/**
 * Shared types for data lake queries.
 * Ported from financeindiaterminal with minimal changes.
 */

export interface OhlcCandle {
  date: string;
  open_price: number;
  high_price: number;
  low_price: number;
  close_price: number;
  volume: number;
  turnover: number;
  no_of_trades: number;
}

export interface QuoteData {
  symbol: string;
  name: string;
  series: string;
  date: string;
  open_price: number;
  high_price: number;
  low_price: number;
  close_price: number;
  last_price: number;
  total_traded_quantity: number;
  turnover: number;
  no_of_trades: number;
  pct_change?: number;
  previous_close?: number;
}

export interface SymbolSearchResult {
  symbol: string;
  name: string;
  series: string;
  isin?: string;
}

export interface MarketStatus {
  date: string;
  status: string;
  holiday_name?: string;
}

export interface IndexQuote {
  symbol: string;
  date: string;
  open_price: number;
  high_price: number;
  low_price: number;
  close_price: number;
  volume: number;
  pct_change?: number;
  previous_close?: number;
}

export interface Movers {
  gainers: QuoteData[];
  losers: QuoteData[];
  mostActive: QuoteData[];
}

// Error response type
export interface ErrorResponse {
  error: string;
  message: string;
  timestamp?: string;
}
