/**
 * Example: Basic Market Data Usage
 * 
 * This example demonstrates how to fetch market quotes and historical data
 * using the high-performance in-memory caching system.
 */

import { MarketDataService } from '@/lib/marketDataService';

async function basicMarketDataExample() {
  console.log('=== Basic Market Data Example ===\n');

  // Get singleton instance
  const marketService = MarketDataService.getInstance();

  // Example 1: Fetch a single quote
  console.log('1. Fetching AAPL quote...');
  const quoteResponse = await marketService.getQuote('AAPL');
  
  if (quoteResponse.success && quoteResponse.data) {
    console.log(`   Symbol: ${quoteResponse.data.symbol}`);
    console.log(`   Price: $${quoteResponse.data.price}`);
    console.log(`   Change: ${quoteResponse.data.change} (${quoteResponse.data.changePercent}%)`);
    console.log(`   Volume: ${quoteResponse.data.volume.toLocaleString()}`);
    console.log(`   Cached: ${quoteResponse.metadata?.cached ? 'Yes' : 'No'}\n`);
  }

  // Example 2: Fetch the same quote again (should be cached)
  console.log('2. Fetching AAPL quote again (should be cached)...');
  const cachedQuoteResponse = await marketService.getQuote('AAPL');
  
  if (cachedQuoteResponse.success && cachedQuoteResponse.metadata) {
    console.log(`   Cached: ${cachedQuoteResponse.metadata.cached ? 'Yes' : 'No'}`);
    if (cachedQuoteResponse.metadata.cacheAge) {
      console.log(`   Cache age: ${cachedQuoteResponse.metadata.cacheAge}ms\n`);
    }
  }

  // Example 3: Fetch historical data
  console.log('3. Fetching AAPL historical data (1 month)...');
  const historyResponse = await marketService.getHistoricalData('AAPL', '1mo');
  
  if (historyResponse.success && historyResponse.data) {
    console.log(`   Records retrieved: ${historyResponse.data.length}`);
    console.log(`   Date range: ${historyResponse.data[0].date.toLocaleDateString()} to ${historyResponse.data[historyResponse.data.length - 1].date.toLocaleDateString()}`);
    console.log(`   First close: $${historyResponse.data[0].close}`);
    console.log(`   Last close: $${historyResponse.data[historyResponse.data.length - 1].close}\n`);
  }

  // Example 4: Check memory statistics
  console.log('4. Checking memory statistics...');
  const memStats = marketService.getMemoryStats();
  console.log(`   Total entries: ${memStats.totalEntries}`);
  console.log(`   Quote cache size: ${memStats.quoteCacheSize}`);
  console.log(`   Historical cache size: ${memStats.historicalCacheSize}`);
  console.log(`   Memory usage: ${(memStats.memoryUsageBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`   Cache hit rate: ${(memStats.cacheHitRate * 100).toFixed(2)}%\n`);

  // Example 5: Fetch multiple symbols
  console.log('5. Fetching multiple symbols...');
  const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'];
  
  const results = await Promise.all(
    symbols.map(symbol => marketService.getQuote(symbol))
  );

  results.forEach((response, index) => {
    if (response.success && response.data) {
      console.log(`   ${response.data.symbol}: $${response.data.price} (${response.data.changePercent.toFixed(2)}%)`);
    }
  });

  console.log('\n=== Example Complete ===');
}

// Run the example
if (require.main === module) {
  basicMarketDataExample()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error running example:', error);
      process.exit(1);
    });
}

export { basicMarketDataExample };
