/**
 * Courses Service
 * All course-related API calls to LMS-main backend
 * Matches actual LMS-main API structure
 */

import api from './api';

const coursesService = {
  /**
   * Get all public courses (for browsing - no auth required)
   * @param {Object} params - Query parameters (page, pageSize, course_type, difficulty_level)
   * @returns {Promise} Course list with pagination
   */
  getPublicCourses: async (params = {}) => {
    try {
      const response = await api.get('/public/courses', { params });
      return {
        success: true,
        data: response.data.data || [],
        meta: response.data.meta || {}
      };
    } catch (error) {
      console.error('Get public courses error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch courses'
      };
    }
  },

  /**
   * Get course details by ID
   * @param {string} courseId - Course ID
   * @returns {Promise} Course details
   */
  getCourseDetails: async (courseId) => {
    try {
      const response = await api.get(`/courses/${courseId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Get course details error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch course details'
      };
    }
  },

  /**
   * Get course curriculum (modules, units, lessons)
   * @param {string} courseId - Course ID
   * @returns {Promise} Course curriculum structure
   */
  getCourseCurriculum: async (courseId) => {
    try {
      const response = await api.get(`/curriculum/${courseId}`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error('Get course curriculum error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch curriculum'
      };
    }
  },

  /**
   * Enroll in a course (student enrolls themselves)
   * @param {string} courseId - Course ID
   * @returns {Promise} Enrollment result
   */
  enrollInCourse: async (courseId) => {
    try {
      const response = await api.post('/enrollments', {
        course_id: courseId
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Enroll in course error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to enroll in course'
      };
    }
  },

  /**
   * Get user's enrolled courses
   * @returns {Promise} List of enrollments
   */
  getMyEnrollments: async () => {
    try {
      const response = await api.get('/enrollments');
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error('Get enrollments error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch enrollments'
      };
    }
  },

  /**
   * Get enrollment details
   * @param {string} enrollmentId - Enrollment ID
   * @returns {Promise} Enrollment details
   */
  getEnrollmentDetails: async (enrollmentId) => {
    try {
      const response = await api.get(`/enrollments/${enrollmentId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Get enrollment details error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch enrollment details'
      };
    }
  },

  /**
   * Check course prerequisites
   * @param {string} courseId - Course ID
   * @returns {Promise} Prerequisites check result
   */
  checkPrerequisites: async (courseId) => {
    try {
      const response = await api.get('/enrollments/check-prerequisites', {
        params: { course_id: courseId }
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Check prerequisites error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to check prerequisites'
      };
    }
  },

  /**
   * Search courses
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise} Search results
   */
  searchCourses: async (query, filters = {}) => {
    try {
      const response = await api.get('/public/courses', {
        params: {
          search: query,
          ...filters
        }
      });
      return {
        success: true,
        data: response.data.data || [],
        meta: response.data.meta || {}
      };
    } catch (error) {
      console.error('Search courses error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to search courses'
      };
    }
  }
};

export default coursesService;
