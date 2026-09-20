"use client";

import React, { useState, useEffect } from "react";
import { MonoNumber } from "@repo/ui";

interface IndexTicker {
  symbol: string;
  value: number;
  change: number; // percentage
  previousClose: number;
}

/**
 * TickerStrip: horizontal auto-scrolling strip of key indices.
 * Shows NIFTY 50, SENSEX, BANKNIFTY, etc.
 */
export const TickerStrip: React.FC = () => {
  const [tickers, setTickers] = useState<IndexTicker[]>([
    { symbol: "NIFTY 50", value: 24850.5, change: 1.2, previousClose: 24550 },
    { symbol: "SENSEX", value: 81234.2, change: 0.85, previousClose: 80550 },
    { symbol: "BANKNIFTY", value: 54321, change: -0.5, previousClose: 54592 },
    { symbol: "NIFTY IT", value: 41200, change: 2.1, previousClose: 40345 },
    { symbol: "INDIA VIX", value: 18.5, change: 3.2, previousClose: 17.9 },
  ]);

  // TODO: Replace with real API calls to /api/market/indices

  return (
    <div className="bg-zinc-900 border-b border-zinc-800 overflow-x-auto">
      <div className="flex gap-8 px-3 py-2 whitespace-nowrap">
        {tickers.map((ticker) => (
          <div
            key={ticker.symbol}
            className="flex items-center gap-3 text-xs font-mono"
          >
            <span className="text-zinc-400 min-w-20">{ticker.symbol}</span>
            <MonoNumber value={ticker.value} size="sm" />
            <MonoNumber value={ticker.change} size="sm" change={ticker.change} />
          </div>
        ))}
      </div>
    </div>
  );
};
