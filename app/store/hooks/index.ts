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
