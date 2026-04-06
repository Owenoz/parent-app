import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useAccessibility } from './AccessibilityProvider';

const HeaderRight = () => {
  const navigation = useNavigation();
  const { accessibilityStyles } = useAccessibility();

  const handleNotificationsPress = () => {
    navigation.navigate('Notifications');
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconButton} onPress={handleNotificationsPress}>
        <Icon name="notifications" size={24} color="#6c757d" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconButton} onPress={handleSettingsPress}>
        <Icon name="settings" size={24} color="#6c757d" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  iconButton: {
    marginLeft: 15,
    padding: 5,
  },
});

export default HeaderRight;