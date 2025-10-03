/**
 * Watchlist API Endpoint
 * Manage user watchlist with real-time quotes
 */

import { NextRequest, NextResponse } from 'next/server';
import { MarketDataService } from '@/lib/services/MarketDataService';
import { APIErrorHandler } from '@/lib/api/errorHandler';

const marketService = MarketDataService.getInstance();

export interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
}

// Mock watchlist - In production, this would come from a database
const mockWatchlist = [
  'AAPL',
  'MSFT', 
  'GOOGL',
  'AMZN',
  'NVDA',
];

// Symbol name mapping for common stocks
const symbolNames: Record<string, string> = {
  'AAPL': 'Apple Inc.',
  'MSFT': 'Microsoft Corporation',
  'GOOGL': 'Alphabet Inc.',
  'AMZN': 'Amazon.com Inc.',
  'NVDA': 'NVIDIA Corporation',
  'TSLA': 'Tesla, Inc.',
  'META': 'Meta Platforms, Inc.',
  'NFLX': 'Netflix, Inc.',
  'DIS': 'The Walt Disney Company',
  'INTC': 'Intel Corporation',
};

/**
 * GET /api/watchlist
 * Get user's watchlist with real-time quotes
 */
export async function GET() {
  try {
    // Fetch current quotes for all watchlist symbols
    const quotes = await marketService.getQuotes(mockWatchlist);
    
    // Build watchlist items with quote data
    const items: WatchlistItem[] = [];
    
    for (const symbol of mockWatchlist) {
      const quote = quotes.get(symbol);
      
      if (quote) {
        items.push({
          symbol: quote.symbol,
          name: symbolNames[quote.symbol] || `${quote.symbol} Inc.`,
          price: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          volume: quote.volume,
          marketCap: quote.marketCap,
        });
      } else {
        // Include symbol even if quote fetch failed
        items.push({
          symbol,
          name: symbolNames[symbol] || `${symbol} Inc.`,
          price: 0,
          change: 0,
          changePercent: 0,
          volume: 0,
        });
      }
    }
    
    return NextResponse.json(
      APIErrorHandler.createSuccessResponse({ items }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in watchlist API:', error);
    return NextResponse.json(
      APIErrorHandler.createErrorResponse(
        'INTERNAL_ERROR',
        'Failed to fetch watchlist',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}

/**
 * POST /api/watchlist
 * Add a symbol to the watchlist
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol } = body;
    
    if (!symbol) {
      return NextResponse.json(
        APIErrorHandler.createErrorResponse(
          'INVALID_PARAMETERS',
          'Symbol is required',
          'Please provide a valid stock symbol'
        ),
        { status: 400 }
      );
    }
    
    // Verify symbol exists by fetching quote
    const quote = await marketService.getQuote(symbol.toUpperCase());
    
    if (!quote) {
      return NextResponse.json(
        APIErrorHandler.createErrorResponse(
          'SYMBOL_NOT_FOUND',
          'Symbol not found',
          'The requested symbol could not be found'
        ),
        { status: 404 }
      );
    }
    
    // In production, add to database
    // For now, just return success
    return NextResponse.json(
      APIErrorHandler.createSuccessResponse({ 
        symbol: symbol.toUpperCase(),
        message: 'Symbol added to watchlist' 
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return NextResponse.json(
      APIErrorHandler.createErrorResponse(
        'INTERNAL_ERROR',
        'Failed to add symbol to watchlist',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/watchlist?symbol=AAPL
 * Remove a symbol from the watchlist
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');
    
    if (!symbol) {
      return NextResponse.json(
        APIErrorHandler.createErrorResponse(
          'INVALID_PARAMETERS',
          'Symbol parameter is required',
          'Please provide a valid stock symbol'
        ),
        { status: 400 }
      );
    }
    
    // In production, remove from database
    // For now, just return success
    return NextResponse.json(
      APIErrorHandler.createSuccessResponse({ 
        symbol: symbol.toUpperCase(),
        message: 'Symbol removed from watchlist' 
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return NextResponse.json(
      APIErrorHandler.createErrorResponse(
        'INTERNAL_ERROR',
        'Failed to remove symbol from watchlist',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}
