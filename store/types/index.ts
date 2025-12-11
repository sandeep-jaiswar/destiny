// Common types used across the application

export interface Quote {
  date: string;
  high: number;
  volume: number;
  open: number;
  low: number;
  close: number;
  adjclose: number;
}

export interface ChartMeta {
  symbol: string;
  longName?: string;
  regularMarketPrice?: number;
  currency?: string;
  exchangeName?: string;
  fullExchangeName?: string;
  instrumentType?: string;
  firstTradeDate?: string;
  regularMarketTime?: string;
  hasPrePostMarketData?: boolean;
  gmtoffset?: number;
  timezone?: string;
  exchangeTimezoneName?: string;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketVolume?: number;
  chartPreviousClose?: number;
  priceHint?: number;
  currentTradingPeriod?: {
    pre?: TradingPeriod;
    regular?: TradingPeriod;
    post?: TradingPeriod;
  };
  dataGranularity?: string;
  range?: string;
  validRanges?: string[];
}

export interface TradingPeriod {
  timezone: string;
  start: string;
  end: string;
  gmtoffset: number;
}

export interface ChartData {
  meta: ChartMeta;
  quotes: Quote[];
  events?: {
    dividends?: Array<{
      amount: number;
      date: string;
    }>;
    splits?: Array<{
      date: string;
      numerator: number;
      denominator: number;
      splitRatio: string;
    }>;
  };
}

export interface SearchResult {
  symbol: string;
  shortname?: string;
  longname?: string;
  exchDisp?: string;
  typeDisp?: string;
  quoteType?: string;
}
