/**
 * RSI Strategy
 * Relative Strength Index - Overbought/Oversold detection
 */

import { BaseStrategy } from './BaseStrategy';
import { StrategyResult, SignalType, RSIConfig } from '../types/strategy';
import { HistoricalData } from '../types/market';
import { calculateRSI } from '../utils/technicalIndicators';

export class RSIStrategy extends BaseStrategy {
  private config: RSIConfig;

  constructor(config: Partial<RSIConfig> = {}) {
    super('RSI Strategy');
    this.config = {
      period: config.period || 14,
      oversold: config.oversold || 30,
      overbought: config.overbought || 70,
    };
  }

  analyze(symbol: string, data: HistoricalData): StrategyResult {
    const minDataLength = this.config.period + 2;

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

    // Calculate RSI
    const rsiValues = calculateRSI(closingPrices, this.config.period);
    
    if (rsiValues.length === 0) {
      return this.createResult(
        symbol,
        'HOLD',
        0,
        undefined,
        'Unable to calculate RSI with provided data.'
      );
    }

    const currentRSI = rsiValues[rsiValues.length - 1];
    const previousRSI = rsiValues.length > 1 ? rsiValues[rsiValues.length - 2] : currentRSI;
    const currentPrice = this.getCurrentPrice(data);

    // Determine signal
    let signal: SignalType = 'HOLD';
    let confidenceScore = 50;
    let analysis = '';

    // Oversold condition (potential buy)
    if (currentRSI < this.config.oversold) {
      signal = 'BUY';
      const intensity = (this.config.oversold - currentRSI) / this.config.oversold;
      confidenceScore = Math.min(90, 60 + intensity * 30);
      
      if (previousRSI < currentRSI) {
        confidenceScore += 10;
        analysis = `Oversold (RSI: ${currentRSI.toFixed(2)}) with upward momentum`;
      } else {
        analysis = `Oversold (RSI: ${currentRSI.toFixed(2)})`;
      }
    }
    // Overbought condition (potential sell)
    else if (currentRSI > this.config.overbought) {
      signal = 'SELL';
      const intensity = (currentRSI - this.config.overbought) / (100 - this.config.overbought);
      confidenceScore = Math.min(90, 60 + intensity * 30);
      
      if (previousRSI > currentRSI) {
        confidenceScore += 10;
        analysis = `Overbought (RSI: ${currentRSI.toFixed(2)}) with downward momentum`;
      } else {
        analysis = `Overbought (RSI: ${currentRSI.toFixed(2)})`;
      }
    }
    // Neutral zone
    else {
      // Check momentum
      const momentum = currentRSI - previousRSI;
      
      if (currentRSI > 50 && momentum > 0) {
        signal = 'BUY';
        confidenceScore = 50 + (currentRSI - 50) * 0.4;
        analysis = `Bullish momentum (RSI: ${currentRSI.toFixed(2)})`;
      } else if (currentRSI < 50 && momentum < 0) {
        signal = 'SELL';
        confidenceScore = 50 + (50 - currentRSI) * 0.4;
        analysis = `Bearish momentum (RSI: ${currentRSI.toFixed(2)})`;
      } else {
        analysis = `Neutral zone (RSI: ${currentRSI.toFixed(2)})`;
      }
    }

    const indicators = {
      rsi: currentRSI,
      previousRSI,
      currentPrice,
      oversoldLevel: this.config.oversold,
      overboughtLevel: this.config.overbought,
    };

    return this.createResult(symbol, signal, confidenceScore, indicators, analysis);
  }
}
