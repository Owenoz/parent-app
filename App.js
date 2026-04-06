import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { AuthProvider } from './src/contexts/AuthContext';
import { AccessibilityProvider } from './src/components/AccessibilityProvider';
import { NetworkProvider } from './src/contexts/NetworkContext';
import { Provider } from 'react-redux';
import store from './src/store';

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#2563eb" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log('App mounting...');
    setTimeout(() => {
      console.log('App ready');
      setIsReady(true);
    }, 100);
  }, []);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <NetworkProvider>
              <AuthProvider>
                <AccessibilityProvider>
                  <StatusBar style="auto" />
                  <AppNavigator />
                </AccessibilityProvider>
              </AuthProvider>
            </NetworkProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </Provider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    ...(Platform.OS === 'web' && {
      height: '100vh',
      width: '100vw',
    }),
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
});
