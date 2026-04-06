# Student Learning Management System

A comprehensive React Native mobile application for students to access their courses, assignments, AI study tools, and track their academic progress.

## Features

### 🎓 Core Learning Features
- **Course Management**: Browse, enroll, and track progress in courses
- **Downloadable Content**: Offline access to lessons and materials
- **Progress Tracking**: Visual progress indicators and stage/level tracking
- **Assignment Management**: Submit assignments with offline draft capability

### 🤖 AI Study Tools
- **AI Tutor**: Context-aware tutoring assistance
- **Language Translator**: Multilingual support for course materials
- **Text-to-Audio**: Accessibility feature for reading materials aloud
- **AI Video Generator**: Create educational videos from text
- **Text Summarizer**: Condense long texts into key points
- **Study Planner**: Personalized study schedule recommendations

### 📝 Assessments & Certification
- **AI Auto-Marking**: Intelligent assignment and quiz grading
- **Plagiarism Detection**: Ensure academic integrity
- **Quiz Engine**: Timed assessments with various question types
- **Certification Tiers**: Bronze, Silver, Gold achievement levels
- **Digital Certificates**: QR-verifiable completion certificates

### ♿ Accessibility Features
- **High Contrast Mode**: Enhanced visibility for visually impaired users
- **Adjustable Text Size**: Customizable font scaling
- **Read-Aloud Feature**: Text-to-speech for all content
- **Guided Navigation**: Step-by-step navigation assistance
- **Hover-Based Zoom**: Magnification for detailed content

### 📊 Impact Tracking
- **Skill Application**: Track real-world application of learned skills
- **Community Impact**: Submit community service and impact reports
- **Success Stories**: Create and share learning achievements
- **Growth Reflection**: Regular self-assessment surveys

## Technology Stack

### Frontend
- **React Native** with Expo
- **React Navigation** (Bottom Tabs, Stack, Drawer)
- **Redux Toolkit** with RTK Query for state management
- **NativeBase** for UI components
- **React Native Reanimated** for smooth animations
- **React Native Gesture Handler** for touch interactions

### State Management
- **Redux Toolkit** with persistent storage
- **AsyncStorage** for local data
- **SQLite** for offline database operations

### Accessibility
- **Accessibility Provider** with comprehensive settings
- **WCAG AA compliance** throughout the application
- **Dynamic font scaling** and theme switching

### Offline Capabilities
- **SQLite database** for local storage
- **Content caching** with expiration management
- **Sync engine** for offline-to-online data synchronization
- **Conflict resolution** for concurrent edits

## Installation

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- React Native development environment

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd StudentApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   npm run android  # For Android
   npm run ios      # For iOS (requires Xcode)
   ```

## Project Structure

```
StudentApp/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AccessibilityProvider.js
│   │   ├── CustomDrawerContent.js
│   │   ├── HeaderRight.js
│   │   └── ...
│   ├── navigation/          # Navigation configuration
│   │   ├── AppNavigator.js
│   │   └── AuthStack.js
│   ├── screens/            # Screen components
│   │   ├── DashboardScreen.js
│   │   ├── CoursesScreen.js
│   │   ├── AIToolsScreen.js
│   │   ├── AssessmentsScreen.js
│   │   ├── ProfileScreen.js
│   │   └── ...
│   ├── store/              # Redux store configuration
│   │   ├── index.js
│   │   └── slices/
│   │       ├── authSlice.js
│   │       ├── courseSlice.js
│   │       ├── assessmentSlice.js
│   │       ├── aiSlice.js
│   │       ├── settingsSlice.js
│   │       └── offlineSlice.js
│   ├── services/           # API services and utilities
│   │   ├── api.js
│   │   ├── auth.js
│   │   └── offline.js
│   ├── utils/              # Utility functions
│   │   ├── helpers.js
│   │   ├── validators.js
│   │   └── constants.js
│   └── contexts/           # React contexts
│       ├── AuthContext.js
│       ├── NetworkContext.js
│       └── AccessibilityContext.js
├── assets/                 # Images, icons, fonts
├── tests/                  # Test files
└── README.md
```

## Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
API_BASE_URL=https://api.your-lms.com
AI_SERVICE_URL=https://ai.your-lms.com
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### App Configuration
Update `app.json` with your app details:
```json
{
  "expo": {
    "name": "Student LMS",
    "slug": "student-lms",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#2563eb"
    }
  }
}
```

## Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run e2e
```

### Accessibility Testing
- Use VoiceOver (iOS) or TalkBack (Android) to test screen reader compatibility
- Test with reduced motion enabled
- Verify color contrast ratios meet WCAG AA standards
- Test with various font sizes and zoom levels

## Performance Optimization

### Image Optimization
- Use WebP format for images when possible
- Implement lazy loading for course thumbnails
- Compress images before uploading

### Bundle Size Optimization
- Use dynamic imports for heavy AI features
- Implement code splitting for different app sections
- Optimize dependencies and remove unused packages

### Offline Performance
- Cache frequently accessed data
- Implement efficient sync strategies
- Use background sync for non-critical updates

## Security

### Authentication Security
- Implement biometric authentication
- Use secure token storage
- Implement automatic token refresh
- Add session timeout functionality

### Data Security
- Encrypt sensitive offline data
- Use HTTPS for all API calls
- Implement proper error handling without exposing sensitive information

## Deployment

### Expo Build
```bash
expo build:android
expo build:ios
```

### App Store Submission
1. Generate production certificates
2. Create app store listings
3. Submit for review
4. Monitor for approval

### Continuous Integration
Set up CI/CD pipeline for:
- Automated testing
- Code quality checks
- Build automation
- Deployment to app stores

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests for your changes
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Changelog

### Version 1.0.0
- Initial release with core features
- AI study tools integration
- Offline capabilities
- Accessibility features
- Comprehensive testing suite