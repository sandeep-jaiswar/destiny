/**
 * Bollinger Bands Strategy
 * Squeeze and breakout detection
 */

import { BaseStrategy } from './BaseStrategy';
import { StrategyResult, SignalType, BollingerBandsConfig } from '../types/strategy';
import { HistoricalData } from '../types/market';
import { calculateBollingerBands } from '../utils/technicalIndicators';

export class BollingerBandsStrategy extends BaseStrategy {
  private config: BollingerBandsConfig;

  constructor(config: Partial<BollingerBandsConfig> = {}) {
    super('Bollinger Bands Strategy');
    this.config = {
      period: config.period || 20,
      standardDeviations: config.standardDeviations || 2,
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

    // Calculate Bollinger Bands
    const bands = calculateBollingerBands(
      closingPrices,
      this.config.period,
      this.config.standardDeviations
    );

    if (bands.upper.length === 0) {
      return this.createResult(
        symbol,
        'HOLD',
        0,
        undefined,
        'Unable to calculate Bollinger Bands with provided data.'
      );
    }

    const currentPrice = this.getCurrentPrice(data);
    const currentUpper = bands.upper[bands.upper.length - 1];
    const currentMiddle = bands.middle[bands.middle.length - 1];
    const currentLower = bands.lower[bands.lower.length - 1];
    
    // Get previous price for trend detection
    const previousPrice = closingPrices.length > 1 
      ? closingPrices[closingPrices.length - 2] 
      : currentPrice;

    // Calculate band width (volatility indicator)
    const bandWidth = ((currentUpper - currentLower) / currentMiddle) * 100;
    const avgBandWidth = bands.upper.map((upper, i) => 
      ((upper - bands.lower[i]) / bands.middle[i]) * 100
    ).reduce((a, b) => a + b, 0) / bands.upper.length;

    // Determine signal
    let signal: SignalType = 'HOLD';
    let confidenceScore = 50;
    let analysis = '';

    // Price near or below lower band (oversold)
    if (currentPrice <= currentLower) {
      signal = 'BUY';
      const distance = ((currentLower - currentPrice) / currentMiddle) * 100;
      confidenceScore = Math.min(90, 70 + distance * 10);
      
      if (previousPrice < currentPrice) {
        confidenceScore += 5;
        analysis = `Price bouncing from lower band (${distance.toFixed(2)}% below)`;
      } else {
        analysis = `Price at lower band (${distance.toFixed(2)}% below middle)`;
      }
    }
    // Price near or above upper band (overbought)
    else if (currentPrice >= currentUpper) {
      signal = 'SELL';
      const distance = ((currentPrice - currentUpper) / currentMiddle) * 100;
      confidenceScore = Math.min(90, 70 + distance * 10);
      
      if (previousPrice > currentPrice) {
        confidenceScore += 5;
        analysis = `Price falling from upper band (${distance.toFixed(2)}% above)`;
      } else {
        analysis = `Price at upper band (${distance.toFixed(2)}% above middle)`;
      }
    }
    // Bollinger Squeeze (low volatility, potential breakout)
    else if (bandWidth < avgBandWidth * 0.7) {
      signal = 'HOLD';
      confidenceScore = 30;
      analysis = `Bollinger Squeeze detected (low volatility, await breakout)`;
    }
    // Price above middle band (bullish)
    else if (currentPrice > currentMiddle) {
      signal = 'BUY';
      const position = ((currentPrice - currentMiddle) / (currentUpper - currentMiddle)) * 100;
      confidenceScore = Math.min(70, 50 + position * 0.2);
      analysis = `Price above middle band (${position.toFixed(0)}% toward upper band)`;
    }
    // Price below middle band (bearish)
    else {
      signal = 'SELL';
      const position = ((currentMiddle - currentPrice) / (currentMiddle - currentLower)) * 100;
      confidenceScore = Math.min(70, 50 + position * 0.2);
      analysis = `Price below middle band (${position.toFixed(0)}% toward lower band)`;
    }

    const indicators = {
      currentPrice,
      upperBand: currentUpper,
      middleBand: currentMiddle,
      lowerBand: currentLower,
      bandWidth,
      avgBandWidth,
    };

    return this.createResult(symbol, signal, confidenceScore, indicators, analysis);
  }
}
