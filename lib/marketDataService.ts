/**
 * MarketDataService - High-performance market data service with in-memory caching
 * 
 * Features:
 * - Real-time quote fetching for US & Indian markets
 * - Historical data with configurable periods and intervals
 * - Multi-symbol batch processing
 * - Fallback mechanisms for API failures
 * - Smart rate limiting and throttling
 * - Symbol validation for multiple exchanges
 */

import yahooFinance from 'yahoo-finance2';
import type {
  MarketQuote,
  HistoricalData,
  TimePeriod,
  TimeInterval,
  SymbolValidationResult,
  CachedData,
  MarketDataServiceConfig,
} from '@/types/market';

export class MarketDataService {
  private static instance: MarketDataService;
  private quoteCache = new Map<string, CachedData<MarketQuote>>();
  private historicalCache = new Map<string, CachedData<HistoricalData>>();
  private validationCache = new Map<string, CachedData<SymbolValidationResult>>();
  private requestTimestamps: number[] = [];
  
  private readonly config: MarketDataServiceConfig = {
    cacheTTL: 5 * 60 * 1000, // 5 minutes for quotes
    rateLimitConfig: {
      maxRequests: 48, // Conservative: 48 requests per minute
      windowMs: 60 * 1000, // 1 minute window
    },
    timeout: 10000, // 10 second timeout
    enableFallback: true,
  };

  private constructor() {
    // Private constructor for singleton pattern
    this.startCleanupInterval();
  }

  static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  /**
   * Fetch real-time quote for a single symbol
   */
  async getQuote(symbol: string): Promise<MarketQuote | null> {
    try {
      // Validate symbol format
      if (!this.isValidSymbolFormat(symbol)) {
        console.error(`Invalid symbol format: ${symbol}`);
        return null;
      }

      // Check cache first
      const cached = this.quoteCache.get(symbol);
      if (cached && this.isCacheValid(cached)) {
        return cached.data;
      }

      // Rate limiting check
      await this.checkRateLimit();

      // Fetch from Yahoo Finance
      const quote = await this.fetchQuoteFromYahoo(symbol);
      
      if (quote) {
        // Cache the result
        this.quoteCache.set(symbol, {
          data: quote,
          timestamp: Date.now(),
          ttl: this.config.cacheTTL,
        });
      }

      return quote;
    } catch (error) {
      console.error(`Failed to fetch quote for ${symbol}:`, error);
      
      // Fallback: try to return cached data even if expired
      if (this.config.enableFallback) {
        const cached = this.quoteCache.get(symbol);
        if (cached) {
          console.log(`Returning stale cache for ${symbol}`);
          return cached.data;
        }
      }
      
      return null;
    }
  }

  /**
   * Fetch quotes for multiple symbols in batch
   */
  async getBatchQuotes(symbols: string[]): Promise<Map<string, MarketQuote | null>> {
    const results = new Map<string, MarketQuote | null>();
    
    // Process symbols in batches to respect rate limits
    const batchSize = 10;
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      
      // Fetch quotes concurrently within batch
      const promises = batch.map(symbol => 
        this.getQuote(symbol).then(quote => ({ symbol, quote }))
      );
      
      const batchResults = await Promise.allSettled(promises);
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.set(result.value.symbol, result.value.quote);
        } else {
          console.error('Batch quote fetch failed:', result.reason);
        }
      });
      
      // Add small delay between batches to avoid rate limiting
      if (i + batchSize < symbols.length) {
        await this.delay(200);
      }
    }
    
    return results;
  }

  /**
   * Fetch historical data with configurable periods and intervals
   */
  async getHistoricalData(
    symbol: string,
    period: TimePeriod = '1mo',
    interval: TimeInterval = '1d'
  ): Promise<HistoricalData | null> {
    try {
      // Validate symbol format
      if (!this.isValidSymbolFormat(symbol)) {
        console.error(`Invalid symbol format: ${symbol}`);
        return null;
      }

      // Check cache
      const cacheKey = `${symbol}_${period}_${interval}`;
      const cached = this.historicalCache.get(cacheKey);
      if (cached && this.isCacheValid(cached)) {
        return cached.data;
      }

      // Rate limiting check
      await this.checkRateLimit();

      // Fetch from Yahoo Finance
      const result = await yahooFinance.historical(symbol, {
        period1: this.getPeriodStartDate(period),
        period2: new Date(),
        interval: interval,
      });

      if (!result || result.length === 0) {
        console.error(`No historical data found for ${symbol}`);
        return null;
      }

      // Transform data
      const historicalData: HistoricalData = {
        symbol,
        data: result.map(item => ({
          date: item.date,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume,
          adjClose: item.adjClose,
        })),
        period,
        interval,
      };

      // Cache with longer TTL for historical data
      this.historicalCache.set(cacheKey, {
        data: historicalData,
        timestamp: Date.now(),
        ttl: 15 * 60 * 1000, // 15 minutes for historical data
      });

      return historicalData;
    } catch (error) {
      console.error(`Failed to fetch historical data for ${symbol}:`, error);
      
      // Fallback to cached data
      if (this.config.enableFallback) {
        const cacheKey = `${symbol}_${period}_${interval}`;
        const cached = this.historicalCache.get(cacheKey);
        if (cached) {
          console.log(`Returning stale historical cache for ${symbol}`);
          return cached.data;
        }
      }
      
      return null;
    }
  }

  /**
   * Validate symbol and get metadata
   */
  async validateSymbol(symbol: string): Promise<SymbolValidationResult> {
    try {
      // Check cache
      const cached = this.validationCache.get(symbol);
      if (cached && this.isCacheValid(cached)) {
        return cached.data;
      }

      // Rate limiting check
      await this.checkRateLimit();

      // Try to fetch a quote to validate
      const quote = await this.fetchQuoteFromYahoo(symbol);
      
      const result: SymbolValidationResult = {
        symbol,
        isValid: quote !== null,
        exchange: quote?.exchange,
        name: symbol,
        currency: quote?.currency,
      };

      // Cache validation result for longer
      this.validationCache.set(symbol, {
        data: result,
        timestamp: Date.now(),
        ttl: 60 * 60 * 1000, // 1 hour for validation
      });

      return result;
    } catch (error) {
      console.error(`Failed to validate symbol ${symbol}:`, error);
      return {
        symbol,
        isValid: false,
        error: 'Validation failed',
      };
    }
  }

  /**
   * Search for symbols
   */
  async searchSymbols(query: string): Promise<unknown[]> {
    try {
      await this.checkRateLimit();
      const results = await yahooFinance.search(query);
      return results.quotes || [];
    } catch (error) {
      console.error(`Failed to search for ${query}:`, error);
      return [];
    }
  }

  /**
   * Private helper methods
   */

  private async fetchQuoteFromYahoo(symbol: string): Promise<MarketQuote | null> {
    try {
      const result = await yahooFinance.quote(symbol);
      
      if (!result) {
        return null;
      }

      return {
        symbol: result.symbol,
        price: result.regularMarketPrice || 0,
        previousClose: result.regularMarketPreviousClose || 0,
        change: result.regularMarketChange || 0,
        changePercent: result.regularMarketChangePercent || 0,
        timestamp: new Date(result.regularMarketTime || Date.now()),
        volume: result.regularMarketVolume || 0,
        marketCap: result.marketCap,
        dayHigh: result.regularMarketDayHigh,
        dayLow: result.regularMarketDayLow,
        open: result.regularMarketOpen,
        fiftyTwoWeekHigh: result.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: result.fiftyTwoWeekLow,
        regularMarketPrice: result.regularMarketPrice,
        currency: result.currency,
        exchange: result.fullExchangeName,
        marketState: result.marketState,
      };
    } catch (error) {
      console.error(`Yahoo Finance API error for ${symbol}:`, error);
      return null;
    }
  }

  private isValidSymbolFormat(symbol: string): boolean {
    if (!symbol || typeof symbol !== 'string' || symbol.trim().length === 0) {
      return false;
    }

    // Support various exchange formats
    const patterns = [
      /^[A-Z]{1,5}$/,              // US stocks (AAPL, MSFT)
      /^[A-Z]{1,5}\.[A-Z]{2}$/,    // Indian stocks (RELIANCE.NS, INFY.BO)
      /^[A-Z]{1,5}\.[A-Z]{1,4}$/,  // Other exchanges
    ];

    return patterns.some(pattern => pattern.test(symbol.toUpperCase()));
  }

  private isCacheValid<T>(cached: CachedData<T>): boolean {
    return Date.now() - cached.timestamp < cached.ttl;
  }

  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const windowStart = now - this.config.rateLimitConfig.windowMs;
    
    // Remove timestamps outside the window
    this.requestTimestamps = this.requestTimestamps.filter(ts => ts > windowStart);
    
    // Check if we've hit the limit
    if (this.requestTimestamps.length >= this.config.rateLimitConfig.maxRequests) {
      const oldestRequest = this.requestTimestamps[0];
      const waitTime = oldestRequest + this.config.rateLimitConfig.windowMs - now;
      
      if (waitTime > 0) {
        console.log(`Rate limit reached, waiting ${waitTime}ms`);
        await this.delay(waitTime);
      }
    }
    
    // Add current request timestamp
    this.requestTimestamps.push(now);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

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
        date.setMonth(0, 1); // January 1st of current year
        break;
      case 'max':
        date.setFullYear(date.getFullYear() - 50); // 50 years back
        break;
      default:
        date.setMonth(date.getMonth() - 1); // Default to 1 month
    }

    return date;
  }

  private startCleanupInterval(): void {
    // Clean up expired cache entries every 10 minutes
    setInterval(() => {
      this.cleanupCache();
    }, 10 * 60 * 1000);
  }

  private cleanupCache(): void {
    const now = Date.now();
    
    // Clean quote cache
    for (const [key, value] of this.quoteCache.entries()) {
      if (now - value.timestamp > value.ttl * 2) { // Keep for 2x TTL
        this.quoteCache.delete(key);
      }
    }
    
    // Clean historical cache
    for (const [key, value] of this.historicalCache.entries()) {
      if (now - value.timestamp > value.ttl * 2) {
        this.historicalCache.delete(key);
      }
    }
    
    // Clean validation cache
    for (const [key, value] of this.validationCache.entries()) {
      if (now - value.timestamp > value.ttl * 2) {
        this.validationCache.delete(key);
      }
    }
    
    console.log('Cache cleanup completed');
  }

  /**
   * Public utility methods
   */

  getCacheStats() {
    return {
      quotes: this.quoteCache.size,
      historical: this.historicalCache.size,
      validations: this.validationCache.size,
      rateLimitQueue: this.requestTimestamps.length,
    };
  }

  clearCache() {
    this.quoteCache.clear();
    this.historicalCache.clear();
    this.validationCache.clear();
    console.log('All caches cleared');
  }
}

// Export singleton instance
export const marketDataService = MarketDataService.getInstance();
