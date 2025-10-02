import { NextRequest, NextResponse } from 'next/server';
import { marketDataService } from '@/lib/marketDataService';
import type { APIResponse, HistoricalData, TimePeriod, TimeInterval } from '@/types/market';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const searchParams = request.nextUrl.searchParams;
    const period = (searchParams.get('period') || '1mo') as TimePeriod;
    const interval = (searchParams.get('interval') || '1d') as TimeInterval;

    if (!symbol) {
      return NextResponse.json<APIResponse<HistoricalData>>({
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

    // Validate period
    const validPeriods: TimePeriod[] = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max'];
    if (!validPeriods.includes(period)) {
      return NextResponse.json<APIResponse<HistoricalData>>({
        success: false,
        error: {
          code: 'INVALID_PERIOD',
          message: 'Invalid period parameter',
          details: `Valid periods: ${validPeriods.join(', ')}`,
        },
      }, { status: 400 });
    }

    // Validate interval
    const validIntervals: TimeInterval[] = ['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo', '3mo'];
    if (!validIntervals.includes(interval)) {
      return NextResponse.json<APIResponse<HistoricalData>>({
        success: false,
        error: {
          code: 'INVALID_INTERVAL',
          message: 'Invalid interval parameter',
          details: `Valid intervals: ${validIntervals.join(', ')}`,
        },
      }, { status: 400 });
    }

    // Fetch historical data from service
    const historicalData = await marketDataService.getHistoricalData(
      normalizedSymbol,
      period,
      interval
    );

    if (!historicalData) {
      return NextResponse.json<APIResponse<HistoricalData>>({
        success: false,
        error: {
          code: 'DATA_NOT_FOUND',
          message: 'Historical data not found',
          details: 'No historical data available for this symbol with the specified period and interval',
        },
      }, { status: 404 });
    }

    return NextResponse.json<APIResponse<HistoricalData>>({
      success: true,
      data: historicalData,
      metadata: {
        timestamp: new Date().toISOString(),
        cached: false,
        source: 'yahoo-finance2',
      },
    });
  } catch (error) {
    console.error('Historical data API error:', error);
    
    return NextResponse.json<APIResponse<HistoricalData>>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch historical data',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
    }, { status: 500 });
  }
}
