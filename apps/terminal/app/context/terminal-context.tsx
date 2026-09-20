"use client";

import React, { createContext, useContext, useState } from "react";

interface TerminalContextType {
  activeSymbol: string;
  setActiveSymbol: (symbol: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
}

const TerminalContext = createContext<TerminalContextType | undefined>(
  undefined
);

export const TerminalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeSymbol, setActiveSymbol] = useState<string>("RELIANCE");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  return (
    <TerminalContext.Provider
      value={{
        activeSymbol,
        setActiveSymbol,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
      }}
    >
      {children}
    </TerminalContext.Provider>
  );
};

export const useTerminal = () => {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error("useTerminal must be used within TerminalProvider");
  }
  return context;
};
