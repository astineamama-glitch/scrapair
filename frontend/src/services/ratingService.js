import apiClient from './api';

const ratingService = {
  // Get rating for a specific user
  getUserRating: async (userId) => {
    try {
      const response = await apiClient.get(`/ratings/user/${userId}`);
      // Backend returns: { message, data: { user: {...}, rating: {...}, recentFeedback: [...] } }
      return response.data?.data || response.data || response;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to fetch user rating';
      throw new Error(msg);
    }
  },

  // Get rating for a specific post
  getPostRating: async (postId) => {
    try {
      const response = await apiClient.get(`/ratings/post/${postId}`);
      // Backend returns: { message, data: { postId, averageRating, totalRatings, totalFeedback, recentFeedback: [...] } }
      return response.data?.data || response.data || response;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to fetch post rating';
      throw new Error(msg);
    }
  },

  // Admin: Get all user ratings
  getAllUserRatings: async (page = 1, limit = 20) => {
    try {
      const response = await apiClient.get('/ratings/admin/users', {
        params: { page, limit }
      });
      // Backend returns: { message, data: [...ratings], pagination: {...} }
      return response.data?.data || response.data || response;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to fetch user ratings';
      throw new Error(msg);
    }
  },

  // Admin: Get all post ratings
  getAllPostRatings: async (page = 1, limit = 20) => {
    try {
      const response = await apiClient.get('/ratings/admin/posts', {
        params: { page, limit }
      });
      // Backend returns: { message, data: [...ratings], pagination: {...} }
      return response.data?.data || response.data || response;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to fetch post ratings';
      throw new Error(msg);
    }
  }
};

export default ratingService;
