/**
 * Strategy Analysis API Endpoint
 * Analyze a symbol with a specific strategy or all strategies
 */

import { NextRequest, NextResponse } from 'next/server';
import { MarketDataService } from '@/lib/services/MarketDataService';
import { StrategyEngine } from '@/lib/strategies/StrategyEngine';
import { APIErrorHandler } from '@/lib/api/errorHandler';
import { validateSymbol } from '@/lib/utils/marketUtils';
import { TimePeriod, TimeInterval } from '@/lib/types/market';

const marketService = MarketDataService.getInstance();
const strategyEngine = StrategyEngine.getInstance();

/**
 * GET /api/strategy?symbol=AAPL&strategy=RSI Strategy&period=1y&interval=1d
 * Analyze symbol with specific strategy or get consensus
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');
    const strategyName = searchParams.get('strategy');
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

    // Get historical data
    const historicalData = await marketService.getHistoricalData(symbol, period, interval);

    if (!historicalData) {
      return NextResponse.json(
        APIErrorHandler.createErrorResponse(
          'SYMBOL_NOT_FOUND',
          'Historical data not found',
          'Unable to retrieve historical data for analysis'
        ),
        { status: 404 }
      );
    }

    // Analyze with specific strategy or all strategies
    if (strategyName) {
      const result = strategyEngine.analyzeWithStrategy(strategyName, symbol, historicalData);
      
      if (!result) {
        return NextResponse.json(
          APIErrorHandler.createErrorResponse(
            'INVALID_PARAMETERS',
            'Invalid strategy name',
            `Available strategies: ${strategyEngine.getAvailableStrategies().join(', ')}`
          ),
          { status: 400 }
        );
      }

      return NextResponse.json(
        APIErrorHandler.createSuccessResponse(result),
        { status: 200 }
      );
    } else {
      // Get consensus from all strategies
      const consensus = strategyEngine.analyzeWithConsensus(symbol, historicalData);
      
      return NextResponse.json(
        APIErrorHandler.createSuccessResponse(consensus),
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error in strategy API:', error);
    return NextResponse.json(
      APIErrorHandler.createErrorResponse(
        'INTERNAL_ERROR',
        'Failed to analyze strategy',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}
