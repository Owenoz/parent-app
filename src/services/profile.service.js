/**
 * Profile Service
 * All user profile-related API calls
 * Matches actual LMS-main API structure
 */

import api from './api';

const profileService = {
  /**
   * Get user profile
   * @returns {Promise} User profile data
   */
  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return {
        success: true,
        data: response.data.data.user
      };
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch profile'
      };
    }
  },

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} Updated profile
   */
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to update profile'
      };
    }
  },

  /**
   * Change password
   * @param {Object} passwordData - Current and new password
   * @returns {Promise} Change result
   */
  changePassword: async (passwordData) => {
    try {
      const response = await api.post('/auth/change-password', passwordData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to change password'
      };
    }
  },

  /**
   * Upload profile picture/avatar
   * @param {FormData} imageData - Image file data
   * @returns {Promise} Upload result with image URL
   */
  uploadProfilePicture: async (imageData) => {
    try {
      const response = await api.post('/users/avatar', imageData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Upload profile picture error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to upload profile picture'
      };
    }
  }
};

export default profileService;
