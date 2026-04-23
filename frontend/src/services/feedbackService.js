import apiClient from './api';

const feedbackService = {
  // Get feedback received by a user
  getUserFeedback: async (userId, page = 1, limit = 20) => {
    try {
      const response = await apiClient.get(`/feedback/user/${userId}`, {
        params: { page, limit }
      });
      return response.data?.data || response.data || response;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to fetch user feedback';
      throw new Error(msg);
    }
  },

  // Get feedback for a specific post/collection
  getPostFeedback: async (postId, page = 1, limit = 20) => {
    try {
      const response = await apiClient.get(`/feedback/post/${postId}`, {
        params: { page, limit }
      });
      return response.data?.data || response.data || response;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to fetch post feedback';
      throw new Error(msg);
    }
  },

  // Get collection feedback status and eligibility
  getCollectionFeedbackStatus: async (collectionId) => {
    try {
      const response = await apiClient.get(`/feedback/collection/${collectionId}/status`);
      return response.data?.data || response.data || response;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to fetch collection feedback status';
      throw new Error(msg);
    }
  },

  // Submit feedback for a collection
  submitFeedback: async (feedbackData) => {
    try {
      const payload = {
        collectionId: feedbackData.collectionId,
        toUserId: feedbackData.toUserId,
        rating: feedbackData.rating,
        comment: feedbackData.comment || ''
      };
      const response = await apiClient.post('/feedback', payload);
      return response.data?.data || response.data || response;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to submit feedback';
      throw new Error(msg);
    }
  }
};

export default feedbackService;
