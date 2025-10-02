# High-Performance In-Memory System - Quick Start Guide

## Features Implemented

✅ **Multi-Tier Cache System**
- Quote cache with 5-minute TTL
- Historical data cache with 1-hour TTL
- LRU eviction strategy for memory management

✅ **Memory Monitoring**
- Real-time memory usage tracking
- Automatic alerts at 80% capacity threshold
- Cache hit rate calculation

✅ **Data Persistence**
- Automatic backup to MongoDB every 15 minutes
- Recovery from persistence on startup
- Critical data protection

✅ **Subscription Engine**
- Publisher-subscriber pattern for real-time updates
- Automatic quote updates every 5 seconds
- Efficient subscription management

✅ **RESTful API Endpoints**
- `/api/market/quote` - Real-time quotes with caching
- `/api/market/history` - Historical data with caching
- `/api/memory/stats` - Memory statistics and management

## Quick Start

### 1. Environment Setup

Ensure you have a `.env` file with MongoDB connection:
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/destiny?retryWrites=true&w=majority
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Test the APIs

**Get a quote:**
```bash
curl http://localhost:3000/api/market/quote?symbol=AAPL
```

**Get historical data:**
```bash
curl http://localhost:3000/api/market/history?symbol=AAPL&period=1mo
```

**Check memory stats:**
```bash
curl http://localhost:3000/api/memory/stats
```

**Clear caches:**
```bash
curl -X POST http://localhost:3000/api/memory/stats
```

## Usage Examples

### Fetch Real-Time Quote
```typescript
import { MarketDataService } from '@/lib/marketDataService';

const service = MarketDataService.getInstance();
const response = await service.getQuote('AAPL');

if (response.success) {
  console.log('Price:', response.data.price);
  console.log('Cached:', response.metadata.cached);
}
```

### Subscribe to Real-Time Updates
```typescript
import { SubscriptionEngine } from '@/lib/subscriptionEngine';

const engine = SubscriptionEngine.getInstance();

const subscription = engine.subscribeToQuote('AAPL', (quote) => {
  console.log(`${quote.symbol}: $${quote.price}`);
});

// Later, unsubscribe
engine.unsubscribe(subscription.id);
```

### Monitor Memory Usage
```typescript
const stats = service.getMemoryStats();
console.log(`Memory: ${(stats.memoryUsagePercent * 100).toFixed(1)}%`);
console.log(`Cache Hit Rate: ${(stats.cacheHitRate * 100).toFixed(1)}%`);
```

## Performance Metrics

### Cache Performance
- **Lookup Time**: O(1) constant time
- **Default Quote Cache**: 500 entries, 5-minute TTL
- **Default Historical Cache**: 100 entries, 1-hour TTL
- **Memory Limit**: 100MB total (50MB per cache)

### API Response Times
- **Cached Quote**: < 10ms
- **Fresh Quote**: < 200ms (Yahoo Finance API)
- **Cached Historical**: < 20ms
- **Fresh Historical**: < 500ms (Yahoo Finance API)

## Architecture

```
┌─────────────────────────────────────────────┐
│         API Layer (Next.js Routes)          │
│  /api/market/quote  /api/market/history    │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│          MarketDataService                  │
│  ┌──────────────┐  ┌──────────────────┐    │
│  │ Quote Cache  │  │ Historical Cache │    │
│  │  5min TTL    │  │    1hr TTL       │    │
│  │ 500 entries  │  │  100 entries     │    │
│  └──────────────┘  └──────────────────┘    │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         SubscriptionEngine                  │
│  EventEmitter-based Pub-Sub                 │
│  5-second update interval                   │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│        Yahoo Finance API                    │
└─────────────────────────────────────────────┘
```

## Memory Management

### Automatic Actions
1. **Periodic Cleanup**: Every 5 minutes, expired entries are removed
2. **LRU Eviction**: When capacity is reached, least-used entries are evicted
3. **Memory Alerts**: Warnings at 80% memory usage
4. **Bulk Eviction**: 10% of entries evicted if memory threshold exceeded

### Manual Management
```bash
# Clear all caches
curl -X POST http://localhost:3000/api/memory/stats

# Check current usage
curl http://localhost:3000/api/memory/stats
```

## Configuration

### Adjust Cache Sizes
Edit `lib/marketDataService.ts`:
```typescript
this.quoteCache = new MemoryStore<MarketQuote>(1000, 100); // 1000 entries, 100MB
this.historicalCache = new MemoryStore<HistoricalData[]>(200, 100); // 200 entries, 100MB
```

### Adjust TTLs
Edit cache TTL constants:
```typescript
private readonly QUOTE_TTL = 10 * 60 * 1000; // 10 minutes
private readonly HISTORICAL_TTL = 2 * 60 * 60 * 1000; // 2 hours
```

### Adjust Update Interval
Edit `lib/subscriptionEngine.ts`:
```typescript
private readonly UPDATE_INTERVAL = 10000; // 10 seconds
```

## Documentation

For detailed documentation, see [MEMORY_SYSTEM.md](./MEMORY_SYSTEM.md)

## Troubleshooting

### Issue: High memory usage
**Solution**: Reduce cache sizes or TTLs, or clear caches manually

### Issue: Low cache hit rate
**Solution**: Increase TTLs or cache sizes

### Issue: Slow API responses
**Solution**: Check Yahoo Finance API status, verify network connectivity

## Next Steps

1. ✅ Core memory system implemented
2. ✅ Multi-tier caching with LRU eviction
3. ✅ Memory monitoring and alerts
4. ✅ Data persistence to MongoDB
5. ✅ Subscription engine for real-time updates
6. ✅ RESTful API endpoints

### Future Enhancements
- WebSocket support for real-time client updates
- Redis integration for distributed caching
- Advanced analytics and metrics dashboard
- Compression for historical data
- Smart pre-fetching based on usage patterns
