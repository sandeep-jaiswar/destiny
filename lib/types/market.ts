/**
 * Market Data Type Definitions
 * Core types for trading platform market data
 */

export interface MarketQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  timestamp: Date;
  marketCap?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
}

export interface HistoricalDataPoint {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose?: number;
}

export interface HistoricalData {
  symbol: string;
  data: HistoricalDataPoint[];
  period: TimePeriod;
  interval: TimeInterval;
}

export type TimePeriod = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | '10y' | 'ytd' | 'max';
export type TimeInterval = '1m' | '5m' | '15m' | '30m' | '1h' | '1d' | '1wk' | '1mo';

export interface SymbolInfo {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  type: 'stock' | 'etf' | 'mutual-fund' | 'crypto' | 'index';
}

export interface MarketStatus {
  isOpen: boolean;
  nextOpen?: Date;
  nextClose?: Date;
  timezone: string;
}

export interface CachedQuote {
  quote: MarketQuote;
  timestamp: Date;
  ttl: number;
}

export interface CachedHistoricalData {
  data: HistoricalData;
  timestamp: Date;
  ttl: number;
}
