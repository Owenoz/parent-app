import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setNetworkStatus, syncOfflineData } from '../store/slices/offlineSlice';

const NetworkContext = createContext();

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

export const NetworkProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);
  const [connectionType, setConnectionType] = useState('unknown');
  const [isSyncing, setIsSyncing] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    // Basic network connectivity check using fetch
    const checkNetwork = async () => {
      try {
        const response = await fetch('https://www.google.com', { method: 'HEAD', mode: 'no-cors' });
        setIsConnected(true);
        setIsInternetReachable(true);
        setConnectionType('unknown');
        dispatch(setNetworkStatus(true));
      } catch (error) {
        setIsConnected(false);
        setIsInternetReachable(false);
        setConnectionType('unknown');
        dispatch(setNetworkStatus(false));
      }
    };

    // Delay initial network check to not block rendering
    const timeout = setTimeout(() => {
      checkNetwork();
    }, 1000);

    // Check network periodically
    const interval = setInterval(checkNetwork, 30000); // Check every 30 seconds

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [dispatch]);

  const handleAutoSync = async () => {
    if (isConnected && isInternetReachable && !isSyncing) {
      try {
        setIsSyncing(true);
        await dispatch(syncOfflineData());
      } catch (error) {
        console.error('Auto-sync failed:', error);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const manualSync = async () => {
    if (!isConnected || !isInternetReachable) {
      return { success: false, message: 'No internet connection available' };
    }

    try {
      setIsSyncing(true);
      await dispatch(syncOfflineData());
      return { success: true, message: 'Sync completed successfully' };
    } catch (error) {
      return { success: false, message: 'Sync failed. Please try again.' };
    } finally {
      setIsSyncing(false);
    }
  };

  const checkConnection = async () => {
    try {
      const response = await fetch('https://www.google.com', { method: 'HEAD', mode: 'no-cors' });
      return {
        isConnected: true,
        isInternetReachable: true,
        connectionType: 'unknown',
        details: null,
      };
    } catch (error) {
      return {
        isConnected: false,
        isInternetReachable: false,
        connectionType: 'unknown',
        details: null,
      };
    }
  };

  const isWiFiConnected = connectionType === 'wifi';
  const isCellularConnected = connectionType === 'cellular';
  const isOffline = !isConnected || !isInternetReachable;

  const value = {
    isConnected,
    isInternetReachable,
    connectionType,
    isWiFiConnected,
    isCellularConnected,
    isOffline,
    isSyncing,
    manualSync,
    checkConnection,
    handleAutoSync,
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};