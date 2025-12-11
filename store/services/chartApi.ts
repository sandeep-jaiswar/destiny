import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ChartData } from '../types';

/**
 * RTK Query API for chart data
 * Handles fetching and caching of stock chart data
 */
export const chartApi = createApi({
  reducerPath: 'chartApi',
  baseQuery: fetchBaseQuery({
    baseUrl: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  }),
  // Keep cache for 6 hours (21600 seconds) - suitable for daily data updates
  keepUnusedDataFor: 21600,
  tagTypes: ['Chart'],
  endpoints: (builder) => ({
    getChartData: builder.query<ChartData, {
      symbol: string;
      period1?: string;
      period2?: string;
    }>({
      query: ({ symbol, period1 = '2023-01-01', period2 = '2024-01-01' }) =>
        `/api/chart?symbol=${symbol}&period1=${period1}&period2=${period2}`,
      providesTags: (result, error, { symbol }) => [{ type: 'Chart', id: symbol }],
    }),
  }),
});

export const {
  useGetChartDataQuery,
  useLazyGetChartDataQuery,
} = chartApi;
