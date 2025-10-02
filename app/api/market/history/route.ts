/**
 * Market Historical Data API Endpoint
 * GET /api/market/history?symbol=AAPL&period=1mo
 */

import { NextRequest, NextResponse } from 'next/server';
import { MarketDataService } from '@/lib/marketDataService';

const marketService = MarketDataService.getInstance();

const VALID_PERIODS = ['1d', '5d', '1mo', '3mo', '6mo', '1y'] as const;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');
    const period = searchParams.get('period') || '1mo';

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

    if (!VALID_PERIODS.includes(period as typeof VALID_PERIODS[number])) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PERIOD',
            message: 'Invalid period parameter',
            details: `Valid periods are: ${VALID_PERIODS.join(', ')}`,
          },
        },
        { status: 400 }
      );
    }

    const response = await marketService.getHistoricalData(
      symbol.toUpperCase(),
      period as typeof VALID_PERIODS[number]
    );

    if (!response.success) {
      return NextResponse.json(response, { 
        status: response.error?.code === 'NO_DATA' ? 404 : 500 
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API /api/market/history] Error:', error);
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
