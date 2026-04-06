/**
 * Notifications Service
 * All notification-related API calls
 * Matches actual LMS-main API structure (mobile-optimized)
 */

import api from './api';

const notificationsService = {
  /**
   * Get all notifications for the student (mobile-optimized with cursor pagination)
   * @param {Object} params - Query parameters (limit, cursor, unreadOnly)
   * @returns {Promise} List of notifications with pagination
   */
  getNotifications: async (params = {}) => {
    try {
      const response = await api.get('/mobile/notifications', { params });
      return {
        success: true,
        data: response.data.data?.notifications || [],
        hasMore: response.data.data?.hasMore || false,
        nextCursor: response.data.data?.nextCursor || null
      };
    } catch (error) {
      console.error('Get notifications error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch notifications'
      };
    }
  },

  /**
   * Mark specific notifications as read
   * @param {Array} notificationIds - Array of notification IDs
   * @returns {Promise} Update result
   */
  markAsRead: async (notificationIds) => {
    try {
      const response = await api.patch('/mobile/notifications', { notificationIds });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Mark notification as read error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to mark notification as read'
      };
    }
  },

  /**
   * Mark all notifications as read
   * @returns {Promise} Update result
   */
  markAllAsRead: async () => {
    try {
      const response = await api.patch('/mobile/notifications', { markAllRead: true });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Mark all as read error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to mark all as read'
      };
    }
  },

  /**
   * Get unread notification count
   * @returns {Promise} Unread count
   */
  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Get unread count error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch unread count'
      };
    }
  },

  /**
   * Register push notification token
   * @param {string} token - Push notification token
   * @param {Object} deviceInfo - Device information
   * @returns {Promise} Registration result
   */
  registerPushToken: async (token, deviceInfo) => {
    try {
      const response = await api.post('/mobile/push-token', {
        token,
        device_info: deviceInfo
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Register push token error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to register push token'
      };
    }
  },

  /**
   * Update notification preferences
   * @param {Object} preferences - Notification preferences
   * @returns {Promise} Update result
   */
  updatePreferences: async (preferences) => {
    try {
      const response = await api.put('/notifications/preferences', preferences);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Update preferences error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to update preferences'
      };
    }
  }
};

export default notificationsService;
