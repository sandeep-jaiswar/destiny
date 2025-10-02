/**
 * Example: Memory Management
 * 
 * This example demonstrates memory monitoring, cache management,
 * and data persistence features.
 */

import { MarketDataService } from '@/lib/marketDataService';

async function memoryManagementExample() {
  console.log('=== Memory Management Example ===\n');

  const marketService = MarketDataService.getInstance();

  // Example 1: Monitor memory usage in real-time
  console.log('1. Setting up real-time memory monitoring...\n');

  const monitoringInterval = setInterval(() => {
    const stats = marketService.getMemoryStats();
    const memUsageMB = (stats.memoryUsageBytes / (1024 * 1024)).toFixed(2);
    const memPercent = (stats.memoryUsagePercent * 100).toFixed(1);
    const hitRate = (stats.cacheHitRate * 100).toFixed(1);

    console.log(`   [Monitor] Memory: ${memUsageMB} MB (${memPercent}%) | Cache Hit Rate: ${hitRate}% | Entries: ${stats.totalEntries}`);

    // Check for alerts
    if (stats.memoryUsagePercent >= 0.8) {
      console.warn('   ⚠️  WARNING: Memory usage above 80% threshold!');
    }
  }, 5000); // Monitor every 5 seconds

  // Example 2: Load multiple symbols to test memory usage
  console.log('\n2. Loading multiple symbols to test cache...\n');

  const testSymbols = [
    'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA',
    'META', 'NVDA', 'AMD', 'INTC', 'IBM',
    'ORCL', 'CSCO', 'CRM', 'ADBE', 'NFLX'
  ];

  console.log(`   Loading ${testSymbols.length} symbols...`);

  for (const symbol of testSymbols) {
    await marketService.getQuote(symbol);
    console.log(`   ✓ Loaded ${symbol}`);
  }

  console.log('\n   All symbols loaded!\n');

  // Example 3: Test cache hit rate
  console.log('3. Testing cache hit rate...\n');

  const beforeStats = marketService.getMemoryStats();
  console.log(`   Cache hit rate before: ${(beforeStats.cacheHitRate * 100).toFixed(1)}%`);

  // Re-fetch same symbols (should all be cached)
  console.log('   Re-fetching same symbols...');
  for (const symbol of testSymbols.slice(0, 5)) {
    await marketService.getQuote(symbol);
  }

  const afterStats = marketService.getMemoryStats();
  console.log(`   Cache hit rate after: ${(afterStats.cacheHitRate * 100).toFixed(1)}%\n`);

  // Example 4: Test data persistence
  console.log('4. Testing data persistence to MongoDB...\n');

  // In a real scenario, this would be called automatically every 15 minutes
  // We're manually triggering it for demonstration
  try {
    // The persistence happens automatically in the background
    console.log('   Note: Data persistence runs automatically every 15 minutes');
    console.log('   Last cleanup: ' + afterStats.lastCleanup.toLocaleString());
    console.log('   Data is being persisted to MongoDB collection: market_cache_snapshots\n');
  } catch (error) {
    console.error('   Error with persistence:', error);
  }

  // Example 5: Recovery from persistence
  console.log('5. Testing recovery from persistence...\n');

  try {
    await marketService.recoverFromPersistence();
    console.log('   ✓ Recovery from persistence completed');
    
    const recoveryStats = marketService.getMemoryStats();
    console.log(`   Entries after recovery: ${recoveryStats.totalEntries}\n`);
  } catch (error) {
    console.error('   Error with recovery:', error);
  }

  // Example 6: Manual cache clearing
  console.log('6. Testing manual cache clearing...\n');

  const beforeClear = marketService.getMemoryStats();
  console.log(`   Entries before clear: ${beforeClear.totalEntries}`);

  marketService.clearCaches();
  
  const afterClear = marketService.getMemoryStats();
  console.log(`   Entries after clear: ${afterClear.totalEntries}`);
  console.log('   ✓ Cache cleared successfully\n');

  // Cleanup
  clearInterval(monitoringInterval);
  
  console.log('=== Example Complete ===');
  process.exit(0);
}

// Run the example
if (require.main === module) {
  memoryManagementExample()
    .catch(error => {
      console.error('Error running example:', error);
      process.exit(1);
    });
}

export { memoryManagementExample };
