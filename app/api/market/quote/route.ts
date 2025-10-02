/**
 * Market Quote API Endpoint
 * GET /api/market/quote?symbol=AAPL
 */

import { NextRequest, NextResponse } from 'next/server';
import { MarketDataService } from '@/lib/marketDataService';

const marketService = MarketDataService.getInstance();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_SYMBOL',
            message: 'Symbol parameter is required',
            details: 'Please provide a stock symbol in the query parameter',
          },
        },
        { status: 400 }
      );
    }

    const response = await marketService.getQuote(symbol.toUpperCase());

    if (!response.success) {
      return NextResponse.json(response, { 
        status: response.error?.code === 'SYMBOL_NOT_FOUND' ? 404 : 500 
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API /api/market/quote] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
