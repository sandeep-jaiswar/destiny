'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TradingChart } from '@/components/charts/TradingChart';
import { TrendingUp, TrendingDown, Search, RefreshCw } from 'lucide-react';
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
      }

      // Fetch historical data
      const historicalRes = await fetch(
        `/api/historical?symbol=${symbol}&period=${selectedInterval}&interval=1d`
      );
      const historicalJson = await historicalRes.json();
      if (historicalJson.success) {
        setHistoricalData(historicalJson.data);
      }

      // Fetch strategy analysis
      const strategyRes = await fetch(
        `/api/strategy?symbol=${symbol}&period=${selectedInterval}&interval=1d`
      );
      const strategyJson = await strategyRes.json();
      if (strategyJson.success) {
        setStrategyAnalysis(strategyJson.data);
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

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground">{symbol}</h1>
          {quote && (
            <p className="text-muted-foreground mt-1">
              Last updated: {new Date(quote.timestamp).toLocaleString()}
            </p>
          )}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Search symbol..."
            value={searchSymbol}
            onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
            className="w-full sm:w-48"
          />
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
          <Button type="button" size="icon" variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Price Overview */}
      {quote && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Current Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatPrice(quote.price)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Change
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${quote.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {quote.changePercent >= 0 ? <TrendingUp className="inline w-5 h-5 mr-1" /> : <TrendingDown className="inline w-5 h-5 mr-1" />}
                {quote.changePercent.toFixed(2)}%
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {formatPrice(quote.change)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(quote.volume / 1e6).toFixed(2)}M
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Day Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {formatPrice(quote.low)} - {formatPrice(quote.high)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chart and Analysis */}
      <Tabs defaultValue="chart" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chart">Chart</TabsTrigger>
          <TabsTrigger value="analysis">Strategy Analysis</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="space-y-4">
          {/* Time Interval Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Price Chart</CardTitle>
              <CardDescription>Candlestick chart with historical data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {(['1d', '5d', '1mo', '3mo', '6mo', '1y'] as TimeInterval[]).map((interval) => (
                  <Button
                    key={interval}
                    variant={selectedInterval === interval ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedInterval(interval)}
                  >
                    {interval}
                  </Button>
                ))}
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-[400px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : historicalData?.data ? (
                <TradingChart
                  symbol={symbol}
                  data={historicalData.data}
                  interval={selectedInterval}
                  height={400}
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No chart data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {strategyAnalysis ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Consensus Signal</CardTitle>
                  <CardDescription>
                    Combined analysis from multiple trading strategies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div>
                      <Badge 
                        variant={getSignalBadgeVariant(strategyAnalysis.consensus)}
                        className="text-xl px-4 py-2"
                      >
                        {strategyAnalysis.consensus}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Confidence Score</p>
                      <p className="text-2xl font-bold">
                        {strategyAnalysis.confidenceScore.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Individual Strategy Signals</CardTitle>
                  <CardDescription>
                    Detailed analysis from each trading strategy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {strategyAnalysis.strategies.map((strategy, index) => (
                      <div
                        key={index}
                        className="p-4 border border-border rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-foreground">
                            {strategy.strategy}
                          </h4>
                          <Badge variant={getSignalBadgeVariant(strategy.signal)}>
                            {strategy.signal}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Confidence: </span>
                            <span className="font-medium">{strategy.confidence}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Score: </span>
                            <span className="font-medium">
                              {strategy.confidenceScore.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        {strategy.analysis && (
                          <p className="text-sm text-muted-foreground">
                            {strategy.analysis}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
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

        <TabsContent value="details" className="space-y-4">
          {quote && (
            <Card>
              <CardHeader>
                <CardTitle>Stock Details</CardTitle>
                <CardDescription>Complete market information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Open</p>
                    <p className="text-lg font-semibold">{formatPrice(quote.open)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Previous Close</p>
                    <p className="text-lg font-semibold">{formatPrice(quote.previousClose)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Day High</p>
                    <p className="text-lg font-semibold">{formatPrice(quote.high)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Day Low</p>
                    <p className="text-lg font-semibold">{formatPrice(quote.low)}</p>
                  </div>
                  {quote.fiftyTwoWeekHigh && (
                    <div>
                      <p className="text-sm text-muted-foreground">52 Week High</p>
                      <p className="text-lg font-semibold">{formatPrice(quote.fiftyTwoWeekHigh)}</p>
                    </div>
                  )}
                  {quote.fiftyTwoWeekLow && (
                    <div>
                      <p className="text-sm text-muted-foreground">52 Week Low</p>
                      <p className="text-lg font-semibold">{formatPrice(quote.fiftyTwoWeekLow)}</p>
                    </div>
                  )}
                  {quote.marketCap && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Market Cap</p>
                      <p className="text-lg font-semibold">
                        ${(quote.marketCap / 1e9).toFixed(2)}B
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
