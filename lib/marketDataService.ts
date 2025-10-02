/**
 * Market Data Service with multi-tier caching
 * Provides high-performance data fetching with intelligent caching
 */

import yahooFinance from 'yahoo-finance2';
import { MarketQuote, HistoricalData, MemoryMetrics } from '@/types/market';
import { MemoryStore } from './memoryStore';
import clientPromise from './mongodb';

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
  };
}

export class MarketDataService {
  private static instance: MarketDataService;
  
  // Multi-tier caches
  private quoteCache: MemoryStore<MarketQuote>;
  private historicalCache: MemoryStore<HistoricalData[]>;
  
  // Cache TTLs
  private readonly QUOTE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly HISTORICAL_TTL = 60 * 60 * 1000; // 1 hour
  
  // API timeout
  private readonly API_TIMEOUT = 10000; // 10 seconds

  private constructor() {
    // Initialize caches with appropriate sizes
    this.quoteCache = new MemoryStore<MarketQuote>(500, 50); // 500 entries, 50MB
    this.historicalCache = new MemoryStore<HistoricalData[]>(100, 50); // 100 entries, 50MB
    
    // Schedule periodic persistence every 15 minutes
    setInterval(() => this.persistCriticalData(), 15 * 60 * 1000);
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
  async getQuote(symbol: string): Promise<APIResponse<MarketQuote>> {
    try {
      // Check cache first
      const cached = this.quoteCache.get(symbol);
      if (cached) {
        return {
          success: true,
          data: cached,
          metadata: {
            timestamp: new Date().toISOString(),
            cached: true,
            cacheAge: Date.now() - cached.timestamp.getTime(),
          },
        };
      }

      // Fetch from Yahoo Finance with timeout
      const quote = await this.fetchQuoteWithTimeout(symbol);
      
      if (!quote) {
        return {
          success: false,
          error: {
            code: 'SYMBOL_NOT_FOUND',
            message: 'Stock symbol not found',
            details: 'Please verify the symbol is correct and market is open',
          },
        };
      }

      // Transform and cache
      const marketQuote = this.transformQuote(symbol, quote);
      this.quoteCache.set(symbol, marketQuote, this.QUOTE_TTL);

      return {
        success: true,
        data: marketQuote,
        metadata: {
          timestamp: new Date().toISOString(),
          cached: false,
        },
      };
    } catch (error) {
      console.error(`[MarketDataService] Failed to fetch quote for ${symbol}:`, error);
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch market data',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get historical data for a symbol
   */
  async getHistoricalData(
    symbol: string,
    period: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' = '1mo'
  ): Promise<APIResponse<HistoricalData[]>> {
    try {
      const cacheKey = `${symbol}:${period}`;
      
      // Check cache first
      const cached = this.historicalCache.get(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          metadata: {
            timestamp: new Date().toISOString(),
            cached: true,
            cacheAge: Date.now() - cached[0]?.date.getTime(),
          },
        };
      }

      // Calculate date range
      const endDate = new Date();
      const startDate = this.calculateStartDate(period);

      // Fetch from Yahoo Finance
      const result = await yahooFinance.historical(symbol, {
        period1: startDate,
        period2: endDate,
      });

      if (!result || result.length === 0) {
        return {
          success: false,
          error: {
            code: 'NO_DATA',
            message: 'No historical data available',
            details: 'No data found for the specified period',
          },
        };
      }

      // Transform data
      const historicalData = this.transformHistoricalData(result);
      this.historicalCache.set(cacheKey, historicalData, this.HISTORICAL_TTL);

      return {
        success: true,
        data: historicalData,
        metadata: {
          timestamp: new Date().toISOString(),
          cached: false,
        },
      };
    } catch (error) {
      console.error(`[MarketDataService] Failed to fetch historical data for ${symbol}:`, error);
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch historical data',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get memory statistics
   */
  getMemoryStats(): MemoryMetrics {
    const quoteMetrics = this.quoteCache.getMemoryUsage();
    const historicalMetrics = this.historicalCache.getMemoryUsage();

    return {
      totalEntries: quoteMetrics.totalEntries + historicalMetrics.totalEntries,
      quoteCacheSize: quoteMetrics.totalEntries,
      historicalCacheSize: historicalMetrics.totalEntries,
      memoryUsageBytes: quoteMetrics.memoryUsageBytes + historicalMetrics.memoryUsageBytes,
      memoryUsagePercent: 
        (quoteMetrics.memoryUsageBytes + historicalMetrics.memoryUsageBytes) /
        (quoteMetrics.maxMemoryBytes + historicalMetrics.maxMemoryBytes),
      maxMemoryBytes: quoteMetrics.maxMemoryBytes + historicalMetrics.maxMemoryBytes,
      cacheHitRate: 
        (quoteMetrics.cacheHitRate * quoteMetrics.totalEntries + 
         historicalMetrics.cacheHitRate * historicalMetrics.totalEntries) /
        (quoteMetrics.totalEntries + historicalMetrics.totalEntries) || 0,
      lastCleanup: quoteMetrics.lastCleanup > historicalMetrics.lastCleanup 
        ? quoteMetrics.lastCleanup 
        : historicalMetrics.lastCleanup,
    };
  }

  /**
   * Clear all caches
   */
  clearCaches(): void {
    this.quoteCache.clear();
    this.historicalCache.clear();
    console.log('[MarketDataService] All caches cleared');
  }

  /**
   * Fetch quote with timeout
   */
  private async fetchQuoteWithTimeout(symbol: string): Promise<unknown> {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), this.API_TIMEOUT);
    });

    const fetchPromise = yahooFinance.quote(symbol);

    return Promise.race([fetchPromise, timeoutPromise]);
  }

  /**
   * Transform Yahoo Finance quote to MarketQuote
   */
  private transformQuote(symbol: string, quote: Record<string, unknown>): MarketQuote {
    return {
      symbol,
      price: (quote.regularMarketPrice as number) || 0,
      change: (quote.regularMarketChange as number) || 0,
      changePercent: (quote.regularMarketChangePercent as number) || 0,
      volume: (quote.regularMarketVolume as number) || 0,
      marketCap: quote.marketCap as number | undefined,
      timestamp: new Date(),
    };
  }

  /**
   * Transform Yahoo Finance historical data
   */
  private transformHistoricalData(data: Record<string, unknown>[]): HistoricalData[] {
    return data.map((item) => ({
      date: new Date(item.date as string | Date),
      open: item.open as number,
      high: item.high as number,
      low: item.low as number,
      close: item.close as number,
      volume: item.volume as number,
      adjClose: item.adjClose as number | undefined,
    }));
  }

  /**
   * Calculate start date based on period
   */
  private calculateStartDate(period: string): Date {
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
      default:
        date.setMonth(date.getMonth() - 1);
    }

    return date;
  }

  /**
   * Persist critical data to MongoDB for recovery
   */
  private async persistCriticalData(): Promise<void> {
    try {
      const client = await clientPromise;
      if (!client) {
        console.warn('[MarketDataService] MongoDB client not available for persistence');
        return;
      }

      const db = client.db();
      const collection = db.collection('market_cache_snapshots');

      // Get all cached quotes
      const quotes: Record<string, MarketQuote> = {};
      for (const key of this.quoteCache.keys()) {
        const quote = this.quoteCache.get(key);
        if (quote) {
          quotes[key] = quote;
        }
      }

      // Save snapshot
      await collection.updateOne(
        { _id: 'latest_snapshot' },
        {
          $set: {
            quotes,
            timestamp: new Date(),
            quoteCount: Object.keys(quotes).length,
          },
        },
        { upsert: true }
      );

      console.log(`[MarketDataService] Persisted ${Object.keys(quotes).length} quotes to MongoDB`);
    } catch (error) {
      console.error('[MarketDataService] Failed to persist data:', error);
    }
  }

  /**
   * Recover data from MongoDB on startup
   */
  async recoverFromPersistence(): Promise<void> {
    try {
      const client = await clientPromise;
      if (!client) {
        console.warn('[MarketDataService] MongoDB client not available for recovery');
        return;
      }

      const db = client.db();
      const collection = db.collection('market_cache_snapshots');

      const snapshot = await collection.findOne({ _id: 'latest_snapshot' });
      
      if (snapshot && snapshot.quotes) {
        let recoveredCount = 0;
        for (const [symbol, quote] of Object.entries(snapshot.quotes)) {
          // Only recover if not too old (within TTL)
          const quoteData = quote as MarketQuote;
          const age = Date.now() - new Date(quoteData.timestamp).getTime();
          
          if (age < this.QUOTE_TTL) {
            this.quoteCache.set(symbol, quoteData, this.QUOTE_TTL - age);
            recoveredCount++;
          }
        }
        
        console.log(`[MarketDataService] Recovered ${recoveredCount} quotes from MongoDB`);
      }
    } catch (error) {
      console.error('[MarketDataService] Failed to recover data:', error);
    }
  }
}
