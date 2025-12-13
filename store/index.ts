/**
 * Central export point for all store-related functionality
 * Import from here to access store, hooks, types, and APIs
 */

// Store and Provider
export { store } from './store';
export { ReduxProvider } from './ReduxProvider';

// Types
export type { RootState, AppDispatch } from './store';
export type {
  Quote,
  ChartMeta,
  ChartData,
  SearchResult,
  TradingPeriod
} from './types';
export type { AppConfig } from './slices/configSlice';

// Hooks
export {
  useAppDispatch,
  useAppSelector,
  useAppConfig,
  useSelectedTicker,
  useCurrentDate,
  useDateRange,
} from './hooks';

// RTK Query APIs
export { chartApi, useGetChartDataQuery, useLazyGetChartDataQuery } from './services/chartApi';

// Config Actions
export {
  setSelectedTicker,
  clearSelectedTicker,
  setTheme,
  setDateRange,
  updateCurrentDate,
} from './slices/configSlice';
