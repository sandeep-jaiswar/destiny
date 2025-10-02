/**
 * Data Manager
 * Orchestrates data flow between services, cache, and persistence
 */

import { MemoryStore } from './MemoryStore';
import { MarketDataService } from '../services/MarketDataService';
import { MarketQuote, HistoricalData, TimePeriod, TimeInterval } from '../types/market';

export class DataManager {
  private static instance: DataManager;
  private marketService: MarketDataService;
  private quoteStore: MemoryStore<MarketQuote>;
  private historicalStore: MemoryStore<HistoricalData>;

  private constructor() {
    this.marketService = MarketDataService.getInstance();
    this.quoteStore = new MemoryStore<MarketQuote>({
      maxSize: 1000,
      ttl: 5 * 60 * 1000, // 5 minutes
    });
    this.historicalStore = new MemoryStore<HistoricalData>({
      maxSize: 500,
      ttl: 60 * 60 * 1000, // 1 hour
    });
  }

  /**
   * Get singleton instance
   */
  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  /**
   * Get quote with multi-tier caching
   */
  async getQuote(symbol: string): Promise<MarketQuote | null> {
    // Try local cache first
    const cached = this.quoteStore.get(symbol);
    if (cached) {
      return cached;
    }

    // Fetch from market service (which has its own cache)
    const quote = await this.marketService.getQuote(symbol);
    if (quote) {
      this.quoteStore.set(symbol, quote);
    }

    return quote;
  }

  /**
   * Get multiple quotes with efficient batching
   */
  async getQuotes(symbols: string[]): Promise<Map<string, MarketQuote>> {
    const results = new Map<string, MarketQuote>();
    const symbolsToFetch: string[] = [];

    // Check cache for each symbol
    for (const symbol of symbols) {
      const cached = this.quoteStore.get(symbol);
      if (cached) {
        results.set(symbol, cached);
      } else {
        symbolsToFetch.push(symbol);
      }
    }

    // Batch fetch remaining symbols
    if (symbolsToFetch.length > 0) {
      const fetchedQuotes = await this.marketService.getQuotes(symbolsToFetch);
      
      for (const [symbol, quote] of fetchedQuotes) {
        this.quoteStore.set(symbol, quote);
        results.set(symbol, quote);
      }
    }

    return results;
  }

  /**
   * Get historical data with caching
   */
  async getHistoricalData(
    symbol: string,
    period: TimePeriod = '1y',
    interval: TimeInterval = '1d'
  ): Promise<HistoricalData | null> {
    const cacheKey = `${symbol}-${period}-${interval}`;

    // Try cache first
    const cached = this.historicalStore.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from market service
    const data = await this.marketService.getHistoricalData(symbol, period, interval);
    if (data) {
      this.historicalStore.set(cacheKey, data);
    }

    return data;
  }

  /**
   * Prefetch quotes for watchlist
   */
  async prefetchWatchlist(symbols: string[]): Promise<void> {
    await this.getQuotes(symbols);
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      quotes: this.quoteStore.getStats(),
      historical: this.historicalStore.getStats(),
    };
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.quoteStore.clear();
    this.historicalStore.clear();
    this.marketService.clearCache();
  }

  /**
   * Cleanup expired entries
   */
  cleanupExpiredEntries(): void {
    const quotesCleaned = this.quoteStore.cleanup();
    const historicalCleaned = this.historicalStore.cleanup();
    const serviceCleaned = this.marketService.cleanupCache();

    console.log(`Cleaned up ${quotesCleaned} quote entries, ${historicalCleaned} historical entries, ${serviceCleaned.quotes} service quote entries, ${serviceCleaned.historical} service historical entries`);
  }
}
