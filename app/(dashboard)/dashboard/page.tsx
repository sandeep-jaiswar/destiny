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
      <div className="bg-white p-6 rounded-lg border border-white">
        <h1 className="text-3xl font-bold text-black mb-1 font-mono">Trading Dashboard</h1>
        <p className="text-gray-600 text-sm">
          Real-time market data and professional trading insights
        </p>
      </div>

      {/* Market Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Positions</CardTitle>
            <Activity className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black font-mono">{quotes.length}</div>
            <p className="text-xs text-gray-500 mt-1">Active stocks tracked</p>
          </CardContent>
        </Card>

        <Card className="border-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Market Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#00FF00]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#00FF00] font-mono">OPEN</div>
            <p className="text-xs text-gray-500 mt-1">Real-time updates</p>
          </CardContent>
        </Card>

        <Card className="border-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#00FF00]">Gainers</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#00FF00]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#00FF00] font-mono">
              {quotes.filter(q => q.changePercent > 0).length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Stocks up today</p>
          </CardContent>
        </Card>

        <Card className="border-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#FF6666]">Losers</CardTitle>
            <TrendingDown className="h-4 w-4 text-[#FF6666]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#FF6666] font-mono">
              {quotes.filter(q => q.changePercent < 0).length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Stocks down today</p>
          </CardContent>
        </Card>
      </div>

      {/* Professional Data Table - Bloomberg Style */}
      <div className="bg-[#CC0000] border-2 border-white rounded-lg overflow-hidden">
        <div className="bg-[#AA0000] border-b-2 border-white px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white font-mono">MARKET OVERVIEW</h3>
              <p className="text-xs mt-1 text-white/80">
                Real-time quotes for top stocks · Updated every 5 seconds
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#00FF00] rounded-full animate-pulse" />
              <span className="text-xs font-medium text-[#00FF00]">LIVE</span>
            </div>
          </div>
        </div>
        <div className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                <p className="text-sm text-white">Loading market data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-white">
              <p className="font-medium">{error}</p>
              <button
                onClick={fetchMarketData}
                className="mt-4 px-6 py-2 bg-[#AA0000] text-white rounded-md hover:bg-[#DD2222] transition-colors font-medium border border-white"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/20">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-[#AA0000] text-xs font-semibold text-white uppercase tracking-wide font-mono">
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
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-[#DD2222] transition-colors group cursor-pointer"
                >
                  <div className="col-span-2 flex items-center">
                    <div>
                      <div className="font-bold text-white text-sm group-hover:text-[#FFFF00] transition-colors font-mono">
                        {quote.symbol}
                      </div>
                      <div className="text-xs text-white/60">Stock #{index + 1}</div>
                    </div>
                  </div>
                  
                  <div className="col-span-3 text-right font-mono text-sm font-semibold text-white flex items-center justify-end">
                    {formatPrice(quote.price)}
                  </div>
                  
                  <div className={cn(
                    "col-span-3 text-right font-mono text-sm font-semibold flex items-center justify-end",
                    quote.change >= 0 ? 'text-[#00FF00]' : 'text-[#FF6666]'
                  )}>
                    {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)}
                  </div>
                  
                  <div className="col-span-2 text-right flex items-center justify-end">
                    <div className={cn(
                      "inline-flex items-center px-2 py-1 text-xs font-mono font-semibold",
                      quote.changePercent >= 0 
                        ? 'text-[#00FF00]' 
                        : 'text-[#FF6666]'
                    )}>
                      {quote.changePercent >= 0 ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
                    </div>
                  </div>
                  
                  <div className="col-span-2 text-right font-mono text-sm text-white/70 flex items-center justify-end">
                    {formatVolume(quote.volume)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/watchlist">
          <Card className="hover:shadow-md cursor-pointer transition-all border-white hover:border-[#CC0000] group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-black group-hover:text-[#CC0000] transition-colors font-mono">
                  <Activity className="w-5 h-5 mr-2" />
                  Watchlist
                </CardTitle>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#CC0000]/10 transition-colors">
                  <Activity className="w-4 h-4 text-gray-600 group-hover:text-[#CC0000]" />
                </div>
              </div>
              <CardDescription className="text-xs mt-2">
                Monitor your favorite stocks in real-time
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/screener">
          <Card className="hover:shadow-md cursor-pointer transition-all border-white hover:border-[#CC0000] group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-black group-hover:text-[#CC0000] transition-colors font-mono">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Stock Screener
                </CardTitle>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#CC0000]/10 transition-colors">
                  <TrendingUp className="w-4 h-4 text-gray-600 group-hover:text-[#CC0000]" />
                </div>
              </div>
              <CardDescription className="text-xs mt-2">
                Find investment opportunities with filters
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/portfolio">
          <Card className="hover:shadow-md cursor-pointer transition-all border-white hover:border-[#CC0000] group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-black group-hover:text-[#CC0000] transition-colors font-mono">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Portfolio
                </CardTitle>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#CC0000]/10 transition-colors">
                  <DollarSign className="w-4 h-4 text-gray-600 group-hover:text-[#CC0000]" />
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
