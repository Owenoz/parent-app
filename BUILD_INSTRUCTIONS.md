# EAS Build Instructions - Ready to Build!

## ✅ Configuration Complete

I've updated your app configuration to be compatible with EAS Build:

### Changes Made:
1. ✅ Removed incompatible packages from package.json
2. ✅ Added Expo alternatives (expo-camera, expo-notifications, expo-speech)
3. ✅ Updated app.json with proper build configuration
4. ✅ Updated eas.json with build profiles for all platforms
5. ✅ Added necessary permissions and plugins

---

## 🚀 Build Commands

### Step 1: Install Dependencies
```bash
cd StudentApp
rm -rf node_modules package-lock.json
npm install
```

### Step 2: Build for All Platforms
```bash
eas build --platform all --profile preview
```

Or build individually:

### Android Only
```bash
eas build --platform android --profile preview
```

### iOS Only (requires Apple Developer account)
```bash
eas build --platform ios --profile preview
```

---

## 📱 Build Profiles

### Preview (Testing)
- Android: APK file
- iOS: Simulator build
- Distribution: Internal testing

```bash
eas build --platform all --profile preview
```

### Production (App Stores)
- Android: AAB file for Play Store
- iOS: IPA file for App Store
- Auto-increment version

```bash
eas build --platform all --profile production
```

### Development (Dev Client)
- For development with custom native code
- Includes dev tools

```bash
eas build --platform all --profile development
```

---

## 🔑 What You Need

### For Android Build:
- ✅ Expo account (you have this)
- ✅ EAS CLI installed (you have this)
- ✅ Project configured (done!)

### For iOS Build:
- ⚠️ Apple Developer account ($99/year)
- ⚠️ Apple Developer Program enrollment

---

## 📦 Package Changes

### Removed (Incompatible):
- ❌ react-native-camera
- ❌ react-native-background-job
- ❌ react-native-push-notification
- ❌ react-native-speech-to-text
- ❌ react-native-text-to-speech
- ❌ react-native-sqlite-storage
- ❌ @expo/webpack-config

### Added (Expo Compatible):
- ✅ expo-camera
- ✅ expo-notifications
- ✅ expo-speech
- ✅ expo-task-manager

---

## 🎯 Build Process

1. **Clean Install**
   ```bash
   cd StudentApp
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Login to EAS**
   ```bash
   eas login
   ```

3. **Start Build**
   ```bash
   eas build --platform all --profile preview
   ```

4. **Wait for Build** (10-30 minutes)
   - Android: ~15 minutes
   - iOS: ~20 minutes

5. **Download APK/IPA**
   - Check your email for build completion
   - Or visit: https://expo.dev/accounts/[your-account]/projects/next-education-lms/builds

---

## 📊 Build Status

Check build status:
```bash
eas build:list
```

View specific build:
```bash
eas build:view [build-id]
```

Cancel build:
```bash
eas build:cancel [build-id]
```

---

## 🐛 If Build Fails

### Check Logs
```bash
eas build:view [build-id]
```

### Common Issues

**Issue: "Module not found"**
```bash
cd StudentApp
rm -rf node_modules
npm install
```

**Issue: "Invalid credentials"**
```bash
eas login
```

**Issue: "Build timeout"**
- Retry the build
- Or use local build: `eas build --platform android --local`

---

## 🎉 After Build Completes

### Android APK:
1. Download from EAS dashboard
2. Install on Android device
3. Enable "Install from Unknown Sources"
4. Test the app

### iOS IPA:
1. Download from EAS dashboard
2. Install via TestFlight or Xcode
3. Test on iOS device

---

## 🔄 Update Code for New Packages

If you use camera, notifications, or speech features, update imports:

### Camera
```javascript
// OLD: import { RNCamera } from 'react-native-camera';
import { Camera } from 'expo-camera';
```

### Notifications
```javascript
// OLD: import PushNotification from 'react-native-push-notification';
import * as Notifications from 'expo-notifications';
```

### Speech
```javascript
// OLD: import Tts from 'react-native-text-to-speech';
import * as Speech from 'expo-speech';
```

---

## 📱 App Details

- **Name:** Next Education LMS
- **Package (Android):** com.nexteducation.lms
- **Bundle ID (iOS):** com.nexteducation.lms
- **Version:** 1.0.0
- **Project ID:** b21a0292-7986-47cb-9004-9dfc29686e37

---

## ✅ Ready to Build!

Everything is configured. Run:

```bash
cd StudentApp
npm install
eas build --platform all --profile preview
```

The build will start and you'll get APK + IPA files when complete!

---

## 🎯 Quick Commands

```bash
# Install dependencies
cd StudentApp && npm install

# Build for all platforms
eas build --platform all --profile preview

# Build Android only
eas build --platform android --profile preview

# Build iOS only
eas build --platform ios --profile preview

# Check build status
eas build:list

# View build details
eas build:view [build-id]
```

---

## 📞 Support

- EAS Build Docs: https://docs.expo.dev/build/introduction/
- Expo Forums: https://forums.expo.dev/
- Check build logs for specific errors

---

**Your app is ready to build! 🚀**
