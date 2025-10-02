/**
 * Quotes API Endpoint
 * Get quotes for multiple symbols (batch)
 */

import { NextRequest, NextResponse } from 'next/server';
import { MarketDataService } from '@/lib/services/MarketDataService';
import { APIErrorHandler } from '@/lib/api/errorHandler';

const marketService = MarketDataService.getInstance();

/**
 * POST /api/quotes
 * Body: { symbols: string[] }
 * Get quotes for multiple symbols
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbols } = body;

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return NextResponse.json(
        APIErrorHandler.createErrorResponse(
          'INVALID_PARAMETERS',
          'Symbols array is required',
          'Please provide an array of valid stock symbols'
        ),
        { status: 400 }
      );
    }

    if (symbols.length > 50) {
      return NextResponse.json(
        APIErrorHandler.createErrorResponse(
          'INVALID_PARAMETERS',
          'Too many symbols',
          'Maximum 50 symbols per request'
        ),
        { status: 400 }
      );
    }

    const quotes = await marketService.getQuotes(symbols);
    const quotesArray = Array.from(quotes.values());

    return NextResponse.json(
      APIErrorHandler.createSuccessResponse({
        quotes: quotesArray,
        count: quotesArray.length,
        requestedCount: symbols.length,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in quotes API:', error);
    return NextResponse.json(
      APIErrorHandler.createErrorResponse(
        'INTERNAL_ERROR',
        'Failed to fetch quotes',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}
