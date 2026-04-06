import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance, AccessibilityInfo, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    fontSize: 16,
    isHighContrast: false,
    isZoomEnabled: false,
    zoomLevel: 1,
    isReadAloudEnabled: false,
    isGuidedNavigation: false,
    theme: 'system', // 'light', 'dark', 'system'
  });

  // Load settings from storage on mount
  useEffect(() => {
    loadSettings();
    checkSystemAccessibility();
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (settings.theme === 'system') {
        updateTheme(colorScheme);
      }
    });
    return () => subscription.remove();
  }, [settings.theme]);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('accessibility_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading accessibility settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('accessibility_settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving accessibility settings:', error);
    }
  };

  const updateSettings = (newSettings) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
  };

  const checkSystemAccessibility = async () => {
    try {
      const isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      const isScreenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      
      // Enable guided navigation if screen reader is enabled
      if (isScreenReaderEnabled && !settings.isGuidedNavigation) {
        updateSettings({ isGuidedNavigation: true });
      }
    } catch (error) {
      console.error('Error checking system accessibility:', error);
    }
  };

  const increaseFontSize = () => {
    if (settings.fontSize < 24) {
      updateSettings({ fontSize: settings.fontSize + 2 });
    }
  };

  const decreaseFontSize = () => {
    if (settings.fontSize > 12) {
      updateSettings({ fontSize: settings.fontSize - 2 });
    }
  };

  const toggleHighContrast = () => {
    updateSettings({ isHighContrast: !settings.isHighContrast });
  };

  const toggleZoom = () => {
    updateSettings({ isZoomEnabled: !settings.isZoomEnabled });
  };

  const setZoomLevel = (level) => {
    updateSettings({ zoomLevel: Math.max(1, Math.min(3, level)) });
  };

  const toggleReadAloud = () => {
    updateSettings({ isReadAloudEnabled: !settings.isReadAloudEnabled });
  };

  const toggleGuidedNavigation = () => {
    updateSettings({ isGuidedNavigation: !settings.isGuidedNavigation });
  };

  const updateTheme = (theme) => {
    updateSettings({ theme });
  };

  const getAccessibilityStyles = () => {
    const styles = {
      fontSize: settings.fontSize,
      lineHeight: settings.fontSize * 1.4,
      color: settings.isHighContrast ? '#ffffff' : undefined,
      backgroundColor: settings.isHighContrast ? '#000000' : undefined,
    };
    return styles;
  };

  const value = {
    settings,
    updateSettings,
    increaseFontSize,
    decreaseFontSize,
    toggleHighContrast,
    toggleZoom,
    setZoomLevel,
    toggleReadAloud,
    toggleGuidedNavigation,
    updateTheme,
    getAccessibilityStyles,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};