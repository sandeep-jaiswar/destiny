import React from "react";

interface CommandInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

/**
 * CommandInput: text input styled for command-bar usage.
 * Bloomberg-style monospace appearance.
 */
export const CommandInput = React.forwardRef<
  HTMLInputElement,
  CommandInputProps
>(
  (
    {
      value,
      onChange,
      onSubmit,
      placeholder = "Enter symbol...",
      className = "",
      autoFocus = true,
    },
    ref
  ) => {
    return (
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSubmit(value);
          }
        }}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`
          w-full px-3 py-2
          bg-zinc-950 border border-zinc-700
          font-mono text-sm text-zinc-100
          placeholder:text-zinc-600
          focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-600
          ${className}
        `}
      />
    );
  }
);

CommandInput.displayName = "CommandInput";
