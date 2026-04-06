import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { setBiometricEnabled } from '../store/slices/authSlice';
import { useAccessibility } from '../components/AccessibilityProvider';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as LocalAuthentication from 'expo-local-authentication';

const BiometricSetupScreen = () => {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isBiometricEnrolled, setIsBiometricEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { accessibilityStyles } = useAccessibility();
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      setIsBiometricSupported(hasHardware);
      setIsBiometricEnrolled(isEnrolled);
    } catch (error) {
      console.error('Error checking biometric support:', error);
    }
  };

  const handleEnableBiometric = async () => {
    if (!isBiometricSupported) {
      Alert.alert(
        'Biometric Authentication Not Available',
        'Your device does not support biometric authentication.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!isBiometricEnrolled) {
      Alert.alert(
        'No Biometric Data Found',
        'Please set up your biometric data in your device settings first.',
        [
          { text: 'Cancel' },
          { 
            text: 'Open Settings', 
            onPress: () => {
              if (Platform.OS === 'ios') {
                // iOS settings URL
                // Note: This would need to be implemented with a proper settings link
              } else {
                // Android settings
                // Note: This would need to be implemented with a proper settings intent
              }
            }
          }
        ]
      );
      return;
    }

    setLoading(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Enable Biometric Login',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        dispatch(setBiometricEnabled(true));
        Alert.alert(
          'Success',
          'Biometric authentication has been enabled for your account.',
          [
            { 
              text: 'OK', 
              onPress: () => navigation.navigate('Dashboard') 
            }
          ]
        );
      } else {
        Alert.alert('Authentication Failed', 'Please try again.');
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Alert.alert('Error', 'Failed to enable biometric authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    dispatch(setBiometricEnabled(false));
    navigation.navigate('Dashboard');
  };

  const getBiometricType = () => {
    if (Platform.OS === 'ios') {
      return 'Face ID or Touch ID';
    } else {
      return 'Fingerprint';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Icon name="fingerprint" size={80} color="#007bff" />
        <Text style={[styles.title, accessibilityStyles]}>Enable Biometric Login</Text>
        <Text style={[styles.subtitle, accessibilityStyles]}>
          Secure your account with {getBiometricType()}
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.infoCard}>
          <Icon name="info" size={24} color="#007bff" style={styles.infoIcon} />
          <Text style={[styles.infoText, accessibilityStyles]}>
            Biometric authentication provides a fast and secure way to access your account.
            Your biometric data is stored securely on your device and is never shared with our servers.
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <Icon 
              name={isBiometricSupported ? "check-circle" : "cancel"} 
              size={20} 
              color={isBiometricSupported ? "#28a745" : "#dc3545"} 
            />
            <Text style={[styles.statusText, accessibilityStyles]}>
              Device supports {getBiometricType()}
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <Icon 
              name={isBiometricEnrolled ? "check-circle" : "cancel"} 
              size={20} 
              color={isBiometricEnrolled ? "#28a745" : "#dc3545"} 
            />
            <Text style={[styles.statusText, accessibilityStyles]}>
              {getBiometricType()} data configured
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.enableButton, loading && styles.disabledButton]}
          onPress={handleEnableBiometric}
          disabled={loading || !isBiometricSupported || !isBiometricEnrolled}
          accessibilityLabel="Enable Biometric Authentication"
          accessibilityHint="Enable biometric login for your account"
        >
          <Text style={styles.enableButtonText}>
            {loading ? 'Enabling...' : `Enable ${getBiometricType()}`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          accessibilityLabel="Skip Biometric Setup"
          accessibilityHint="Skip biometric setup and continue to dashboard"
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#212529',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 10,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
  },
  infoIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 20,
  },
  statusContainer: {
    marginBottom: 30,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    color: '#212529',
    marginLeft: 10,
  },
  enableButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#6c757d',
  },
  enableButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007bff',
    borderRadius: 8,
  },
  skipButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BiometricSetupScreen;