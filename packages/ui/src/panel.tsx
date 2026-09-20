import React from "react";

interface PanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  borderColor?: "zinc" | "slate" | "gray";
}

/**
 * Panel: bordered container with optional title bar.
 * Dark theme designed for Bloomberg-style terminal.
 */
export const Panel: React.FC<PanelProps> = ({
  title,
  children,
  className = "",
  borderColor = "zinc",
}) => {
  const borderClass = `border-${borderColor}-800`;
  const bgClass = "bg-zinc-950";

  return (
    <div className={`${bgClass} border ${borderClass} rounded-sm ${className}`}>
      {title && (
        <div className="border-b border-zinc-800 px-3 py-2 text-xs font-mono text-zinc-400 bg-zinc-900">
          {title}
        </div>
      )}
      <div className="p-3">
        {children}
      </div>
    </div>
  );
};
