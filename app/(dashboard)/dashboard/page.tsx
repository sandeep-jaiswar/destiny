'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
    return volume.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h1 className="text-3xl font-bold text-foreground mb-1">Trading Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Real-time market data and professional trading insights
        </p>
      </div>

      {/* Market Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Positions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground font-mono">{quotes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active stocks tracked</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Market Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success font-mono">OPEN</div>
            <p className="text-xs text-muted-foreground mt-1">Real-time updates</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-success">Gainers</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success font-mono">
              {quotes.filter(q => q.changePercent > 0).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Stocks up today</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Losers</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive font-mono">
              {quotes.filter(q => q.changePercent < 0).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Stocks down today</p>
          </CardContent>
        </Card>
      </div>

      {/* Professional Data Table */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-foreground">MARKET OVERVIEW</CardTitle>
              <CardDescription className="text-xs mt-1">
                Real-time quotes for top stocks · Updated every 5 seconds
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-xs font-medium text-success">LIVE</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Loading market data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p className="font-medium">{error}</p>
              <button
                onClick={fetchMarketData}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-medium"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <div className="col-span-2">Symbol</div>
                <div className="col-span-3 text-right">Price</div>
                <div className="col-span-3 text-right">Change</div>
                <div className="col-span-2 text-right">Change %</div>
                <div className="col-span-2 text-right">Volume</div>
              </div>
              
              {/* Table Rows */}
              {quotes.map((quote, index) => (
                <Link
                  key={quote.symbol}
                  href={`/charts/${quote.symbol}`}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group cursor-pointer"
                >
                  <div className="col-span-2 flex items-center">
                    <div>
                      <div className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                        {quote.symbol}
                      </div>
                      <div className="text-xs text-muted-foreground">Stock #{index + 1}</div>
                    </div>
                  </div>
                  
                  <div className="col-span-3 text-right font-mono text-sm font-semibold text-foreground flex items-center justify-end">
                    {formatPrice(quote.price)}
                  </div>
                  
                  <div className={cn(
                    "col-span-3 text-right font-mono text-sm font-semibold flex items-center justify-end",
                    quote.change >= 0 ? 'text-success' : 'text-destructive'
                  )}>
                    {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)}
                  </div>
                  
                  <div className="col-span-2 text-right flex items-center justify-end">
                    <div className={cn(
                      "inline-flex items-center px-2 py-1 rounded text-xs font-mono font-semibold",
                      quote.changePercent >= 0 
                        ? 'bg-green-100 text-success' 
                        : 'bg-red-100 text-destructive'
                    )}>
                      {quote.changePercent >= 0 ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
                    </div>
                  </div>
                  
                  <div className="col-span-2 text-right font-mono text-sm text-muted-foreground flex items-center justify-end">
                    {formatVolume(quote.volume)}
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
          <Card className="hover:shadow-md cursor-pointer transition-all border-gray-200 hover:border-primary group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-foreground group-hover:text-primary transition-colors">
                  <Activity className="w-5 h-5 mr-2" />
                  Watchlist
                </CardTitle>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Activity className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                </div>
              </div>
              <CardDescription className="text-xs mt-2">
                Monitor your favorite stocks in real-time
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/screener">
          <Card className="hover:shadow-md cursor-pointer transition-all border-gray-200 hover:border-primary group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-foreground group-hover:text-primary transition-colors">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Stock Screener
                </CardTitle>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <TrendingUp className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                </div>
              </div>
              <CardDescription className="text-xs mt-2">
                Find investment opportunities with filters
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/portfolio">
          <Card className="hover:shadow-md cursor-pointer transition-all border-gray-200 hover:border-primary group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-foreground group-hover:text-primary transition-colors">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Portfolio
                </CardTitle>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <DollarSign className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                </div>
              </div>
              <CardDescription className="text-xs mt-2">
                Track your investments and performance
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
