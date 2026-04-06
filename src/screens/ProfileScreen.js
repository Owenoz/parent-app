import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../components/AccessibilityProvider';
import { useNetwork } from '../contexts/NetworkContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import profileService from '../services/profile.service';

const ProfileScreen = ({ navigation }) => {
  const { user, selectedChildId, logout } = useAuth();
  const { settings, updateSettings, getAccessibilityStyles } = useAccessibility();
  const { isOffline } = useNetwork();
  
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const result = await profileService.getProfile();
      
      if (result.success) {
        setProfileData(result.data);
        setEditForm(result.data);
      } else {
        Alert.alert('Error', result.error || 'Failed to load profile data');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      saveProfileChanges();
    } else {
      // Start editing
      setIsEditing(true);
    }
  };

  const saveProfileChanges = async () => {
    try {
      setIsLoading(true);
      const result = await profileService.updateProfile(editForm);
      
      if (result.success) {
        setProfileData(editForm);
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage < 30) return '#ef4444';
    if (percentage < 70) return '#f59e0b';
    return '#10b981';
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
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
          
          <Text style={[styles.headerTitle, accessibilityStyles]}>Profile</Text>
          
          <TouchableOpacity style={styles.settingsButton} onPress={() => setIsSettingsModalVisible(true)}>
            <Ionicons name="settings-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Profile Section */}
      <View style={[styles.profileSection, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
        <View style={styles.avatarContainer}>
          {profileData?.avatar ? (
            <Image
              source={{ uri: profileData.avatar }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="person-outline" size={48} color="#ffffff" />
            </View>
          )}
          <TouchableOpacity style={styles.editAvatarButton}>
            <Ionicons name="camera-outline" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileInfo}>
          {isEditing ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, accessibilityStyles]}>Full Name</Text>
                <TextInput
                  style={[
                    styles.input,
                    accessibilityStyles,
                    { borderColor: settings.isHighContrast ? '#ffffff' : '#e2e8f0' }
                  ]}
                  value={editForm.name}
                  onChangeText={(text) => setEditForm({...editForm, name: text})}
                  accessibilityLabel="Full name"
                  accessibilityRole="text"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, accessibilityStyles]}>Email</Text>
                <TextInput
                  style={[
                    styles.input,
                    accessibilityStyles,
                    { borderColor: settings.isHighContrast ? '#ffffff' : '#e2e8f0' }
                  ]}
                  value={editForm.email}
                  onChangeText={(text) => setEditForm({...editForm, email: text})}
                  keyboardType="email-address"
                  accessibilityLabel="Email address"
                  accessibilityRole="text"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, accessibilityStyles]}>Phone</Text>
                <TextInput
                  style={[
                    styles.input,
                    accessibilityStyles,
                    { borderColor: settings.isHighContrast ? '#ffffff' : '#e2e8f0' }
                  ]}
                  value={editForm.phone}
                  onChangeText={(text) => setEditForm({...editForm, phone: text})}
                  keyboardType="phone-pad"
                  accessibilityLabel="Phone number"
                  accessibilityRole="text"
                />
              </View>
            </>
          ) : (
            <>
              <Text style={[styles.profileName, accessibilityStyles]}>
                {profileData?.name || 'Student Name'}
              </Text>
              <Text style={[styles.profileEmail, accessibilityStyles]}>
                {profileData?.email || 'student@example.com'}
              </Text>
              <Text style={[styles.profilePhone, accessibilityStyles]}>
                {profileData?.phone || 'Phone not provided'}
              </Text>
            </>
          )}
        </View>

        <View style={styles.profileActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: isEditing ? '#10b981' : '#2563eb' }
            ]}
            onPress={handleEditToggle}
            disabled={isLoading}
            accessibilityLabel={isEditing ? "Save Profile" : "Edit Profile"}
            accessibilityRole="button"
          >
            <Text style={styles.actionButtonText}>
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setIsLogoutModalVisible(true)}
            accessibilityLabel="Logout"
            accessibilityRole="button"
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={styles.secondaryButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Statistics Section */}
      <View style={[styles.statsSection, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
        <Text style={[styles.sectionTitle, accessibilityStyles]}>Learning Statistics</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="school-outline" size={24} color="#3b82f6" />
            <Text style={[styles.statValue, accessibilityStyles]}>5</Text>
            <Text style={[styles.statLabel, accessibilityStyles]}>Courses</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="document-text-outline" size={24} color="#10b981" />
            <Text style={[styles.statValue, accessibilityStyles]}>12</Text>
            <Text style={[styles.statLabel, accessibilityStyles]}>Assignments</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="help-circle-outline" size={24} color="#f59e0b" />
            <Text style={[styles.statValue, accessibilityStyles]}>8</Text>
            <Text style={[styles.statLabel, accessibilityStyles]}>Quizzes</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="medal-outline" size={24} color="#8b5cf6" />
            <Text style={[styles.statValue, accessibilityStyles]}>3</Text>
            <Text style={[styles.statLabel, accessibilityStyles]}>Certificates</Text>
          </View>
        </View>
      </View>

      {/* Progress Section */}
      <View style={[styles.progressSection, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
        <Text style={[styles.sectionTitle, accessibilityStyles]}>Overall Progress</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, accessibilityStyles]}>Learning Progress</Text>
            <Text style={[styles.progressValue, accessibilityStyles]}>75%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: '75%', backgroundColor: getProgressColor(75) }
              ]}
            />
          </View>
          
          <View style={styles.progressStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, accessibilityStyles]}>15</Text>
              <Text style={[styles.statLabel, accessibilityStyles]}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, accessibilityStyles]}>5</Text>
              <Text style={[styles.statLabel, accessibilityStyles]}>Active</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, accessibilityStyles]}>20</Text>
              <Text style={[styles.statLabel, accessibilityStyles]}>Total</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Certificates Section */}
      <View style={[styles.certificatesSection, { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }]}>
        <Text style={[styles.sectionTitle, accessibilityStyles]}>Recent Certificates</Text>
        
        <View style={styles.certificatesList}>
          <TouchableOpacity style={styles.certificateItem}>
            <LinearGradient
              colors={['#f59e0b', '#d97706']}
              style={styles.certificateIcon}
            >
              <Ionicons name="medal-outline" size={24} color="#ffffff" />
            </LinearGradient>
            <View style={styles.certificateInfo}>
              <Text style={[styles.certificateTitle, accessibilityStyles]}>
                Mathematics Excellence
              </Text>
              <Text style={[styles.certificateDate, accessibilityStyles]}>
                Awarded: March 15, 2024
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.certificateItem}>
            <LinearGradient
              colors={['#3b82f6', '#2563eb']}
              style={styles.certificateIcon}
            >
              <Ionicons name="medal-outline" size={24} color="#ffffff" />
            </LinearGradient>
            <View style={styles.certificateInfo}>
              <Text style={[styles.certificateTitle, accessibilityStyles]}>
                Science Achievement
              </Text>
              <Text style={[styles.certificateDate, accessibilityStyles]}>
                Awarded: February 20, 2024
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Settings Modal */}
      <Modal
        visible={isSettingsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsSettingsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, accessibilityStyles]}>Settings</Text>
              <TouchableOpacity onPress={() => setIsSettingsModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, accessibilityStyles]}>High Contrast Mode</Text>
                <Text style={[styles.settingSubtitle, accessibilityStyles]}>
                  Improve visibility with high contrast colors
                </Text>
              </View>
              <Switch
                value={settings.isHighContrast}
                onValueChange={(value) => updateSettings({ ...settings, isHighContrast: value })}
                thumbColor={settings.isHighContrast ? '#2563eb' : '#f4f4f5'}
                trackColor={{ false: '#737373', true: '#bfdbfe' }}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, accessibilityStyles]}>Adjustable Text Size</Text>
                <Text style={[styles.settingSubtitle, accessibilityStyles]}>
                  Scale text size for better readability
                </Text>
              </View>
              <View style={styles.textSizeControls}>
                <TouchableOpacity
                  style={styles.sizeButton}
                  onPress={() => updateSettings({ ...settings, fontSize: Math.max(12, settings.fontSize - 2) })}
                >
                  <Text style={styles.sizeButtonText}>A-</Text>
                </TouchableOpacity>
                <Text style={[styles.currentSize, accessibilityStyles]}>
                  Current: {settings.fontSize}px
                </Text>
                <TouchableOpacity
                  style={styles.sizeButton}
                  onPress={() => updateSettings({ ...settings, fontSize: Math.min(24, settings.fontSize + 2) })}
                >
                  <Text style={styles.sizeButtonText}>A+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, accessibilityStyles]}>Hover Zoom</Text>
                <Text style={[styles.settingSubtitle, accessibilityStyles]}>
                  Enable zoom on hover for better visibility
                </Text>
              </View>
              <Switch
                value={settings.hoverZoom}
                onValueChange={(value) => updateSettings({ ...settings, hoverZoom: value })}
                thumbColor={settings.hoverZoom ? '#2563eb' : '#f4f4f5'}
                trackColor={{ false: '#737373', true: '#bfdbfe' }}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, accessibilityStyles]}>Guided Navigation</Text>
                <Text style={[styles.settingSubtitle, accessibilityStyles]}>
                  Enable step-by-step navigation assistance
                </Text>
              </View>
              <Switch
                value={settings.guidedNavigation}
                onValueChange={(value) => updateSettings({ ...settings, guidedNavigation: value })}
                thumbColor={settings.guidedNavigation ? '#2563eb' : '#f4f4f5'}
                trackColor={{ false: '#737373', true: '#bfdbfe' }}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, accessibilityStyles]}>Push Notifications</Text>
                <Text style={[styles.settingSubtitle, accessibilityStyles]}>
                  Receive notifications for assignments and updates
                </Text>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={(value) => updateSettings({ ...settings, notifications: value })}
                thumbColor={settings.notifications ? '#2563eb' : '#f4f4f5'}
                trackColor={{ false: '#737373', true: '#bfdbfe' }}
              />
            </View>

            <TouchableOpacity
              style={styles.closeSettingsButton}
              onPress={() => setIsSettingsModalVisible(false)}
              accessibilityLabel="Close Settings"
              accessibilityRole="button"
            >
              <Text style={styles.closeSettingsText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Logout Modal */}
      <Modal
        visible={isLogoutModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsLogoutModalVisible(false)}
      >
        <View style={styles.logoutModalOverlay}>
          <View style={[
            styles.logoutModalContent,
            { backgroundColor: settings.isHighContrast ? '#1a1a1a' : '#ffffff' }
          ]}>
            <Ionicons name="log-out-outline" size={48} color="#ef4444" />
            <Text style={[styles.logoutTitle, accessibilityStyles]}>Logout</Text>
            <Text style={[styles.logoutSubtitle, accessibilityStyles]}>
              Are you sure you want to logout?
            </Text>
            
            <View style={styles.logoutActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsLogoutModalVisible(false)}
                accessibilityLabel="Cancel"
                accessibilityRole="button"
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmLogoutButton}
                onPress={handleLogout}
                accessibilityLabel="Logout"
                accessibilityRole="button"
              >
                <Text style={styles.confirmLogoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  settingsButton: {
    padding: 8,
  },
  profileSection: {
    marginHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 60,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f8fafc',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
    marginLeft: 8,
  },
  statsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
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
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  progressSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0',
  },
  certificatesSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  certificatesList: {
    marginTop: 8,
  },
  certificateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  certificateIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  certificateInfo: {
    flex: 1,
  },
  certificateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  certificateDate: {
    fontSize: 12,
    color: '#64748b',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  textSizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 120,
  },
  sizeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  currentSize: {
    fontSize: 12,
    color: '#64748b',
  },
  closeSettingsButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  closeSettingsText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutModalContent: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  logoutTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  logoutSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  logoutActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  confirmLogoutButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmLogoutText: {
    color: '#ffffff',
    fontSize: 16,
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

export default ProfileScreen;