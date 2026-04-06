# Student App - LMS Integration

This React Native mobile app is now fully integrated with the LMS-main(2) backend system.

## Quick Start

### 1. Start the Backend
```bash
cd "../LMS-main (2)"
npm run dev
```

### 2. Configure API URL
Update `.env` file with your backend URL:
```env
API_BASE_URL=http://localhost:3000/api/v1
```

**For physical devices**, use your computer's IP:
```env
API_BASE_URL=http://192.168.1.100:3000/api/v1
```

### 3. Start the App
```bash
npm start
```

## What's Connected

### ✅ Authentication
- Student registration
- Login/logout
- Token refresh
- Password reset
- Profile management

### ✅ Courses
- Browse course catalog
- View course details
- Enroll in courses
- Access course content
- Track progress

### ✅ Assessments
- View assignments and quizzes
- Submit assignments
- Take quizzes
- View grades and feedback

### ✅ Certificates
- View earned certificates
- Download certificates
- Verify certificates

### ✅ Mobile Features
- Offline content access
- Push notifications
- Attendance tracking
- Content downloads

## API Service Structure

All API calls are centralized in `src/services/api.js`:

```javascript
import { authAPI, courseAPI, assessmentAPI } from './services/api';

// Example: Login
const result = await authAPI.login({ email, password });

// Example: Get courses
const courses = await courseAPI.getCourses({ is_published: true });

// Example: Submit assignment
await assignmentAPI.submitAssignment(assessmentId, formData);
```

## Authentication Flow

1. User logs in → Tokens stored in AsyncStorage
2. API requests include token in Authorization header
3. Token expires → Automatically refreshed
4. Refresh fails → User logged out

## Testing

### Test Backend Connection
```javascript
import { apiUtils } from './services/api';

const isOnline = await apiUtils.isOnline();
console.log('Backend connected:', isOnline);
```

### Test Authentication
1. Open app
2. Register new account or login
3. Check AsyncStorage for tokens
4. Navigate to Dashboard

## Environment Variables

Create `.env` file:
```env
# Required
API_BASE_URL=http://localhost:3000/api/v1
AI_SERVICE_URL=http://localhost:3000/api/v1/ai

# Optional
NODE_ENV=development
```

## Troubleshooting

### Can't connect to backend
- Ensure backend is running on port 3000
- Check API_BASE_URL in .env
- For physical devices, use IP address not localhost
- Check firewall settings

### Authentication errors
- Clear AsyncStorage: `AsyncStorage.clear()`
- Check token expiration
- Verify backend auth routes are working

### CORS errors
- Backend must allow mobile app origin
- Check ALLOWED_ORIGINS in backend .env.local

## File Structure

```
src/
├── services/
│   └── api.js              # All API endpoints
├── contexts/
│   ├── AuthContext.js      # Authentication state
│   └── NetworkContext.js   # Network status
├── screens/
│   ├── LoginScreen.js
│   ├── DashboardScreen.js
│   └── ...
└── store/
    └── slices/
        └── authSlice.js    # Redux auth state
```

## Next Steps

1. Test all features with real backend
2. Handle edge cases and errors
3. Implement offline sync
4. Add push notifications
5. Optimize performance
6. Prepare for production

## Support

See main INTEGRATION_GUIDE.md for detailed documentation.
