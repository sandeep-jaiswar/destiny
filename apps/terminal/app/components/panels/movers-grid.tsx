"use client";

import React, { useState, useEffect } from "react";
import { Panel, DataGrid, DataGridColumn, MonoNumber } from "@repo/ui";
import type { QuoteData } from "@destiny/duckdb-lake";

/**
 * MoversGrid: shows top gainers/losers.
 * TODO: Wire to /api/market/movers once implemented.
 */
export const MoversGrid: React.FC = () => {
  const [gainers, setGainers] = useState<QuoteData[]>([
    {
      symbol: "IDEA",
      name: "Idea Cellular",
      series: "EQ",
      date: "2026-09-20",
      open_price: 10.5,
      high_price: 11.2,
      low_price: 10.3,
      close_price: 11.0,
      last_price: 11.0,
      total_traded_quantity: 1500000,
      turnover: 1650000,
      no_of_trades: 5000,
    },
  ]);

  const columns: DataGridColumn<QuoteData>[] = [
    { key: "symbol", label: "Symbol", width: "80px" },
    {
      key: "close_price",
      label: "Price",
      width: "80px",
      render: (value) => <MonoNumber value={value} decimals={2} />,
    },
    {
      key: "total_traded_quantity",
      label: "Volume",
      width: "100px",
      render: (value) => <MonoNumber value={(value / 1e6).toFixed(1)} />,
    },
  ];

  return (
    <Panel title="Movers">
      <div className="space-y-2">
        <div>
          <div className="text-xs text-zinc-500 mb-1">Top Gainers</div>
          <DataGrid data={gainers} columns={columns} maxHeight="120px" />
        </div>
        <div>
          <div className="text-xs text-zinc-500 mb-1">Top Losers</div>
          <DataGrid data={[]} columns={columns} maxHeight="120px" />
        </div>
      </div>
    </Panel>
  );
};
