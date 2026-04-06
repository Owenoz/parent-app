import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { 
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
  updateUserProfile
} from '../store/slices/authSlice';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const authState = useSelector(state => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('user_token');
      if (token) {
        // Verify token and get user info
        try {
          const response = await api.get('/auth/me');
          if (response.data.success) {
            const user = response.data.data.user;
            
            // Only allow students to stay logged in
            if (user.role !== 'student') {
              await AsyncStorage.removeItem('user_token');
              await AsyncStorage.removeItem('refresh_token');
              await AsyncStorage.removeItem('user_data');
              dispatch(logout());
              return;
            }
            
            dispatch(loginSuccess({
              user: user,
              token: token
            }));
          }
        } catch (error) {
          // If token verification fails, try to refresh
          console.log('Token verification failed, attempting refresh:', error);
          try {
            await refreshTokenIfNeeded();
          } catch (refreshError) {
            // If refresh also fails, clear tokens
            await AsyncStorage.removeItem('user_token');
            await AsyncStorage.removeItem('refresh_token');
            dispatch(logout());
          }
        }
      }
    } catch (error) {
      console.log('Auth check failed:', error);
      // Don't dispatch logout if there's no token
    }
  };

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      dispatch(loginStart());
      
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;
        
        // Only allow students to login to the mobile app
        if (user.role !== 'student') {
          dispatch(loginFailure('Only students can access the mobile app'));
          Alert.alert(
            'Access Denied',
            'Only students can access the mobile app. Please use the web portal for admin, instructor, or parent access.',
            [{ text: 'OK' }]
          );
          return { success: false, message: 'Only students can access the mobile app' };
        }
        
        // Store tokens securely
        await AsyncStorage.setItem('user_token', accessToken);
        if (refreshToken) {
          await AsyncStorage.setItem('refresh_token', refreshToken);
        }
        
        // Store user data
        await AsyncStorage.setItem('user_data', JSON.stringify(user));
        
        dispatch(loginSuccess({ user, token: accessToken }));
        return { success: true, user };
      } else {
        const errorMessage = response.data.error?.message || 'Login failed';
        dispatch(loginFailure(errorMessage));
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || 'Login failed. Please check your credentials and try again.';
      dispatch(loginFailure(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      dispatch(registerStart());
      
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;
        
        // Store tokens securely
        await AsyncStorage.setItem('user_token', accessToken);
        if (refreshToken) {
          await AsyncStorage.setItem('refresh_token', refreshToken);
        }
        
        // Store user data
        await AsyncStorage.setItem('user_data', JSON.stringify(user));
        
        dispatch(registerSuccess({ user, token: accessToken }));
        return { success: true, user };
      } else {
        const errorMessage = response.data.error?.message || 'Registration failed';
        dispatch(registerFailure(errorMessage));
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response?.data?.error) {
        const errorData = error.response.data.error;
        if (errorData.details && Array.isArray(errorData.details)) {
          errorMessage = errorData.details.map(d => d.message).join('\n');
        } else {
          errorMessage = errorData.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      dispatch(registerFailure(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = async () => {
    try {
      // Call logout API to invalidate token
      await api.post('/auth/logout');
    } catch (error) {
      console.log('Logout API call failed:', error);
    } finally {
      // Clear local storage and state
      await AsyncStorage.removeItem('user_token');
      await AsyncStorage.removeItem('refresh_token');
      dispatch(logout());
    }
  };

  const refreshTokenIfNeeded = async () => {
    try {
      const storedRefreshToken = await AsyncStorage.getItem('refresh_token');
      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/auth/refresh', { refreshToken: storedRefreshToken });
      if (response.data.success) {
        const { accessToken } = response.data.data;
        await AsyncStorage.setItem('user_token', accessToken);
        dispatch(refreshToken({ token: accessToken }));
        return accessToken;
      }
    } catch (error) {
      console.log('Token refresh failed:', error);
      logoutUser();
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      if (response.data.success) {
        dispatch(updateUserProfile(response.data.data.user));
        return { success: true, user: response.data.data.user };
      }
      const errorMessage = response.data.error?.message || 'Profile update failed';
      return { success: false, message: errorMessage };
    } catch (error) {
      return { success: false, message: error.response?.data?.error?.message || 'Profile update failed' };
    }
  };

  const enableBiometric = async () => {
    dispatch(enableBiometric());
  };

  const disableBiometric = async () => {
    dispatch(disableBiometric());
  };

  const value = {
    ...authState,
    isLoading,
    login,
    register,
    logout: logoutUser,
    refreshToken: refreshTokenIfNeeded,
    updateProfile,
    enableBiometric,
    disableBiometric,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};