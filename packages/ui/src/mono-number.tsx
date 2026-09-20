import React from "react";

interface MonoNumberProps {
  value: number | string;
  change?: number; // percentage change
  decimals?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  highlight?: boolean;
}

/**
 * MonoNumber: displays numbers in monospace with tabular figures for alignment.
 * Colorizes by sign (green for positive, red for negative).
 */
export const MonoNumber: React.FC<MonoNumberProps> = ({
  value,
  change,
  decimals = 2,
  className = "",
  size = "md",
  highlight = false,
}) => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  const isNegative = change !== undefined ? change < 0 : numValue < 0;
  const isPositive = change !== undefined ? change > 0 : numValue > 0;

  const sizeClass = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }[size];

  const colorClass = isPositive
    ? "text-green-400"
    : isNegative
      ? "text-red-400"
      : "text-zinc-300";

  const bgClass = highlight ? "bg-zinc-900 px-1 py-0.5 rounded" : "";

  const formatted =
    typeof value === "string" ? value : numValue.toFixed(decimals);

  return (
    <span
      className={`font-mono tabular-nums ${sizeClass} ${colorClass} ${bgClass} ${className}`}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {formatted}
      {change !== undefined && (
        <span className={`text-xs ml-1 ${isPositive ? "text-green-400" : "text-red-400"}`}>
          {change > 0 ? "+" : ""}{change.toFixed(2)}%
        </span>
      )}
    </span>
  );
};
