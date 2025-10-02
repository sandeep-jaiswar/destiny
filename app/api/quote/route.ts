/**
 * Quote API Endpoint
 * Get real-time and historical market data
 */

import { NextRequest, NextResponse } from 'next/server';
import { MarketDataService } from '@/lib/services/MarketDataService';
import { APIErrorHandler } from '@/lib/api/errorHandler';
import { validateSymbol } from '@/lib/utils/marketUtils';

const marketService = MarketDataService.getInstance();

/**
 * GET /api/quote?symbol=AAPL
 * Get real-time quote for a single symbol
 */
export async function GET(request: NextRequest) {
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

    if (!validateSymbol(symbol)) {
      return NextResponse.json(
        APIErrorHandler.createErrorResponse(
          'INVALID_SYMBOL',
          'Invalid symbol format',
          'Symbol must be 1-5 uppercase letters, optionally followed by an exchange suffix'
        ),
        { status: 400 }
      );
    }

    const quote = await marketService.getQuote(symbol);

    if (!quote) {
      return NextResponse.json(
        APIErrorHandler.createErrorResponse(
          'SYMBOL_NOT_FOUND',
          'Symbol not found',
          'The requested symbol could not be found or market may be closed'
        ),
        { status: 404 }
      );
    }

    return NextResponse.json(
      APIErrorHandler.createSuccessResponse(quote),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in quote API:', error);
    return NextResponse.json(
      APIErrorHandler.createErrorResponse(
        'INTERNAL_ERROR',
        'Failed to fetch quote',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}
