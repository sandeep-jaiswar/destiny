"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTerminal } from "../../context/terminal-context";
import { Panel } from "@repo/ui";
import type { OhlcCandle } from "@destiny/duckdb-lake";

/**
 * ChartPanel: displays OHLC candlestick + volume histogram.
 * Uses TradingView's lightweight-charts library.
 *
 * TODO: Wire up lightweight-charts once available.
 * For now: placeholder with JSON render for testing data flow.
 */
export const ChartPanel: React.FC = () => {
  const { activeSymbol, startDate, endDate } = useTerminal();
  const [candles, setCandles] = useState<OhlcCandle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchCandles = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (startDate) params.append("start", startDate);
        if (endDate) params.append("end", endDate);

        const res = await fetch(`/api/equity/${activeSymbol}/ohlc?${params}`);
        if (!res.ok) {
          throw new Error(`API error: ${res.statusText}`);
        }
        const data = await res.json();
        setCandles(data.data || []);
      } catch (err: any) {
        setError(err.message);
        setCandles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCandles();
  }, [activeSymbol, startDate, endDate]);

  return (
    <Panel title={`Chart — ${activeSymbol}`} className="h-full flex flex-col">
      {loading && <div className="text-xs text-zinc-500 text-center py-4">Loading...</div>}
      {error && <div className="text-xs text-red-400 text-center py-4">Error: {error}</div>}

      {candles.length > 0 && (
        <div className="flex-1 flex flex-col justify-between min-h-0">
          {/* Placeholder: chart will go here once lightweight-charts is integrated */}
          <div className="flex-1 bg-zinc-900 rounded border border-zinc-800 flex items-center justify-center text-center">
            <div className="text-xs text-zinc-500">
              <p>Candlestick chart placeholder</p>
              <p className="text-zinc-700">{candles.length} candles loaded</p>
            </div>
          </div>

          {/* Volume histogram placeholder */}
          <div className="h-12 bg-zinc-900 rounded border border-zinc-800 mt-2 flex items-center justify-center text-xs text-zinc-600">
            Volume histogram
          </div>
        </div>
      )}
    </Panel>
  );
};
