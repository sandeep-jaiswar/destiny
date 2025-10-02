/**
 * MACD Strategy
 * Moving Average Convergence Divergence analysis
 */

import { BaseStrategy } from './BaseStrategy';
import { StrategyResult, SignalType, MACDConfig } from '../types/strategy';
import { HistoricalData } from '../types/market';
import { calculateMACD } from '../utils/technicalIndicators';

export class MACDStrategy extends BaseStrategy {
  private config: MACDConfig;

  constructor(config: Partial<MACDConfig> = {}) {
    super('MACD Strategy');
    this.config = {
      fastPeriod: config.fastPeriod || 12,
      slowPeriod: config.slowPeriod || 26,
      signalPeriod: config.signalPeriod || 9,
    };
  }

  analyze(symbol: string, data: HistoricalData): StrategyResult {
    const minDataLength = this.config.slowPeriod + this.config.signalPeriod + 10;

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

    // Calculate MACD
    const macdResult = calculateMACD(
      closingPrices,
      this.config.fastPeriod,
      this.config.slowPeriod,
      this.config.signalPeriod
    );

    if (macdResult.histogram.length === 0) {
      return this.createResult(
        symbol,
        'HOLD',
        0,
        undefined,
        'Unable to calculate MACD with provided data.'
      );
    }

    const currentMACD = macdResult.macd[macdResult.macd.length - 1];
    const currentSignal = macdResult.signal[macdResult.signal.length - 1];
    const currentHistogram = macdResult.histogram[macdResult.histogram.length - 1];
    const previousHistogram =
      macdResult.histogram.length > 1
        ? macdResult.histogram[macdResult.histogram.length - 2]
        : currentHistogram;
    const currentPrice = this.getCurrentPrice(data);

    // Determine signal
    let signal: SignalType = 'HOLD';
    let confidenceScore = 50;
    let analysis = '';

    // Bullish crossover (MACD crosses above signal line)
    if (currentHistogram > 0 && previousHistogram <= 0) {
      signal = 'BUY';
      confidenceScore = 80;
      analysis = 'Bullish crossover: MACD crossed above signal line';
    }
    // Bearish crossover (MACD crosses below signal line)
    else if (currentHistogram < 0 && previousHistogram >= 0) {
      signal = 'SELL';
      confidenceScore = 80;
      analysis = 'Bearish crossover: MACD crossed below signal line';
    }
    // MACD above signal line (bullish)
    else if (currentHistogram > 0) {
      signal = 'BUY';
      
      // Stronger signal if histogram is increasing
      if (currentHistogram > previousHistogram) {
        confidenceScore = 70;
        analysis = 'Bullish trend with increasing momentum';
      } else {
        confidenceScore = 60;
        analysis = 'Bullish trend with decreasing momentum';
      }
    }
    // MACD below signal line (bearish)
    else if (currentHistogram < 0) {
      signal = 'SELL';
      
      // Stronger signal if histogram is decreasing
      if (currentHistogram < previousHistogram) {
        confidenceScore = 70;
        analysis = 'Bearish trend with increasing momentum';
      } else {
        confidenceScore = 60;
        analysis = 'Bearish trend with decreasing momentum';
      }
    }

    const indicators = {
      macd: currentMACD,
      signal: currentSignal,
      histogram: currentHistogram,
      currentPrice,
    };

    return this.createResult(symbol, signal, confidenceScore, indicators, analysis);
  }
}
