'use client';

import { useState } from 'react';

export default function DemoPage() {
  const [symbol, setSymbol] = useState('AAPL');
  const [quoteData, setQuoteData] = useState<string | null>(null);
  const [historicalData, setHistoricalData] = useState<string | null>(null);
  const [strategyData, setStrategyData] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/quote?symbol=${symbol}`);
      const data = await response.json();
      setQuoteData(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quote');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistorical = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/historical?symbol=${symbol}&period=1mo&interval=1d`);
      const data = await response.json();
      setHistoricalData(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch historical data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStrategy = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/strategy?symbol=${symbol}&period=3mo&interval=1d`);
      const data = await response.json();
      setStrategyData(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch strategy analysis');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStatsData(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Destiny Trading Platform - API Demo</h1>

        {/* Input Section */}
        <div className="mb-8 p-6 bg-card rounded-lg border border-border">
          <label className="block mb-2 text-sm font-medium text-card-foreground">
            Stock Symbol
          </label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            className="w-full p-3 border border-input rounded bg-background text-foreground mb-4"
            placeholder="Enter symbol (e.g., AAPL, TSLA, RELIANCE.NS)"
          />

          <div className="flex flex-wrap gap-4">
            <button
              onClick={fetchQuote}
              disabled={loading}
              className="px-6 py-3 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
            >
              Fetch Quote
            </button>
            <button
              onClick={fetchHistorical}
              disabled={loading}
              className="px-6 py-3 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
            >
              Fetch Historical
            </button>
            <button
              onClick={fetchStrategy}
              disabled={loading}
              className="px-6 py-3 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
            >
              Analyze Strategy
            </button>
            <button
              onClick={fetchStats}
              disabled={loading}
              className="px-6 py-3 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 disabled:opacity-50"
            >
              System Stats
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive text-destructive-foreground rounded">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="mb-8 p-4 bg-muted rounded">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        )}

        {/* Results Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quote Data */}
          {quoteData && (
            <div className="p-6 bg-card rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 text-card-foreground">Quote Data</h2>
              <pre className="bg-muted p-4 rounded overflow-auto text-sm text-muted-foreground">
                {quoteData}
              </pre>
            </div>
          )}

          {/* Historical Data */}
          {historicalData && (
            <div className="p-6 bg-card rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 text-card-foreground">Historical Data</h2>
              <pre className="bg-muted p-4 rounded overflow-auto text-sm text-muted-foreground max-h-96">
                {historicalData}
              </pre>
            </div>
          )}

          {/* Strategy Data */}
          {strategyData && (
            <div className="p-6 bg-card rounded-lg border border-border lg:col-span-2">
              <h2 className="text-2xl font-bold mb-4 text-card-foreground">Strategy Analysis</h2>
              <pre className="bg-muted p-4 rounded overflow-auto text-sm text-muted-foreground max-h-96">
                {strategyData}
              </pre>
            </div>
          )}

          {/* Stats Data */}
          {statsData && (
            <div className="p-6 bg-card rounded-lg border border-border lg:col-span-2">
              <h2 className="text-2xl font-bold mb-4 text-card-foreground">System Statistics</h2>
              <pre className="bg-muted p-4 rounded overflow-auto text-sm text-muted-foreground">
                {statsData}
              </pre>
            </div>
          )}
        </div>

        {/* Documentation */}
        <div className="mt-8 p-6 bg-card rounded-lg border border-border">
          <h2 className="text-2xl font-bold mb-4 text-card-foreground">API Endpoints</h2>
          <div className="space-y-3 text-sm text-card-foreground">
            <div>
              <code className="bg-muted px-2 py-1 rounded">GET /api/quote?symbol=AAPL</code>
              <p className="mt-1 text-muted-foreground">Get real-time quote for a symbol</p>
            </div>
            <div>
              <code className="bg-muted px-2 py-1 rounded">POST /api/quotes</code>
              <p className="mt-1 text-muted-foreground">Get quotes for multiple symbols (batch)</p>
            </div>
            <div>
              <code className="bg-muted px-2 py-1 rounded">GET /api/historical?symbol=AAPL&period=1y&interval=1d</code>
              <p className="mt-1 text-muted-foreground">Get historical OHLCV data</p>
            </div>
            <div>
              <code className="bg-muted px-2 py-1 rounded">GET /api/strategy?symbol=AAPL</code>
              <p className="mt-1 text-muted-foreground">Get strategy analysis and consensus</p>
            </div>
            <div>
              <code className="bg-muted px-2 py-1 rounded">GET /api/strategies</code>
              <p className="mt-1 text-muted-foreground">List all available strategies</p>
            </div>
            <div>
              <code className="bg-muted px-2 py-1 rounded">GET /api/stats</code>
              <p className="mt-1 text-muted-foreground">Get system statistics and cache metrics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
