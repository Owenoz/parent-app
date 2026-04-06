import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BiometricSetupScreen = ({ navigation }) => {
  const [isEnabled, setIsEnabled] = useState(false);

  const handleEnable = () => {
    Alert.alert(
      'Enable Biometric',
      'Would you like to enable biometric authentication?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Enable', 
          onPress: () => {
            setIsEnabled(true);
            Alert.alert('Success', 'Biometric authentication enabled!');
          }
        },
      ]
    );
  };

  const handleDisable = () => {
    setIsEnabled(false);
    Alert.alert('Disabled', 'Biometric authentication disabled');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Biometric Setup</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Status Card */}
      <View style={styles.statusCard}>
        <View style={[
          styles.statusIcon,
          { backgroundColor: isEnabled ? '#10b981' : '#f59e0b' }
        ]}>
          <Ionicons 
            name={isEnabled ? "checkmark-circle" : "finger-print"} 
            size={64} 
            color="#ffffff" 
          />
        </View>
        
        <Text style={styles.statusTitle}>
          {isEnabled ? 'Biometric Enabled' : 'Setup Biometric'}
        </Text>
        <Text style={styles.statusDesc}>
          {isEnabled 
            ? 'You can now use fingerprint or face recognition to login'
            : 'Enable biometric authentication for quick and secure access'
          }
        </Text>
      </View>

      {/* Features */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Features</Text>
        
        <View style={styles.featureItem}>
          <Ionicons name="flash-outline" size={24} color="#2563eb" />
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Quick Login</Text>
            <Text style={styles.featureDesc}>Access your account instantly</Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#10b981" />
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Enhanced Security</Text>
            <Text style={styles.featureDesc}>Your biometric data stays on device</Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Ionicons name="lock-closed-outline" size={24} color="#f59e0b" />
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Privacy Protected</Text>
            <Text style={styles.featureDesc}>No passwords stored</Text>
          </View>
        </View>
      </View>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        {!isEnabled ? (
          <TouchableOpacity style={styles.enableButton} onPress={handleEnable}>
            <Ionicons name="finger-print" size={24} color="#ffffff" />
            <Text style={styles.enableButtonText}>Enable Biometric</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.disableButton} onPress={handleDisable}>
            <Ionicons name="close-circle-outline" size={24} color="#ef4444" />
            <Text style={styles.disableButtonText}>Disable Biometric</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#2563eb',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  statusCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  statusIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusDesc: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    marginLeft: 12,
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    color: '#64748b',
  },
  actionContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  enableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
  },
  enableButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  disableButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default BiometricSetupScreen;
