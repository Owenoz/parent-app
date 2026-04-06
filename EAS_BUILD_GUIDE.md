# EAS Build Guide - Next Education LMS Student App

## Prerequisites

1. **Expo Account**
   - Create account at: https://expo.dev/signup
   - Your project ID is already configured: `b21a0292-7986-47cb-9004-9dfc29686e37`

2. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

3. **Login to EAS**
   ```bash
   eas login
   ```
   Enter your Expo credentials

## Step-by-Step Build Process

### Step 1: Verify Configuration

Your app is already configured with:
- ✅ `eas.json` - Build profiles
- ✅ `app.json` - App configuration
- ✅ Project ID in `extra.eas.projectId`

### Step 2: Update Environment Variables (Optional)

If your app needs API URLs, create `.env` file:
```bash
API_BASE_URL=http://your-backend-url.com
```

### Step 3: Build for Android (APK)

**Development Build (for testing):**
```bash
eas build --profile development --platform android
```

**Preview Build (internal testing):**
```bash
eas build --profile preview --platform android
```

**Production Build (release):**
```bash
eas build --profile production --platform android
```

### Step 4: Build for iOS

**Preview Build (simulator):**
```bash
eas build --profile preview --platform ios
```

**Production Build (App Store):**
```bash
eas build --profile production --platform ios
```

Note: iOS production builds require Apple Developer account ($99/year)

### Step 5: Build for Both Platforms

```bash
eas build --profile production --platform all
```

## Build Profiles Explained

### Development Profile
- Creates development client
- Internal distribution
- APK format (faster)
- For testing with dev tools

### Preview Profile
- Internal distribution
- APK format for Android
- Simulator build for iOS
- For internal testing

### Production Profile
- Auto-increments version
- APK format for Android
- Ready for store submission
- Optimized and minified

## Current Configuration

### Android Settings
```json
{
  "package": "com.nexteducation.lms",
  "versionCode": 1,
  "permissions": [
    "CAMERA",
    "READ_EXTERNAL_STORAGE",
    "WRITE_EXTERNAL_STORAGE",
    "NOTIFICATIONS"
  ]
}
```

### iOS Settings
```json
{
  "bundleIdentifier": "com.nexteducation.lms",
  "buildNumber": "1.0.0"
}
```

## Common Commands

### Check build status
```bash
eas build:list
```

### View specific build
```bash
eas build:view [BUILD_ID]
```

### Download build
```bash
eas build:download [BUILD_ID]
```

### Configure project
```bash
eas build:configure
```

### Update credentials
```bash
eas credentials
```

## Build Process Flow

1. **Run build command** → EAS uploads your code
2. **EAS servers** → Install dependencies and build
3. **Build completes** → Download link provided
4. **Install** → Download APK/IPA and install on device

## Troubleshooting

### Issue: "Not logged in"
```bash
eas login
```

### Issue: "Project not configured"
```bash
eas build:configure
```

### Issue: "Build failed"
- Check build logs: `eas build:view [BUILD_ID]`
- Common fixes:
  - Update dependencies: `npm install`
  - Clear cache: `rm -rf node_modules .expo`
  - Reinstall: `npm install`

### Issue: "Android keystore"
EAS will automatically generate one for you on first build

### Issue: "iOS provisioning"
You need an Apple Developer account for production builds

## Quick Start (Recommended)

### For Android APK (easiest):
```bash
# 1. Login
eas login

# 2. Build preview APK
eas build --profile preview --platform android

# 3. Wait for build (5-15 minutes)
# 4. Download APK from link provided
# 5. Install on Android device
```

### For iOS Simulator:
```bash
# 1. Login
eas login

# 2. Build for simulator
eas build --profile preview --platform ios

# 3. Download and run in Xcode simulator
```

## Distribution Options

### Internal Testing
1. Build with `preview` profile
2. Share download link with testers
3. Install APK directly on Android devices

### Google Play Store (Android)
1. Build with `production` profile
2. Submit to Play Store:
   ```bash
   eas submit --platform android
   ```

### Apple App Store (iOS)
1. Build with `production` profile
2. Submit to App Store:
   ```bash
   eas submit --platform ios
   ```

## Build Time Estimates

- **Android APK:** 5-15 minutes
- **iOS Simulator:** 10-20 minutes
- **Production builds:** 15-30 minutes

## Cost

- **Free tier:** 30 builds/month
- **Paid plans:** Unlimited builds
- See: https://expo.dev/pricing

## Next Steps After Build

1. **Download the build** from the link provided
2. **Test on real device:**
   - Android: Install APK directly
   - iOS: Use TestFlight or simulator
3. **Share with testers** using the download link
4. **Submit to stores** when ready

## Important Notes

- ✅ Your app is already configured for EAS
- ✅ Project ID is set up
- ✅ Build profiles are ready
- ⚠️ You need to login to EAS first
- ⚠️ iOS production requires Apple Developer account
- ⚠️ First build takes longer (dependencies download)

## Support

- EAS Documentation: https://docs.expo.dev/build/introduction/
- Expo Forums: https://forums.expo.dev/
- Discord: https://chat.expo.dev/

## Quick Reference

```bash
# Login
eas login

# Build Android APK (recommended for testing)
eas build --profile preview --platform android

# Build iOS simulator
eas build --profile preview --platform ios

# Build production (both platforms)
eas build --profile production --platform all

# Check builds
eas build:list

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

---

**Ready to build?** Start with:
```bash
eas login
eas build --profile preview --platform android
```

This will create an APK you can install on any Android device for testing!
