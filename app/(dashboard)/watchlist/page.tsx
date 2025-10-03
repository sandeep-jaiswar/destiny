'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Star, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
}

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [newSymbol, setNewSymbol] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWatchlist();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchWatchlist, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/watchlist');
      const data = await response.json();
      
      if (data.success && data.data?.items) {
        setWatchlist(data.data.items);
        setError(null);
      } else {
        setError(data.error?.message || 'Failed to fetch watchlist');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSymbol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol) return;

    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: newSymbol }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNewSymbol('');
        // Refresh watchlist to show the new symbol
        await fetchWatchlist();
      } else {
        alert(data.error?.message || 'Failed to add symbol');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add symbol');
    }
  };

  const handleRemoveSymbol = async (symbol: string) => {
    try {
      const response = await fetch(`/api/watchlist?symbol=${symbol}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove from local state
        setWatchlist(watchlist.filter(item => item.symbol !== symbol));
      } else {
        alert(data.error?.message || 'Failed to remove symbol');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove symbol');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Watchlist</h1>
          <p className="text-muted-foreground mt-1">
            Monitor your favorite stocks
          </p>
        </div>
      </div>

      {/* Add Symbol Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add to Watchlist</CardTitle>
          <CardDescription>
            Enter a stock symbol to add it to your watchlist
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddSymbol} className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter symbol (e.g., AAPL)"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
              className="max-w-xs"
            />
            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              Add Symbol
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Watchlist Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Symbols
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{watchlist.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gainers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {watchlist.filter(item => item.changePercent > 0).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Losers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              {watchlist.filter(item => item.changePercent < 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Watchlist Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Watchlist</CardTitle>
          <CardDescription>
            Real-time quotes for your tracked stocks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && watchlist.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Loading watchlist...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p className="font-medium">{error}</p>
              <button
                onClick={fetchWatchlist}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-medium"
              >
                Retry
              </button>
            </div>
          ) : watchlist.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Your watchlist is empty</p>
              <p className="text-sm mt-2">Add symbols above to start tracking stocks</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead className="text-right">Change %</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {watchlist.map((item) => (
                  <TableRow key={item.symbol}>
                    <TableCell className="font-medium">
                      <Link href={`/charts/${item.symbol}`} className="hover:underline">
                        {item.symbol}
                      </Link>
                    </TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                    <TableCell className={`text-right ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {item.change >= 0 ? '+' : ''}{formatCurrency(item.change)}
                    </TableCell>
                    <TableCell className={`text-right ${item.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      <div className="flex items-center justify-end gap-1">
                        {item.changePercent >= 0 ? 
                          <TrendingUp className="w-4 h-4" /> : 
                          <TrendingDown className="w-4 h-4" />
                        }
                        {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSymbol(item.symbol)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
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
