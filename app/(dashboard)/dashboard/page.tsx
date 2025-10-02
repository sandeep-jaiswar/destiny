'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import Link from 'next/link';

interface MarketQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA'];

export default function DashboardPage() {
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols: DEFAULT_SYMBOLS }),
      });
      
      const data = await response.json();
      if (data.success && data.data?.quotes) {
        setQuotes(data.data.quotes);
      } else {
        setError('Failed to fetch market data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
    return volume.toString();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Trading Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time market data and trading insights
        </p>
      </div>

      {/* Market Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Positions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotes.length}</div>
            <p className="text-xs text-muted-foreground">Active stocks tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">Real-time updates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gainers</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {quotes.filter(q => q.changePercent > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Stocks up today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Losers</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {quotes.filter(q => q.changePercent < 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Stocks down today</p>
          </CardContent>
        </Card>
      </div>

      {/* Stock List */}
      <Card>
        <CardHeader>
          <CardTitle>Market Overview</CardTitle>
          <CardDescription>
            Real-time quotes for top stocks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              <p>{error}</p>
              <button
                onClick={fetchMarketData}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {quotes.map((quote) => (
                <Link
                  key={quote.symbol}
                  href={`/charts/${quote.symbol}`}
                  className="block p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-foreground">
                          {quote.symbol}
                        </h3>
                        <Badge
                          variant={quote.changePercent >= 0 ? 'default' : 'destructive'}
                        >
                          {quote.changePercent >= 0 ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {formatChange(quote.change, quote.changePercent)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Volume: {formatVolume(quote.volume)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">
                        {formatPrice(quote.price)}
                      </p>
                      <p className={`text-sm ${quote.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatChange(quote.change, quote.changePercent)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/watchlist">
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Watchlist
              </CardTitle>
              <CardDescription>
                Monitor your favorite stocks
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/screener">
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Stock Screener
              </CardTitle>
              <CardDescription>
                Find investment opportunities
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/portfolio">
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Portfolio
              </CardTitle>
              <CardDescription>
                Track your investments
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
