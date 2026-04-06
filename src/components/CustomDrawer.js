import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const CustomDrawer = (props) => {
  const { user, logout } = useAuth();
  const { navigation, state } = props;

  const menuItems = [
    { name: 'Dashboard', icon: 'home', route: 'Dashboard', gradient: ['#3b82f6', '#2563eb'] },
    { name: 'My Courses', icon: 'book', route: 'Courses', gradient: ['#8b5cf6', '#7c3aed'] },
    { name: 'AI Tools', icon: 'sparkles', route: 'AI Tools', gradient: ['#ec4899', '#db2777'] },
    { name: 'Assessments', icon: 'clipboard', route: 'Assessments', gradient: ['#f59e0b', '#d97706'] },
    { name: 'Profile', icon: 'person', route: 'Profile', gradient: ['#10b981', '#059669'] },
    { name: 'Settings', icon: 'settings', route: 'Settings', gradient: ['#6366f1', '#4f46e5'] },
  ];

  const handleLogout = async () => {
    await logout();
    navigation.closeDrawer();
  };

  const currentRoute = state.routes[state.index].name;

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#2563eb', '#1e40af', '#1e3a8a']}
        style={styles.header}
      >
        <View style={styles.profileSection}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color="#ffffff" />
            </View>
          )}
          <Text style={styles.userName}>{user?.name || 'Student'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
        </View>
      </LinearGradient>

      {/* Menu Items */}
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {menuItems.map((item, index) => {
          const isActive = currentRoute === item.route;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => navigation.navigate(item.route)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={isActive ? item.gradient : ['transparent', 'transparent']}
                style={styles.menuItemGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.menuItemContent}>
                  <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                    <Ionicons
                      name={item.icon}
                      size={22}
                      color={isActive ? '#ffffff' : '#64748b'}
                    />
                  </View>
                  <Text style={[styles.menuItemText, isActive && styles.menuItemTextActive]}>
                    {item.name}
                  </Text>
                  {isActive && (
                    <View style={styles.activeIndicator}>
                      <Ionicons name="chevron-forward" size={20} color="#ffffff" />
                    </View>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="log-out-outline" size={22} color="#ef4444" />
            </View>
            <Text style={styles.logoutText}>Logout</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Next Education LMS</Text>
        <Text style={styles.footerVersion}>Version 1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#ffffff',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItemActive: {
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItemGradient: {
    borderRadius: 12,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  menuItemTextActive: {
    color: '#ffffff',
  },
  activeIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
    marginHorizontal: 20,
  },
  logoutButton: {
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 10,
    color: '#94a3b8',
  },
});

export default CustomDrawer;
