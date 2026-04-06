# Pre-Build Checklist ✅

## Before Running EAS Build

### 1. Configuration Files ✅
- [x] `eas.json` - Build profiles configured
- [x] `app.json` - App metadata set
- [x] `babel.config.js` - Reanimated plugin added
- [x] `index.js` - Gesture handler imported first
- [x] Project ID configured

### 2. Dependencies ✅
- [x] All npm packages installed
- [x] `react-native-gesture-handler` installed
- [x] `react-native-reanimated` installed
- [x] `@react-navigation/drawer` installed

### 3. Code Quality ✅
- [x] No placeholder image errors
- [x] All imports working
- [x] Navigation configured
- [x] API endpoints set

### 4. Assets
- [ ] Check if `assets/icon.png` exists (app icon)
- [ ] Check if `assets/splash.png` exists (splash screen)
- [ ] Check if `assets/adaptive-icon.png` exists (Android)

### 5. Environment Variables
- [ ] Set API_BASE_URL in app config or .env
- [ ] Configure any API keys needed

## Quick Asset Check

Run this to verify assets exist:
```bash
ls -la assets/
```

If assets are missing, you can:
1. Create placeholder icons
2. Or update `app.json` to remove icon references

## Build Commands

### Test Build (Recommended First)
```bash
# 1. Login to EAS
eas login

# 2. Build preview APK
eas build --profile preview --platform android
```

### Production Build
```bash
# Build for Android
eas build --profile production --platform android

# Build for iOS (requires Apple Developer account)
eas build --profile production --platform ios

# Build for both
eas build --profile production --platform all
```

## Expected Build Time
- First build: 15-20 minutes (downloads all dependencies)
- Subsequent builds: 5-10 minutes

## After Build Completes

1. **Download the APK/IPA** from the link provided
2. **Install on device:**
   - Android: Transfer APK and install
   - iOS: Use TestFlight or Xcode
3. **Test the app** thoroughly
4. **Share with testers** using the download link

## Troubleshooting

### If build fails:
1. Check build logs: `eas build:view [BUILD_ID]`
2. Common issues:
   - Missing assets → Update app.json
   - Dependency conflicts → Update package.json
   - Configuration errors → Check eas.json

### If app crashes on device:
1. Check if backend API is accessible
2. Verify API_BASE_URL is correct
3. Check device logs

## Current App Configuration

**Package Name:** `com.nexteducation.lms`
**Version:** `1.0.0`
**Version Code:** `1`

**Permissions:**
- Camera (for scanning)
- Storage (for file uploads)
- Notifications (for alerts)

## Ready to Build?

Run these commands in order:

```bash
# 1. Verify you're in the right directory
cd StudentApp

# 2. Login to EAS
eas login

# 3. Start the build
eas build --profile preview --platform android

# 4. Wait for completion (grab a coffee ☕)

# 5. Download and test!
```

## Notes

- ✅ App is configured for EAS Build
- ✅ Navigation uses drawer (hamburger menu)
- ✅ Modern UI with gradients
- ✅ Student-only access enforced
- ✅ Real API integration
- ⚠️ Make sure backend API is running for testing
- ⚠️ Update API_BASE_URL if needed

## Support

If you encounter issues:
1. Check EAS documentation: https://docs.expo.dev/build/
2. View build logs for errors
3. Ask in Expo forums: https://forums.expo.dev/

---

**You're ready to build!** 🚀

Start with:
```bash
eas login
eas build --profile preview --platform android
```
