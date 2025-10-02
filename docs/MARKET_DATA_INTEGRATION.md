# Market Data Integration Documentation

## Overview

The Market Data Integration provides a comprehensive solution for fetching real-time and historical market data from Yahoo Finance. It features in-memory caching, rate limiting, batch processing, and support for multiple exchanges including US markets (NASDAQ, NYSE) and Indian markets (NSE, BSE).

## Features

✅ **Real-time Quote Engine**: Fetch live prices for US & Indian markets  
✅ **Historical Data Service**: OHLCV data with configurable periods (1d to 5y) and intervals  
✅ **Multi-symbol Support**: Batch processing for watchlists and portfolios  
✅ **Fallback Mechanisms**: Graceful degradation when Yahoo Finance is unavailable  
✅ **Rate Limiting**: Smart throttling to prevent API blocking (48 requests/minute)  
✅ **Symbol Validation**: Support for NSE (.NS), BSE (.BO), NASDAQ, NYSE formats  
✅ **In-memory Caching**: High-performance caching with configurable TTL  
✅ **Symbol Search**: Search for stocks by name or symbol  

## Architecture

### MarketDataService

The core service is implemented as a singleton class with the following capabilities:

- **In-memory caching** with separate caches for quotes, historical data, and validations
- **Rate limiting** with a sliding window algorithm (48 requests per minute)
- **Automatic cache cleanup** every 10 minutes
- **Fallback mechanisms** that return stale cache data when API fails
- **Batch processing** with configurable batch sizes

### API Endpoints

#### 1. Real-time Quote

```
GET /api/market/quote/[symbol]
```

Fetch real-time quote for a single symbol.

**Example:**
```bash
curl http://localhost:3000/api/market/quote/AAPL
curl http://localhost:3000/api/market/quote/RELIANCE.NS
```

**Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "AAPL",
    "price": 175.43,
    "previousClose": 174.50,
    "change": 0.93,
    "changePercent": 0.53,
    "timestamp": "2024-01-15T20:00:00.000Z",
    "volume": 52847392,
    "marketCap": 2748000000000,
    "dayHigh": 176.82,
    "dayLow": 174.21,
    "open": 175.00,
    "fiftyTwoWeekHigh": 199.62,
    "fiftyTwoWeekLow": 124.17,
    "currency": "USD",
    "exchange": "NasdaqGS",
    "marketState": "CLOSED"
  },
  "metadata": {
    "timestamp": "2024-01-15T20:15:30.000Z",
    "cached": false,
    "source": "yahoo-finance2"
  }
}
```

#### 2. Historical Data

```
GET /api/market/historical/[symbol]?period=1mo&interval=1d
```

Fetch historical OHLCV data with configurable periods and intervals.

**Parameters:**
- `period`: `1d`, `5d`, `1mo`, `3mo`, `6mo`, `1y`, `2y`, `5y`, `10y`, `ytd`, `max`
- `interval`: `1m`, `2m`, `5m`, `15m`, `30m`, `60m`, `90m`, `1h`, `1d`, `5d`, `1wk`, `1mo`, `3mo`

**Example:**
```bash
curl "http://localhost:3000/api/market/historical/AAPL?period=1mo&interval=1d"
curl "http://localhost:3000/api/market/historical/INFY.BO?period=1y&interval=1wk"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "AAPL",
    "period": "1mo",
    "interval": "1d",
    "data": [
      {
        "date": "2024-01-02T00:00:00.000Z",
        "open": 187.15,
        "high": 188.44,
        "low": 183.89,
        "close": 185.64,
        "volume": 82488200,
        "adjClose": 185.64
      }
      // ... more data points
    ]
  },
  "metadata": {
    "timestamp": "2024-01-15T20:15:30.000Z",
    "cached": false,
    "source": "yahoo-finance2"
  }
}
```

#### 3. Batch Quotes

```
POST /api/market/batch-quotes
GET /api/market/batch-quotes?symbols=AAPL,MSFT,GOOGL
```

Fetch quotes for multiple symbols in a single request.

**POST Body:**
```json
{
  "symbols": ["AAPL", "MSFT", "GOOGL", "RELIANCE.NS", "INFY.BO"]
}
```

**GET Example:**
```bash
curl "http://localhost:3000/api/market/batch-quotes?symbols=AAPL,MSFT,GOOGL"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "quotes": {
      "AAPL": {
        "symbol": "AAPL",
        "price": 175.43,
        // ... full quote data
      },
      "MSFT": {
        "symbol": "MSFT",
        "price": 378.91,
        // ... full quote data
      }
      // ... more quotes
    },
    "successful": 5,
    "failed": 0
  },
  "metadata": {
    "timestamp": "2024-01-15T20:15:30.000Z",
    "cached": false,
    "source": "yahoo-finance2"
  }
}
```

**Limits:**
- Maximum 50 symbols per batch
- Automatically batched in groups of 10 to respect rate limits

#### 4. Symbol Validation

```
GET /api/market/validate-symbol?symbol=AAPL
```

Validate a symbol and get metadata.

**Example:**
```bash
curl "http://localhost:3000/api/market/validate-symbol?symbol=AAPL"
curl "http://localhost:3000/api/market/validate-symbol?symbol=RELIANCE.NS"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "AAPL",
    "isValid": true,
    "exchange": "NasdaqGS",
    "name": "AAPL",
    "currency": "USD"
  },
  "metadata": {
    "timestamp": "2024-01-15T20:15:30.000Z",
    "cached": false,
    "source": "yahoo-finance2"
  }
}
```

#### 5. Symbol Search

```
GET /api/market/search?q=apple
```

Search for symbols by name or ticker.

**Example:**
```bash
curl "http://localhost:3000/api/market/search?q=apple"
curl "http://localhost:3000/api/market/search?q=reliance"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "exchange": "NASDAQ",
      "type": "EQUITY"
    },
    {
      "symbol": "AAPL.MX",
      "name": "Apple Inc.",
      "exchange": "Mexico",
      "type": "EQUITY"
    }
    // ... more results
  ],
  "metadata": {
    "timestamp": "2024-01-15T20:15:30.000Z",
    "cached": false,
    "source": "yahoo-finance2"
  }
}
```

## Supported Exchange Formats

### US Markets
- **NASDAQ**: `AAPL`, `MSFT`, `GOOGL`, `TSLA`
- **NYSE**: `IBM`, `JPM`, `WMT`, `DIS`

### Indian Markets
- **NSE (National Stock Exchange)**: Add `.NS` suffix
  - Examples: `RELIANCE.NS`, `TCS.NS`, `INFY.NS`, `HDFCBANK.NS`
- **BSE (Bombay Stock Exchange)**: Add `.BO` suffix
  - Examples: `RELIANCE.BO`, `TCS.BO`, `INFY.BO`, `HDFCBANK.BO`

### Other Markets
The service supports various international exchanges through Yahoo Finance's symbol format.

## Usage Examples

### TypeScript/JavaScript Client

```typescript
import type { APIResponse, MarketQuote, HistoricalData } from '@/types/market';

// Fetch single quote
async function getStockQuote(symbol: string) {
  const response = await fetch(`/api/market/quote/${symbol}`);
  const data: APIResponse<MarketQuote> = await response.json();
  
  if (data.success) {
    console.log(`${data.data.symbol}: $${data.data.price}`);
  } else {
    console.error('Error:', data.error?.message);
  }
}

// Fetch historical data
async function getHistoricalData(symbol: string) {
  const response = await fetch(
    `/api/market/historical/${symbol}?period=1mo&interval=1d`
  );
  const data: APIResponse<HistoricalData> = await response.json();
  
  if (data.success && data.data) {
    console.log(`Retrieved ${data.data.data.length} data points`);
  }
}

// Batch fetch quotes
async function getWatchlistQuotes(symbols: string[]) {
  const response = await fetch('/api/market/batch-quotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbols }),
  });
  
  const data = await response.json();
  if (data.success) {
    Object.entries(data.data.quotes).forEach(([symbol, quote]) => {
      if (quote) {
        console.log(`${symbol}: $${quote.price}`);
      }
    });
  }
}

// Usage
getStockQuote('AAPL');
getStockQuote('RELIANCE.NS');
getHistoricalData('TSLA');
getWatchlistQuotes(['AAPL', 'MSFT', 'GOOGL', 'RELIANCE.NS', 'INFY.BO']);
```

### React Component Example

```tsx
import { useState, useEffect } from 'react';
import type { MarketQuote } from '@/types/market';

export function StockQuote({ symbol }: { symbol: string }) {
  const [quote, setQuote] = useState<MarketQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuote() {
      try {
        setLoading(true);
        const response = await fetch(`/api/market/quote/${symbol}`);
        const data = await response.json();
        
        if (data.success) {
          setQuote(data.data);
        } else {
          setError(data.error?.message || 'Failed to fetch quote');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }

    fetchQuote();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchQuote, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [symbol]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!quote) return null;

  return (
    <div className="stock-quote">
      <h3>{quote.symbol}</h3>
      <div className="price">${quote.price.toFixed(2)}</div>
      <div className={quote.change >= 0 ? 'positive' : 'negative'}>
        {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} 
        ({quote.changePercent.toFixed(2)}%)
      </div>
    </div>
  );
}
```

## Caching Strategy

### Cache TTL (Time To Live)
- **Quotes**: 5 minutes
- **Historical Data**: 15 minutes
- **Symbol Validation**: 1 hour

### Cache Behavior
- Cache is checked before making API calls
- Stale cache is returned as fallback when API fails
- Automatic cleanup runs every 10 minutes
- Cache entries are removed after 2x TTL

### Cache Statistics
```typescript
import { marketDataService } from '@/lib/marketDataService';

const stats = marketDataService.getCacheStats();
console.log(stats);
// {
//   quotes: 5,
//   historical: 2,
//   validations: 3,
//   rateLimitQueue: 8
// }
```

## Rate Limiting

### Configuration
- **Max Requests**: 48 per minute (conservative limit)
- **Window**: 60 seconds sliding window
- **Behavior**: Automatically delays requests when limit is reached

### Best Practices
1. Use batch endpoints for multiple symbols
2. Cache results on your end when possible
3. Implement exponential backoff for retries
4. Monitor rate limit queue size

## Error Handling

All API endpoints return a consistent error format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional details about the error"
  }
}
```

### Common Error Codes

- `MISSING_SYMBOL`: Symbol parameter not provided
- `MISSING_QUERY`: Query parameter not provided
- `SYMBOL_NOT_FOUND`: Symbol doesn't exist or market is closed
- `DATA_NOT_FOUND`: No data available for requested parameters
- `INVALID_PERIOD`: Invalid period parameter
- `INVALID_INTERVAL`: Invalid interval parameter
- `BATCH_TOO_LARGE`: Batch size exceeds 50 symbols
- `INVALID_REQUEST`: Malformed request
- `INTERNAL_ERROR`: Server-side error

## Performance Considerations

### Optimization Tips

1. **Use Batch Endpoints**: Fetch multiple symbols in one request
2. **Cache on Frontend**: Don't refetch data unnecessarily
3. **Optimize Intervals**: Use appropriate refresh intervals (5-10 minutes for quotes)
4. **Lazy Load**: Only fetch data when needed
5. **Prefetch**: Load data for watchlists in background

### Typical Response Times

- **Single Quote**: 100-500ms (first request), <10ms (cached)
- **Batch Quotes (10 symbols)**: 500-2000ms
- **Historical Data**: 500-1500ms
- **Search**: 200-800ms
- **Validation**: 100-500ms

## Monitoring and Debugging

### Service Health Check

```typescript
import { marketDataService } from '@/lib/marketDataService';

// Get cache statistics
const stats = marketDataService.getCacheStats();

// Clear cache if needed
marketDataService.clearCache();
```

### Logging

The service logs important events:
- API errors with symbol and error details
- Rate limiting events
- Cache cleanup operations
- Fallback to stale cache

Check your application logs for these messages.

## Migration from Old Search API

If you were using the old `/api/search` endpoint, migrate to the new endpoints:

### Before:
```typescript
const results = await fetch('/api/search');
```

### After:
```typescript
// For symbol search
const results = await fetch('/api/market/search?q=INFY.NS');

// For quotes
const quote = await fetch('/api/market/quote/INFY.NS');
```

## Future Enhancements

Potential future improvements:
- WebSocket support for real-time streaming
- More granular rate limiting per IP
- Redis caching for multi-instance deployments
- Additional technical indicators
- Options and futures data
- News and fundamentals integration

## Support

For issues or questions:
1. Check this documentation
2. Review the TypeScript types in `/types/market.ts`
3. Examine the service code in `/lib/marketDataService.ts`
4. Check API route implementations in `/app/api/market/`

## License

Part of the Destiny Trading Platform - Professional trading application built with Next.js and Yahoo Finance integration.
