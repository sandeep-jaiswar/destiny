/**
 * Trading Strategy Type Definitions
 * Types for strategy analysis and signals
 */

export type SignalType = 'BUY' | 'SELL' | 'HOLD';
export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface StrategyResult {
  symbol: string;
  strategy: string;
  signal: SignalType;
  confidence: ConfidenceLevel;
  confidenceScore: number; // 0-100
  timestamp: Date;
  indicators?: Record<string, number>;
  analysis?: string;
  metadata?: Record<string, unknown>;
}

export interface StrategyConfig {
  name: string;
  parameters: Record<string, number>;
  enabled: boolean;
}

export interface MovingAverageConfig {
  shortPeriod: number;
  longPeriod: number;
}

export interface RSIConfig {
  period: number;
  oversold: number;
  overbought: number;
}

export interface MACDConfig {
  fastPeriod: number;
  slowPeriod: number;
  signalPeriod: number;
}

export interface BollingerBandsConfig {
  period: number;
  standardDeviations: number;
}

export interface TechnicalIndicators {
  sma?: number[];
  ema?: number[];
  rsi?: number[];
  macd?: {
    macd: number[];
    signal: number[];
    histogram: number[];
  };
  bollingerBands?: {
    upper: number[];
    middle: number[];
    lower: number[];
  };
}

export interface BacktestResult {
  strategy: string;
  symbol: string;
  period: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalReturn: number;
  averageReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

export interface StrategyConsensus {
  symbol: string;
  strategies: StrategyResult[];
  consensus: SignalType;
  confidenceScore: number;
  timestamp: Date;
}
