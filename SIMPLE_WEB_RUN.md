# 🌐 Run on Web - Simple Method

Expo 55 has built-in web support. No extra configuration needed!

## 🚀 Just Run It

### Step 1: Start the app
```bash
cd StudentApp
npm start
```

### Step 2: Press 'w' for web
When you see the menu, press:
```
w
```

That's it! The app will open in your browser at `http://localhost:8081`

---

## 🔐 Login Credentials

**Email:** `student@lms.com`  
**Password:** `password`

---

## ✅ What Works on Web

- ✅ Login/Register
- ✅ Browse courses  
- ✅ View course details
- ✅ Dashboard
- ✅ Profile
- ✅ Settings
- ✅ All API calls to backend

---

## 🐛 If You See Errors

### Clear cache:
```bash
npm start -- --clear
```

### Or reset everything:
```bash
rm -rf .expo
rm -rf node_modules/.cache
npm start
```

---

## 📋 Complete Setup

**Terminal 1 - Backend:**
```bash
cd "LMS-main (2)"
npm run dev
# Wait for: ✓ Ready
```

**Terminal 2 - Student App:**
```bash
cd StudentApp
npm start
# Press 'w' for web
```

---

## 🎉 That's It!

The app will open in your browser automatically.

Login with:
- Email: student@lms.com
- Password: password

Enjoy! 🚀
