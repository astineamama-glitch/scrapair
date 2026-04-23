/**
 * Feedback API Client
 * Admin frontend feedback API calls
 */

import apiClient from '../../shared/utils/apiClient';

export const feedbackAPI = {
  /**
   * Get all feedback with optional filters
   */
  getAll: async (page = 1, limit = 20, filters = {}) => {
    try {
      const params = { page, limit, ...filters };
      const response = await apiClient.get('/api/admin/feedback', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch feedback');
    }
  },

  /**
   * Get feedback statistics
   */
  getStats: async () => {
    try {
      const response = await apiClient.get('/api/admin/feedback/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch feedback statistics');
    }
  }
};

export default feedbackAPI;
