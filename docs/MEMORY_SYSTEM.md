# High-Performance In-Memory System Documentation

## Overview

The Destiny trading platform implements a sophisticated high-performance in-memory caching system designed to achieve ultra-low latency for market data access while working within MongoDB Atlas free tier constraints.

## Architecture

### Core Components

#### 1. MemoryStore (lib/memoryStore.ts)
A generic in-memory cache with intelligent memory management:

- **LRU Eviction**: Automatically evicts least-recently-used entries when capacity is reached
- **TTL Support**: Each entry has a configurable time-to-live
- **Memory Monitoring**: Tracks memory usage and alerts at 80% capacity
- **Automatic Cleanup**: Periodic cleanup of expired entries every 5 minutes

```typescript
const cache = new MemoryStore<MarketQuote>(500, 50); // 500 entries, 50MB
cache.set('AAPL', quoteData, 5 * 60 * 1000); // 5-minute TTL
const data = cache.get('AAPL');
```

#### 2. MarketDataService (lib/marketDataService.ts)
Multi-tier caching service for market data:

**Features:**
- Quote cache: 5-minute TTL, 500 entries, 50MB
- Historical cache: 1-hour TTL, 100 entries, 50MB
- Automatic data persistence to MongoDB every 15 minutes
- Recovery from persistence on startup
- Timeout protection for API calls (10 seconds)

**Usage:**
```typescript
const service = MarketDataService.getInstance();

// Get quote with automatic caching
const response = await service.getQuote('AAPL');

// Get historical data
const history = await service.getHistoricalData('AAPL', '1mo');

// Get memory statistics
const stats = service.getMemoryStats();
```

#### 3. SubscriptionEngine (lib/subscriptionEngine.ts)
Real-time data distribution using publisher-subscriber pattern:

**Features:**
- EventEmitter-based pub-sub architecture
- Automatic quote updates every 5 seconds
- Subscription management (subscribe/unsubscribe)
- Automatic cleanup when no subscribers remain

**Usage:**
```typescript
const engine = SubscriptionEngine.getInstance();

// Subscribe to quote updates
const subscription = engine.subscribeToQuote('AAPL', (quote) => {
  console.log('New price:', quote.price);
});

// Unsubscribe
engine.unsubscribe(subscription.id);
```

## API Endpoints

### GET /api/market/quote?symbol=AAPL
Fetch real-time quote for a symbol.

**Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "AAPL",
    "price": 150.25,
    "change": 2.50,
    "changePercent": 1.69,
    "volume": 50000000,
    "timestamp": "2024-01-01T12:00:00Z"
  },
  "metadata": {
    "timestamp": "2024-01-01T12:00:00Z",
    "cached": true,
    "cacheAge": 45000
  }
}
```

### GET /api/market/history?symbol=AAPL&period=1mo
Fetch historical data for a symbol.

**Parameters:**
- `symbol`: Stock symbol (required)
- `period`: Time period - `1d`, `5d`, `1mo`, `3mo`, `6mo`, `1y` (default: `1mo`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-01T00:00:00Z",
      "open": 145.00,
      "high": 151.00,
      "low": 144.50,
      "close": 150.25,
      "volume": 50000000,
      "adjClose": 150.25
    }
  ],
  "metadata": {
    "timestamp": "2024-01-01T12:00:00Z",
    "cached": false
  }
}
```

### GET /api/memory/stats
Get memory usage statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "memory": {
      "totalEntries": 125,
      "quoteCacheSize": 100,
      "historicalCacheSize": 25,
      "memoryUsageMB": "12.50",
      "memoryUsagePercent": "12.50",
      "maxMemoryMB": "100.00",
      "cacheHitRate": "85.50",
      "lastCleanup": "2024-01-01T12:00:00Z"
    },
    "subscriptions": {
      "total": 5
    },
    "alerts": []
  }
}
```

### POST /api/memory/stats
Clear all caches and subscriptions.

**Response:**
```json
{
  "success": true,
  "message": "All caches and subscriptions cleared"
}
```

## Performance Characteristics

### Cache Performance
- **Quote lookup**: O(1) - Map-based storage
- **Historical lookup**: O(1) - Map-based storage with composite keys
- **LRU eviction**: O(n) - Scans all entries to find least used
- **Memory estimation**: O(1) - Constant time calculation

### Memory Management
- **Default quote cache**: 500 entries × ~1KB = ~500KB
- **Default historical cache**: 100 entries × ~10KB = ~1MB
- **Total default allocation**: ~100MB (50MB per cache)
- **Alert threshold**: 80% of max memory
- **Automatic eviction**: 10% of entries when threshold exceeded

### Data Persistence
- **Backup interval**: Every 15 minutes
- **Recovery on startup**: Automatic from last snapshot
- **Storage location**: MongoDB collection `market_cache_snapshots`
- **Snapshot retention**: Latest snapshot only

## Configuration

### Memory Limits
Adjust memory limits in `MarketDataService` constructor:

```typescript
// Default configuration
this.quoteCache = new MemoryStore<MarketQuote>(500, 50);
this.historicalCache = new MemoryStore<HistoricalData[]>(100, 50);
```

### Cache TTLs
Modify TTL constants in `MarketDataService`:

```typescript
private readonly QUOTE_TTL = 5 * 60 * 1000; // 5 minutes
private readonly HISTORICAL_TTL = 60 * 60 * 1000; // 1 hour
```

### Subscription Update Interval
Adjust update frequency in `SubscriptionEngine`:

```typescript
private readonly UPDATE_INTERVAL = 5000; // 5 seconds
```

## Monitoring and Alerting

### Memory Alerts
The system automatically logs warnings when memory usage exceeds 80%:

```
[MemoryStore] Memory usage at 85.5% - consider evicting entries or increasing memory limit
```

### Automatic Actions
1. **Forced cleanup**: Removes expired entries
2. **Bulk eviction**: Evicts 10% of entries if still over threshold
3. **Console logging**: All significant events are logged

### Statistics Tracking
- Cache hit rate calculation
- Memory usage estimation
- Entry count tracking
- Last cleanup timestamp

## Best Practices

### 1. Cache Warming
Pre-populate cache with frequently accessed symbols on startup:

```typescript
const service = MarketDataService.getInstance();
await service.recoverFromPersistence(); // Load from MongoDB
```

### 2. Subscription Management
Always unsubscribe when data is no longer needed:

```typescript
const subscription = engine.subscribeToQuote('AAPL', callback);
// ... later
engine.unsubscribe(subscription.id);
```

### 3. Error Handling
All API responses follow consistent format with proper error codes:

```typescript
if (!response.success) {
  console.error(`Error ${response.error?.code}: ${response.error?.message}`);
}
```

### 4. Memory Monitoring
Regularly check memory statistics:

```typescript
const stats = service.getMemoryStats();
if (stats.memoryUsagePercent > 0.7) {
  console.warn('Memory usage high, consider clearing old entries');
}
```

## Integration Example

```typescript
import { MarketDataService } from '@/lib/marketDataService';
import { SubscriptionEngine } from '@/lib/subscriptionEngine';

// Initialize services
const marketService = MarketDataService.getInstance();
const subscriptionEngine = SubscriptionEngine.getInstance();

// Recover from persistence
await marketService.recoverFromPersistence();

// Subscribe to real-time updates
const subscription = subscriptionEngine.subscribeToQuote('AAPL', (quote) => {
  console.log(`AAPL: $${quote.price} (${quote.changePercent}%)`);
});

// Fetch historical data
const history = await marketService.getHistoricalData('AAPL', '1mo');
if (history.success) {
  console.log(`Retrieved ${history.data?.length} historical records`);
}

// Monitor memory usage
setInterval(async () => {
  const stats = marketService.getMemoryStats();
  console.log(`Memory: ${(stats.memoryUsagePercent * 100).toFixed(1)}%`);
  console.log(`Cache hit rate: ${(stats.cacheHitRate * 100).toFixed(1)}%`);
}, 60000); // Every minute
```

## Troubleshooting

### High Memory Usage
**Symptom**: Memory alerts appearing frequently

**Solutions:**
1. Increase memory limits in MemoryStore constructor
2. Reduce TTL values to expire entries faster
3. Manually clear caches: `POST /api/memory/stats`

### Low Cache Hit Rate
**Symptom**: Cache hit rate below 50%

**Causes:**
1. TTL too short for access pattern
2. Too many unique symbols being accessed
3. Cache size too small

**Solutions:**
1. Increase TTL values
2. Increase cache size limits
3. Pre-warm cache with popular symbols

### Memory Leaks
**Symptom**: Memory usage continuously increasing

**Solutions:**
1. Check subscription cleanup - ensure unsubscribe is called
2. Verify periodic cleanup is running (check lastCleanup timestamp)
3. Monitor for stuck intervals with `clearAll()` calls

## Future Enhancements

1. **Redis Integration**: Optional Redis backend for distributed caching
2. **Compression**: Compress historical data to reduce memory usage
3. **Smart Pre-fetching**: Predict and pre-fetch likely symbol requests
4. **Tiered Storage**: Move cold data to disk-based storage
5. **WebSocket Support**: Real-time push updates to clients
6. **Metrics Dashboard**: Visual monitoring of cache performance
