import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'light',
  language: 'en',
  notifications: true,
  accessibility: {
    fontSize: 'medium',
    highContrast: false,
    screenReader: false,
  },
  offlineMode: false,
  loading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateTheme: (state, action) => {
      state.theme = action.payload;
    },
    updateLanguage: (state, action) => {
      state.language = action.payload;
    },
    toggleNotifications: (state) => {
      state.notifications = !state.notifications;
    },
    updateAccessibility: (state, action) => {
      state.accessibility = { ...state.accessibility, ...action.payload };
    },
    toggleOfflineMode: (state) => {
      state.offlineMode = !state.offlineMode;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    resetSettings: (state) => {
      return initialState;
    },
    loadSettings: (state, action) => {
      return { ...initialState, ...action.payload };
    },
  },
});

export const {
  updateTheme,
  updateLanguage,
  toggleNotifications,
  updateAccessibility,
  toggleOfflineMode,
  setLoading,
  setError,
  resetSettings,
  loadSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;