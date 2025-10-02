/**
 * Market Utilities
 * Helper functions for market data operations
 */

/**
 * Validate stock symbol format
 * Supports US (AAPL, TSLA), Indian (.NS, .BO), and other exchanges
 */
export function validateSymbol(symbol: string): boolean {
  if (!symbol || typeof symbol !== 'string') {
    return false;
  }
  
  const symbolPattern = /^[A-Z]{1,5}(\.[A-Z]{1,3})?$/;
  return symbolPattern.test(symbol.toUpperCase());
}

/**
 * Normalize symbol to uppercase format
 */
export function normalizeSymbol(symbol: string): string {
  return symbol.toUpperCase().trim();
}

/**
 * Detect market exchange from symbol
 */
export function detectExchange(symbol: string): string {
  const normalized = normalizeSymbol(symbol);
  
  if (normalized.endsWith('.NS')) {
    return 'NSE'; // National Stock Exchange of India
  } else if (normalized.endsWith('.BO')) {
    return 'BSE'; // Bombay Stock Exchange
  } else if (normalized.endsWith('.L')) {
    return 'LSE'; // London Stock Exchange
  } else if (normalized.endsWith('.TO')) {
    return 'TSX'; // Toronto Stock Exchange
  } else {
    return 'US'; // Default to US markets (NYSE/NASDAQ)
  }
}

/**
 * Check if market is likely open (simplified check)
 * Note: This is a basic implementation. Production should use proper market calendar APIs
 */
export function isMarketLikelyOpen(exchange: string = 'US'): boolean {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getUTCHours();
  
  // Weekend check
  if (day === 0 || day === 6) {
    return false;
  }
  
  // Simple hour-based check (US markets: 9:30 AM - 4:00 PM EST = 14:30 - 21:00 UTC)
  if (exchange === 'US') {
    return hour >= 14 && hour < 21;
  }
  
  // Indian markets: 9:15 AM - 3:30 PM IST = 3:45 - 10:00 UTC
  if (exchange === 'NSE' || exchange === 'BSE') {
    return hour >= 3 && hour < 10;
  }
  
  // Default: assume open during weekday business hours
  return hour >= 8 && hour < 17;
}

/**
 * Format price with appropriate decimal places
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Format large numbers (market cap, volume) with K, M, B suffixes
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + 'B';
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + 'M';
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + 'K';
  }
  return num.toString();
}

/**
 * Calculate time difference in milliseconds
 */
export function getTimeDifferenceMs(date1: Date, date2: Date = new Date()): number {
  return Math.abs(date2.getTime() - date1.getTime());
}

/**
 * Check if data is stale (older than maxAge)
 */
export function isDataStale(timestamp: Date, maxAgeMs: number): boolean {
  return getTimeDifferenceMs(timestamp) > maxAgeMs;
}

/**
 * Batch array into chunks
 */
export function batchArray<T>(array: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
}

/**
 * Sleep/delay utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | unknown;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}
