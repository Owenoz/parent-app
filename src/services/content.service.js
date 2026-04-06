/**
 * Content Service
 * All content-related API calls (lessons, videos, documents, etc.)
 * Matches actual LMS-main API structure
 */

import api from './api';

const contentService = {
  /**
   * Get course content (curriculum structure)
   * @param {string} courseId - Course ID
   * @returns {Promise} Course curriculum with modules, units, lessons
   */
  getCourseContent: async (courseId) => {
    try {
      const response = await api.get(`/curriculum/${courseId}`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error('Get course content error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch content'
      };
    }
  },

  /**
   * Get specific lesson content
   * @param {string} lessonId - Lesson ID
   * @returns {Promise} Lesson content details
   */
  getLessonContent: async (lessonId) => {
    try {
      const response = await api.get(`/curriculum/lessons/${lessonId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Get lesson content error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch lesson content'
      };
    }
  },

  /**
   * Mark content as complete
   * @param {string} contentId - Content ID
   * @returns {Promise} Completion result
   */
  markContentComplete: async (contentId) => {
    try {
      const response = await api.post(`/content/${contentId}/complete`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Mark content complete error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to mark content complete'
      };
    }
  },

  /**
   * Track content view/progress
   * @param {string} contentId - Content ID
   * @param {number} progress - Progress percentage (0-100)
   * @returns {Promise} Tracking result
   */
  trackContentProgress: async (contentId, progress) => {
    try {
      const response = await api.post(`/content/${contentId}/progress`, {
        progress
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Track content progress error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to track progress'
      };
    }
  },

  /**
   * Download content for offline viewing
   * @param {string} contentId - Content ID
   * @returns {Promise} Download URL or blob
   */
  downloadContent: async (contentId) => {
    try {
      const response = await api.get(`/mobile/content/${contentId}`, {
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Download content error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to download content'
      };
    }
  }
};

export default contentService;
