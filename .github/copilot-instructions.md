# GitHub Copilot Instructions for Destiny Trading Platform

## Project Overview
**Destiny** is a high-performance, real-time trading platform built with Next.js, TypeScript, and in-memory data architecture. We're building a professional-grade financial application that rivals commercial trading platforms while operating within MongoDB Atlas free tier constraints.

## Our Development Philosophy

### 🎯 Core Values
- **Performance First**: Every millisecond matters in trading. Sub-second response times are non-negotiable.
- **Memory Over Database**: We use in-memory storage for market data to bypass storage limitations and achieve ultra-low latency.
- **Professional Quality**: Code should be production-ready, well-tested, and maintainable by enterprise development teams.
- **Financial Accuracy**: Precision is critical - no rounding errors, no data loss, no approximations in calculations.
- **Real-time Everything**: Users expect live data, instant updates, and immediate feedback.

### 🏗️ Architecture Mindset
- Favor in-memory solutions over database queries
- Implement caching at every layer
- Design for horizontal scalability from day one
- Build resilient systems with proper error handling
- Optimize for both development speed and runtime performance

## Technology Stack & Preferences

### Primary Stack
```yaml
Frontend: Next.js 14+ with App Router, TypeScript, Tailwind CSS
Backend: Next.js API Routes, Node.js
Database: MongoDB Atlas (minimal usage - user data only)
Market Data: yahoo-finance2 library exclusively
Storage: In-memory (JavaScript Maps, custom MemoryStore)
Deployment: Vercel with custom domain
Real-time: Socket.IO for WebSocket connections
Charts: Chart.js for basic charts, Plotly.js for advanced
Testing: Jest, Cypress, React Testing Library
```

### Coding Standards

#### TypeScript
- **Always use TypeScript** - no plain JavaScript files
- **Strict mode enabled** - no `any` types without explicit reasoning
- **Interface over type** for object definitions
- **Consistent naming**: PascalCase for classes/interfaces, camelCase for variables/functions
- **Explicit return types** for all public methods and complex functions

#### Code Style
```typescript
// ✅ PREFERRED: Explicit, typed, performant
export interface MarketQuote {
  symbol: string;
  price: number;
  timestamp: Date;
  volume: number;
}

export class MarketDataService {
  private cache = new Map<string, MarketQuote>();
  private readonly timeout: number = 5000;

  async getQuote(symbol: string): Promise<MarketQuote | null> {
    try {
      // Check cache first
      const cached = this.cache.get(symbol);
      if (cached && this.isValid(cached)) {
        return cached;
      }

      // Fetch from API with proper error handling
      const quote = await this.fetchFromYahooFinance(symbol);
      if (quote) {
        this.cache.set(symbol, quote);
      }
      
      return quote;
    } catch (error) {
      console.error(`Failed to fetch quote for ${symbol}:`, error);
      return null;
    }
  }
}

// ❌ AVOID: Loose typing, no error handling, unclear structure
const getQuote = async (symbol) => {
  const data = await fetch(symbol);
  return data;
}
```

#### Performance Patterns
- **Cache everything**: API responses, calculations, derived data
- **Lazy load**: Components, data, large dependencies
- **Debounce user input**: Search, typing, real-time updates
- **Batch operations**: Multiple API calls, bulk updates
- **Memory management**: Clean up subscriptions, clear unused cache

#### Error Handling
```typescript
// ✅ PREFERRED: Comprehensive error handling
try {
  const result = await riskyOperation();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  
  // Log for debugging
  if (error instanceof ValidationError) {
    return { success: false, error: 'Invalid input provided' };
  }
  
  if (error instanceof NetworkError) {
    return { success: false, error: 'Network unavailable, please retry' };
  }
  
  // Generic fallback
  return { success: false, error: 'Operation failed, please try again' };
}

// ❌ AVOID: Silent failures, unclear errors
try {
  await riskyOperation();
} catch (error) {
  // Silent failure
}
```

## Domain-Specific Guidance

### Financial Calculations
- **Use precise decimal libraries** for currency calculations when needed
- **Never use floating-point** arithmetic for money values without consideration
- **Always validate** financial data before processing
- **Include units** in variable names: `priceUSD`, `volumeShares`, `percentChange`

### Trading Strategy Implementation
```typescript
// ✅ PREFERRED: Clear, testable strategy pattern
export abstract class BaseStrategy {
  abstract analyze(symbol: string, data: HistoricalData[]): StrategyResult;
  
  protected calculateMA(prices: number[], period: number): number[] {
    // Implementation with proper edge case handling
  }
}

export class MovingAverageStrategy extends BaseStrategy {
  constructor(
    private shortPeriod: number = 10,
    private longPeriod: number = 20
  ) {
    super();
    this.validatePeriods();
  }
  
  analyze(symbol: string, data: HistoricalData[]): StrategyResult {
    // Clear, step-by-step implementation
    // 1. Validate input data
    // 2. Calculate moving averages
    // 3. Detect crossovers
    // 4. Calculate confidence
    // 5. Return structured result
  }
}
```

### Real-time Data Handling
- **Use WebSockets** for real-time updates, not polling
- **Implement reconnection logic** with exponential backoff
- **Throttle updates** to prevent UI flooding
- **Handle connection states** explicitly (connecting, connected, disconnected)

### API Design Patterns
```typescript
// ✅ PREFERRED: Consistent API response format
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
  metadata?: {
    timestamp: string;
    cached: boolean;
    cacheAge?: number;
  };
}

// All API routes should return this format
export default async function handler(req: NextApiRequest, res: NextApiResponse<APIResponse<MarketQuote>>) {
  try {
    const quote = await marketService.getQuote(req.query.symbol as string);
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SYMBOL_NOT_FOUND',
          message: 'Stock symbol not found',
          details: 'Please verify the symbol is correct and market is open'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: quote,
      metadata: {
        timestamp: new Date().toISOString(),
        cached: false
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch market data'
      }
    });
  }
}
```

## Component Architecture

### React Components
- **Functional components** with hooks over class components
- **Custom hooks** for complex logic and state management
- **Memoization** for expensive calculations and frequent re-renders
- **Error boundaries** for graceful error handling
- **Loading states** for all async operations

```typescript
// ✅ PREFERRED: Well-structured component pattern
interface TradingChartProps {
  symbol: string;
  data: HistoricalData[];
  strategies?: StrategyResult[];
  onSymbolChange?: (symbol: string) => void;
}

export const TradingChart: React.FC<TradingChartProps> = ({ 
  symbol, 
  data, 
  strategies,
  onSymbolChange 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Custom hook for chart management
  const { chartRef, updateChart } = useChart();
  
  // Memoized expensive calculations
  const chartData = useMemo(() => {
    return transformDataForChart(data, strategies);
  }, [data, strategies]);
  
  // Error boundary integration
  if (error) {
    return <ErrorDisplay message={error} onRetry={() => setError(null)} />;
  }
  
  return (
    <div className="trading-chart-container">
      {isLoading && <LoadingSpinner />}
      <canvas ref={chartRef} />
    </div>
  );
};
```

## Security & Best Practices

### Data Validation
- **Validate all inputs** at API boundaries
- **Sanitize user data** before processing
- **Use schema validation** (Zod, Yup) for complex objects
- **Rate limit API endpoints** to prevent abuse

### Performance Monitoring
- **Monitor memory usage** in production
- **Track API response times** and cache hit rates
- **Alert on errors** and performance degradation
- **Use proper logging** for debugging

### Testing Strategy
- **Unit tests** for all business logic and utility functions
- **Integration tests** for API endpoints and external services
- **Component tests** for React components with user interactions
- **E2E tests** for critical user workflows

## Code Generation Guidelines

When generating code for this project:

1. **Always include proper TypeScript typing** and interfaces
2. **Implement comprehensive error handling** with specific error types
3. **Add performance optimizations** like caching and memoization
4. **Include loading states and error boundaries** in React components
5. **Follow our API response format** for consistency
6. **Add inline comments** explaining complex financial logic
7. **Consider edge cases** like market closures, invalid symbols, network failures
8. **Implement proper cleanup** for subscriptions and event listeners

## Examples to Follow

### Market Data Fetching
```typescript
export class MarketDataService {
  private static instance: MarketDataService;
  private cache = new Map<string, CachedQuote>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  async getQuote(symbol: string): Promise<MarketQuote | null> {
    // 1. Validate symbol format
    // 2. Check cache first
    // 3. Fetch from yahoo-finance2 with timeout
    // 4. Transform data to our format
    // 5. Cache result
    // 6. Return standardized response
  }
}
```

### Strategy Implementation
```typescript
export class RSIStrategy extends BaseStrategy {
  constructor(
    private period: number = 14,
    private oversold: number = 30,
    private overbought: number = 70
  ) {
    super();
  }

  analyze(symbol: string, data: HistoricalData[]): StrategyResult {
    // Clear step-by-step RSI calculation
    // with proper mathematical implementation
  }
}
```

Remember: We're building a professional trading platform that real traders will use. Every line of code should reflect the quality and performance standards expected in financial software.

## Quick Reference

### Imports to Use
```typescript
// Market data
import yahooFinance from 'yahoo-finance2';

// Next.js
import { NextApiRequest, NextApiResponse } from 'next';
import { useRouter } from 'next/router';

// React
import { useState, useEffect, useMemo, useCallback } from 'react';

// Styling
import clsx from 'clsx'; // for conditional classes

// Utilities
import { z } from 'zod'; // for validation
```

### File Naming Conventions
- Components: `PascalCase.tsx` (TradingChart.tsx)
- Utilities: `camelCase.ts` (marketUtils.ts)
- API Routes: `[dynamic].ts` ([symbol].ts)
- Types: `camelCase.ts` (marketTypes.ts)
- Classes: `PascalCase.ts` (MarketDataService.ts)

