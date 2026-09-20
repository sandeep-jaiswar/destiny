"use client";

import React, { useState, useEffect } from "react";
import { useTerminal } from "../../context/terminal-context";
import { Panel, MonoNumber } from "@repo/ui";

interface WatchlistItem {
  symbol: string;
  lastPrice?: number;
  change?: number;
}

/**
 * Watchlist: left sidebar with user's saved symbols.
 * localStorage-persisted for POC (no auth yet).
 */
export const Watchlist: React.FC = () => {
  const { activeSymbol, setActiveSymbol } = useTerminal();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [inputValue, setInputValue] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("watchlist");
      if (saved) {
        setItems(JSON.parse(saved));
      } else {
        // Default watchlist
        setItems([
          { symbol: "RELIANCE" },
          { symbol: "INFY" },
          { symbol: "TCS" },
          { symbol: "HDFC" },
          { symbol: "ICICI" },
        ]);
      }
    } catch {
      // localStorage not available, use defaults
      setItems([
        { symbol: "RELIANCE" },
        { symbol: "INFY" },
        { symbol: "TCS" },
      ]);
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem("watchlist", JSON.stringify(items));
    } catch {
      // localStorage not available
    }
  }, [items]);

  const addSymbol = () => {
    const sym = inputValue.toUpperCase().trim();
    if (sym && !items.some((i) => i.symbol === sym)) {
      setItems([...items, { symbol: sym }]);
      setInputValue("");
    }
  };

  const removeSymbol = (symbol: string) => {
    setItems(items.filter((i) => i.symbol !== symbol));
  };

  return (
    <Panel title="Watchlist" className="h-full">
      <div className="space-y-2">
        <div className="flex gap-1 mb-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addSymbol();
            }}
            placeholder="Add..."
            className="flex-1 px-2 py-1 text-xs bg-zinc-900 border border-zinc-700 rounded text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
          />
          <button
            onClick={addSymbol}
            className="px-2 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-zinc-300"
          >
            +
          </button>
        </div>

        <div className="space-y-1">
          {items.map((item) => (
            <div
              key={item.symbol}
              onClick={() => setActiveSymbol(item.symbol)}
              className={`
                px-2 py-1 text-xs font-mono rounded cursor-pointer
                transition-colors
                ${
                  activeSymbol === item.symbol
                    ? "bg-zinc-700 text-zinc-100 border border-zinc-600"
                    : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800"
                }
              `}
            >
              <div className="flex justify-between items-center">
                <span>{item.symbol}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSymbol(item.symbol);
                  }}
                  className="text-zinc-600 hover:text-red-400 text-xs"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
};
