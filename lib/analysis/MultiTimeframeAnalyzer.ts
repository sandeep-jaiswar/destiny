/**
 * Multi-Timeframe Analyzer
 * Analyze strategies across multiple timeframes for stronger signals
 */

import { MarketDataService } from '../services/MarketDataService';
import { StrategyEngine } from '../strategies/StrategyEngine';
import { StrategyConsensus } from '../types/strategy';
import { TimePeriod, TimeInterval } from '../types/market';

export interface TimeframeAnalysis {
  timeframe: {
    period: TimePeriod;
    interval: TimeInterval;
  };
  consensus: StrategyConsensus;
}

export interface MultiTimeframeResult {
  symbol: string;
  timeframes: TimeframeAnalysis[];
  overallConsensus: 'BUY' | 'SELL' | 'HOLD';
  overallConfidence: number;
  timestamp: Date;
}

export interface TimeframeConfig {
  period: TimePeriod;
  interval: TimeInterval;
  weight: number; // Weight for consensus calculation (0-1)
}

export class MultiTimeframeAnalyzer {
  private static instance: MultiTimeframeAnalyzer;
  private marketService: MarketDataService;
  private strategyEngine: StrategyEngine;

  // Default timeframe configurations
  private static DEFAULT_TIMEFRAMES: TimeframeConfig[] = [
    { period: '1mo', interval: '1d', weight: 0.5 },   // Daily - highest weight
    { period: '3mo', interval: '1wk', weight: 0.3 },  // Weekly - medium weight
    { period: '1y', interval: '1mo', weight: 0.2 },   // Monthly - lower weight
  ];

  private constructor() {
    this.marketService = MarketDataService.getInstance();
    this.strategyEngine = StrategyEngine.getInstance();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): MultiTimeframeAnalyzer {
    if (!MultiTimeframeAnalyzer.instance) {
      MultiTimeframeAnalyzer.instance = new MultiTimeframeAnalyzer();
    }
    return MultiTimeframeAnalyzer.instance;
  }

  /**
   * Analyze symbol across multiple timeframes
   */
  async analyzeMultiTimeframe(
    symbol: string,
    timeframes?: TimeframeConfig[]
  ): Promise<MultiTimeframeResult | null> {
    const configs = timeframes || MultiTimeframeAnalyzer.DEFAULT_TIMEFRAMES;
    const timeframeAnalyses: TimeframeAnalysis[] = [];

    // Analyze each timeframe
    for (const config of configs) {
      const historicalData = await this.marketService.getHistoricalData(
        symbol,
        config.period,
        config.interval
      );

      if (!historicalData) {
        console.warn(`Failed to fetch data for ${symbol} at ${config.period}/${config.interval}`);
        continue;
      }

      const consensus = this.strategyEngine.analyzeWithConsensus(symbol, historicalData);
      
      timeframeAnalyses.push({
        timeframe: {
          period: config.period,
          interval: config.interval,
        },
        consensus,
      });
    }

    if (timeframeAnalyses.length === 0) {
      return null;
    }

    // Calculate overall consensus
    const overallConsensus = this.calculateOverallConsensus(timeframeAnalyses, configs);
    const overallConfidence = this.calculateOverallConfidence(timeframeAnalyses, configs);

    return {
      symbol,
      timeframes: timeframeAnalyses,
      overallConsensus,
      overallConfidence,
      timestamp: new Date(),
    };
  }

  /**
   * Calculate weighted overall consensus from multiple timeframes
   */
  private calculateOverallConsensus(
    analyses: TimeframeAnalysis[],
    configs: TimeframeConfig[]
  ): 'BUY' | 'SELL' | 'HOLD' {
    let buyScore = 0;
    let sellScore = 0;
    let holdScore = 0;

    analyses.forEach((analysis, index) => {
      const weight = configs[index]?.weight || 1 / analyses.length;
      const confidenceWeight = (analysis.consensus.confidenceScore / 100) * weight;

      if (analysis.consensus.consensus === 'BUY') {
        buyScore += confidenceWeight;
      } else if (analysis.consensus.consensus === 'SELL') {
        sellScore += confidenceWeight;
      } else {
        holdScore += confidenceWeight;
      }
    });

    const maxScore = Math.max(buyScore, sellScore, holdScore);
    
    if (maxScore === buyScore) return 'BUY';
    if (maxScore === sellScore) return 'SELL';
    return 'HOLD';
  }

  /**
   * Calculate overall confidence score
   */
  private calculateOverallConfidence(
    analyses: TimeframeAnalysis[],
    configs: TimeframeConfig[]
  ): number {
    const overallConsensus = this.calculateOverallConsensus(analyses, configs);
    
    // Count agreeing timeframes with weights
    let agreementScore = 0;
    let totalWeight = 0;
    let weightedConfidence = 0;

    analyses.forEach((analysis, index) => {
      const weight = configs[index]?.weight || 1 / analyses.length;
      totalWeight += weight;

      if (analysis.consensus.consensus === overallConsensus) {
        agreementScore += weight;
        weightedConfidence += analysis.consensus.confidenceScore * weight;
      }
    });

    const agreementRate = agreementScore / totalWeight;
    const avgConfidence = weightedConfidence / agreementScore;

    // Combine agreement rate and average confidence
    return Math.min(100, (agreementRate * 50) + (avgConfidence * 0.5));
  }

  /**
   * Get timeframe strength analysis
   */
  getTimeframeStrength(result: MultiTimeframeResult): {
    bullish: number;
    bearish: number;
    neutral: number;
  } {
    let bullish = 0;
    let bearish = 0;
    let neutral = 0;

    result.timeframes.forEach(tf => {
      if (tf.consensus.consensus === 'BUY') bullish++;
      else if (tf.consensus.consensus === 'SELL') bearish++;
      else neutral++;
    });

    const total = result.timeframes.length;
    
    return {
      bullish: (bullish / total) * 100,
      bearish: (bearish / total) * 100,
      neutral: (neutral / total) * 100,
    };
  }
}
