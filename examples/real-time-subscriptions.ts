/**
 * Example: Real-time Subscriptions
 * 
 * This example demonstrates how to use the subscription engine
 * for real-time market data updates.
 */

import { SubscriptionEngine } from '@/lib/subscriptionEngine';
import { MarketQuote } from '@/types/market';

async function subscriptionExample() {
  console.log('=== Real-time Subscription Example ===\n');

  // Get singleton instance
  const subscriptionEngine = SubscriptionEngine.getInstance();

  // Example 1: Subscribe to a single symbol
  console.log('1. Subscribing to AAPL real-time updates...\n');
  
  let updateCount = 0;
  const maxUpdates = 3;
  
  const aaplSubscription = subscriptionEngine.subscribeToQuote('AAPL', (quote: MarketQuote) => {
    updateCount++;
    console.log(`   [Update ${updateCount}] AAPL: $${quote.price} (${quote.changePercent.toFixed(2)}%)`);
    console.log(`   Time: ${quote.timestamp.toLocaleTimeString()}\n`);

    // Unsubscribe after receiving a few updates
    if (updateCount >= maxUpdates) {
      console.log('   Received enough updates, unsubscribing...\n');
      subscriptionEngine.unsubscribe(aaplSubscription.id);
    }
  });

  console.log(`   Subscription ID: ${aaplSubscription.id}`);
  console.log(`   Symbol: ${aaplSubscription.symbol}`);
  console.log(`   Type: ${aaplSubscription.type}\n`);

  // Example 2: Subscribe to multiple symbols
  console.log('2. Subscribing to multiple symbols...\n');

  const symbols = ['GOOGL', 'MSFT', 'AMZN'];
  const subscriptions = symbols.map(symbol => {
    return subscriptionEngine.subscribeToQuote(symbol, (quote: MarketQuote) => {
      console.log(`   ${quote.symbol}: $${quote.price} (${quote.changePercent > 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%)`);
    });
  });

  console.log(`   Created ${subscriptions.length} subscriptions`);
  console.log(`   Total active subscriptions: ${subscriptionEngine.getTotalSubscriptions()}\n`);

  // Example 3: Check active subscriptions for a symbol
  console.log('3. Checking active subscriptions for GOOGL...');
  const googlSubs = subscriptionEngine.getSubscriptions('GOOGL');
  console.log(`   Active subscriptions: ${googlSubs.length}\n`);

  // Example 4: Listen to subscription engine events
  console.log('4. Listening to subscription engine events...\n');
  
  subscriptionEngine.on('quote-update', ({ symbol, quote }) => {
    // This event fires for all quote updates
    // You can use this for logging, analytics, etc.
  });

  // Wait for some updates, then cleanup
  setTimeout(() => {
    console.log('5. Cleaning up subscriptions...');
    
    // Unsubscribe from specific subscriptions
    subscriptions.forEach(sub => {
      subscriptionEngine.unsubscribe(sub.id);
    });
    
    console.log(`   Remaining subscriptions: ${subscriptionEngine.getTotalSubscriptions()}`);
    console.log('\n=== Example Complete ===');
    
    // Note: In a real application, you would call subscriptionEngine.clearAll()
    // when shutting down the application
    process.exit(0);
  }, 20000); // Wait 20 seconds

  console.log('   Waiting for updates (will run for 20 seconds)...\n');
}

// Run the example
if (require.main === module) {
  subscriptionExample()
    .catch(error => {
      console.error('Error running example:', error);
      process.exit(1);
    });
}

export { subscriptionExample };
