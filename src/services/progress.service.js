/**
 * Progress Service
 * All progress tracking and analytics API calls
 * Matches actual LMS-main API structure
 */

import api from './api';

const progressService = {
  /**
   * Get student's dashboard statistics
   * @returns {Promise} Dashboard stats (courses, progress, achievements)
   */
  getDashboardStats: async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch dashboard stats'
      };
    }
  },

  /**
   * Get enrollment statistics
   * @returns {Promise} Enrollment stats
   */
  getEnrollmentStats: async () => {
    try {
      const response = await api.get('/analytics/enrollments');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Get enrollment stats error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch enrollment stats'
      };
    }
  },

  /**
   * Get progress for a specific course
   * @param {string} courseId - Course ID
   * @returns {Promise} Course progress data
   */
  getCourseProgress: async (courseId) => {
    try {
      const response = await api.get('/analytics/courses', {
        params: { courseId }
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Get course progress error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch course progress'
      };
    }
  },

  /**
   * Get enrollment progress details
   * @param {string} enrollmentId - Enrollment ID
   * @returns {Promise} Detailed progress information
   */
  getEnrollmentProgress: async (enrollmentId) => {
    try {
      const response = await api.get(`/enrollments/${enrollmentId}/progress`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Get enrollment progress error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch enrollment progress'
      };
    }
  }
};

export default progressService;
