import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration - Connect to LMS-main(2) backend
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3000/api/v1/ai';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// AI Service instance
export const aiApi = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 30000, // AI requests may take longer
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('user_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          });

          if (response.data.success) {
            const { token } = response.data;
            await AsyncStorage.setItem('user_token', token);
            
            // Update the original request with new token
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.log('Token refresh failed:', refreshError);
        // Redirect to login or dispatch logout action
        // This would typically trigger a logout in your app
      }
    }

    return Promise.reject(error);
  }
);

// Auth endpoints - Matching actual LMS-main API structure
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
};

// Course endpoints - Matching actual LMS-main API structure
export const courseAPI = {
  // Public courses (no auth required)
  getPublicCourses: (params) => api.get('/public/courses', { params }),
  // Authenticated course endpoints
  getCourses: (params) => api.get('/courses', { params }),
  getCourse: (courseId) => api.get(`/courses/${courseId}`),
  getCurriculum: (courseId) => api.get(`/curriculum/${courseId}`),
  // Enrollments
  enroll: (courseId) => api.post('/enrollments', { course_id: courseId }),
  getMyEnrollments: () => api.get('/enrollments'),
  getEnrollmentDetails: (enrollmentId) => api.get(`/enrollments/${enrollmentId}`),
  checkPrerequisites: (courseId) => api.get('/enrollments/check-prerequisites', { params: { course_id: courseId } }),
};

// Assessment endpoints - Matching actual LMS-main API structure
export const assessmentAPI = {
  getAssessments: (courseId, params) => api.get('/assessments', { params: { courseId, ...params } }),
  getAssessment: (assessmentId) => api.get(`/assessments/${assessmentId}`),
  submitAssessment: (assessmentId, data) => api.post(`/assessments/${assessmentId}/submit`, data),
  getMySubmissions: (params) => api.get('/assessments/submissions', { params }),
  getSubmission: (submissionId) => api.get(`/assessments/submissions/${submissionId}`),
  uploadFile: (fileData) => api.post('/content/upload', fileData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Content endpoints - Matching actual LMS-main API structure
export const contentAPI = {
  getCourseContent: (courseId) => api.get(`/curriculum/${courseId}`),
  getLessonContent: (lessonId) => api.get(`/curriculum/lessons/${lessonId}`),
  markContentComplete: (contentId) => api.post(`/content/${contentId}/complete`),
  trackProgress: (contentId, progress) => api.post(`/content/${contentId}/progress`, { progress }),
  downloadContent: (contentId) => api.get(`/mobile/content/${contentId}`, { responseType: 'blob' }),
};

// AI endpoints
export const aiAPI = {
  getTutorResponse: (message, context) => aiApi.post('/tutor/chat', { message, context }),
  translateText: (text, targetLanguage) => aiApi.post('/translate', { text, targetLanguage }),
  textToAudio: (text, voiceSettings) => aiApi.post('/text-to-speech', { text, voiceSettings }),
  generateVideo: (script, settings) => aiApi.post('/video/generate', { script, settings }),
  summarizeText: (text, maxLength) => aiApi.post('/summarize', { text, maxLength }),
  generateStudyPlan: (userData, goals) => aiApi.post('/study-plan/generate', { userData, goals }),
  checkPlagiarism: (text) => aiApi.post('/plagiarism/check', { text }),
  autoGradeAssignment: (assignmentId, submissionId) => aiApi.post(`/auto-grade/${assignmentId}/${submissionId}`),
};

// Certificate endpoints - Matching actual LMS-main API structure
export const certificateAPI = {
  getMyCertificates: () => api.get('/certifications'),
  getCertificate: (enrollmentId) => api.get(`/certifications/${enrollmentId}`),
  generateCertificate: (enrollmentId) => api.post('/certificates/generate', { enrollment_id: enrollmentId }),
  downloadCertificate: (certificateId) => api.get(`/certificates/${certificateId}/download`, { responseType: 'blob' }),
  verifyCertificate: (code) => api.post('/certificates/verify', { code }),
};

// User endpoints - Matching actual LMS-main API structure
export const userAPI = {
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// Analytics endpoints - Matching actual LMS-main API structure
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getEnrollmentStats: () => api.get('/analytics/enrollments'),
  getCourseProgress: (courseId) => api.get('/analytics/courses', { params: { courseId } }),
};

// Notifications endpoints - Matching actual LMS-main API structure
export const notificationsAPI = {
  getNotifications: (params) => api.get('/mobile/notifications', { params }),
  markAsRead: (notificationIds) => api.patch('/mobile/notifications', { notificationIds }),
  markAllAsRead: () => api.patch('/mobile/notifications', { markAllRead: true }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  updatePreferences: (preferences) => api.put('/notifications/preferences', preferences),
};

// Mobile-specific endpoints - Matching actual LMS-main API structure
export const mobileAPI = {
  registerPushToken: (token, deviceInfo) => api.post('/mobile/push-token', { token, device_info: deviceInfo }),
  syncData: (data) => api.post('/mobile/sync', data),
  markAttendance: (data) => api.post('/mobile/attendance', data),
};

// Success stories endpoints - Matching actual LMS-main API structure
export const storiesAPI = {
  getPublicStories: (params) => api.get('/public/success-stories', { params }),
  submitStory: (data) => api.post('/success-stories', data),
  getMyStories: () => api.get('/success-stories'),
};

// Utility functions
export const apiUtils = {
  isOnline: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL.replace('/api/v1', '')}/api/health`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  },
  
  retryRequest: async (requestFn, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      }
    }
  },
  
  handleOfflineError: (error) => {
    if (error.code === 'NETWORK_ERROR' || error.message.includes('timeout')) {
      return {
        success: false,
        message: 'No internet connection. Please check your connection and try again.',
        isOffline: true
      };
    }
    return { success: false, message: error.message, isOffline: false };
  },
};

export default api;