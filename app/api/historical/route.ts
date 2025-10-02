/**
 * Historical Data API Endpoint
 * Get historical OHLCV data
 */

import { NextRequest, NextResponse } from 'next/server';
import { MarketDataService } from '@/lib/services/MarketDataService';
import { APIErrorHandler } from '@/lib/api/errorHandler';
import { validateSymbol } from '@/lib/utils/marketUtils';
import { TimePeriod, TimeInterval } from '@/lib/types/market';

const marketService = MarketDataService.getInstance();

const VALID_PERIODS: TimePeriod[] = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max'];
const VALID_INTERVALS: TimeInterval[] = ['1m', '5m', '15m', '30m', '1h', '1d', '1wk', '1mo'];

/**
 * GET /api/historical?symbol=AAPL&period=1y&interval=1d
 * Get historical data for a symbol
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');
    const period = (searchParams.get('period') || '1y') as TimePeriod;
    const interval = (searchParams.get('interval') || '1d') as TimeInterval;

    if (!symbol) {
      return NextResponse.json(
        APIErrorHandler.createErrorResponse(
          'INVALID_PARAMETERS',
          'Symbol parameter is required'
        ),
        { status: 400 }
      );
    }

    if (!validateSymbol(symbol)) {
      return NextResponse.json(
        APIErrorHandler.createErrorResponse(
          'INVALID_SYMBOL',
          'Invalid symbol format'
        ),
        { status: 400 }
      );
    }

    if (!VALID_PERIODS.includes(period)) {
      return NextResponse.json(
        APIErrorHandler.createErrorResponse(
          'INVALID_PARAMETERS',
          'Invalid period',
          `Valid periods: ${VALID_PERIODS.join(', ')}`
        ),
        { status: 400 }
      );
    }

    if (!VALID_INTERVALS.includes(interval)) {
      return NextResponse.json(
        APIErrorHandler.createErrorResponse(
          'INVALID_PARAMETERS',
          'Invalid interval',
          `Valid intervals: ${VALID_INTERVALS.join(', ')}`
        ),
        { status: 400 }
      );
    }

    const data = await marketService.getHistoricalData(symbol, period, interval);

    if (!data) {
      return NextResponse.json(
        APIErrorHandler.createErrorResponse(
          'SYMBOL_NOT_FOUND',
          'Historical data not found',
          'Unable to retrieve historical data for the requested symbol'
        ),
        { status: 404 }
      );
    }

    return NextResponse.json(
      APIErrorHandler.createSuccessResponse(data),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in historical API:', error);
    return NextResponse.json(
      APIErrorHandler.createErrorResponse(
        'INTERNAL_ERROR',
        'Failed to fetch historical data',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}
