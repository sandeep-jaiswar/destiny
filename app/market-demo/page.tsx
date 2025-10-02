/**
 * Market Data Demo Page
 * 
 * This page demonstrates the Market Data Integration functionality
 * with live examples of all components and API endpoints.
 */

import { StockQuote, Watchlist, SymbolSearch, HistoricalChart } from '@/components/market/MarketDataExamples';

export default function MarketDataDemo() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">Market Data Integration</h1>
          <p className="text-gray-600">
            Real-time quotes, historical data, and symbol search powered by Yahoo Finance
          </p>
        </header>

        {/* Symbol Search */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Symbol Search</h2>
          <p className="text-gray-600 mb-4">Search for stocks by name or symbol</p>
          <SymbolSearch onSelect={(symbol) => console.log('Selected:', symbol)} />
        </section>

        {/* Single Quote Examples */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Real-time Quotes</h2>
          <p className="text-gray-600 mb-4">Live stock quotes with auto-refresh</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StockQuote symbol="AAPL" />
            <StockQuote symbol="MSFT" />
            <StockQuote symbol="GOOGL" />
            <StockQuote symbol="TSLA" />
          </div>
        </section>

        {/* Indian Market Examples */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Indian Markets</h2>
          <p className="text-gray-600 mb-4">NSE and BSE stock quotes</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StockQuote symbol="RELIANCE.NS" />
            <StockQuote symbol="TCS.NS" />
            <StockQuote symbol="INFY.BO" />
          </div>
        </section>

        {/* Watchlist Example */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Batch Quotes (Watchlist)</h2>
          <p className="text-gray-600 mb-4">Efficiently fetch multiple quotes in one request</p>
          <Watchlist 
            symbols={[
              'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META',
              'RELIANCE.NS', 'TCS.NS', 'INFY.NS'
            ]} 
          />
        </section>

        {/* Historical Data Example */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Historical Data</h2>
          <p className="text-gray-600 mb-4">OHLCV data with configurable periods</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <HistoricalChart symbol="AAPL" period="1mo" />
            <HistoricalChart symbol="RELIANCE.NS" period="1mo" />
          </div>
        </section>

        {/* API Documentation Link */}
        <section className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h2 className="text-2xl font-bold mb-2">API Documentation</h2>
          <p className="text-gray-700 mb-4">
            For detailed API documentation, see{' '}
            <code className="bg-white px-2 py-1 rounded text-sm">
              /docs/MARKET_DATA_INTEGRATION.md
            </code>
          </p>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Endpoints:</strong>
            </div>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li><code>/api/market/quote/[symbol]</code> - Real-time quotes</li>
              <li><code>/api/market/historical/[symbol]</code> - Historical OHLCV data</li>
              <li><code>/api/market/batch-quotes</code> - Multi-symbol quotes</li>
              <li><code>/api/market/search</code> - Symbol search</li>
              <li><code>/api/market/validate-symbol</code> - Symbol validation</li>
            </ul>
          </div>
        </section>

        {/* Features List */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">✅ Real-time Data</h3>
              <p className="text-sm text-gray-600">
                Live quotes for US and Indian markets with 5-minute caching
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">✅ Historical Data</h3>
              <p className="text-sm text-gray-600">
                OHLCV data from 1 day to 5 years with multiple intervals
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">✅ Batch Processing</h3>
              <p className="text-sm text-gray-600">
                Fetch up to 50 symbols in a single request
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">✅ Rate Limiting</h3>
              <p className="text-sm text-gray-600">
                Smart throttling at 48 requests/minute to prevent blocking
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">✅ Fallback Mechanism</h3>
              <p className="text-sm text-gray-600">
                Returns cached data when API is unavailable
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">✅ Multi-Exchange</h3>
              <p className="text-sm text-gray-600">
                Support for NASDAQ, NYSE, NSE (.NS), BSE (.BO)
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
