import { NextRequest, NextResponse } from 'next/server';
import { marketDataService } from '@/lib/marketDataService';
import type { APIResponse, MarketQuote } from '@/types/market';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;

    if (!symbol) {
      return NextResponse.json<APIResponse<MarketQuote>>({
        success: false,
        error: {
          code: 'MISSING_SYMBOL',
          message: 'Symbol parameter is required',
          details: 'Please provide a valid stock symbol (e.g., AAPL, RELIANCE.NS)',
        },
      }, { status: 400 });
    }

    // Normalize symbol to uppercase
    const normalizedSymbol = symbol.toUpperCase();

    // Fetch quote from service
    const quote = await marketDataService.getQuote(normalizedSymbol);

    if (!quote) {
      return NextResponse.json<APIResponse<MarketQuote>>({
        success: false,
        error: {
          code: 'SYMBOL_NOT_FOUND',
          message: 'Stock symbol not found',
          details: 'Please verify the symbol is correct and market is open. Supported formats: AAPL (US), RELIANCE.NS (NSE), INFY.BO (BSE)',
        },
      }, { status: 404 });
    }

    return NextResponse.json<APIResponse<MarketQuote>>({
      success: true,
      data: quote,
      metadata: {
        timestamp: new Date().toISOString(),
        cached: false,
        source: 'yahoo-finance2',
      },
    });
  } catch (error) {
    console.error('Quote API error:', error);
    
    return NextResponse.json<APIResponse<MarketQuote>>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch market data',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
    }, { status: 500 });
  }
}
