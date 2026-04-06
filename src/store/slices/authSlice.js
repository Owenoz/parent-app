import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../../services/api';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  biometricEnabled: false,
  children: [], // For parent accounts managing multiple children
  selectedChildId: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Authentication actions
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;
    },
    
    // Registration actions
    registerStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    registerSuccess: (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    },
    registerFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Logout action
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.selectedChildId = null;
      state.error = null;
    },

    // Token refresh
    refreshToken: (state, action) => {
      state.token = action.payload.token;
    },

    // Biometric authentication
    enableBiometric: (state) => {
      state.biometricEnabled = true;
    },
    disableBiometric: (state) => {
      state.biometricEnabled = false;
    },

    // Child management (for parent accounts)
    setChildren: (state, action) => {
      state.children = action.payload;
    },
    selectChild: (state, action) => {
      state.selectedChildId = action.payload;
    },
    addChild: (state, action) => {
      state.children.push(action.payload);
    },
    removeChild: (state, action) => {
      state.children = state.children.filter(child => child.id !== action.payload);
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Update user profile
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Login async thunk
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })
      
      // Register async thunk
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Forgot password async thunk
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Set biometric enabled async thunk
      .addCase(setBiometricEnabled.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setBiometricEnabled.fulfilled, (state, action) => {
        state.isLoading = false;
        state.biometricEnabled = action.payload.enabled;
        state.error = null;
      })
      .addCase(setBiometricEnabled.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Async Thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      if (response.data.success) {
        await AsyncStorage.setItem('user_token', response.data.token);
        await AsyncStorage.setItem('refresh_token', response.data.refreshToken);
        await AsyncStorage.setItem('user_data', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (emailData, { rejectWithValue }) => {
    try {
      const response = await authAPI.forgotPassword(emailData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const setBiometricEnabled = createAsyncThunk(
  'auth/setBiometricEnabled',
  async (enabled, { rejectWithValue }) => {
    try {
      const response = enabled 
        ? await authAPI.enableBiometric()
        : await authAPI.disableBiometric();
      return { enabled, success: response.data.success };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout,
  refreshToken,
  enableBiometric,
  disableBiometric,
  setChildren,
  selectChild,
  addChild,
  removeChild,
  clearError,
  updateUserProfile,
} = authSlice.actions;

export default authSlice.reducer;
