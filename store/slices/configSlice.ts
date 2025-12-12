import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AppConfig {
  selectedTicker: string | null;
  currentDate: string;
  theme: 'light' | 'dark';
  dateRange: {
    period1: string;
    period2: string;
  };
}

const initialState: AppConfig = {
  selectedTicker: 'marksans.ns',
  currentDate: new Date().toISOString().split('T')[0],
  theme: 'dark',
  dateRange: {
    period1: '2023-01-01',
    period2: '2024-01-01',
  },
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setSelectedTicker: (state, action: PayloadAction<string>) => {
      state.selectedTicker = action.payload;
    },
    clearSelectedTicker: (state) => {
      state.selectedTicker = null;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setDateRange: (state, action: PayloadAction<{ period1: string; period2: string }>) => {
      state.dateRange = action.payload;
    },
    updateCurrentDate: (state) => {
      state.currentDate = new Date().toISOString().split('T')[0];
    },
  },
});

export const {
  setSelectedTicker,
  clearSelectedTicker,
  setTheme,
  setDateRange,
  updateCurrentDate,
} = configSlice.actions;

export default configSlice.reducer;
