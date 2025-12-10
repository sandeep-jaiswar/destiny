import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface Quote {
  date: string;
  high: number;
  volume: number;
  open: number;
  low: number;
  close: number;
  adjclose: number;
}

export interface ChartData {
  meta: {
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
    currentTradingPeriod?: any;
    dataGranularity?: string;
    range?: string;
    validRanges?: string[];
  };
  quotes: Quote[];
  events?: {
    dividends?: Array<{
      amount: number;
      date: string;
    }>;
  };
}

export const chartApi = createApi({
  reducerPath: 'chartApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  }),
  // Keep cache for 6 hours (21600 seconds)
  keepUnusedDataFor: 21600,
  tagTypes: ['Chart'],
  endpoints: (builder) => ({
    getChartData: builder.query<ChartData, { symbol: string; period1?: string; period2?: string }>({
      query: ({ symbol, period1 = '2023-01-01', period2 = '2024-01-01' }) => 
        `/api/chart?symbol=${symbol}&period1=${period1}&period2=${period2}`,
      providesTags: (result, error, { symbol }) => [{ type: 'Chart', id: symbol }],
    }),
  }),
});

export const { useGetChartDataQuery } = chartApi;
