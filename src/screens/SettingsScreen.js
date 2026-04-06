import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../components/AccessibilityProvider';
import { useNetwork } from '../contexts/NetworkContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const SettingsScreen = ({ navigation }) => {
  const { user, selectedChildId, logout } = useAuth();
  const { settings, updateSettings, getAccessibilityStyles } = useAccessibility();
  const { isOffline } = useNetwork();
  
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'sw', name: 'Swahili' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
  ];

  const themes = [
    { id: 'light', name: 'Light', icon: 'sunny-outline' },
    { id: 'dark', name: 'Dark', icon: 'moon-outline' },
    { id: 'high-contrast', name: 'High Contrast', icon: 'contrast-outline' },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout }
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear Data',
      'This will clear all downloaded content and cached data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: () => Alert.alert('Cleared', 'All cached data has been cleared.') }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Account Deleted', 'Your account has been deleted.') }
      ]
    );
  };

  const accessibilityStyles = getAccessibilityStyles();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: settings.isHighContrast ? '#000000' : '#f8fafc' }]}
    >
      {/* Header */}
      <LinearGradient
        colors={settings.isHighContrast ? ['#ffffff', '#ffffff'] : ['#2563eb', '#1e40af']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, accessibilityStyles]}>Settings</Text>
            <Text style={[styles.headerSubtitle, accessibilityStyles]}>
              Customize your learning experience
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Profile Section */}
      <View style={[styles.section, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
        <Text style={[styles.sectionTitle, accessibilityStyles]}>Profile</Text>
        
        <View style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, accessibilityStyles]}>{user?.name || 'Student Name'}</Text>
            <Text style={[styles.profileEmail, accessibilityStyles]}>{user?.email || 'student@example.com'}</Text>
            <Text style={[styles.profileRole, accessibilityStyles]}>Student</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
            accessibilityLabel="View Profile"
            accessibilityRole="button"
          >
            <Ionicons name="person-circle-outline" size={32} color="#2563eb" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Accessibility Section */}
      <View style={[styles.section, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
        <Text style={[styles.sectionTitle, accessibilityStyles]}>Accessibility</Text>
        
        {/* High Contrast Mode */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, accessibilityStyles]}>High Contrast Mode</Text>
            <Text style={[styles.settingDescription, accessibilityStyles]}>
              Improve visibility with high contrast colors
            </Text>
          </View>
          <Switch
            value={settings.isHighContrast}
            onValueChange={(value) => updateSettings({ ...settings, isHighContrast: value })}
            thumbColor={settings.isHighContrast ? '#ffffff' : '#f4f4f5'}
            trackColor={{ false: '#e5e7eb', true: '#2563eb' }}
          />
        </View>

        {/* Text Size */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, accessibilityStyles]}>Text Size</Text>
            <Text style={[styles.settingDescription, accessibilityStyles]}>
              Adjust text size for comfortable reading
            </Text>
          </View>
          <View style={styles.textSizeControls}>
            <TouchableOpacity
              style={[styles.sizeButton, { backgroundColor: settings.textSize === 'small' ? '#2563eb' : '#f8fafc' }]}
              onPress={() => updateSettings({ ...settings, textSize: 'small' })}
            >
              <Text style={[styles.sizeButtonText, { color: settings.textSize === 'small' ? '#ffffff' : '#64748b' }]}>A</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sizeButton, { backgroundColor: settings.textSize === 'medium' ? '#2563eb' : '#f8fafc' }]}
              onPress={() => updateSettings({ ...settings, textSize: 'medium' })}
            >
              <Text style={[styles.sizeButtonText, { color: settings.textSize === 'medium' ? '#ffffff' : '#64748b' }]}>A</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sizeButton, { backgroundColor: settings.textSize === 'large' ? '#2563eb' : '#f8fafc' }]}
              onPress={() => updateSettings({ ...settings, textSize: 'large' })}
            >
              <Text style={[styles.sizeButtonText, { color: settings.textSize === 'large' ? '#ffffff' : '#64748b' }]}>A</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Zoom on Hover */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, accessibilityStyles]}>Zoom on Hover</Text>
            <Text style={[styles.settingDescription, accessibilityStyles]}>
              Enable zoom functionality when hovering over text
            </Text>
          </View>
          <Switch
            value={settings.enableZoom}
            onValueChange={(value) => updateSettings({ ...settings, enableZoom: value })}
            thumbColor={settings.enableZoom ? '#ffffff' : '#f4f4f5'}
            trackColor={{ false: '#e5e7eb', true: '#2563eb' }}
          />
        </View>

        {/* Read Aloud */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, accessibilityStyles]}>Read Aloud</Text>
            <Text style={[styles.settingDescription, accessibilityStyles]}>
              Enable text-to-speech for reading assistance
            </Text>
          </View>
          <Switch
            value={settings.enableReadAloud}
            onValueChange={(value) => updateSettings({ ...settings, enableReadAloud: value })}
            thumbColor={settings.enableReadAloud ? '#ffffff' : '#f4f4f5'}
            trackColor={{ false: '#e5e7eb', true: '#2563eb' }}
          />
        </View>

        {/* Guided Navigation */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, accessibilityStyles]}>Guided Navigation</Text>
            <Text style={[styles.settingDescription, accessibilityStyles]}>
              Enable step-by-step navigation assistance
            </Text>
          </View>
          <Switch
            value={settings.enableGuidedNav}
            onValueChange={(value) => updateSettings({ ...settings, enableGuidedNav: value })}
            thumbColor={settings.enableGuidedNav ? '#ffffff' : '#f4f4f5'}
            trackColor={{ false: '#e5e7eb', true: '#2563eb' }}
          />
        </View>
      </View>

      {/* App Preferences Section */}
      <View style={[styles.section, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
        <Text style={[styles.sectionTitle, accessibilityStyles]}>App Preferences</Text>
        
        {/* Language */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => setShowLanguageModal(true)}
          accessibilityLabel="Change Language"
          accessibilityRole="button"
        >
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, accessibilityStyles]}>Language</Text>
            <Text style={[styles.settingDescription, accessibilityStyles]}>
              {languages.find(lang => lang.code === settings.language)?.name || 'English'}
            </Text>
          </View>
          <Ionicons name="language-outline" size={24} color="#64748b" />
        </TouchableOpacity>

        {/* Theme */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => setShowThemeModal(true)}
          accessibilityLabel="Change Theme"
          accessibilityRole="button"
        >
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, accessibilityStyles]}>Theme</Text>
            <Text style={[styles.settingDescription, accessibilityStyles]}>
              {themes.find(theme => theme.id === settings.theme)?.name || 'Light'}
            </Text>
          </View>
          <Ionicons name="color-palette-outline" size={24} color="#64748b" />
        </TouchableOpacity>

        {/* Notifications */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, accessibilityStyles]}>Push Notifications</Text>
            <Text style={[styles.settingDescription, accessibilityStyles]}>
              Receive updates and reminders
            </Text>
          </View>
          <Switch
            value={settings.enableNotifications}
            onValueChange={(value) => updateSettings({ ...settings, enableNotifications: value })}
            thumbColor={settings.enableNotifications ? '#ffffff' : '#f4f4f5'}
            trackColor={{ false: '#e5e7eb', true: '#2563eb' }}
          />
        </View>

        {/* Auto-Download */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, accessibilityStyles]}>Auto-Download Content</Text>
            <Text style={[styles.settingDescription, accessibilityStyles]}>
              Automatically download course materials
            </Text>
          </View>
          <Switch
            value={settings.autoDownload}
            onValueChange={(value) => updateSettings({ ...settings, autoDownload: value })}
            thumbColor={settings.autoDownload ? '#ffffff' : '#f4f4f5'}
            trackColor={{ false: '#e5e7eb', true: '#2563eb' }}
          />
        </View>
      </View>

      {/* Data Management Section */}
      <View style={[styles.section, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
        <Text style={[styles.sectionTitle, accessibilityStyles]}>Data Management</Text>
        
        {/* Clear Cache */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={handleClearData}
          accessibilityLabel="Clear Cache"
          accessibilityRole="button"
        >
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, accessibilityStyles]}>Clear Cache</Text>
            <Text style={[styles.settingDescription, accessibilityStyles]}>
              Clear downloaded content and cached data
            </Text>
          </View>
          <Ionicons name="trash-outline" size={24} color="#64748b" />
        </TouchableOpacity>

        {/* Storage Usage */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, accessibilityStyles]}>Storage Usage</Text>
            <Text style={[styles.settingDescription, accessibilityStyles]}>
              150 MB used of 1 GB available
            </Text>
          </View>
          <View style={styles.storageBar}>
            <View style={styles.storageFill} />
          </View>
        </View>
      </View>

      {/* Account Section */}
      <View style={[styles.section, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
        <Text style={[styles.sectionTitle, accessibilityStyles]}>Account</Text>
        
        {/* Logout */}
        <TouchableOpacity
          style={[styles.settingRow, styles.dangerRow]}
          onPress={handleLogout}
          accessibilityLabel="Logout"
          accessibilityRole="button"
        >
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, styles.dangerText, accessibilityStyles]}>Logout</Text>
            <Text style={[styles.settingDescription, accessibilityStyles]}>
              Sign out of your account
            </Text>
          </View>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity
          style={[styles.settingRow, styles.dangerRow]}
          onPress={handleDeleteAccount}
          accessibilityLabel="Delete Account"
          accessibilityRole="button"
        >
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, styles.dangerText, accessibilityStyles]}>Delete Account</Text>
            <Text style={[styles.settingDescription, accessibilityStyles]}>
              Permanently delete your account
            </Text>
          </View>
          <Ionicons name="trash-bin-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
            <Text style={[styles.modalTitle, accessibilityStyles]}>Select Language</Text>
            {languages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.modalOption,
                  { borderBottomColor: settings.isHighContrast ? '#ffffff' : '#e2e8f0' }
                ]}
                onPress={() => {
                  updateSettings({ ...settings, language: language.code });
                  setShowLanguageModal(false);
                }}
              >
                <Text style={[styles.modalOptionText, accessibilityStyles]}>{language.name}</Text>
                {settings.language === language.code && (
                  <Ionicons name="checkmark-circle" size={24} color="#2563eb" />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={[styles.modalCloseText, accessibilityStyles]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Theme Selection Modal */}
      <Modal
        visible={showThemeModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
            <Text style={[styles.modalTitle, accessibilityStyles]}>Select Theme</Text>
            {themes.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.modalOption,
                  { borderBottomColor: settings.isHighContrast ? '#ffffff' : '#e2e8f0' }
                ]}
                onPress={() => {
                  updateSettings({ ...settings, theme: theme.id });
                  setShowThemeModal(false);
                }}
              >
                <View style={styles.themeOption}>
                  <Ionicons name={theme.icon} size={24} color="#64748b" />
                  <Text style={[styles.modalOptionText, accessibilityStyles]}>{theme.name}</Text>
                </View>
                {settings.theme === theme.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#2563eb" />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowThemeModal(false)}
            >
              <Text style={[styles.modalCloseText, accessibilityStyles]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Offline Indicator */}
      {isOffline && (
        <View style={styles.offlineIndicator}>
          <Ionicons name="wifi-outline" size={16} color="#ef4444" />
          <Text style={styles.offlineText}>Offline Mode - Some features may be limited</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#e5e7eb',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  profileRole: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  profileButton: {
    padding: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  dangerRow: {
    borderBottomColor: '#fecaca',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  dangerText: {
    color: '#dc2626',
  },
  settingDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  textSizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sizeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  sizeButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  storageBar: {
    width: 60,
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  storageFill: {
    width: '15%',
    height: '100%',
    backgroundColor: '#2563eb',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
  },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    padding: 8,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
  },
  offlineText: {
    fontSize: 12,
    color: '#dc2626',
    marginLeft: 8,
  },
});

export default SettingsScreen;