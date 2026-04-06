import { createSlice } from '@reduxjs/toolkit';
import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

// Only use SQLite on native platforms
let db = null;

// Initialize database on native platforms
if (Platform.OS !== 'web') {
  try {
    db = SQLite.openDatabaseSync('lms_offline.db');
    console.log('Database opened');
  } catch (error) {
    console.log('SQLite not available:', error.message);
  }
}

const initialState = {
  isOnline: true,
  pendingSync: [],
  cachedContent: {},
  lastSyncTime: null,
  syncStatus: 'idle', // 'idle', 'syncing', 'error'
  error: null,
};

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    setNetworkStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    
    addToPendingSync: (state, action) => {
      state.pendingSync.push({
        ...action.payload,
        id: Date.now(),
        timestamp: new Date().toISOString(),
      });
    },
    
    removeFromPendingSync: (state, action) => {
      state.pendingSync = state.pendingSync.filter(item => item.id !== action.payload);
    },
    
    clearPendingSync: (state) => {
      state.pendingSync = [];
    },
    
    addCachedContent: (state, action) => {
      const { type, id, content, timestamp } = action.payload;
      const cacheKey = `${type}_${id}`;
      state.cachedContent[cacheKey] = {
        content,
        timestamp: timestamp || new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      };
    },
    
    removeCachedContent: (state, action) => {
      const { type, id } = action.payload;
      const cacheKey = `${type}_${id}`;
      delete state.cachedContent[cacheKey];
    },
    
    clearCachedContent: (state) => {
      state.cachedContent = {};
    },
    
    setSyncStatus: (state, action) => {
      state.syncStatus = action.payload;
    },
    
    setLastSyncTime: (state, action) => {
      state.lastSyncTime = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Database operations
    initDatabase: () => {
      // Skip database initialization on web
      if (Platform.OS === 'web' || !db) {
        console.log('Database not available on web platform');
        return;
      }
      
      try {
        // Create tables for offline data
        db.execSync(`
          CREATE TABLE IF NOT EXISTS assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            description TEXT,
            courseId INTEGER,
            dueDate TEXT,
            status TEXT,
            isDraft INTEGER,
            content TEXT,
            createdAt TEXT,
            updatedAt TEXT
          )
        `);
        
        db.execSync(`
          CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY,
            title TEXT,
            description TEXT,
            instructor TEXT,
            progress INTEGER,
            isDownloaded INTEGER,
            content TEXT,
            updatedAt TEXT
          )
        `);
        
        db.execSync(`
          CREATE TABLE IF NOT EXISTS lessons (
            id INTEGER PRIMARY KEY,
            courseId INTEGER,
            title TEXT,
            content TEXT,
            videoUrl TEXT,
            isDownloaded INTEGER,
            downloadedAt TEXT
          )
        `);
        
        db.execSync(`
          CREATE TABLE IF NOT EXISTS quizzes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            courseId INTEGER,
            questions TEXT,
            timeLimit INTEGER,
            isDraft INTEGER,
            createdAt TEXT
          )
        `);
      } catch (error) {
        console.log('Error initializing database:', error);
      }
    },
    
    saveAssignmentOffline: (state, action) => {
      // Skip database operations on web
      if (Platform.OS === 'web' || !db) {
        console.log('Offline save not available on web platform');
        // Store in Redux state instead for web
        state.pendingSync.push({
          type: 'assignment',
          data: action.payload,
          timestamp: new Date().toISOString(),
        });
        return;
      }
      
      try {
        const { title, description, courseId, dueDate, content } = action.payload;
        const result = db.runSync(
          'INSERT INTO assignments (title, description, courseId, dueDate, status, isDraft, content, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [title, description, courseId, dueDate, 'draft', 1, content, new Date().toISOString(), new Date().toISOString()]
        );
        console.log('Assignment saved offline:', result.lastInsertRowId);
      } catch (error) {
        console.log('Error saving assignment:', error);
      }
    },
    
    getOfflineAssignments: (state, action) => {
      // This would be handled by a thunk or effect
    },
  },
});

// Async thunks for complex operations
export const syncOfflineData = () => async (dispatch, getState) => {
  try {
    dispatch(setSyncStatus('syncing'));
    
    const state = getState();
    const { pendingSync, isOnline } = state.offline;
    
    if (!isOnline) {
      dispatch(setError('No internet connection available'));
      return;
    }
    
    // Process pending sync items
    for (const item of pendingSync) {
      try {
        // Attempt to sync each item
        await dispatch(processSyncItem(item));
        dispatch(removeFromPendingSync(item.id));
      } catch (error) {
        console.error('Sync failed for item:', item, error);
      }
    }
    
    dispatch(setLastSyncTime(new Date().toISOString()));
    dispatch(setSyncStatus('idle'));
    
  } catch (error) {
    dispatch(setError(error.message));
    dispatch(setSyncStatus('error'));
  }
};

export const processSyncItem = (item) => async (dispatch) => {
  // This would contain the logic to sync different types of items
  // (assignments, quizzes, progress updates, etc.)
  switch (item.type) {
    case 'assignment':
      // Sync assignment logic
      break;
    case 'quiz':
      // Sync quiz logic
      break;
    case 'progress':
      // Sync progress logic
      break;
    default:
      throw new Error(`Unknown sync item type: ${item.type}`);
  }
};

export const downloadCourseContent = (courseId) => async (dispatch) => {
  try {
    // Download course content for offline access
    // This would fetch content and store it locally
    dispatch(setSyncStatus('syncing'));
    
    // Simulate download
    const courseContent = await fetchCourseContent(courseId);
    dispatch(addCachedContent({
      type: 'course',
      id: courseId,
      content: courseContent,
    }));
    
    dispatch(setSyncStatus('idle'));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

// Helper function to fetch course content
const fetchCourseContent = async (courseId) => {
  // This would make an API call to get course content
  return {
    lessons: [],
    materials: [],
    assignments: [],
  };
};

export const {
  setNetworkStatus,
  addToPendingSync,
  removeFromPendingSync,
  clearPendingSync,
  addCachedContent,
  removeCachedContent,
  clearCachedContent,
  setSyncStatus,
  setLastSyncTime,
  setError,
  clearError,
  initDatabase,
  saveAssignmentOffline,
  getOfflineAssignments,
} = offlineSlice.actions;

export default offlineSlice.reducer;