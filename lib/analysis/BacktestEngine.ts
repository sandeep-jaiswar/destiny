/**
 * Backtesting Engine
 * Historical performance validation with comprehensive metrics
 */

import { BaseStrategy } from '../strategies/BaseStrategy';
import { BacktestResult } from '../types/strategy';
import { HistoricalData } from '../types/market';

export interface Trade {
  entryDate: Date;
  entryPrice: number;
  exitDate: Date;
  exitPrice: number;
  type: 'BUY' | 'SELL';
  return: number;
  returnPercent: number;
}

export interface BacktestConfig {
  initialCapital: number;
  commission: number; // Commission per trade (percentage)
  slippage: number; // Slippage per trade (percentage)
  positionSize: number; // Percentage of capital per trade (0-1)
}

export interface DetailedBacktestResult extends BacktestResult {
  trades: Trade[];
  equity: number[];
  drawdownSeries: number[];
  config: BacktestConfig;
}

export class BacktestEngine {
  private static DEFAULT_CONFIG: BacktestConfig = {
    initialCapital: 10000,
    commission: 0.001, // 0.1%
    slippage: 0.001, // 0.1%
    positionSize: 1.0, // 100% of capital
  };

  /**
   * Backtest a strategy with historical data
   */
  static backtest(
    strategy: BaseStrategy,
    data: HistoricalData,
    config: Partial<BacktestConfig> = {}
  ): DetailedBacktestResult {
    const backtestConfig: BacktestConfig = {
      ...BacktestEngine.DEFAULT_CONFIG,
      ...config,
    };

    const trades: Trade[] = [];
    const equity: number[] = [backtestConfig.initialCapital];
    let currentCapital = backtestConfig.initialCapital;
    let currentPosition: { type: 'BUY' | 'SELL'; entryPrice: number; entryDate: Date } | null = null;

    // Iterate through historical data
    for (let i = 0; i < data.data.length; i++) {
      // Create a subset of data up to current point for strategy analysis
      const currentData: HistoricalData = {
        ...data,
        data: data.data.slice(0, i + 1),
      };

      // Skip if not enough data for strategy
      if (currentData.data.length < 30) {
        equity.push(currentCapital);
        continue;
      }

      const result = strategy.analyze(data.symbol, currentData);
      const currentPoint = data.data[i];

      // Entry logic
      if (!currentPosition && result.signal !== 'HOLD') {
        currentPosition = {
          type: result.signal,
          entryPrice: currentPoint.close,
          entryDate: currentPoint.date,
        };
      }
      // Exit logic - exit when signal changes or opposite signal
      else if (currentPosition) {
        const shouldExit =
          result.signal === 'HOLD' ||
          (currentPosition.type === 'BUY' && result.signal === 'SELL') ||
          (currentPosition.type === 'SELL' && result.signal === 'BUY');

        if (shouldExit) {
          const exitPrice = currentPoint.close;
          const trade = this.executeTrade(
            currentPosition,
            exitPrice,
            currentPoint.date,
            currentCapital,
            backtestConfig
          );

          trades.push(trade);
          currentCapital += trade.return;
          currentPosition = null;

          // If new signal is not HOLD, open new position
          if (result.signal !== 'HOLD') {
            currentPosition = {
              type: result.signal,
              entryPrice: currentPoint.close,
              entryDate: currentPoint.date,
            };
          }
        }
      }

      equity.push(currentCapital);
    }

    // Close any open position at the end
    if (currentPosition) {
      const lastPoint = data.data[data.data.length - 1];
      const trade = this.executeTrade(
        currentPosition,
        lastPoint.close,
        lastPoint.date,
        currentCapital,
        backtestConfig
      );
      trades.push(trade);
      currentCapital += trade.return;
      equity.push(currentCapital);
    }

    // Calculate metrics
    const metrics = this.calculateMetrics(trades, equity, backtestConfig.initialCapital, data);
    const drawdownSeries = this.calculateDrawdownSeries(equity);

    return {
      ...metrics,
      trades,
      equity,
      drawdownSeries,
      config: backtestConfig,
    };
  }

  /**
   * Execute a trade with commission and slippage
   */
  private static executeTrade(
    position: { type: 'BUY' | 'SELL'; entryPrice: number; entryDate: Date },
    exitPrice: number,
    exitDate: Date,
    capital: number,
    config: BacktestConfig
  ): Trade {
    const direction = position.type === 'BUY' ? 1 : -1;
    
    // Apply slippage
    const adjustedEntryPrice = position.entryPrice * (1 + config.slippage * direction);
    const adjustedExitPrice = exitPrice * (1 - config.slippage * direction);
    
    // Calculate return before commission
    const priceReturn = (adjustedExitPrice - adjustedEntryPrice) / adjustedEntryPrice;
    const grossReturn = priceReturn * direction;
    
    // Apply commission
    const netReturn = grossReturn - (config.commission * 2); // Entry and exit commission
    
    // Calculate dollar return based on position size
    const positionValue = capital * config.positionSize;
    const dollarReturn = positionValue * netReturn;
    
    return {
      entryDate: position.entryDate,
      entryPrice: position.entryPrice,
      exitDate,
      exitPrice,
      type: position.type,
      return: dollarReturn,
      returnPercent: netReturn * 100,
    };
  }

  /**
   * Calculate backtest metrics
   */
  private static calculateMetrics(
    trades: Trade[],
    equity: number[],
    initialCapital: number,
    data: HistoricalData
  ): BacktestResult {
    const winningTrades = trades.filter(t => t.return > 0);
    const losingTrades = trades.filter(t => t.return <= 0);
    
    const totalReturn = equity[equity.length - 1] - initialCapital;
    const totalReturnPercent = (totalReturn / initialCapital) * 100;
    
    const averageReturn = trades.length > 0
      ? trades.reduce((sum, t) => sum + t.returnPercent, 0) / trades.length
      : 0;
    
    const winRate = trades.length > 0
      ? (winningTrades.length / trades.length) * 100
      : 0;
    
    const maxDrawdown = this.calculateMaxDrawdown(equity);
    const sharpeRatio = this.calculateSharpeRatio(trades, data);

    return {
      strategy: '',
      symbol: data.symbol,
      period: `${data.period}`,
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate,
      totalReturn: totalReturnPercent,
      averageReturn,
      maxDrawdown,
      sharpeRatio,
    };
  }

  /**
   * Calculate maximum drawdown
   */
  private static calculateMaxDrawdown(equity: number[]): number {
    let maxDrawdown = 0;
    let peak = equity[0];

    for (const value of equity) {
      if (value > peak) {
        peak = value;
      }
      
      const drawdown = ((peak - value) / peak) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return maxDrawdown;
  }

  /**
   * Calculate drawdown series for visualization
   */
  private static calculateDrawdownSeries(equity: number[]): number[] {
    const drawdowns: number[] = [];
    let peak = equity[0];

    for (const value of equity) {
      if (value > peak) {
        peak = value;
      }
      
      const drawdown = ((peak - value) / peak) * 100;
      drawdowns.push(drawdown);
    }

    return drawdowns;
  }

  /**
   * Calculate Sharpe Ratio (annualized)
   */
  private static calculateSharpeRatio(trades: Trade[], data: HistoricalData): number {
    if (trades.length < 2) return 0;

    const returns = trades.map(t => t.returnPercent);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    
    // Calculate standard deviation
    const squaredDiffs = returns.map(r => Math.pow(r - avgReturn, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return 0;

    // Annualize based on trading frequency
    const tradingDaysPerYear = 252;
    const daysInPeriod = data.data.length;
    const tradesPerYear = (trades.length / daysInPeriod) * tradingDaysPerYear;
    
    const annualizedReturn = avgReturn * tradesPerYear;
    const annualizedStdDev = stdDev * Math.sqrt(tradesPerYear);
    
    // Assume risk-free rate of 2%
    const riskFreeRate = 2.0;
    
    return (annualizedReturn - riskFreeRate) / annualizedStdDev;
  }

  /**
   * Compare multiple strategies
   */
  static compareStrategies(
    strategies: BaseStrategy[],
    data: HistoricalData,
    config?: Partial<BacktestConfig>
  ): DetailedBacktestResult[] {
    return strategies.map(strategy => {
      const result = this.backtest(strategy, data, config);
      return {
        ...result,
        strategy: strategy.getName(),
      };
    });
  }
}
