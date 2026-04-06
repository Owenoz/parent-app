/**
 * Certificates Service
 * All certificate-related API calls
 * Matches actual LMS-main API structure
 */

import api from './api';

const certificatesService = {
  /**
   * Get all certificates for the student
   * @returns {Promise} List of certificates (certifications)
   */
  getMyCertificates: async () => {
    try {
      const response = await api.get('/certifications');
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error('Get certificates error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch certificates'
      };
    }
  },

  /**
   * Get certificate details for an enrollment
   * @param {string} enrollmentId - Enrollment ID
   * @returns {Promise} Certificate details
   */
  getCertificateDetails: async (enrollmentId) => {
    try {
      const response = await api.get(`/certifications/${enrollmentId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Get certificate details error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch certificate details'
      };
    }
  },

  /**
   * Generate certificate for completed course
   * @param {string} enrollmentId - Enrollment ID
   * @returns {Promise} Generated certificate
   */
  generateCertificate: async (enrollmentId) => {
    try {
      const response = await api.post('/certificates/generate', {
        enrollment_id: enrollmentId
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Generate certificate error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to generate certificate'
      };
    }
  },

  /**
   * Download certificate
   * @param {string} certificateId - Certificate ID
   * @returns {Promise} Certificate file blob
   */
  downloadCertificate: async (certificateId) => {
    try {
      const response = await api.get(`/certificates/${certificateId}/download`, {
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Download certificate error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to download certificate'
      };
    }
  },

  /**
   * Verify certificate authenticity
   * @param {string} certificateCode - Certificate verification code
   * @returns {Promise} Verification result
   */
  verifyCertificate: async (certificateCode) => {
    try {
      const response = await api.post('/certificates/verify', {
        code: certificateCode
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Verify certificate error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to verify certificate'
      };
    }
  }
};

export default certificatesService;
