/**
 * Example Market Data Components
 * 
 * Demonstrates how to use the Market Data Integration in React components
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MarketQuote, HistoricalData, APIResponse } from '@/types/market';

/**
 * Single Stock Quote Component
 * 
 * Usage:
 *   <StockQuote symbol="AAPL" />
 *   <StockQuote symbol="RELIANCE.NS" />
 */
export function StockQuote({ symbol }: { symbol: string }) {
  const [quote, setQuote] = useState<MarketQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/market/quote/${symbol}`);
      const data: APIResponse<MarketQuote> = await response.json();
      
      if (data.success && data.data) {
        setQuote(data.data);
      } else {
        setError(data.error?.message || 'Failed to fetch quote');
      }
    } catch (err) {
      setError('Network error');
      console.error('Error fetching quote:', err);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchQuote();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchQuote, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchQuote]);

  if (loading && !quote) {
    return (
      <div className="p-4 border rounded-lg animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 rounded-lg bg-red-50">
        <p className="text-red-600 text-sm">Error: {error}</p>
        <button
          onClick={fetchQuote}
          className="mt-2 text-xs text-red-600 underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!quote) return null;

  const isPositive = quote.change >= 0;

  return (
    <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{quote.symbol}</h3>
        {quote.marketState && (
          <span className={`text-xs px-2 py-1 rounded ${
            quote.marketState === 'REGULAR' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {quote.marketState}
          </span>
        )}
      </div>
      
      <div className="text-3xl font-bold mb-1">
        {quote.currency === 'INR' ? '₹' : '$'}{quote.price.toFixed(2)}
      </div>
      
      <div className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? '↑' : '↓'} {isPositive ? '+' : ''}{quote.change.toFixed(2)} 
        ({isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%)
      </div>
      
      {quote.volume && (
        <div className="text-xs text-gray-500 mt-2">
          Volume: {quote.volume.toLocaleString()}
        </div>
      )}
      
      {quote.timestamp && (
        <div className="text-xs text-gray-400 mt-1">
          Updated: {new Date(quote.timestamp).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

/**
 * Watchlist Component - Display multiple stock quotes
 * 
 * Usage:
 *   <Watchlist symbols={['AAPL', 'MSFT', 'GOOGL', 'RELIANCE.NS']} />
 */
export function Watchlist({ symbols }: { symbols: string[] }) {
  const [quotes, setQuotes] = useState<Record<string, MarketQuote | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/market/batch-quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols }),
      });
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setQuotes(data.data.quotes);
      } else {
        setError(data.error?.message || 'Failed to fetch quotes');
      }
    } catch (err) {
      setError('Network error');
      console.error('Error fetching watchlist:', err);
    } finally {
      setLoading(false);
    }
  }, [symbols]);

  useEffect(() => {
    if (symbols.length > 0) {
      fetchQuotes();
      
      // Auto-refresh every 5 minutes
      const interval = setInterval(fetchQuotes, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [fetchQuotes, symbols]);

  if (loading && Object.keys(quotes).length === 0) {
    return (
      <div className="space-y-2">
        {symbols.map(symbol => (
          <div key={symbol} className="p-4 border rounded-lg animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 rounded-lg bg-red-50">
        <p className="text-red-600 text-sm">Error: {error}</p>
        <button
          onClick={fetchQuotes}
          className="mt-2 text-xs text-red-600 underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Watchlist</h2>
        <button
          onClick={fetchQuotes}
          className="text-sm text-blue-600 hover:text-blue-800"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {symbols.map(symbol => {
          const quote = quotes[symbol];
          
          if (!quote) {
            return (
              <div key={symbol} className="p-4 border rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600">{symbol} - No data</p>
              </div>
            );
          }
          
          const isPositive = quote.change >= 0;
          
          return (
            <div key={symbol} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <h3 className="text-sm font-semibold mb-1">{quote.symbol}</h3>
              <div className="text-2xl font-bold mb-1">
                {quote.currency === 'INR' ? '₹' : '$'}{quote.price.toFixed(2)}
              </div>
              <div className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '↑' : '↓'} {isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Symbol Search Component
 * 
 * Usage:
 *   <SymbolSearch onSelect={(symbol) => console.log(symbol)} />
 */
export function SymbolSearch({ onSelect }: { onSelect?: (symbol: string) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{
    symbol: string;
    name?: string;
    exchange?: string;
    type?: string;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/market/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setResults(data.data);
      } else {
        setError(data.error?.message || 'Search failed');
        setResults([]);
      }
    } catch (err) {
      setError('Network error');
      setResults([]);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      search(query);
    }, 500); // Debounce search

    return () => clearTimeout(timer);
  }, [query, search]);

  return (
    <div className="w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stocks (e.g., Apple, AAPL)..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {loading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 p-2 text-sm text-red-600 bg-red-50 rounded">
          {error}
        </div>
      )}
      
      {results.length > 0 && (
        <div className="mt-2 border rounded-lg shadow-lg bg-white max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={`${result.symbol}-${index}`}
              onClick={() => {
                onSelect?.(result.symbol);
                setQuery('');
                setResults([]);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 transition-colors"
            >
              <div className="font-semibold text-sm">{result.symbol}</div>
              {result.name && (
                <div className="text-xs text-gray-600">{result.name}</div>
              )}
              {result.exchange && (
                <div className="text-xs text-gray-400">{result.exchange}</div>
              )}
            </button>
          ))}
        </div>
      )}
      
      {query && !loading && results.length === 0 && !error && (
        <div className="mt-2 p-4 text-sm text-gray-500 text-center">
          No results found for &quot;{query}&quot;
        </div>
      )}
    </div>
  );
}

/**
 * Historical Chart Component (Simple Example)
 * 
 * Note: This is a basic example. For production, use charting libraries like Chart.js or Plotly
 * 
 * Usage:
 *   <HistoricalChart symbol="AAPL" period="1mo" />
 */
export function HistoricalChart({ 
  symbol, 
  period = '1mo' 
}: { 
  symbol: string; 
  period?: string;
}) {
  const [data, setData] = useState<HistoricalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistoricalData() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `/api/market/historical/${symbol}?period=${period}&interval=1d`
        );
        const result: APIResponse<HistoricalData> = await response.json();
        
        if (result.success && result.data) {
          setData(result.data);
        } else {
          setError(result.error?.message || 'Failed to fetch data');
        }
      } catch (err) {
        setError('Network error');
        console.error('Error fetching historical data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistoricalData();
  }, [symbol, period]);

  if (loading) {
    return (
      <div className="p-8 border rounded-lg animate-pulse">
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 rounded-lg bg-red-50">
        <p className="text-red-600 text-sm">Error: {error}</p>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <p className="text-gray-600 text-sm">No historical data available</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">
        {data.symbol} - Historical Data ({data.period})
      </h3>
      
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {data.data.slice().reverse().slice(0, 20).map((point, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0 text-sm">
            <span className="font-medium">
              {new Date(point.date).toLocaleDateString()}
            </span>
            <div className="flex gap-4 text-xs">
              <span>O: ${point.open.toFixed(2)}</span>
              <span>H: ${point.high.toFixed(2)}</span>
              <span>L: ${point.low.toFixed(2)}</span>
              <span className="font-semibold">C: ${point.close.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        Showing latest 20 data points of {data.data.length} total
      </div>
    </div>
  );
}
