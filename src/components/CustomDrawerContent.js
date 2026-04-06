import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from './AccessibilityProvider';

const CustomDrawerContent = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { accessibilityStyles } = useAccessibility();

  const handleLogout = () => {
    logout();
    navigation.navigate('Auth');
  };

  const menuItems = [
    { label: 'Dashboard', screen: 'Dashboard' },
    { label: 'Courses', screen: 'Courses' },
    { label: 'Assessments', screen: 'Assessments' },
    { label: 'AI Tools', screen: 'AITools' },
    { label: 'Profile', screen: 'Profile' },
    { label: 'Settings', screen: 'Settings' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../assets/logo.png')} 
          style={styles.logo}
          defaultSource={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' }}
        />
        <Text style={[styles.username, accessibilityStyles]}>{user?.name || 'User'}</Text>
        <Text style={[styles.email, accessibilityStyles]}>{user?.email || 'user@example.com'}</Text>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={[styles.menuText, accessibilityStyles]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  email: {
    fontSize: 14,
    color: '#6c757d',
  },
  menu: {
    flex: 1,
    paddingVertical: 20,
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  menuText: {
    fontSize: 16,
    color: '#212529',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomDrawerContent;