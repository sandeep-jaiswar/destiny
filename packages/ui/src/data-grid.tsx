import React, { useState } from "react";

export interface DataGridColumn<T> {
  key: keyof T;
  label: string;
  width?: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataGridProps<T> {
  data: T[];
  columns: DataGridColumn<T>[];
  onRowClick?: (row: T) => void;
  maxHeight?: string;
  striped?: boolean;
}

/**
 * DataGrid: sortable table with keyboard navigation.
 * Dark theme, monospace font, Bloomberg-style appearance.
 */
export const DataGrid = React.forwardRef<HTMLDivElement, DataGridProps<any>>(
  (
    {
      data,
      columns,
      onRowClick,
      maxHeight = "400px",
      striped = true,
    },
    ref
  ) => {
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [selectedIdx, setSelectedIdx] = useState<number>(0);

    const sortedData = React.useMemo(() => {
      if (!sortKey) return data;
      const sorted = [...data].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortDir === "asc" ? cmp : -cmp;
      });
      return sorted;
    }, [data, sortKey, sortDir]);

    const handleSort = (key: string) => {
      if (sortKey === key) {
        setSortDir(sortDir === "asc" ? "desc" : "asc");
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        setSelectedIdx((i) => Math.min(i + 1, sortedData.length - 1));
      } else if (e.key === "ArrowUp") {
        setSelectedIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && onRowClick) {
        onRowClick(sortedData[selectedIdx]);
      }
    };

    return (
      <div
        ref={ref}
        className="overflow-auto border border-zinc-800 rounded-sm"
        style={{ maxHeight }}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <table className="w-full text-xs font-mono">
          <thead className="sticky top-0 bg-zinc-900 border-b border-zinc-800">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-2 py-1 text-left text-zinc-400 font-semibold cursor-pointer hover:bg-zinc-800"
                  onClick={() =>
                    col.sortable !== false && handleSort(String(col.key))
                  }
                  style={{ width: col.width }}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortKey === String(col.key) && (
                      <span className="text-zinc-500">
                        {sortDir === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, idx) => (
              <tr
                key={idx}
                className={`border-b border-zinc-800 cursor-pointer ${
                  striped && idx % 2 === 1 ? "bg-zinc-950" : "bg-zinc-900/50"
                } ${
                  selectedIdx === idx
                    ? "bg-zinc-800"
                    : "hover:bg-zinc-800/50"
                }`}
                onClick={() => {
                  setSelectedIdx(idx);
                  onRowClick?.(row);
                }}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className="px-2 py-1 text-zinc-300"
                    style={{ width: col.width }}
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : String(row[col.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);

DataGrid.displayName = "DataGrid";
