import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import courseSlice from './slices/courseSlice';
import assessmentSlice from './slices/assessmentSlice';
import aiSlice from './slices/aiSlice';
import settingsSlice from './slices/settingsSlice';
import offlineSlice from './slices/offlineSlice';

// Combine all reducers
const rootReducer = combineReducers({
  auth: authSlice,
  courses: courseSlice,
  assessments: assessmentSlice,
  ai: aiSlice,
  settings: settingsSlice,
  offline: offlineSlice,
});

// Configuration for persisting state
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'settings', 'courses', 'offline'], // Only persist these slices
  blacklist: ['ai', 'assessments'], // Don't persist these (too large or temporary)
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Create persistor
export const persistor = persistStore(store);

// Export store
export default store;
