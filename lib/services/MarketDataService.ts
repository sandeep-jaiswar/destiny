/**
 * Market Data Service
 * Integration with Yahoo Finance API for real-time and historical data
 */

import yahooFinance from 'yahoo-finance2';
import { MarketQuote, HistoricalData, HistoricalDataPoint, TimePeriod, TimeInterval } from '../types/market';
import { MemoryStore } from '../storage/MemoryStore';
import { validateSymbol, normalizeSymbol, retryWithBackoff, batchArray } from '../utils/marketUtils';

export class MarketDataService {
  private static instance: MarketDataService;
  private quoteCache: MemoryStore<MarketQuote>;
  private historicalCache: MemoryStore<HistoricalData>;
  private readonly QUOTE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly HISTORICAL_CACHE_TTL = 60 * 60 * 1000; // 1 hour
  private readonly REQUEST_TIMEOUT = 10000; // 10 seconds
  private readonly BATCH_SIZE = 10;

  private constructor() {
    this.quoteCache = new MemoryStore<MarketQuote>({
      maxSize: 1000,
      ttl: this.QUOTE_CACHE_TTL,
    });
    this.historicalCache = new MemoryStore<HistoricalData>({
      maxSize: 500,
      ttl: this.HISTORICAL_CACHE_TTL,
    });
  }

  /**
   * Get singleton instance
   */
  static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  /**
   * Get real-time quote for a symbol
   */
  async getQuote(symbol: string): Promise<MarketQuote | null> {
    try {
      // Validate and normalize symbol
      if (!validateSymbol(symbol)) {
        console.error(`Invalid symbol format: ${symbol}`);
        return null;
      }

      const normalizedSymbol = normalizeSymbol(symbol);

      // Check cache first
      const cached = this.quoteCache.get(normalizedSymbol);
      if (cached) {
        return cached;
      }

      // Fetch from Yahoo Finance with retry
      const quote = await retryWithBackoff(
        async () => {
          const result = await yahooFinance.quote(normalizedSymbol);
          return this.transformQuote(normalizedSymbol, result);
        },
        3,
        1000
      );

      if (quote) {
        this.quoteCache.set(normalizedSymbol, quote);
      }

      return quote;
    } catch (error) {
      console.error(`Failed to fetch quote for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get quotes for multiple symbols (batch processing)
   */
  async getQuotes(symbols: string[]): Promise<Map<string, MarketQuote>> {
    const results = new Map<string, MarketQuote>();

    // Validate symbols
    const validSymbols = symbols
      .filter(s => validateSymbol(s))
      .map(s => normalizeSymbol(s));

    if (validSymbols.length === 0) {
      return results;
    }

    // Check cache for each symbol
    const symbolsToFetch: string[] = [];
    for (const symbol of validSymbols) {
      const cached = this.quoteCache.get(symbol);
      if (cached) {
        results.set(symbol, cached);
      } else {
        symbolsToFetch.push(symbol);
      }
    }

    // Batch fetch remaining symbols
    if (symbolsToFetch.length > 0) {
      const batches = batchArray(symbolsToFetch, this.BATCH_SIZE);

      for (const batch of batches) {
        try {
          const quotes = await Promise.all(
            batch.map(symbol => this.getQuote(symbol))
          );

          quotes.forEach((quote, index) => {
            if (quote) {
              results.set(batch[index], quote);
            }
          });
        } catch (error) {
          console.error('Error fetching batch quotes:', error);
        }
      }
    }

    return results;
  }

  /**
   * Get historical data for a symbol
   */
  async getHistoricalData(
    symbol: string,
    period: TimePeriod = '1y',
    interval: TimeInterval = '1d'
  ): Promise<HistoricalData | null> {
    try {
      if (!validateSymbol(symbol)) {
        console.error(`Invalid symbol format: ${symbol}`);
        return null;
      }

      const normalizedSymbol = normalizeSymbol(symbol);
      const cacheKey = `${normalizedSymbol}-${period}-${interval}`;

      // Check cache
      const cached = this.historicalCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Fetch from Yahoo Finance
      const result = await retryWithBackoff(
        async () => {
          const queryOptions = {
            period1: this.getPeriodStartDate(period),
            period2: new Date(),
            interval: interval as string,
          };

          return await yahooFinance.historical(normalizedSymbol, queryOptions);
        },
        3,
        1000
      );

      if (!result || result.length === 0) {
        return null;
      }

      const historicalData: HistoricalData = {
        symbol: normalizedSymbol,
        data: result.map(candle => this.transformHistoricalDataPoint(candle)),
        period,
        interval,
      };

      this.historicalCache.set(cacheKey, historicalData);
      return historicalData;
    } catch (error) {
      console.error(`Failed to fetch historical data for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Search for symbols
   */
  async searchSymbols(query: string): Promise<unknown[]> {
    try {
      const results = await yahooFinance.search(query);
      return results.quotes || [];
    } catch (error) {
      console.error(`Failed to search symbols for ${query}:`, error);
      return [];
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      quotes: this.quoteCache.getStats(),
      historical: this.historicalCache.getStats(),
    };
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.quoteCache.clear();
    this.historicalCache.clear();
  }

  /**
   * Cleanup expired cache entries
   */
  cleanupCache(): { quotes: number; historical: number } {
    return {
      quotes: this.quoteCache.cleanup(),
      historical: this.historicalCache.cleanup(),
    };
  }

  /**
   * Transform Yahoo Finance quote to our format
   */
  private transformQuote(symbol: string, data: Record<string, unknown>): MarketQuote {
    return {
      symbol,
      price: (data.regularMarketPrice as number) || 0,
      change: (data.regularMarketChange as number) || 0,
      changePercent: (data.regularMarketChangePercent as number) || 0,
      volume: (data.regularMarketVolume as number) || 0,
      open: (data.regularMarketOpen as number) || 0,
      high: (data.regularMarketDayHigh as number) || 0,
      low: (data.regularMarketDayLow as number) || 0,
      previousClose: (data.regularMarketPreviousClose as number) || 0,
      timestamp: new Date(),
      marketCap: data.marketCap as number | undefined,
      fiftyTwoWeekHigh: data.fiftyTwoWeekHigh as number | undefined,
      fiftyTwoWeekLow: data.fiftyTwoWeekLow as number | undefined,
    };
  }

  /**
   * Transform historical data point
   */
  private transformHistoricalDataPoint(candle: Record<string, unknown>): HistoricalDataPoint {
    return {
      date: new Date(candle.date as string),
      open: (candle.open as number) || 0,
      high: (candle.high as number) || 0,
      low: (candle.low as number) || 0,
      close: (candle.close as number) || 0,
      volume: (candle.volume as number) || 0,
      adjustedClose: candle.adjClose as number | undefined,
    };
  }

  /**
   * Get start date for historical data period
   */
  private getPeriodStartDate(period: TimePeriod): Date {
    const now = new Date();
    const date = new Date(now);

    switch (period) {
      case '1d':
        date.setDate(date.getDate() - 1);
        break;
      case '5d':
        date.setDate(date.getDate() - 5);
        break;
      case '1mo':
        date.setMonth(date.getMonth() - 1);
        break;
      case '3mo':
        date.setMonth(date.getMonth() - 3);
        break;
      case '6mo':
        date.setMonth(date.getMonth() - 6);
        break;
      case '1y':
        date.setFullYear(date.getFullYear() - 1);
        break;
      case '2y':
        date.setFullYear(date.getFullYear() - 2);
        break;
      case '5y':
        date.setFullYear(date.getFullYear() - 5);
        break;
      case '10y':
        date.setFullYear(date.getFullYear() - 10);
        break;
      case 'ytd':
        date.setMonth(0);
        date.setDate(1);
        break;
      case 'max':
        date.setFullYear(date.getFullYear() - 20);
        break;
      default:
        date.setFullYear(date.getFullYear() - 1);
    }

    return date;
  }
}
