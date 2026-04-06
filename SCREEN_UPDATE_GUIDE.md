# Screen Update Guide - Remove Mock Data, Use Real APIs

This guide shows you how to update each screen to use real API calls instead of mock data.

---

## 🎯 General Pattern

### Before (Mock Data)
```javascript
const [courses, setCourses] = useState([
  { id: 1, title: 'Mock Course', ... },
  { id: 2, title: 'Another Mock', ... }
]);
```

### After (Real API)
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { fetchPublicCourses } from '../store/slices/courseSlice';

const dispatch = useDispatch();
const { courses, loading, error } = useSelector(state => state.courses);

useEffect(() => {
  dispatch(fetchPublicCourses());
}, [dispatch]);
```

---

## 📱 Screen-by-Screen Updates

### 1. CoursesScreen.js

**What to change:**
- Remove mock course data
- Use Redux `fetchPublicCourses` thunk
- Add loading and error states

**Code:**
```javascript
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPublicCourses, searchCourses } from '../store/slices/courseSlice';

function CoursesScreen() {
  const dispatch = useDispatch();
  const { courses, loading, error, meta } = useSelector(state => state.courses);

  useEffect(() => {
    dispatch(fetchPublicCourses({ page: 1, limit: 20 }));
  }, [dispatch]);

  const handleSearch = (query) => {
    dispatch(searchCourses({ query, filters: {} }));
  };

  const handleLoadMore = () => {
    if (meta.page < meta.totalPages) {
      dispatch(fetchPublicCourses({ page: meta.page + 1, limit: 20 }));
    }
  };

  // Keep all existing UI/design code
  // Just replace data source
}
```

---

### 2. CourseDetailScreen.js

**What to change:**
- Remove mock course details
- Use Redux `fetchCourseDetails` thunk
- Use `enrollInCourse` for enrollment

**Code:**
```javascript
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourseDetails, enrollInCourse } from '../store/slices/courseSlice';

function CourseDetailScreen({ route }) {
  const { courseId } = route.params;
  const dispatch = useDispatch();
  const { selectedCourse, loading, error } = useSelector(state => state.courses);

  useEffect(() => {
    dispatch(fetchCourseDetails(courseId));
  }, [dispatch, courseId]);

  const handleEnroll = async () => {
    const result = await dispatch(enrollInCourse(courseId));
    if (result.type.endsWith('/fulfilled')) {
      // Show success message
      Alert.alert('Success', 'Enrolled successfully!');
    }
  };

  // Keep all existing UI/design code
}
```

---

### 3. DashboardScreen.js

**What to change:**
- Remove mock dashboard data
- Use `progressService.getDashboardStats()`
- Use `fetchMyEnrollments` for enrolled courses

**Code:**
```javascript
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyEnrollments } from '../store/slices/courseSlice';
import progressService from '../services/progress.service';

function DashboardScreen() {
  const dispatch = useDispatch();
  const { enrollments } = useSelector(state => state.courses);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    
    // Fetch enrollments
    dispatch(fetchMyEnrollments());
    
    // Fetch dashboard stats
    const result = await progressService.getDashboardStats();
    if (result.success) {
      setDashboardStats(result.data);
    }
    
    setLoading(false);
  };

  // Keep all existing UI/design code
}
```

---

### 4. AssessmentsScreen.js

**What to change:**
- Remove mock assessments
- Use Redux `fetchAssessments` thunk

**Code:**
```javascript
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssessments } from '../store/slices/assessmentSlice';

function AssessmentsScreen({ route }) {
  const { courseId } = route.params;
  const dispatch = useDispatch();
  const { assessments, loading, error } = useSelector(state => state.assessments);

  useEffect(() => {
    dispatch(fetchAssessments({ courseId, type: null })); // null = all types
  }, [dispatch, courseId]);

  const filterQuizzes = () => {
    dispatch(fetchAssessments({ courseId, type: 'quiz' }));
  };

  const filterAssignments = () => {
    dispatch(fetchAssessments({ courseId, type: 'assignment' }));
  };

  // Keep all existing UI/design code
}
```

---

### 5. QuizScreen.js

**What to change:**
- Remove mock quiz data
- Use Redux `fetchAssessmentDetails` and `submitAssessment`

**Code:**
```javascript
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssessmentDetails, startAssessment, submitAssessment } from '../store/slices/assessmentSlice';

function QuizScreen({ route }) {
  const { assessmentId } = route.params;
  const dispatch = useDispatch();
  const { selectedAssessment, loading } = useSelector(state => state.assessments);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    dispatch(fetchAssessmentDetails(assessmentId));
    dispatch(startAssessment(assessmentId)); // For timed quizzes
  }, [dispatch, assessmentId]);

  const handleSubmit = async () => {
    const result = await dispatch(submitAssessment({
      assessmentId,
      submission: { answers }
    }));
    
    if (result.type.endsWith('/fulfilled')) {
      // Navigate to results screen
      navigation.navigate('QuizResults', { submissionId: result.payload.id });
    }
  };

  // Keep all existing UI/design code
}
```

---

### 6. AssignmentScreen.js

**What to change:**
- Remove mock assignment data
- Use `assessmentsService` methods

**Code:**
```javascript
import React, { useEffect, useState } from 'react';
import assessmentsService from '../services/assessments.service';

function AssignmentScreen({ route }) {
  const { assessmentId } = route.params;
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignment();
  }, []);

  const loadAssignment = async () => {
    const result = await assessmentsService.getAssessmentDetails(assessmentId);
    if (result.success) {
      setAssignment(result.data);
    }
    setLoading(false);
  };

  const handleSubmit = async (files, text) => {
    // Upload files first
    const uploadedFiles = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      const uploadResult = await assessmentsService.uploadAssignmentFile(formData);
      if (uploadResult.success) {
        uploadedFiles.push(uploadResult.data.url);
      }
    }

    // Submit assignment
    const result = await assessmentsService.submitAssessment(assessmentId, {
      text_submission: text,
      file_urls: uploadedFiles
    });

    if (result.success) {
      Alert.alert('Success', 'Assignment submitted successfully!');
    }
  };

  // Keep all existing UI/design code
}
```

---

### 7. LessonScreen.js

**What to change:**
- Remove mock lesson data
- Use `contentService.getLessonContent()`
- Use `contentService.markContentComplete()`

**Code:**
```javascript
import React, { useEffect, useState } from 'react';
import contentService from '../services/content.service';

function LessonScreen({ route }) {
  const { lessonId } = route.params;
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLesson();
  }, []);

  const loadLesson = async () => {
    const result = await contentService.getLessonContent(lessonId);
    if (result.success) {
      setLesson(result.data);
    }
    setLoading(false);
  };

  const handleComplete = async () => {
    const result = await contentService.markContentComplete(lessonId);
    if (result.success) {
      Alert.alert('Success', 'Lesson marked as complete!');
    }
  };

  const handleProgress = async (progress) => {
    await contentService.trackContentProgress(lessonId, progress);
  };

  // Keep all existing UI/design code
}
```

---

### 8. ProfileScreen.js

**What to change:**
- Remove mock profile data
- Use `profileService` methods

**Code:**
```javascript
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import profileService from '../services/profile.service';

function ProfileScreen() {
  const user = useSelector(state => state.auth.user);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const result = await profileService.getProfile();
    if (result.success) {
      setProfile(result.data);
    }
    setLoading(false);
  };

  const handleUpdate = async (updates) => {
    const result = await profileService.updateProfile(updates);
    if (result.success) {
      setProfile(result.data);
      Alert.alert('Success', 'Profile updated successfully!');
    }
  };

  const handleUploadPicture = async (imageFile) => {
    const formData = new FormData();
    formData.append('picture', imageFile);
    
    const result = await profileService.uploadProfilePicture(formData);
    if (result.success) {
      setProfile({ ...profile, picture_url: result.data.url });
    }
  };

  // Keep all existing UI/design code
}
```

---

### 9. CertificateScreen.js

**What to change:**
- Remove mock certificates
- Use `certificatesService` methods

**Code:**
```javascript
import React, { useEffect, useState } from 'react';
import certificatesService from '../services/certificates.service';

function CertificateScreen() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    const result = await certificatesService.getMyCertificates();
    if (result.success) {
      setCertificates(result.data);
    }
    setLoading(false);
  };

  const handleDownload = async (certificateId) => {
    const result = await certificatesService.downloadCertificate(certificateId);
    if (result.success) {
      // Handle blob download
      // For React Native, you might need to use FileSystem
    }
  };

  const handleShare = async (certificateId) => {
    const result = await certificatesService.shareCertificate(certificateId);
    if (result.success) {
      // Share the link
      Share.share({ url: result.data.share_url });
    }
  };

  // Keep all existing UI/design code
}
```

---

### 10. SettingsScreen.js

**What to change:**
- Remove mock settings
- Use `profileService.getSettings()` and `profileService.updateSettings()`

**Code:**
```javascript
import React, { useEffect, useState } from 'react';
import profileService from '../services/profile.service';

function SettingsScreen() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const result = await profileService.getSettings();
    if (result.success) {
      setSettings(result.data);
    }
    setLoading(false);
  };

  const handleUpdate = async (key, value) => {
    const result = await profileService.updateSettings({
      ...settings,
      [key]: value
    });
    
    if (result.success) {
      setSettings(result.data);
    }
  };

  // Keep all existing UI/design code
}
```

---

## 🔄 Common Patterns

### Loading State
```javascript
if (loading) {
  return <ActivityIndicator size="large" color="#0000ff" />;
}
```

### Error Handling
```javascript
if (error) {
  return (
    <View>
      <Text>Error: {error}</Text>
      <Button title="Retry" onPress={() => dispatch(fetchData())} />
    </View>
  );
}
```

### Empty State
```javascript
if (!loading && courses.length === 0) {
  return (
    <View>
      <Text>No courses available</Text>
    </View>
  );
}
```

### Pull to Refresh
```javascript
const [refreshing, setRefreshing] = useState(false);

const onRefresh = async () => {
  setRefreshing(true);
  await dispatch(fetchData());
  setRefreshing(false);
};

<ScrollView
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
>
  {/* Content */}
</ScrollView>
```

---

## ✅ Checklist for Each Screen

- [ ] Remove all mock data arrays/objects
- [ ] Import necessary services or Redux actions
- [ ] Add useEffect to load data on mount
- [ ] Add loading state
- [ ] Add error handling
- [ ] Add empty state handling
- [ ] Keep all existing UI/design code
- [ ] Test with real backend data

---

## 🚫 What NOT to Change

- ❌ Don't change any styles or design
- ❌ Don't modify component structure
- ❌ Don't change navigation
- ❌ Don't alter UI/UX flow
- ✅ Only change data source (mock → real API)

---

## 🧪 Testing Each Screen

1. Start LMS-main backend
2. Login with test credentials
3. Navigate to the screen
4. Verify data loads from backend
5. Test all interactions (enroll, submit, etc.)
6. Check error handling (disconnect backend)
7. Check loading states

---

## 📝 Example: Complete Screen Update

**Before:**
```javascript
function CoursesScreen() {
  const [courses] = useState([
    { id: 1, title: 'Mock Course 1' },
    { id: 2, title: 'Mock Course 2' }
  ]);

  return (
    <View>
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </View>
  );
}
```

**After:**
```javascript
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPublicCourses } from '../store/slices/courseSlice';

function CoursesScreen() {
  const dispatch = useDispatch();
  const { courses, loading, error } = useSelector(state => state.courses);

  useEffect(() => {
    dispatch(fetchPublicCourses());
  }, [dispatch]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (courses.length === 0) return <EmptyState />;

  return (
    <View>
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </View>
  );
}
```

---

**Remember:** Keep all designs exactly as they are. Only change where the data comes from!
