/**
 * Multi-Timeframe Analysis API Endpoint
 * Analyze symbol across multiple timeframes
 */

import { NextRequest, NextResponse } from 'next/server';
import { MultiTimeframeAnalyzer, TimeframeConfig } from '@/lib/analysis/MultiTimeframeAnalyzer';
import { APIErrorHandler } from '@/lib/api/errorHandler';
import { validateSymbol } from '@/lib/utils/marketUtils';

const analyzer = MultiTimeframeAnalyzer.getInstance();

/**
 * GET /api/multi-timeframe?symbol=AAPL
 * Analyze symbol across multiple timeframes (1d, 1w, 1m)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');

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

    // Optional: Parse custom timeframes from query params
    let customTimeframes: TimeframeConfig[] | undefined;
    const timeframesParam = searchParams.get('timeframes');
    
    if (timeframesParam) {
      try {
        customTimeframes = JSON.parse(timeframesParam);
      } catch {
        return NextResponse.json(
          APIErrorHandler.createErrorResponse(
            'INVALID_PARAMETERS',
            'Invalid timeframes format',
            'Timeframes must be a valid JSON array'
          ),
          { status: 400 }
        );
      }
    }

    const result = await analyzer.analyzeMultiTimeframe(symbol, customTimeframes);

    if (!result) {
      return NextResponse.json(
        APIErrorHandler.createErrorResponse(
          'SYMBOL_NOT_FOUND',
          'Failed to analyze symbol across timeframes',
          'Unable to retrieve data for multi-timeframe analysis'
        ),
        { status: 404 }
      );
    }

    // Add timeframe strength analysis
    const strength = analyzer.getTimeframeStrength(result);

    return NextResponse.json(
      APIErrorHandler.createSuccessResponse({
        ...result,
        strength,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in multi-timeframe API:', error);
    return NextResponse.json(
      APIErrorHandler.createErrorResponse(
        'INTERNAL_ERROR',
        'Failed to perform multi-timeframe analysis',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}
