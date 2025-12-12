"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { SearchResult } from "@/store";
import { useAppDispatch, useSelectedTicker } from "@/store";
import { setSelectedTicker } from "@/store";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";

export function Searchbar() {
  const selectedTicker = useSelectedTicker();
  const [query, setQuery] = useState<string>(selectedTicker || "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputWidth, setInputWidth] = useState<number | undefined>(undefined);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dispatch = useAppDispatch();

  // Debounce hook
  function useDebounce<T>(value: T, delay: number) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(handler);
    }, [value, delay]);
    return debounced;
  }
  const debouncedQuery = useDebounce(query, 300);

  // Measure input width and update state
  useEffect(() => {
    if (inputRef.current) setInputWidth(inputRef.current.offsetWidth);
    const handleResize = () => {
      if (inputRef.current) setInputWidth(inputRef.current.offsetWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setResults([]);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions
  useEffect(() => {
    if (debouncedQuery === selectedTicker || debouncedQuery.length < 1) {
      setResults([]);
      setIsLoading(false);
      setSelectedIndex(-1);
      return;
    }
    setIsLoading(true);
    fetch(`/api/autosuggest?query=${encodeURIComponent(debouncedQuery)}`)
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setSelectedIndex(data.length ? 0 : -1);
      })
      .catch(() => setResults([]))
      .finally(() => setIsLoading(false));
  }, [debouncedQuery, selectedTicker]);

  const handleSelect = useCallback((symbol: string) => {
    // Always update input and Redux, even if the same symbol is selected
    setQuery(symbol);
    dispatch(setSelectedTicker(symbol));
    setResults([]); // Close popover
    setSelectedIndex(-1);
    if (inputRef.current) {
      inputRef.current.blur(); // Optionally blur to close popover visually
    }
  }, [dispatch]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex].symbol);
    } else if (e.key === "Escape") {
      setResults([]);
      setSelectedIndex(-1);
    }
  }, [results, selectedIndex, handleSelect]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex, results]);

  // Clear refs before mapping
  itemRefs.current = [];

  const showPopover = results.length > 0;

  return (
    <Popover open={showPopover}>
      <PopoverTrigger asChild>
        <div ref={searchRef} className="w-full relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0}
            placeholder="SEARCH STOCKS & SYMBOLS"
            className="pl-11 pr-10 py-2.5 bg-background border-b-2 border-primary/60 text-foreground text-sm font-medium tracking-wide placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:bg-background/80 transition-all duration-200 uppercase shadow-sm rounded-none"
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls="search-results"
            aria-activedescendant={selectedIndex >= 0 ? `result-${selectedIndex}` : undefined}
            role="combobox"
            aria-expanded={showPopover}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 min-w-[320px] max-w-screen border-l-4 border-primary shadow-2xl rounded-md mt-2"
        style={inputWidth ? { width: inputWidth } : undefined}
      >
        <Command>
          <CommandList id="search-results" role="listbox">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {results.map((result, index) => (
                <CommandItem
                  key={`${result.symbol}-${index}`}
                  value={result.symbol}
                  ref={el => { itemRefs.current[index] = el; }}
                  tabIndex={-1}
                  id={`result-${index}`}
                  aria-selected={selectedIndex === index}
                  onClick={() => handleSelect(result.symbol)}
                  onSelect={() => handleSelect(result.symbol)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={
                    (selectedIndex === index
                      ? "bg-primary/20 border-l-2 border-primary text-foreground"
                      : "hover:bg-muted/50") +
                    " w-full px-4 py-2.5 text-left transition-all duration-150 border-b border-border/50 flex items-start gap-3"
                  }
                  role="option"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="font-bold text-base tracking-wide uppercase">
                        {result.symbol}
                      </span>
                      {result.exchDisp && (
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                          {result.exchDisp}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate font-normal">
                      {result.longname || result.shortname || "N/A"}
                    </div>
                  </div>
                  {result.typeDisp && (
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded shrink-0 border border-primary/30">
                      {result.typeDisp}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
