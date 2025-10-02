# Market Data Integration - Quick Start

## 🚀 Quick Start

The Market Data Integration provides real-time and historical market data for US and Indian markets using Yahoo Finance.

## 📦 API Endpoints

### Get Real-time Quote
```bash
GET /api/market/quote/AAPL
GET /api/market/quote/RELIANCE.NS
```

### Get Historical Data
```bash
GET /api/market/historical/AAPL?period=1mo&interval=1d
GET /api/market/historical/INFY.BO?period=1y&interval=1wk
```

### Batch Quotes
```bash
POST /api/market/batch-quotes
Body: { "symbols": ["AAPL", "MSFT", "GOOGL"] }

# OR via GET
GET /api/market/batch-quotes?symbols=AAPL,MSFT,GOOGL
```

### Search Symbols
```bash
GET /api/market/search?q=apple
GET /api/market/search?q=reliance
```

### Validate Symbol
```bash
GET /api/market/validate-symbol?symbol=AAPL
```

## 🌍 Supported Markets

- **US Stocks**: `AAPL`, `MSFT`, `GOOGL`, `TSLA`, etc.
- **Indian NSE**: `RELIANCE.NS`, `TCS.NS`, `INFY.NS`, etc.
- **Indian BSE**: `RELIANCE.BO`, `TCS.BO`, `INFY.BO`, etc.

## 💡 Usage Example

```typescript
// Fetch a quote
const response = await fetch('/api/market/quote/AAPL');
const data = await response.json();

if (data.success) {
  console.log(`${data.data.symbol}: $${data.data.price}`);
}
```

## ⚡ Features

- ✅ Real-time quotes with 5-minute caching
- ✅ Historical OHLCV data (1d to 5y periods)
- ✅ Batch processing (up to 50 symbols)
- ✅ Rate limiting (48 requests/minute)
- ✅ Automatic fallback to cached data
- ✅ Multi-exchange support (NASDAQ, NYSE, NSE, BSE)

## 📚 Full Documentation

See [MARKET_DATA_INTEGRATION.md](./MARKET_DATA_INTEGRATION.md) for complete documentation including:
- Detailed API reference
- Response formats
- Error handling
- Performance tips
- React component examples

## 🔧 Configuration

The service uses default settings optimized for performance:
- Quote cache: 5 minutes
- Historical cache: 15 minutes
- Rate limit: 48 requests/minute
- Batch size: Max 50 symbols

## 📊 Cache Statistics

```typescript
import { marketDataService } from '@/lib/marketDataService';

const stats = marketDataService.getCacheStats();
// { quotes: 5, historical: 2, validations: 3, rateLimitQueue: 8 }
```

## ⚠️ Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "SYMBOL_NOT_FOUND",
    "message": "Stock symbol not found",
    "details": "Please verify the symbol is correct..."
  }
}
```

## 🎯 Best Practices

1. Use batch endpoints for multiple symbols
2. Respect cache TTL to minimize API calls
3. Implement proper error handling
4. Monitor rate limits with cache stats
5. Use appropriate refresh intervals (5-10 minutes)

---

Built for the Destiny Trading Platform 🚀
