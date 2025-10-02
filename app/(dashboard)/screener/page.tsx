'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

// Mock screener results
const mockResults = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 175.50, volume: 52000000, marketCap: 2750000000000, changePercent: 1.44, pe: 28.5 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 350.25, volume: 25000000, marketCap: 2600000000000, changePercent: -0.34, pe: 32.1 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 140.80, volume: 18000000, marketCap: 1800000000000, changePercent: 2.77, pe: 25.3 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 145.30, volume: 42000000, marketCap: 1500000000000, changePercent: 0.35, pe: 45.2 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 480.20, volume: 38000000, marketCap: 1200000000000, changePercent: 3.31, pe: 68.5 },
];

export default function ScreenerPage() {
  const [results, setResults] = useState(mockResults);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minVolume, setMinVolume] = useState('');

  const handleSearch = () => {
    // In a real app, this would call the API with filter parameters
    let filtered = mockResults;
    
    if (minPrice) {
      filtered = filtered.filter(item => item.price >= parseFloat(minPrice));
    }
    
    if (maxPrice) {
      filtered = filtered.filter(item => item.price <= parseFloat(maxPrice));
    }
    
    if (minVolume) {
      filtered = filtered.filter(item => item.volume >= parseFloat(minVolume) * 1000000);
    }
    
    setResults(filtered);
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    setMinVolume('');
    setResults(mockResults);
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
        <h1 className="text-4xl font-bold text-foreground">Stock Screener</h1>
        <p className="text-muted-foreground mt-1">
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
          {results.length === 0 ? (
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
                    <TableCell className="text-right">{item.pe.toFixed(2)}</TableCell>
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
