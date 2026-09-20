"use client";

import React, { useState, useRef } from "react";
import { useTerminal } from "../../context/terminal-context";
import { CommandInput } from "@repo/ui";

/**
 * CommandBar: top bar with symbol entry (/ focused).
 * Allows quick symbol navigation like Bloomberg's GO function.
 */
export const CommandBar: React.FC = () => {
  const { setActiveSymbol } = useTerminal();
  const [input, setInput] = useState<string>("");
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (value: string) => {
    const symbol = value.toUpperCase().trim();
    if (symbol) {
      setActiveSymbol(symbol);
      setInput("");
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !isFocused) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsFocused(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocused]);

  return (
    <div className="bg-zinc-900 border-b border-zinc-800 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500 font-mono">$</span>
        <CommandInput
          ref={inputRef}
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          placeholder="Symbol (press / to focus)"
          autoFocus={false}
        />
      </div>
    </div>
  );
};
