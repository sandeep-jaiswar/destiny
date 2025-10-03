'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

interface ScreenerResult {
  symbol: string;
  name: string;
  price: number;
  volume: number;
  marketCap: number;
  changePercent: number;
  pe?: number;
}

export default function ScreenerPage() {
  const [results, setResults] = useState<ScreenerResult[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minVolume, setMinVolume] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load initial results on mount
    const loadInitialData = async () => {
      await handleSearch();
    };
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (minVolume) params.append('minVolume', (parseFloat(minVolume) * 1000000).toString());
      
      const response = await fetch(`/api/screener?${params.toString()}`);
      const data = await response.json();
      
      if (data.success && data.data?.results) {
        setResults(data.data.results);
      } else {
        setError(data.error?.message || 'Failed to screen stocks');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    setMinVolume('');
    // Reload all results
    handleSearch();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value}`;
  };

  const formatVolume = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white font-mono">Stock Screener</h1>
        <p className="text-white/80 mt-1">
          Find investment opportunities based on your criteria
        </p>
      </div>

      {/* Filter Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Set criteria to find stocks matching your requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Min Price ($)
              </label>
              <Input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Max Price ($)
              </label>
              <Input
                type="number"
                placeholder="1000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Min Volume (M)
              </label>
              <Input
                type="number"
                placeholder="1"
                value={minVolume}
                onChange={(e) => setMinVolume(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Results Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{results.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(results.reduce((sum, r) => sum + r.price, 0) / results.length || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top Gainer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {Math.max(...results.map(r => r.changePercent)).toFixed(2)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top Loser
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {Math.min(...results.map(r => r.changePercent)).toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Screening Results</CardTitle>
          <CardDescription>
            Stocks matching your filter criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Screening stocks...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p className="font-medium">{error}</p>
              <button
                onClick={handleSearch}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-medium"
              >
                Retry
              </button>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No stocks found matching your criteria</p>
              <p className="text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Change %</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                  <TableHead className="text-right">Market Cap</TableHead>
                  <TableHead className="text-right">P/E Ratio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((item) => (
                  <TableRow key={item.symbol}>
                    <TableCell className="font-medium">
                      <Link href={`/charts/${item.symbol}`} className="hover:underline">
                        {item.symbol}
                      </Link>
                    </TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                    <TableCell className={`text-right ${item.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      <div className="flex items-center justify-end gap-1">
                        {item.changePercent >= 0 ? 
                          <TrendingUp className="w-4 h-4" /> : 
                          <TrendingDown className="w-4 h-4" />
                        }
                        {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatVolume(item.volume)}</TableCell>
                    <TableCell className="text-right">{formatMarketCap(item.marketCap)}</TableCell>
                    <TableCell className="text-right">{item.pe ? item.pe.toFixed(2) : 'N/A'}</TableCell>
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
