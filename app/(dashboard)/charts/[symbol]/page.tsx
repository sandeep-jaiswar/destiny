'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TradingChart } from '@/components/charts/TradingChart';
import { TrendingDown, Search, RefreshCw, Activity, BarChart3, DollarSign, TrendingUpIcon, Percent, Clock } from 'lucide-react';
import { HistoricalData, MarketQuote } from '@/lib/types/market';

type TimeInterval = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y';

interface StrategyResult {
  strategy: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: string;
  confidenceScore: number;
  analysis?: string;
}

interface StrategyConsensus {
  symbol: string;
  consensus: 'BUY' | 'SELL' | 'HOLD';
  confidenceScore: number;
  strategies: StrategyResult[];
}

export default function ChartPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = (params?.symbol as string) || 'AAPL';

  const [quote, setQuote] = useState<MarketQuote | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null);
  const [strategyAnalysis, setStrategyAnalysis] = useState<StrategyConsensus | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<TimeInterval>('1mo');
  const [loading, setLoading] = useState(true);
  const [searchSymbol, setSearchSymbol] = useState(symbol);
  const [useMockData, setUseMockData] = useState(false);

  // Mock data for demo purposes
  const mockQuote: MarketQuote = {
    symbol: symbol,
    price: 185.92,
    change: 2.34,
    changePercent: 1.27,
    volume: 45678900,
    open: 184.50,
    high: 186.45,
    low: 183.80,
    previousClose: 183.58,
    timestamp: new Date(),
    marketCap: 2847000000000,
    fiftyTwoWeekHigh: 199.62,
    fiftyTwoWeekLow: 164.08,
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, selectedInterval]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch quote
      const quoteRes = await fetch(`/api/quote?symbol=${symbol}`);
      const quoteData = await quoteRes.json();
      if (quoteData.success) {
        setQuote(quoteData.data);
        setUseMockData(false);
      } else {
        // Use mock data if API fails
        setQuote(mockQuote);
        setUseMockData(true);
      }

      // Fetch historical data
      const historicalRes = await fetch(
        `/api/historical?symbol=${symbol}&period=${selectedInterval}&interval=1d`
      );
      const historicalJson = await historicalRes.json();
      if (historicalJson.success) {
        setHistoricalData(historicalJson.data);
      } else if (useMockData) {
        // Generate mock historical data
        const mockHistoricalData: HistoricalData = {
          symbol: symbol,
          period: selectedInterval,
          interval: '1d',
          data: Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (30 - i));
            const basePrice = 180 + Math.random() * 10;
            return {
              date,
              open: basePrice,
              high: basePrice + Math.random() * 3,
              low: basePrice - Math.random() * 3,
              close: basePrice + (Math.random() - 0.5) * 2,
              volume: 40000000 + Math.random() * 20000000,
            };
          }),
        };
        setHistoricalData(mockHistoricalData);
      }

      // Fetch strategy analysis
      const strategyRes = await fetch(
        `/api/strategy?symbol=${symbol}&period=${selectedInterval}&interval=1d`
      );
      const strategyJson = await strategyRes.json();
      if (strategyJson.success) {
        setStrategyAnalysis(strategyJson.data);
      } else if (useMockData) {
        // Mock strategy analysis
        const mockStrategy: StrategyConsensus = {
          symbol: symbol,
          consensus: 'BUY',
          confidenceScore: 72.5,
          strategies: [
            {
              strategy: 'Moving Average Crossover',
              signal: 'BUY',
              confidence: 'High',
              confidenceScore: 78.2,
              analysis: 'Short-term MA crossed above long-term MA, bullish signal',
            },
            {
              strategy: 'RSI Strategy',
              signal: 'BUY',
              confidence: 'Medium',
              confidenceScore: 65.8,
              analysis: 'RSI at 52.3, indicating neutral to slightly bullish momentum',
            },
            {
              strategy: 'MACD Strategy',
              signal: 'BUY',
              confidence: 'High',
              confidenceScore: 73.5,
              analysis: 'MACD line above signal line with positive histogram',
            },
          ],
        };
        setStrategyAnalysis(mockStrategy);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchSymbol && searchSymbol !== symbol) {
      router.push(`/charts/${searchSymbol.toUpperCase()}`);
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

  const getSignalBadgeVariant = (signal: string): 'default' | 'destructive' | 'secondary' => {
    if (signal === 'BUY') return 'default';
    if (signal === 'SELL') return 'destructive';
    return 'secondary';
  };

  // Calculate additional metrics
  const calculateMetrics = () => {
    if (!quote) return null;
    
    const dayRange = quote.high - quote.low;
    const dayRangePercent = (dayRange / quote.low) * 100;
    const distanceFrom52WkHigh = quote.fiftyTwoWeekHigh 
      ? ((quote.fiftyTwoWeekHigh - quote.price) / quote.fiftyTwoWeekHigh) * 100 
      : 0;
    const distanceFrom52WkLow = quote.fiftyTwoWeekLow
      ? ((quote.price - quote.fiftyTwoWeekLow) / quote.fiftyTwoWeekLow) * 100
      : 0;
    const avgVolume = quote.volume; // This would ideally be a 30-day average
    const volumeRatio = 1.0; // Placeholder - would compare to average
    
    return {
      dayRange,
      dayRangePercent,
      distanceFrom52WkHigh,
      distanceFrom52WkLow,
      avgVolume,
      volumeRatio,
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="space-y-3 px-2 md:px-0">
      {/* Compact Header with Multi-Tier Data Hierarchy */}
      <div className="flex flex-col gap-3">
        {/* Tier 1: Symbol & Primary Actions */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full md:w-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{symbol}</h1>
            {quote && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl md:text-2xl font-bold">{formatPrice(quote.price)}</span>
                <Badge variant={quote.changePercent >= 0 ? 'default' : 'destructive'} className="text-sm px-2 py-1">
                  {quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
                </Badge>
                <Badge variant={quote.changePercent >= 0 ? 'default' : 'destructive'} className="text-sm px-2 py-1">
                  {quote.changePercent >= 0 ? '+' : ''}{formatPrice(quote.change)}
                </Badge>
              </div>
            )}
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
            <Input
              type="text"
              placeholder="Symbol..."
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
              className="w-full md:w-32 h-9"
            />
            <Button type="submit" size="sm" className="shrink-0">
              <Search className="h-4 w-4" />
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={fetchData} className="shrink-0">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* Tier 2: Key Market Metrics - Responsive grid */}
        {quote && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            <div className="bg-card border rounded-lg p-2">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Open
              </div>
              <div className="text-sm font-semibold text-foreground">{formatPrice(quote.open)}</div>
            </div>
            <div className="bg-card border rounded-lg p-2">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUpIcon className="h-3 w-3" />
                High
              </div>
              <div className="text-sm font-semibold text-green-600">{formatPrice(quote.high)}</div>
            </div>
            <div className="bg-card border rounded-lg p-2">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                Low
              </div>
              <div className="text-sm font-semibold text-red-600">{formatPrice(quote.low)}</div>
            </div>
            <div className="bg-card border rounded-lg p-2">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Prev Close
              </div>
              <div className="text-sm font-semibold text-foreground">{formatPrice(quote.previousClose)}</div>
            </div>
            <div className="bg-card border rounded-lg p-2">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                Volume
              </div>
              <div className="text-sm font-semibold text-foreground">{(quote.volume / 1e6).toFixed(1)}M</div>
            </div>
            <div className="bg-card border rounded-lg p-2">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Percent className="h-3 w-3" />
                Day Range
              </div>
              <div className="text-sm font-semibold text-foreground">{metrics?.dayRangePercent.toFixed(2)}%</div>
            </div>
            <div className="bg-card border rounded-lg p-2">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                52W High
              </div>
              <div className="text-sm font-semibold text-foreground">
                {quote.fiftyTwoWeekHigh ? formatPrice(quote.fiftyTwoWeekHigh) : 'N/A'}
              </div>
            </div>
            <div className="bg-card border rounded-lg p-2">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                52W Low
              </div>
              <div className="text-sm font-semibold text-foreground">
                {quote.fiftyTwoWeekLow ? formatPrice(quote.fiftyTwoWeekLow) : 'N/A'}
              </div>
            </div>
          </div>
        )}

        {/* Tier 3: Extended Metrics - Responsive grid */}
        {quote && metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            <div className="bg-card border rounded-lg p-2">
              <div className="text-xs text-muted-foreground">Market Cap</div>
              <div className="text-sm font-semibold text-foreground">
                {quote.marketCap ? `$${(quote.marketCap / 1e9).toFixed(2)}B` : 'N/A'}
              </div>
            </div>
            <div className="bg-card border rounded-lg p-2">
              <div className="text-xs text-muted-foreground">From 52W High</div>
              <div className="text-sm font-semibold text-red-600">
                {quote.fiftyTwoWeekHigh ? `-${metrics.distanceFrom52WkHigh.toFixed(1)}%` : 'N/A'}
              </div>
            </div>
            <div className="bg-card border rounded-lg p-2">
              <div className="text-xs text-muted-foreground">From 52W Low</div>
              <div className="text-sm font-semibold text-green-600">
                {quote.fiftyTwoWeekLow ? `+${metrics.distanceFrom52WkLow.toFixed(1)}%` : 'N/A'}
              </div>
            </div>
            <div className="bg-card border rounded-lg p-2">
              <div className="text-xs text-muted-foreground">Day Range $</div>
              <div className="text-sm font-semibold text-foreground">{formatPrice(metrics.dayRange)}</div>
            </div>
            <div className="bg-card border rounded-lg p-2">
              <div className="text-xs text-muted-foreground">Avg Volume</div>
              <div className="text-sm font-semibold text-foreground">{(metrics.avgVolume / 1e6).toFixed(1)}M</div>
            </div>
            <div className="bg-card border rounded-lg p-2">
              <div className="text-xs text-muted-foreground">Vol Ratio</div>
              <div className="text-sm font-semibold text-foreground">{metrics.volumeRatio.toFixed(2)}x</div>
            </div>
            <div className="bg-card border rounded-lg p-2">
              <div className="text-xs text-muted-foreground">Spread</div>
              <div className="text-sm font-semibold text-foreground">
                {formatPrice(quote.high - quote.low)}
              </div>
            </div>
            <div className="bg-card border rounded-lg p-2">
              <div className="text-xs text-muted-foreground">Updated</div>
              <div className="text-xs font-semibold text-foreground">
                {quote ? new Date(quote.timestamp).toLocaleTimeString() : 'N/A'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Multi-Panel Layout - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Main Chart - Full width on mobile, 8 columns on desktop */}
        <div className="lg:col-span-8">
          <Card className="h-full">
            <CardHeader className="pb-2 px-3 pt-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <CardTitle className="text-base">Price Chart</CardTitle>
                <div className="flex gap-1 flex-wrap">
                  {(['1d', '5d', '1mo', '3mo', '6mo', '1y'] as TimeInterval[]).map((interval) => (
                    <Button
                      key={interval}
                      variant={selectedInterval === interval ? 'default' : 'ghost'}
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => setSelectedInterval(interval)}
                    >
                      {interval}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              {loading ? (
                <div className="flex justify-center items-center h-[300px] md:h-[500px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : historicalData?.data ? (
                <TradingChart
                  symbol={symbol}
                  data={historicalData.data}
                  interval={selectedInterval}
                  height={window.innerWidth < 768 ? 300 : 500}
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No chart data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Full width on mobile, 4 columns on desktop */}
        <div className="lg:col-span-4 space-y-3">
          {/* Strategy Analysis Panel */}
          {strategyAnalysis && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Strategy Consensus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <Badge 
                    variant={getSignalBadgeVariant(strategyAnalysis.consensus)}
                    className="text-lg px-3 py-1"
                  >
                    {strategyAnalysis.consensus}
                  </Badge>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Confidence</div>
                    <div className="text-xl font-bold">
                      {strategyAnalysis.confidenceScore.toFixed(0)}%
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {strategyAnalysis.strategies.slice(0, 3).map((strategy, index) => (
                    <div key={index} className="flex items-center justify-between text-xs border-t pt-2">
                      <span className="font-medium">{strategy.strategy}</span>
                      <Badge variant={getSignalBadgeVariant(strategy.signal)} className="text-xs">
                        {strategy.signal}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Market Statistics Panel */}
          {quote && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Market Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground">Bid</div>
                    <div className="font-semibold">{formatPrice(quote.price * 0.999)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Ask</div>
                    <div className="font-semibold">{formatPrice(quote.price * 1.001)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Bid Size</div>
                    <div className="font-semibold">1,000</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Ask Size</div>
                    <div className="font-semibold">1,500</div>
                  </div>
                  <div className="col-span-2 border-t pt-2">
                    <div className="text-muted-foreground">Volume Profile</div>
                    <div className="mt-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Buy</span>
                        <div className="flex-1 mx-2 bg-green-200 h-2 rounded" style={{width: '60%'}}></div>
                        <span className="font-semibold">60%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Sell</span>
                        <div className="flex-1 mx-2 bg-red-200 h-2 rounded" style={{width: '40%'}}></div>
                        <span className="font-semibold">40%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technical Indicators Panel */}
          {historicalData?.data && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Technical Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground">RSI (14)</div>
                    <div className="font-semibold text-green-600">52.3</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">MACD</div>
                    <div className="font-semibold text-green-600">+0.45</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">SMA (20)</div>
                    <div className="font-semibold">{formatPrice(quote?.price || 0)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">SMA (50)</div>
                    <div className="font-semibold">{formatPrice((quote?.price || 0) * 0.98)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">EMA (12)</div>
                    <div className="font-semibold">{formatPrice((quote?.price || 0) * 1.01)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">EMA (26)</div>
                    <div className="font-semibold">{formatPrice((quote?.price || 0) * 0.99)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">BB Upper</div>
                    <div className="font-semibold">{formatPrice((quote?.price || 0) * 1.05)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">BB Lower</div>
                    <div className="font-semibold">{formatPrice((quote?.price || 0) * 0.95)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">ATR (14)</div>
                    <div className="font-semibold">{formatPrice((quote?.high || 0) - (quote?.low || 0))}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Stoch %K</div>
                    <div className="font-semibold">65.2</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Performance Metrics Panel */}
          {quote && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Today</span>
                    <span className={`font-semibold ${quote.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Week</span>
                    <span className="font-semibold text-green-600">+2.45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Month</span>
                    <span className="font-semibold text-green-600">+5.78%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">3 Months</span>
                    <span className="font-semibold text-green-600">+12.34%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">YTD</span>
                    <span className="font-semibold text-green-600">+18.92%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">1 Year</span>
                    <span className="font-semibold text-green-600">+25.67%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Bottom Panel Row - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Volume Analysis */}
        <div className="w-full">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Volume Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {quote && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Current</span>
                    <span className="font-semibold">{(quote.volume / 1e6).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Avg (30d)</span>
                    <span className="font-semibold">{(quote.volume / 1e6).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Relative</span>
                    <span className="font-semibold">1.0x</span>
                  </div>
                  <div className="mt-2 pt-2 border-t">
                    <div className="text-xs text-muted-foreground mb-1">Volume Trend</div>
                    <div className="h-16 flex items-end gap-1">
                      {[0.6, 0.8, 0.7, 0.9, 1.0, 0.85, 0.95, 1.0].map((height, i) => (
                        <div 
                          key={i} 
                          className="flex-1 bg-blue-500 rounded-t"
                          style={{ height: `${height * 100}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Market Breadth */}
        <div className="w-full">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Market Breadth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Advances</span>
                  <span className="font-semibold text-green-600">2,145</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Declines</span>
                  <span className="font-semibold text-red-600">1,423</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unchanged</span>
                  <span className="font-semibold">432</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">A/D Ratio</span>
                  <span className="font-semibold text-green-600">1.51</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New Highs</span>
                  <span className="font-semibold">89</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New Lows</span>
                  <span className="font-semibold">23</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sector Performance */}
        <div className="w-full">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Sector Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Technology</span>
                  <span className="font-semibold text-green-600">+1.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Healthcare</span>
                  <span className="font-semibold text-green-600">+0.9%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Financials</span>
                  <span className="font-semibold text-green-600">+0.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Consumer</span>
                  <span className="font-semibold text-red-600">-0.3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Energy</span>
                  <span className="font-semibold text-red-600">-0.7%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Utilities</span>
                  <span className="font-semibold text-red-600">-1.2%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Movers */}
        <div className="w-full">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Top Movers</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="gainers" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-7">
                  <TabsTrigger value="gainers" className="text-xs">Gainers</TabsTrigger>
                  <TabsTrigger value="losers" className="text-xs">Losers</TabsTrigger>
                </TabsList>
                <TabsContent value="gainers" className="mt-2">
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="font-medium">NVDA</span>
                      <span className="text-green-600 font-semibold">+5.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">AMD</span>
                      <span className="text-green-600 font-semibold">+4.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">TSLA</span>
                      <span className="text-green-600 font-semibold">+3.9%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">META</span>
                      <span className="text-green-600 font-semibold">+3.5%</span>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="losers" className="mt-2">
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="font-medium">INTC</span>
                      <span className="text-red-600 font-semibold">-4.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">PYPL</span>
                      <span className="text-red-600 font-semibold">-3.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">DIS</span>
                      <span className="text-red-600 font-semibold">-2.9%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">BA</span>
                      <span className="text-red-600 font-semibold">-2.3%</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Details in Collapsible Section */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="details">Extended Details</TabsTrigger>
          <TabsTrigger value="analysis">Full Strategy Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-3 mt-3">
          {quote && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Price Levels</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Open</span>
                      <span className="font-semibold text-foreground">{formatPrice(quote.open)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Previous Close</span>
                      <span className="font-semibold text-foreground">{formatPrice(quote.previousClose)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Day High</span>
                      <span className="font-semibold text-foreground">{formatPrice(quote.high)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Day Low</span>
                      <span className="font-semibold text-foreground">{formatPrice(quote.low)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">52-Week Range</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-2.5 text-xs">
                    {quote.fiftyTwoWeekHigh && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">52W High</span>
                        <span className="font-semibold text-foreground">{formatPrice(quote.fiftyTwoWeekHigh)}</span>
                      </div>
                    )}
                    {quote.fiftyTwoWeekLow && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">52W Low</span>
                        <span className="font-semibold text-foreground">{formatPrice(quote.fiftyTwoWeekLow)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">% from High</span>
                      <span className="font-semibold text-red-600">
                        {quote.fiftyTwoWeekHigh ? `-${metrics?.distanceFrom52WkHigh.toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">% from Low</span>
                      <span className="font-semibold text-green-600">
                        {quote.fiftyTwoWeekLow ? `+${metrics?.distanceFrom52WkLow.toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Volume Data</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Volume</span>
                      <span className="font-semibold text-foreground">{(quote.volume / 1e6).toFixed(2)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Volume</span>
                      <span className="font-semibold text-foreground">{(quote.volume / 1e6).toFixed(2)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Relative Vol</span>
                      <span className="font-semibold text-foreground">1.0x</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Market Data</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-2.5 text-xs">
                    {quote.marketCap && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Market Cap</span>
                        <span className="font-semibold text-foreground">${(quote.marketCap / 1e9).toFixed(2)}B</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">P/E Ratio</span>
                      <span className="font-semibold text-foreground">28.5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">EPS</span>
                      <span className="font-semibold text-foreground">$6.42</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dividend</span>
                      <span className="font-semibold text-foreground">$0.92</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-3 mt-3">
          {strategyAnalysis ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Consensus Signal</CardTitle>
                  <CardDescription>Combined analysis from multiple strategies</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Badge 
                      variant={getSignalBadgeVariant(strategyAnalysis.consensus)}
                      className="text-2xl px-6 py-2"
                    >
                      {strategyAnalysis.consensus}
                    </Badge>
                    <div>
                      <p className="text-sm text-muted-foreground">Confidence Score</p>
                      <p className="text-3xl font-bold">
                        {strategyAnalysis.confidenceScore.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {strategyAnalysis.strategies.map((strategy, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{strategy.strategy}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={getSignalBadgeVariant(strategy.signal)} className="text-lg px-4 py-1">
                        {strategy.signal}
                      </Badge>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Confidence</div>
                        <div className="text-lg font-bold">{strategy.confidenceScore.toFixed(1)}%</div>
                      </div>
                    </div>
                    {strategy.analysis && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {strategy.analysis}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">
                  {loading ? 'Loading strategy analysis...' : 'No strategy analysis available'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
