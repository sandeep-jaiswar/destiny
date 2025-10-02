/**
 * Base Strategy Abstract Class
 * Foundation for all trading strategies
 */

import { StrategyResult, SignalType, ConfidenceLevel } from '../types/strategy';
import { HistoricalData } from '../types/market';

export abstract class BaseStrategy {
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Analyze market data and generate trading signal
   * Must be implemented by each strategy
   */
  abstract analyze(symbol: string, data: HistoricalData): StrategyResult;

  /**
   * Get strategy name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Calculate confidence level from score
   */
  protected getConfidenceLevel(score: number): ConfidenceLevel {
    if (score >= 70) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Create strategy result object
   */
  protected createResult(
    symbol: string,
    signal: SignalType,
    confidenceScore: number,
    indicators?: Record<string, number>,
    analysis?: string
  ): StrategyResult {
    return {
      symbol,
      strategy: this.name,
      signal,
      confidence: this.getConfidenceLevel(confidenceScore),
      confidenceScore,
      timestamp: new Date(),
      indicators,
      analysis,
    };
  }

  /**
   * Validate that we have enough data
   */
  protected validateDataLength(data: HistoricalData, minLength: number): boolean {
    return data.data.length >= minLength;
  }

  /**
   * Extract closing prices from historical data
   */
  protected getClosingPrices(data: HistoricalData): number[] {
    return data.data.map(point => point.close);
  }

  /**
   * Get the most recent closing price
   */
  protected getCurrentPrice(data: HistoricalData): number {
    if (data.data.length === 0) return 0;
    return data.data[data.data.length - 1].close;
  }
}
