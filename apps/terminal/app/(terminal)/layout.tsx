"use client";

import React from "react";
import { TerminalProvider } from "../context/terminal-context";
import { CommandBar } from "../components/panels/command-bar";
import { TickerStrip } from "../components/panels/ticker-strip";
import { Watchlist } from "../components/panels/watchlist";
import { ChartPanel } from "../components/panels/chart-panel";
import { QuotePanel } from "../components/panels/quote-panel";
import { MoversGrid } from "../components/panels/movers-grid";

/**
 * Terminal layout: Bloomberg-style dark multi-panel grid.
 *
 * Layout:
 * ┌─────────────────────────────────────────────────────────┐
 * │ CommandBar (/ focused)                                  │
 * ├─────────────────────────────────────────────────────────┤
 * │ TickerStrip (NIFTY, SENSEX, BANKNIFTY, etc.)           │
 * ├──────────────────┬──────────────────┬──────────────────┤
 * │ Watchlist        │ ChartPanel       │ QuotePanel       │
 * │ (left sidebar)   │ (candlestick)    │ (OHLC grid)      │
 * │                  │                  │                  │
 * ├──────────────────┼──────────────────┼──────────────────┤
 * │ MoversGrid       │ (future space)   │ (future space)   │
 * │ (gainers/losers) │                  │                  │
 * └──────────────────┴──────────────────┴──────────────────┘
 */
export default function TerminalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TerminalProvider>
      <div className="h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden flex flex-col">
        {/* Command Bar */}
        <CommandBar />

        {/* Ticker Strip */}
        <TickerStrip />

        {/* Main Grid */}
        <div className="flex-1 grid grid-cols-12 gap-1 p-1 overflow-hidden">
          {/* Left Sidebar: Watchlist */}
          <div className="col-span-2 min-h-0">
            <Watchlist />
          </div>

          {/* Center-Left: Chart */}
          <div className="col-span-5 min-h-0">
            <ChartPanel />
          </div>

          {/* Right Sidebar: Quote + Movers */}
          <div className="col-span-5 flex flex-col gap-1 min-h-0">
            <div className="h-1/3 min-h-0">
              <QuotePanel />
            </div>
            <div className="h-2/3 min-h-0">
              <MoversGrid />
            </div>
          </div>
        </div>

        {/* Status bar (future) */}
        <div className="bg-zinc-900 border-t border-zinc-800 px-3 py-1 text-xs text-zinc-600 h-6">
          Ready
        </div>
      </div>
    </TerminalProvider>
  );
}
