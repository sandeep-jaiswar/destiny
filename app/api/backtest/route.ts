/**
 * Backtesting API Endpoint
 * Test strategies against historical data
 */

import { NextRequest, NextResponse } from 'next/server';
import { MarketDataService } from '@/lib/services/MarketDataService';
import { StrategyEngine } from '@/lib/strategies/StrategyEngine';
import { BacktestEngine, BacktestConfig } from '@/lib/analysis/BacktestEngine';
import { MovingAverageStrategy } from '@/lib/strategies/MovingAverageStrategy';
import { RSIStrategy } from '@/lib/strategies/RSIStrategy';
import { MACDStrategy } from '@/lib/strategies/MACDStrategy';
import { BollingerBandsStrategy } from '@/lib/strategies/BollingerBandsStrategy';
import { BaseStrategy } from '@/lib/strategies/BaseStrategy';
import { APIErrorHandler } from '@/lib/api/errorHandler';
import { validateSymbol } from '@/lib/utils/marketUtils';
import { TimePeriod, TimeInterval } from '@/lib/types/market';

const marketService = MarketDataService.getInstance();
const strategyEngine = StrategyEngine.getInstance();

/**
 * GET /api/backtest?symbol=AAPL&strategy=RSI Strategy&period=1y&interval=1d
 * Backtest a strategy or compare all strategies
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');
    const strategyName = searchParams.get('strategy');
    const period = (searchParams.get('period') || '1y') as TimePeriod;
    const interval = (searchParams.get('interval') || '1d') as TimeInterval;
    const compare = searchParams.get('compare') === 'true';

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

    // Parse optional backtest configuration
    const backtestConfig: Partial<BacktestConfig> = {};
    
    const initialCapital = searchParams.get('initialCapital');
    if (initialCapital) {
      backtestConfig.initialCapital = parseFloat(initialCapital);
    }

    const commission = searchParams.get('commission');
    if (commission) {
      backtestConfig.commission = parseFloat(commission);
    }

    const slippage = searchParams.get('slippage');
    if (slippage) {
      backtestConfig.slippage = parseFloat(slippage);
    }

    const positionSize = searchParams.get('positionSize');
    if (positionSize) {
      backtestConfig.positionSize = parseFloat(positionSize);
    }

    // Get historical data
    const historicalData = await marketService.getHistoricalData(symbol, period, interval);

    if (!historicalData) {
      return NextResponse.json(
        APIErrorHandler.createErrorResponse(
          'SYMBOL_NOT_FOUND',
          'Historical data not found',
          'Unable to retrieve historical data for backtesting'
        ),
        { status: 404 }
      );
    }

    // Compare all strategies or test specific one
    if (compare) {
      const strategies: BaseStrategy[] = [
        new MovingAverageStrategy(),
        new RSIStrategy(),
        new MACDStrategy(),
        new BollingerBandsStrategy(),
      ];

      const results = BacktestEngine.compareStrategies(
        strategies,
        historicalData,
        backtestConfig
      );

      return NextResponse.json(
        APIErrorHandler.createSuccessResponse({
          symbol,
          period,
          interval,
          comparison: results,
        }),
        { status: 200 }
      );
    } else if (strategyName) {
      // Test specific strategy
      let strategy: BaseStrategy | null = null;

      switch (strategyName) {
        case 'Moving Average Crossover':
          strategy = new MovingAverageStrategy();
          break;
        case 'RSI Strategy':
          strategy = new RSIStrategy();
          break;
        case 'MACD Strategy':
          strategy = new MACDStrategy();
          break;
        case 'Bollinger Bands Strategy':
          strategy = new BollingerBandsStrategy();
          break;
        default:
          return NextResponse.json(
            APIErrorHandler.createErrorResponse(
              'INVALID_PARAMETERS',
              'Invalid strategy name',
              `Available strategies: ${strategyEngine.getAvailableStrategies().join(', ')}`
            ),
            { status: 400 }
          );
      }

      const result = BacktestEngine.backtest(strategy, historicalData, backtestConfig);
      result.strategy = strategyName;

      return NextResponse.json(
        APIErrorHandler.createSuccessResponse(result),
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        APIErrorHandler.createErrorResponse(
          'INVALID_PARAMETERS',
          'Either strategy parameter or compare=true must be provided'
        ),
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in backtest API:', error);
    return NextResponse.json(
      APIErrorHandler.createErrorResponse(
        'INTERNAL_ERROR',
        'Failed to perform backtesting',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}
