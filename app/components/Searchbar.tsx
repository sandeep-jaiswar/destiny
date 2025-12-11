"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { SearchResult } from "@/app/store";

export function Searchbar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 1) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/autosuggest?query=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        setResults(data);
        setIsOpen(data.length > 0);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSelect = (symbol: string) => {
    setQuery("");
    setIsOpen(false);
    router.push(`/chart/${symbol}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex].symbol);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={searchRef} className="relative w-full font-sans">
      {/* Search Input - Bloomberg Style */}
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() =>
            query.length > 0 && results.length > 0 && setIsOpen(true)
          }
          placeholder="SEARCH STOCKS & SYMBOLS"
          className="w-full pl-11 pr-10 py-2.5 bg-black/40 border-b-2 border-orange-600/60
                   text-white text-sm font-medium tracking-wide placeholder-gray-500 
                   focus:outline-none focus:border-orange-500 focus:bg-black/60
                   transition-all duration-200 uppercase"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-orange-600/30 border-t-orange-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown - Bloomberg Style */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-black border-l-4 border-orange-600 shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={result.symbol}
              onClick={() => handleSelect(result.symbol)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full px-4 py-2.5 text-left transition-all duration-150 border-b border-gray-800/50
                ${selectedIndex === index 
                  ? "bg-orange-600/20 border-l-2 border-l-orange-500" 
                  : "hover:bg-gray-900/50"
                }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Symbol and Exchange */}
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-white font-bold text-base tracking-wide uppercase">
                      {result.symbol}
                    </span>
                    {result.exchDisp && (
                      <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                        {result.exchDisp}
                      </span>
                    )}
                  </div>
                  
                  {/* Company Name */}
                  <div className="text-xs text-gray-400 truncate font-normal">
                    {result.longname || result.shortname || "N/A"}
                  </div>
                </div>
                
                {/* Asset Type Badge */}
                {result.typeDisp && (
                  <span className="text-[10px] text-orange-400/80 font-bold uppercase tracking-wider 
                                 bg-orange-900/20 px-2 py-0.5 rounded shrink-0 border border-orange-900/30">
                    {result.typeDisp}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
