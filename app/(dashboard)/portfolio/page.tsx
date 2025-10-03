'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Plus } from 'lucide-react';

interface PortfolioPosition {
  symbol: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  change: number;
  changePercent: number;
  marketValue: number;
  costBasis: number;
  gainLoss: number;
  gainLossPercent: number;
}

interface PortfolioSummary {
  holdings: PortfolioPosition[];
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolio();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchPortfolio, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/portfolio');
      const data = await response.json();
      
      if (data.success && data.data) {
        setPortfolio(data.data);
        setError(null);
      } else {
        setError(data.error?.message || 'Failed to fetch portfolio');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const totalValue = portfolio?.totalValue || 0;
  const totalCost = portfolio?.totalCost || 0;
  const totalGainLoss = portfolio?.totalGainLoss || 0;
  const totalGainLossPercent = portfolio?.totalGainLossPercent || 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white font-mono">Portfolio</h1>
          <p className="text-white/80 mt-1">
            Track your investments and performance
          </p>
        </div>
        <Button className="bg-[#AA0000] hover:bg-[#CC0000] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Position
        </Button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black font-mono">{formatCurrency(totalValue)}</div>
            {loading && <div className="text-xs text-gray-500 mt-1">Updating...</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Gain/Loss
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(totalGainLoss)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Return
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalGainLossPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {totalGainLossPercent >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holdings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
          <CardDescription>Your current stock positions with live prices</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !portfolio ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Loading portfolio...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p className="font-medium">{error}</p>
              <button
                onClick={fetchPortfolio}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-medium"
              >
                Retry
              </button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead className="text-right">Shares</TableHead>
                  <TableHead className="text-right">Avg Cost</TableHead>
                  <TableHead className="text-right">Current Price</TableHead>
                  <TableHead className="text-right">Market Value</TableHead>
                  <TableHead className="text-right">Gain/Loss</TableHead>
                  <TableHead className="text-right">Return %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolio?.holdings.map((holding) => (
                  <TableRow key={holding.symbol}>
                    <TableCell className="font-medium">{holding.symbol}</TableCell>
                    <TableCell className="text-right">{holding.shares}</TableCell>
                    <TableCell className="text-right">{formatCurrency(holding.avgCost)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(holding.currentPrice)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(holding.marketValue)}</TableCell>
                    <TableCell className={`text-right ${holding.gainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {holding.gainLoss >= 0 ? '+' : ''}{formatCurrency(holding.gainLoss)}
                    </TableCell>
                    <TableCell className={`text-right ${holding.gainLossPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {holding.gainLossPercent >= 0 ? <TrendingUp className="inline w-4 h-4 mr-1" /> : <TrendingDown className="inline w-4 h-4 mr-1" />}
                      {holding.gainLossPercent >= 0 ? '+' : ''}{holding.gainLossPercent.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
