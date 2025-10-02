/**
 * Strategy Engine
 * Multi-strategy orchestrator for consensus signals
 */

import { BaseStrategy } from './BaseStrategy';
import { StrategyResult, SignalType, StrategyConsensus } from '../types/strategy';
import { HistoricalData } from '../types/market';
import { MovingAverageStrategy } from './MovingAverageStrategy';
import { RSIStrategy } from './RSIStrategy';
import { MACDStrategy } from './MACDStrategy';
import { BollingerBandsStrategy } from './BollingerBandsStrategy';

export class StrategyEngine {
  private strategies: BaseStrategy[];
  private static instance: StrategyEngine;

  private constructor() {
    this.strategies = [
      new MovingAverageStrategy(),
      new RSIStrategy(),
      new MACDStrategy(),
      new BollingerBandsStrategy(),
    ];
  }

  /**
   * Get singleton instance
   */
  static getInstance(): StrategyEngine {
    if (!StrategyEngine.instance) {
      StrategyEngine.instance = new StrategyEngine();
    }
    return StrategyEngine.instance;
  }

  /**
   * Analyze with all strategies and generate consensus
   */
  analyzeWithConsensus(symbol: string, data: HistoricalData): StrategyConsensus {
    // Run all strategies
    const results = this.strategies.map(strategy => strategy.analyze(symbol, data));

    // Calculate consensus
    const consensus = this.calculateConsensus(results);
    const confidenceScore = this.calculateConsensusConfidence(results, consensus);

    return {
      symbol,
      strategies: results,
      consensus,
      confidenceScore,
      timestamp: new Date(),
    };
  }

  /**
   * Analyze with a specific strategy
   */
  analyzeWithStrategy(
    strategyName: string,
    symbol: string,
    data: HistoricalData
  ): StrategyResult | null {
    const strategy = this.strategies.find(s => s.getName() === strategyName);
    if (!strategy) {
      return null;
    }
    return strategy.analyze(symbol, data);
  }

  /**
   * Get all available strategies
   */
  getAvailableStrategies(): string[] {
    return this.strategies.map(s => s.getName());
  }

  /**
   * Add a custom strategy
   */
  addStrategy(strategy: BaseStrategy): void {
    this.strategies.push(strategy);
  }

  /**
   * Calculate consensus signal from multiple strategies
   */
  private calculateConsensus(results: StrategyResult[]): SignalType {
    // Count weighted votes
    let buyScore = 0;
    let sellScore = 0;
    let holdScore = 0;

    results.forEach(result => {
      const weight = result.confidenceScore / 100;
      
      if (result.signal === 'BUY') {
        buyScore += weight;
      } else if (result.signal === 'SELL') {
        sellScore += weight;
      } else {
        holdScore += weight;
      }
    });

    // Determine consensus
    const maxScore = Math.max(buyScore, sellScore, holdScore);
    
    if (maxScore === buyScore) return 'BUY';
    if (maxScore === sellScore) return 'SELL';
    return 'HOLD';
  }

  /**
   * Calculate confidence score for consensus
   */
  private calculateConsensusConfidence(
    results: StrategyResult[],
    consensus: SignalType
  ): number {
    // Count how many strategies agree with consensus
    const agreeing = results.filter(r => r.signal === consensus);
    const agreementRate = agreeing.length / results.length;

    // Calculate average confidence of agreeing strategies
    const avgConfidence = agreeing.reduce((sum, r) => sum + r.confidenceScore, 0) / agreeing.length;

    // Combine agreement rate and average confidence
    return (agreementRate * 50) + (avgConfidence * 0.5);
  }
}
