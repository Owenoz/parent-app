import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import Screens
import AuthStack from './AuthStack';
import DashboardScreen from '../screens/DashboardScreen';
import CoursesScreen from '../screens/CoursesScreen';
import AIToolsScreen from '../screens/AIToolsScreen';
import AssessmentsScreen from '../screens/AssessmentsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CourseDetailScreen from '../screens/CourseDetailScreen';
import LessonScreen from '../screens/LessonScreen';
import AssignmentScreen from '../screens/AssignmentScreen';
import QuizScreen from '../screens/QuizScreen';
import CertificateScreen from '../screens/CertificateScreen';
import AITutorScreen from '../screens/AITutorScreen';
import TextToAudioScreen from '../screens/TextToAudioScreen';
import VideoGeneratorScreen from '../screens/VideoGeneratorScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Import Components
import CustomDrawer from '../components/CustomDrawer';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// Main Drawer Navigator for authenticated users
const MainDrawerNavigator = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? '#374151' : '#e5e7eb',
        },
        headerTintColor: isDark ? '#ffffff' : '#1f2937',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.toggleDrawer()}
            style={{ marginLeft: 16 }}
          >
            <Ionicons name="menu" size={28} color={isDark ? '#ffffff' : '#1f2937'} />
          </TouchableOpacity>
        ),
        drawerType: 'slide',
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        drawerStyle: {
          width: 280,
        },
      })}
    >
      <Drawer.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
        }}
      />
      <Drawer.Screen 
        name="Courses" 
        component={CoursesScreen}
        options={{
          title: 'My Courses',
        }}
      />
      <Drawer.Screen 
        name="AI Tools" 
        component={AIToolsScreen}
        options={{
          title: 'AI Study Tools',
        }}
      />
      <Drawer.Screen 
        name="Assessments" 
        component={AssessmentsScreen}
        options={{
          title: 'Assessments',
        }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'My Profile',
        }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
    </Drawer.Navigator>
  );
};

// Stack Navigator for detailed screens
const MainStackNavigator = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
        },
        headerTintColor: isDark ? '#ffffff' : '#1f2937',
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="AuthStack" 
        component={AuthStack}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="MainDrawer" 
        component={MainDrawerNavigator}
        options={{ headerShown: false }}
      />
      
      {/* Settings Screen */}
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings & Accessibility' }}
      />
      
      {/* Course Screens */}
      <Stack.Screen 
        name="CourseDetail" 
        component={CourseDetailScreen}
        options={{ title: 'Course Details' }}
      />
      <Stack.Screen 
        name="Lesson" 
        component={LessonScreen}
        options={{ title: 'Lesson Content' }}
      />
      
      {/* Assessment Screens */}
      <Stack.Screen 
        name="Assignment" 
        component={AssignmentScreen}
        options={{ title: 'Assignment' }}
      />
      <Stack.Screen 
        name="Quiz" 
        component={QuizScreen}
        options={{ title: 'Quiz' }}
      />
      <Stack.Screen 
        name="Certificate" 
        component={CertificateScreen}
        options={{ title: 'Certificate' }}
      />
      
      {/* AI Tools Screens */}
      <Stack.Screen 
        name="AITutor" 
        component={AITutorScreen}
        options={{ title: 'AI Tutor' }}
      />
      <Stack.Screen 
        name="TextToAudio" 
        component={TextToAudioScreen}
        options={{ title: 'Text to Audio' }}
      />
      <Stack.Screen 
        name="VideoGenerator" 
        component={VideoGeneratorScreen}
        options={{ title: 'AI Video Generator' }}
      />
    </Stack.Navigator>
  );
};

// Root Navigation Container
const AppNavigator = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: '#2563eb',
          background: isDark ? '#0b1220' : '#ffffff',
          card: isDark ? '#111827' : '#ffffff',
          text: isDark ? '#ffffff' : '#1f2937',
          border: isDark ? '#374151' : '#e5e7eb',
          notification: '#ef4444',
        },
      }}
    >
      <MainStackNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;