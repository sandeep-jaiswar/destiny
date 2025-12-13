import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

/**
 * Typed version of useDispatch hook
 * Use throughout the app instead of plain useDispatch
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed version of useSelector hook
 * Use throughout the app instead of plain useSelector
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Custom hook to access app configuration
 */
export const useAppConfig = () => {
  return useAppSelector((state) => state.config);
};

/**
 * Custom hook to get the selected ticker
 */
export const useSelectedTicker = () => {
  return useAppSelector((state) => state.config.selectedTicker);
};

/**
 * Custom hook to get current date
 */
export const useCurrentDate = () => {
  return useAppSelector((state) => state.config.currentDate);
};

/**
 * Custom hook to get date range
 */
export const useDateRange = () => {
  return useAppSelector((state) => state.config.dateRange);
};
