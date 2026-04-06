import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../components/AccessibilityProvider';
import { useNetwork } from '../contexts/NetworkContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRememberMe, setIsRememberMe] = useState(false);

  const { login, isLoading, error, isAuthenticated } = useAuth();
  const { settings, getAccessibilityStyles } = useAccessibility();
  const { isOffline, checkConnection } = useNetwork();

  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('MainDrawer');
    }
    
    // Check if user wants to be remembered
    checkRememberMe();
  }, [isAuthenticated]);

  const checkRememberMe = async () => {
    try {
      const rememberMe = await AsyncStorage.getItem('remember_me');
      const savedEmail = await AsyncStorage.getItem('saved_email');
      if (rememberMe === 'true' && savedEmail) {
        setEmail(savedEmail);
        setIsRememberMe(true);
      }
    } catch (error) {
      console.log('Error checking remember me:', error);
    }
  };

  const handleLogin = async () => {
    // Basic validation
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    const result = await login(email, password);
    
    if (result.success) {
      // Save email if remember me is checked
      if (isRememberMe) {
        await AsyncStorage.setItem('remember_me', 'true');
        await AsyncStorage.setItem('saved_email', email);
      } else {
        await AsyncStorage.removeItem('remember_me');
        await AsyncStorage.removeItem('saved_email');
      }
      
      // Check if biometric is enabled
      const biometricEnabled = await AsyncStorage.getItem('biometric_enabled');
      if (biometricEnabled === 'true') {
        navigation.replace('BiometricSetup');
      }
    } else {
      Alert.alert('Login Failed', result.message || 'Invalid credentials');
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleRememberMe = () => {
    setIsRememberMe(!isRememberMe);
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const accessibilityStyles = getAccessibilityStyles();

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: settings.isHighContrast ? '#000000' : '#ffffff' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoPlaceholder}>
            <Ionicons name="school-outline" size={48} color="#2563eb" />
          </View>
          <Text style={[styles.title, accessibilityStyles]}>Welcome Back</Text>
          <Text style={[styles.subtitle, accessibilityStyles]}>
            Sign in to continue your learning journey
          </Text>
        </View>

        {/* Connection Status */}
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Ionicons name="wifi-outline" size={16} color="#ef4444" />
            <Text style={styles.offlineText}>Offline Mode - Some features may be limited</Text>
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Form Section */}
        <View style={[styles.formContainer, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Ionicons 
              name="mail-outline" 
              size={20} 
              color={settings.isHighContrast ? '#ffffff' : '#666'} 
              style={styles.inputIcon}
            />
            <TextInput
              style={[
                styles.input,
                accessibilityStyles,
                {
                  borderColor: settings.isHighContrast ? '#ffffff' : '#e1e5e9',
                  backgroundColor: settings.isHighContrast ? '#333333' : '#f8f9fa',
                }
              ]}
              placeholder="Email Address"
              placeholderTextColor={settings.isHighContrast ? '#888' : '#666'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Email Address"
              accessibilityRole="text"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons 
              name="lock-closed-outline" 
              size={20} 
              color={settings.isHighContrast ? '#ffffff' : '#666'} 
              style={styles.inputIcon}
            />
            <TextInput
              style={[
                styles.input,
                accessibilityStyles,
                {
                  borderColor: settings.isHighContrast ? '#ffffff' : '#e1e5e9',
                  backgroundColor: settings.isHighContrast ? '#333333' : '#f8f9fa',
                }
              ]}
              placeholder="Password"
              placeholderTextColor={settings.isHighContrast ? '#888' : '#666'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Password"
              accessibilityRole="text"
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={togglePasswordVisibility}
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              accessibilityRole="button"
            >
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color={settings.isHighContrast ? '#ffffff' : '#666'} 
              />
            </TouchableOpacity>
          </View>

          {/* Remember Me */}
          <View style={styles.rememberContainer}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={toggleRememberMe}
              accessibilityLabel={isRememberMe ? "Remember me checked" : "Remember me unchecked"}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isRememberMe }}
            >
              <Ionicons
                name={isRememberMe ? "checkbox-outline" : "square-outline"}
                size={20}
                color={settings.isHighContrast ? '#ffffff' : '#2563eb'}
              />
              <Text style={[styles.rememberText, accessibilityStyles]}>Remember me</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotLink}>
              <Text style={[styles.forgotText, accessibilityStyles]}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              {
                backgroundColor: settings.isHighContrast ? '#ffffff' : '#2563eb',
                opacity: isLoading ? 0.7 : 1,
              }
            ]}
            onPress={handleLogin}
            disabled={isLoading}
            accessibilityLabel="Sign In"
            accessibilityRole="button"
          >
            {isLoading ? (
              <Ionicons name="sync-outline" size={20} color={settings.isHighContrast ? '#000000' : '#ffffff'} style={styles.spinner} />
            ) : (
              <Text style={[styles.loginButtonText, accessibilityStyles]}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Alternative Login Options */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={[styles.dividerText, accessibilityStyles]}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={[styles.socialButton, { borderColor: settings.isHighContrast ? '#ffffff' : '#e1e5e9' }]}>
              <Ionicons name="logo-google" size={24} color="#db4437" />
              <Text style={[styles.socialButtonText, accessibilityStyles]}>Google</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.socialButton, { borderColor: settings.isHighContrast ? '#ffffff' : '#e1e5e9' }]}>
              <Ionicons name="logo-apple" size={24} color="#000000" />
              <Text style={[styles.socialButtonText, accessibilityStyles]}>Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={[styles.registerText, accessibilityStyles]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={[styles.registerLink, accessibilityStyles]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, accessibilityStyles]}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    marginBottom: 20,
    borderRadius: 40,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    padding: 10,
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  offlineText: {
    fontSize: 12,
    color: '#dc2626',
    marginLeft: 8,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    padding: 12,
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  formContainer: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  inputIcon: {
    padding: 12,
    backgroundColor: '#f8f9fa',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    borderRadius: 12,
  },
  passwordToggle: {
    padding: 12,
  },
  rememberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  forgotLink: {
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#2563eb',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    fontSize: 12,
    color: '#6b7280',
    marginHorizontal: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    marginRight: 8,
  },
  socialButtonText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  registerLink: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default LoginScreen;