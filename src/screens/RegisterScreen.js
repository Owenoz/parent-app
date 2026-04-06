import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../components/AccessibilityProvider';
import { Ionicons } from '@expo/vector-icons';

const RegisterScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register, isLoading } = useAuth();
  const { settings, getAccessibilityStyles } = useAccessibility();

  const handleRegister = async () => {
    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    const result = await register({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: phone || undefined,
      password,
      languagePreference: 'en'
    });

    if (result.success) {
      Alert.alert(
        'Success',
        'Your account has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('MainDrawer')
          }
        ]
      );
    } else {
      Alert.alert('Registration Failed', result.message || 'Please try again');
    }
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
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoPlaceholder}>
            <Ionicons name="person-add-outline" size={48} color="#2563eb" />
          </View>
          <Text style={[styles.title, accessibilityStyles]}>Create Account</Text>
          <Text style={[styles.subtitle, accessibilityStyles]}>
            Join our learning platform today
          </Text>
        </View>

        <View style={[styles.formContainer, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
          {/* First Name */}
          <View style={styles.inputContainer}>
            <Ionicons 
              name="person-outline" 
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
              placeholder="First Name *"
              placeholderTextColor={settings.isHighContrast ? '#888' : '#666'}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              accessibilityLabel="First Name"
            />
          </View>

          {/* Last Name */}
          <View style={styles.inputContainer}>
            <Ionicons 
              name="person-outline" 
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
              placeholder="Last Name *"
              placeholderTextColor={settings.isHighContrast ? '#888' : '#666'}
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              accessibilityLabel="Last Name"
            />
          </View>

          {/* Email */}
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
              placeholder="Email Address *"
              placeholderTextColor={settings.isHighContrast ? '#888' : '#666'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Email Address"
            />
          </View>

          {/* Phone (Optional) */}
          <View style={styles.inputContainer}>
            <Ionicons 
              name="call-outline" 
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
              placeholder="Phone Number (Optional)"
              placeholderTextColor={settings.isHighContrast ? '#888' : '#666'}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              accessibilityLabel="Phone Number"
            />
          </View>

          {/* Password */}
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
              placeholder="Password *"
              placeholderTextColor={settings.isHighContrast ? '#888' : '#666'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              accessibilityLabel="Password"
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color={settings.isHighContrast ? '#ffffff' : '#666'} 
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
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
              placeholder="Confirm Password *"
              placeholderTextColor={settings.isHighContrast ? '#888' : '#666'}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              accessibilityLabel="Confirm Password"
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons 
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color={settings.isHighContrast ? '#ffffff' : '#666'} 
              />
            </TouchableOpacity>
          </View>

          {/* Password Requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={[styles.requirementsTitle, accessibilityStyles]}>Password must contain:</Text>
            <Text style={[styles.requirementText, accessibilityStyles]}>• At least 8 characters</Text>
            <Text style={[styles.requirementText, accessibilityStyles]}>• One uppercase letter</Text>
            <Text style={[styles.requirementText, accessibilityStyles]}>• One lowercase letter</Text>
            <Text style={[styles.requirementText, accessibilityStyles]}>• One number</Text>
            <Text style={[styles.requirementText, accessibilityStyles]}>• One special character</Text>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[
              styles.registerButton,
              {
                backgroundColor: settings.isHighContrast ? '#ffffff' : '#2563eb',
                opacity: isLoading ? 0.7 : 1,
              }
            ]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <Ionicons name="sync-outline" size={20} color={settings.isHighContrast ? '#000000' : '#ffffff'} />
            ) : (
              <Text style={[styles.registerButtonText, accessibilityStyles]}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, accessibilityStyles]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.loginLink, accessibilityStyles]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, accessibilityStyles]}>
            By creating an account, you agree to our Terms of Service and Privacy Policy
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
  requirementsContainer: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
  },
  requirementText: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 2,
  },
  registerButton: {
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
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#6b7280',
  },
  loginLink: {
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

export default RegisterScreen;