// Market Data Types for Destiny Trading Platform

export interface MarketQuote {
  symbol: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  timestamp: Date;
  volume: number;
  marketCap?: number;
  dayHigh?: number;
  dayLow?: number;
  open?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  regularMarketPrice?: number;
  currency?: string;
  exchange?: string;
  marketState?: string;
}

export interface HistoricalDataPoint {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose?: number;
}

export interface HistoricalData {
  symbol: string;
  data: HistoricalDataPoint[];
  period: string;
  interval: string;
}

export type TimePeriod = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | '10y' | 'ytd' | 'max';
export type TimeInterval = '1m' | '2m' | '5m' | '15m' | '30m' | '60m' | '90m' | '1h' | '1d' | '5d' | '1wk' | '1mo' | '3mo';

export interface SymbolValidationResult {
  symbol: string;
  isValid: boolean;
  exchange?: string;
  name?: string;
  type?: string;
  currency?: string;
  error?: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
  metadata?: {
    timestamp: string;
    cached: boolean;
    cacheAge?: number;
    source?: string;
  };
}

export interface CachedData<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface MarketDataServiceConfig {
  cacheTTL: number;
  rateLimitConfig: RateLimitConfig;
  timeout: number;
  enableFallback: boolean;
}
