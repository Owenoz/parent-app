# 📱 This is a Mobile-Only App

The StudentApp is a **React Native mobile application** and must be run on:
- Android Emulator
- iOS Simulator
- Physical Android/iOS device

**It cannot run in a web browser.**

---

## 🚀 How to Run the App

### Option 1: Android Emulator (Recommended)

1. **Make sure Android Studio is installed** with an emulator set up

2. **In the terminal where you ran `npm start`, press:**
   ```
   a
   ```

3. **Wait for the emulator to open and the app to load**

### Option 2: iOS Simulator (Mac only)

1. **Make sure Xcode is installed**

2. **In the terminal where you ran `npm start`, press:**
   ```
   i
   ```

3. **Wait for the simulator to open and the app to load**

### Option 3: Physical Device (Easiest!)

1. **Install Expo Go app on your phone:**
   - Android: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [Apple App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Make sure your phone and computer are on the same WiFi network**

3. **Update the API URL for your network:**
   
   Edit `StudentApp/.env`:
   ```env
   API_BASE_URL=http://192.168.1.9:3000/api/v1
   ```
   (Use the Network IP shown in your backend terminal)

4. **Scan the QR code** shown in the terminal:
   - **Android**: Open Expo Go app and scan
   - **iOS**: Open Camera app and scan (opens in Expo Go)

---

## ❌ Don't Use Web Browser

When you see:
```
› Press w │ open web
```

**Don't press `w`** - the app won't work in a browser because it uses React Native components that only work on mobile devices.

---

## 🔧 If You Don't Have an Emulator

### Quick Setup for Android Emulator:

1. **Install Android Studio:**
   - Download from: https://developer.android.com/studio
   - Install with default settings

2. **Set up an emulator:**
   - Open Android Studio
   - Go to: Tools → Device Manager
   - Click "Create Device"
   - Select a phone (e.g., Pixel 5)
   - Select a system image (e.g., Android 13)
   - Click Finish

3. **Run the app:**
   ```bash
   cd StudentApp
   npm start
   # Press 'a' when prompted
   ```

### Or Use Your Phone (Easier!):

1. Install Expo Go app
2. Update `.env` with your network IP
3. Scan QR code
4. Done! ✅

---

## 🔐 Login Credentials

Once the app opens on your device:

**Email:** `student@lms.com`  
**Password:** `password`

---

## 🐛 Troubleshooting

### "Could not connect to development server"

**Solution:** Update `StudentApp/.env` with your computer's IP:
```env
API_BASE_URL=http://192.168.1.9:3000/api/v1
```

### "Network request failed"

**Solutions:**
1. Make sure backend is running: `cd "LMS-main (2)" && npm run dev`
2. Check your firewall isn't blocking port 3000
3. Make sure phone and computer are on same WiFi

### "White screen" or "Could not find MIME"

This happens when trying to run in web browser. **Use mobile emulator or device instead.**

---

## ✅ Correct Setup

**Terminal 1 - Backend:**
```bash
cd "LMS-main (2)"
npm run dev
# Should show: ✓ Ready in X seconds
```

**Terminal 2 - Mobile App:**
```bash
cd StudentApp
npm start
# Press 'a' for Android or 'i' for iOS
# Or scan QR code with Expo Go
```

---

## 📱 What You'll See

Once the app loads on your mobile device:

1. **Login Screen** - Enter credentials
2. **Dashboard** - Overview of courses and progress
3. **Courses** - Browse available courses
4. **Profile** - View your profile
5. **AI Tools** - Access AI features

---

**Remember: This is a mobile app, not a web app!** 📱

Use Android emulator, iOS simulator, or your physical phone with Expo Go.
