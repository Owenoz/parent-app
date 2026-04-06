import React, { createContext, useContext, useState } from 'react';

// Mock Auth Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const MockAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    // Simulate API call
    setTimeout(() => {
      if (email && password) {
        setIsAuthenticated(true);
        setUser({ email, name: 'Test User' });
        setIsLoading(false);
        return { success: true, user: { email, name: 'Test User' } };
      } else {
        setError('Invalid credentials');
        setIsLoading(false);
        return { success: false, message: 'Invalid credentials' };
      }
    }, 1000);

    return { success: true };
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    error,
    login,
    logout: () => setIsAuthenticated(false),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Mock Accessibility Context
const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    return {
      settings: { isHighContrast: false },
      getAccessibilityStyles: () => ({}),
    };
  }
  return context;
};

export const MockAccessibilityProvider = ({ children }) => {
  const [settings] = useState({
    isHighContrast: false,
    fontSize: 16,
  });

  const getAccessibilityStyles = () => ({
    fontSize: settings.fontSize,
  });

  const value = {
    settings,
    getAccessibilityStyles,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// Mock Network Context
const NetworkContext = createContext();

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    return {
      isOffline: false,
      checkConnection: async () => ({ isConnected: true }),
    };
  }
  return context;
};

export const MockNetworkProvider = ({ children }) => {
  const [isOffline] = useState(false);

  const checkConnection = async () => ({
    isConnected: true,
    isInternetReachable: true,
  });

  const value = {
    isOffline,
    isConnected: true,
    checkConnection,
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};
