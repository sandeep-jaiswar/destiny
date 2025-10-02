/**
 * Market data types for the Destiny trading platform
 */

export interface MarketQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  timestamp: Date;
}

export interface HistoricalData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose?: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  ttl: number;
}

export interface MemoryMetrics {
  totalEntries: number;
  quoteCacheSize: number;
  historicalCacheSize: number;
  memoryUsageBytes: number;
  memoryUsagePercent: number;
  maxMemoryBytes: number;
  cacheHitRate: number;
  lastCleanup: Date;
}

export interface SubscriptionCallback<T> {
  (data: T): void;
}

export interface Subscription {
  id: string;
  symbol: string;
  type: 'quote' | 'historical';
  createdAt: Date;
}
