/**
 * Moving Average Strategy
 * Golden Cross / Death Cross detection
 */

import { BaseStrategy } from './BaseStrategy';
import { StrategyResult, SignalType, MovingAverageConfig } from '../types/strategy';
import { HistoricalData } from '../types/market';
import { calculateSMA, detectCrossover, detectCrossunder } from '../utils/technicalIndicators';

export class MovingAverageStrategy extends BaseStrategy {
  private config: MovingAverageConfig;

  constructor(config: Partial<MovingAverageConfig> = {}) {
    super('Moving Average Crossover');
    this.config = {
      shortPeriod: config.shortPeriod || 10,
      longPeriod: config.longPeriod || 20,
    };
  }

  analyze(symbol: string, data: HistoricalData): StrategyResult {
    const minDataLength = this.config.longPeriod + 2;

    // Validate data
    if (!this.validateDataLength(data, minDataLength)) {
      return this.createResult(
        symbol,
        'HOLD',
        0,
        undefined,
        `Insufficient data. Need at least ${minDataLength} data points.`
      );
    }

    const closingPrices = this.getClosingPrices(data);

    // Calculate moving averages
    const shortMA = calculateSMA(closingPrices, this.config.shortPeriod);
    const longMA = calculateSMA(closingPrices, this.config.longPeriod);

    // Align arrays (longMA is shorter)
    const offset = shortMA.length - longMA.length;
    const alignedShortMA = shortMA.slice(offset);

    // Get current values
    const currentShortMA = alignedShortMA[alignedShortMA.length - 1];
    const currentLongMA = longMA[longMA.length - 1];
    const currentPrice = this.getCurrentPrice(data);

    // Detect crossovers
    const crossovers = detectCrossover(alignedShortMA, longMA);
    const crossunders = detectCrossunder(alignedShortMA, longMA);

    // Determine signal
    let signal: SignalType = 'HOLD';
    let confidenceScore = 50;
    let analysis = '';

    // Golden Cross (bullish)
    if (crossovers[crossovers.length - 1]) {
      signal = 'BUY';
      confidenceScore = 75;
      analysis = `Golden Cross detected: Short MA (${this.config.shortPeriod}) crossed above Long MA (${this.config.longPeriod})`;
    }
    // Death Cross (bearish)
    else if (crossunders[crossunders.length - 1]) {
      signal = 'SELL';
      confidenceScore = 75;
      analysis = `Death Cross detected: Short MA (${this.config.shortPeriod}) crossed below Long MA (${this.config.longPeriod})`;
    }
    // Bullish trend (short MA above long MA)
    else if (currentShortMA > currentLongMA) {
      signal = 'BUY';
      const spread = ((currentShortMA - currentLongMA) / currentLongMA) * 100;
      confidenceScore = Math.min(70, 50 + spread * 10);
      analysis = `Bullish trend: Short MA above Long MA by ${spread.toFixed(2)}%`;
    }
    // Bearish trend (short MA below long MA)
    else if (currentShortMA < currentLongMA) {
      signal = 'SELL';
      const spread = ((currentLongMA - currentShortMA) / currentLongMA) * 100;
      confidenceScore = Math.min(70, 50 + spread * 10);
      analysis = `Bearish trend: Short MA below Long MA by ${spread.toFixed(2)}%`;
    }

    const indicators = {
      shortMA: currentShortMA,
      longMA: currentLongMA,
      currentPrice,
      spread: currentShortMA - currentLongMA,
    };

    return this.createResult(symbol, signal, confidenceScore, indicators, analysis);
  }
}
