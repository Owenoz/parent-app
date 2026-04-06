import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

// Import Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import BiometricSetupScreen from '../screens/BiometricSetupScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { isLoading } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        contentStyle: {
          backgroundColor: isDark ? '#0b1220' : '#ffffff',
        },
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
      />
      <Stack.Screen 
        name="BiometricSetup" 
        component={BiometricSetupScreen}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;