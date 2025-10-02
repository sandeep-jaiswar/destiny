/**
 * Technical Indicators Utility
 * Mathematical functions for technical analysis
 */

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(data: number[], period: number): number[] {
  if (data.length < period) {
    return [];
  }

  const result: number[] = [];
  
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j];
    }
    result.push(sum / period);
  }
  
  return result;
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(data: number[], period: number): number[] {
  if (data.length < period) {
    return [];
  }

  const result: number[] = [];
  const multiplier = 2 / (period + 1);
  
  // Calculate initial SMA as the first EMA value
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
  }
  const initialEMA = sum / period;
  result.push(initialEMA);
  
  // Calculate subsequent EMA values
  for (let i = period; i < data.length; i++) {
    const ema = (data[i] - result[result.length - 1]) * multiplier + result[result.length - 1];
    result.push(ema);
  }
  
  return result;
}

/**
 * Calculate Relative Strength Index (RSI)
 */
export function calculateRSI(data: number[], period: number = 14): number[] {
  if (data.length < period + 1) {
    return [];
  }

  const result: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  // Calculate initial average gain and loss
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  // Calculate first RSI
  const rs = avgGain / avgLoss;
  result.push(100 - (100 / (1 + rs)));
  
  // Calculate subsequent RSI values
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    const rs = avgGain / avgLoss;
    result.push(100 - (100 / (1 + rs)));
  }
  
  return result;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(
  data: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number[]; signal: number[]; histogram: number[] } {
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);
  
  // Align arrays (slowEMA is shorter)
  const offset = fastEMA.length - slowEMA.length;
  const macd = slowEMA.map((slow, i) => fastEMA[i + offset] - slow);
  
  // Calculate signal line (EMA of MACD)
  const signal = calculateEMA(macd, signalPeriod);
  
  // Calculate histogram (MACD - Signal)
  const signalOffset = macd.length - signal.length;
  const histogram = signal.map((sig, i) => macd[i + signalOffset] - sig);
  
  return { macd, signal, histogram };
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(
  data: number[],
  period: number = 20,
  standardDeviations: number = 2
): { upper: number[]; middle: number[]; lower: number[] } {
  const middle = calculateSMA(data, period);
  const upper: number[] = [];
  const lower: number[] = [];
  
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const mean = middle[i - period + 1];
    
    // Calculate standard deviation
    const squaredDiffs = slice.map(value => Math.pow(value - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
    const stdDev = Math.sqrt(variance);
    
    upper.push(mean + standardDeviations * stdDev);
    lower.push(mean - standardDeviations * stdDev);
  }
  
  return { upper, middle, lower };
}

/**
 * Calculate Standard Deviation
 */
export function calculateStandardDeviation(data: number[]): number {
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const squaredDiffs = data.map(value => Math.pow(value - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / data.length;
  return Math.sqrt(variance);
}

/**
 * Calculate Percentage Change
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Detect Crossover (when line1 crosses above line2)
 */
export function detectCrossover(line1: number[], line2: number[]): boolean[] {
  const crossovers: boolean[] = [];
  
  for (let i = 1; i < Math.min(line1.length, line2.length); i++) {
    const crossedOver = line1[i] > line2[i] && line1[i - 1] <= line2[i - 1];
    crossovers.push(crossedOver);
  }
  
  return crossovers;
}

/**
 * Detect Crossunder (when line1 crosses below line2)
 */
export function detectCrossunder(line1: number[], line2: number[]): boolean[] {
  const crossunders: boolean[] = [];
  
  for (let i = 1; i < Math.min(line1.length, line2.length); i++) {
    const crossedUnder = line1[i] < line2[i] && line1[i - 1] >= line2[i - 1];
    crossunders.push(crossedUnder);
  }
  
  return crossunders;
}
