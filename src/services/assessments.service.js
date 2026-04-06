/**
 * Assessments Service
 * All assessment-related API calls (quizzes, assignments, submissions)
 * Matches actual LMS-main API structure
 */

import api from './api';

const assessmentsService = {
  /**
   * Get assessments for a course
   * @param {string} courseId - Course ID (required)
   * @param {string} type - Assessment type ('quiz', 'assignment', 'exam') - optional
   * @returns {Promise} List of assessments
   */
  getAssessments: async (courseId, type = null) => {
    try {
      const params = { courseId };
      if (type) params.assessment_type = type;
      
      const response = await api.get('/assessments', { params });
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error('Get assessments error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch assessments'
      };
    }
  },

  /**
   * Get assessment details
   * @param {string} assessmentId - Assessment ID
   * @returns {Promise} Assessment details with questions
   */
  getAssessmentDetails: async (assessmentId) => {
    try {
      const response = await api.get(`/assessments/${assessmentId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Get assessment details error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch assessment details'
      };
    }
  },

  /**
   * Start an assessment (for timed assessments)
   * @param {string} assessmentId - Assessment ID
   * @returns {Promise} Assessment session
   */
  startAssessment: async (assessmentId) => {
    try {
      const response = await api.post(`/assessments/${assessmentId}/start`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Start assessment error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to start assessment'
      };
    }
  },

  /**
   * Submit assessment answers
   * @param {string} assessmentId - Assessment ID
   * @param {Object} submission - Submission data (answers, files, etc.)
   * @returns {Promise} Submission result
   */
  submitAssessment: async (assessmentId, submission) => {
    try {
      const response = await api.post(`/assessments/${assessmentId}/submit`, submission);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Submit assessment error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to submit assessment'
      };
    }
  },

  /**
   * Upload file for assignment
   * @param {FormData} fileData - File data
   * @returns {Promise} Upload result with file URL
   */
  uploadAssignmentFile: async (fileData) => {
    try {
      const response = await api.post('/content/upload', fileData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Upload file error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to upload file'
      };
    }
  },

  /**
   * Get student's submissions
   * @param {string} courseId - Course ID (optional)
   * @returns {Promise} List of submissions
   */
  getMySubmissions: async (courseId = null) => {
    try {
      const params = {};
      if (courseId) params.courseId = courseId;
      
      const response = await api.get('/assessments/submissions', { params });
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error('Get submissions error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch submissions'
      };
    }
  },

  /**
   * Get submission details with feedback
   * @param {string} submissionId - Submission ID
   * @returns {Promise} Submission details
   */
  getSubmissionDetails: async (submissionId) => {
    try {
      const response = await api.get(`/assessments/submissions/${submissionId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Get submission details error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch submission details'
      };
    }
  },

  /**
   * Get quiz results
   * @param {string} submissionId - Submission ID
   * @returns {Promise} Quiz results with score
   */
  getQuizResults: async (submissionId) => {
    try {
      const response = await api.get(`/assessments/submissions/${submissionId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Get quiz results error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch quiz results'
      };
    }
  }
};

export default assessmentsService;
