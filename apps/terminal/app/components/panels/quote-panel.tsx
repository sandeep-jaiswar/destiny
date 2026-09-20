"use client";

import React, { useState, useEffect } from "react";
import { useTerminal } from "../../context/terminal-context";
import { Panel, MonoNumber } from "@repo/ui";
import { QuoteData } from "@destiny/duckdb-lake";

/**
 * QuotePanel: displays OHLC, volume, and other quote data.
 * Right-side dense grid layout, monospace numerics.
 */
export const QuotePanel: React.FC = () => {
  const { activeSymbol } = useTerminal();
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchQuote = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/equity/${activeSymbol}/quote`);
        if (!res.ok) {
          throw new Error(`API error: ${res.statusText}`);
        }
        const data = await res.json();
        setQuote(data.data || null);
      } catch (err: any) {
        setError(err.message);
        setQuote(null);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [activeSymbol]);

  if (!quote && !loading && !error) {
    return (
      <Panel title="Quote">
        <div className="text-xs text-zinc-500">No data</div>
      </Panel>
    );
  }

  return (
    <Panel title={`Quote — ${activeSymbol}`}>
      {loading && <div className="text-xs text-zinc-500">Loading...</div>}
      {error && <div className="text-xs text-red-400">Error: {error}</div>}
      {quote && (
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          {[
            ["Open", quote.open_price],
            ["High", quote.high_price],
            ["Low", quote.low_price],
            ["Close", quote.close_price],
            ["Prev", "—"],
            ["Volume", quote.total_traded_quantity],
            ["Turnover", `₹${(quote.turnover / 1e7).toFixed(1)}Cr`],
            ["Trades", quote.no_of_trades],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <span className="text-zinc-500">{label}</span>
              {typeof value === "number" ? (
                <MonoNumber value={value} decimals={2} />
              ) : (
                <span className="text-zinc-300">{value}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
};
