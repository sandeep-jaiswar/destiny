import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { chartApi } from './services/chartApi';
import configReducer from './slices/configSlice';

/**
 * Redux store configuration
 * Combines all reducers and middleware
 */
export const store = configureStore({
  reducer: {
    // RTK Query APIs
    [chartApi.reducerPath]: chartApi.reducer,
    // Slices
    config: configReducer,
    // Add other reducers here as the app grows
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Configure middleware options if needed
      serializableCheck: {
        // Ignore these action types for serialization check
        ignoredActions: ['chartApi/executeMutation/fulfilled'],
      },
    }).concat(
      // RTK Query middleware
      chartApi.middleware,
      // Add other middleware here
    ),
  devTools: process.env.NODE_ENV !== 'production',
});

// Enable refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

// Infer types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
