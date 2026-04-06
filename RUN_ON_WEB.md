# 🌐 Run Student App on Web

The app is now configured to run on web browsers for testing!

## 🚀 Quick Start

### Step 1: Stop the current process
If the app is already running, press `Ctrl+C` in the terminal.

### Step 2: Clear cache and restart
```bash
cd StudentApp
rm -rf .expo
npm start -- --clear
```

### Step 3: Open in web browser
When you see the menu, press:
```
w
```

Or visit: **http://localhost:19006**

---

## 🔐 Login Credentials

**Email:** `student@lms.com`  
**Password:** `password`

---

## ✅ What Was Configured

- ✅ Metro bundler configured for web
- ✅ Web compatibility shims added
- ✅ AsyncStorage polyfill for web
- ✅ Platform-specific styling
- ✅ Webpack config for Expo web

---

## 🎯 Testing on Web

### Features that work on web:
- ✅ Login/Register
- ✅ Browse courses
- ✅ View course details
- ✅ Dashboard
- ✅ Profile management
- ✅ Settings

### Features limited on web:
- ⚠️ Camera/Image picker (use file upload instead)
- ⚠️ Biometric authentication (not available)
- ⚠️ Push notifications (not available)
- ⚠️ Offline mode (limited)

---

## 🐛 Troubleshooting

### White screen or errors?

**Solution 1: Clear cache**
```bash
cd StudentApp
rm -rf .expo
rm -rf node_modules/.cache
npm start -- --clear
```

**Solution 2: Reinstall dependencies**
```bash
cd StudentApp
rm -rf node_modules
npm install
npm start
```

### "Could not find MIME for Buffer"

This error should be fixed now. If it persists:
```bash
cd StudentApp
npm install --save-dev @expo/webpack-config
npm start -- --clear
```

### Backend connection issues

Make sure backend is running:
```bash
cd "LMS-main (2)"
npm run dev
```

Check `.env` has correct URL:
```env
API_BASE_URL=http://localhost:3000/api/v1
```

---

## 📱 Mobile vs Web

### For best experience:
- **Mobile (Android/iOS)**: Full features, native performance
- **Web**: Quick testing, limited features

### To run on mobile:
```bash
npm start
# Press 'a' for Android or 'i' for iOS
```

---

## ✅ Complete Setup

**Terminal 1 - Backend:**
```bash
cd "LMS-main (2)"
npm run dev
```

**Terminal 2 - Student App (Web):**
```bash
cd StudentApp
npm start
# Press 'w' for web
```

**Or visit directly:**
```
http://localhost:19006
```

---

## 🎉 You're Ready!

The app should now open in your web browser at:
**http://localhost:19006**

Login with:
- Email: student@lms.com
- Password: password

Enjoy testing! 🚀
