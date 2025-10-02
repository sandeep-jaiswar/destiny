# High-Performance In-Memory System - Examples

This directory contains practical examples demonstrating how to use the high-performance in-memory caching system in the Destiny trading platform.

## Available Examples

### 1. Basic Market Data (`basic-market-data.ts`)

Demonstrates fundamental market data operations:
- Fetching real-time quotes
- Accessing historical data
- Understanding cache behavior
- Monitoring memory statistics
- Batch fetching multiple symbols

**Run:**
```bash
npx ts-node examples/basic-market-data.ts
```

**Key concepts covered:**
- Singleton pattern usage
- API response handling
- Cache hit/miss detection
- Memory metrics interpretation

---

### 2. Real-time Subscriptions (`real-time-subscriptions.ts`)

Shows how to use the subscription engine for real-time updates:
- Creating subscriptions for symbols
- Handling real-time quote updates
- Managing multiple subscriptions
- Proper cleanup and unsubscription
- Event-based architecture

**Run:**
```bash
npx ts-node examples/real-time-subscriptions.ts
```

**Key concepts covered:**
- Publisher-subscriber pattern
- Event handling
- Subscription lifecycle management
- Real-time data streaming

---

### 3. Memory Management (`memory-management.ts`)

Demonstrates advanced memory management features:
- Real-time memory monitoring
- Cache hit rate optimization
- Data persistence to MongoDB
- Recovery from persistence
- Manual cache clearing
- Memory threshold alerts

**Run:**
```bash
npx ts-node examples/memory-management.ts
```

**Key concepts covered:**
- Memory monitoring
- Persistence and recovery
- Cache optimization
- Performance metrics

---

## Prerequisites

Before running these examples, ensure you have:

1. **Environment configured**: `.env` file with `MONGODB_URI`
2. **Dependencies installed**: `npm install`
3. **Development server** (optional): For API endpoint examples

## Running Examples

### Using ts-node (Recommended)
```bash
npx ts-node examples/basic-market-data.ts
```

### Using Next.js Development Mode

These examples can also be imported and used within Next.js pages or API routes:

```typescript
import { basicMarketDataExample } from '@/examples/basic-market-data';

export default async function DemoPage() {
  await basicMarketDataExample();
  return <div>Check console for output</div>;
}
```

## Understanding the Output

### Example 1: Basic Market Data
```
=== Basic Market Data Example ===

1. Fetching AAPL quote...
   Symbol: AAPL
   Price: $150.25
   Change: 2.50 (1.69%)
   Volume: 50,000,000
   Cached: No

2. Fetching AAPL quote again (should be cached)...
   Cached: Yes
   Cache age: 45ms

3. Fetching AAPL historical data (1 month)...
   Records retrieved: 21
   Date range: 12/1/2023 to 1/1/2024
   First close: $145.00
   Last close: $150.25

4. Checking memory statistics...
   Total entries: 2
   Quote cache size: 1
   Historical cache size: 1
   Memory usage: 2.05 MB
   Cache hit rate: 50.00%
```

### Example 2: Real-time Subscriptions
```
=== Real-time Subscription Example ===

1. Subscribing to AAPL real-time updates...
   Subscription ID: AAPL:quote:1234567890:abc123def
   Symbol: AAPL
   Type: quote

   [Update 1] AAPL: $150.25 (1.69%)
   Time: 2:30:45 PM

   [Update 2] AAPL: $150.30 (1.72%)
   Time: 2:30:50 PM

   [Update 3] AAPL: $150.28 (1.71%)
   Time: 2:30:55 PM

   Received enough updates, unsubscribing...
```

### Example 3: Memory Management
```
=== Memory Management Example ===

1. Setting up real-time memory monitoring...
   [Monitor] Memory: 12.50 MB (12.5%) | Cache Hit Rate: 85.0% | Entries: 15

2. Loading multiple symbols to test cache...
   Loading 15 symbols...
   ✓ Loaded AAPL
   ✓ Loaded GOOGL
   ...
   All symbols loaded!

3. Testing cache hit rate...
   Cache hit rate before: 50.0%
   Re-fetching same symbols...
   Cache hit rate after: 75.0%
```

## Modifying Examples

Feel free to modify these examples to test different scenarios:

### Test Different Symbols
```typescript
const symbols = ['AAPL', 'GOOGL', 'MSFT']; // Change to your preferred symbols
```

### Adjust Update Intervals
```typescript
const maxUpdates = 5; // Increase for more updates
```

### Test Memory Limits
```typescript
// In marketDataService.ts
this.quoteCache = new MemoryStore<MarketQuote>(10, 1); // Small cache for testing
```

## Troubleshooting

### Issue: "Module not found" errors
**Solution**: Run `npm install` to ensure all dependencies are installed

### Issue: Network timeout errors
**Solution**: 
- Check internet connectivity
- Verify Yahoo Finance API is accessible
- Increase timeout in `marketDataService.ts`

### Issue: MongoDB connection errors
**Solution**:
- Verify `MONGODB_URI` in `.env` file
- Check MongoDB Atlas cluster is running
- Ensure IP whitelist includes your current IP

### Issue: No real-time updates
**Solution**:
- Wait at least 5 seconds (update interval)
- Verify subscription was created successfully
- Check console for error messages

## Best Practices

1. **Always unsubscribe**: Call `unsubscribe()` when done to prevent memory leaks
2. **Monitor memory**: Regularly check memory stats in production
3. **Handle errors**: Wrap calls in try-catch blocks
4. **Optimize cache**: Adjust TTL based on your use case
5. **Test thoroughly**: Run examples in development before deploying

## Integration Patterns

### Pattern 1: API Endpoint Integration
```typescript
// app/api/portfolio/route.ts
import { MarketDataService } from '@/lib/marketDataService';

export async function GET() {
  const service = MarketDataService.getInstance();
  const quote = await service.getQuote('AAPL');
  return Response.json(quote);
}
```

### Pattern 2: React Component Integration
```typescript
// components/StockQuote.tsx
'use client';

import { useEffect, useState } from 'react';

export function StockQuote({ symbol }: { symbol: string }) {
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    fetch(`/api/market/quote?symbol=${symbol}`)
      .then(res => res.json())
      .then(data => setQuote(data.data));
  }, [symbol]);

  return <div>{quote?.price}</div>;
}
```

### Pattern 3: Background Job Integration
```typescript
// jobs/update-portfolio.ts
import { MarketDataService } from '@/lib/marketDataService';

export async function updatePortfolio() {
  const service = MarketDataService.getInstance();
  const symbols = ['AAPL', 'GOOGL', 'MSFT'];
  
  const quotes = await Promise.all(
    symbols.map(symbol => service.getQuote(symbol))
  );
  
  // Process quotes...
}
```

## Additional Resources

- [MEMORY_SYSTEM.md](../docs/MEMORY_SYSTEM.md) - Detailed technical documentation
- [QUICKSTART.md](../docs/QUICKSTART.md) - Quick start guide
- [README.md](../README.md) - Main project documentation

## Contributing

If you create useful examples, consider contributing them back to the project!
