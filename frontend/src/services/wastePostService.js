import apiClient from './api';
import {
  normalizeWastePost,
  normalizeWastePosts,
} from '../shared/utils/wastePostNormalizer';

const withNormalizedPost = (payload) => ({
  ...payload,
  data: normalizeWastePost(payload?.data),
});

const withNormalizedPosts = (payload) => ({
  ...payload,
  data: normalizeWastePosts(payload?.data),
});

const wastePostService = {
  // Create waste post
  createWastePost: async (data) => {
    const response = await apiClient.post('/waste-posts', data);
    return withNormalizedPost(response.data);
  },

  // Get user's own waste posts
  getUserWastePosts: async (page = 1, limit = 20, status) => {
    const params = { page, limit };
    if (status) params.status = status;
    const response = await apiClient.get('/waste-posts/user/mine', { params });
    return withNormalizedPosts(response.data);
  },

  // Update waste post
  updateWastePost: async (id, data) => {
    const response = await apiClient.put(`/waste-posts/${id}`, data);
    return withNormalizedPost(response.data);
  },

  // Delete waste post
  deleteWastePost: async (id) => {
    const response = await apiClient.delete(`/waste-posts/${id}`);
    return response.data;
  },

  // Get waste post by ID
  getWastePostById: async (id) => {
    const response = await apiClient.get(`/waste-posts/${id}`);
    return withNormalizedPost(response.data);
  },

  // Get marketplace (all public posts)
  getMarketplace: async (filters = {}) => {
    const response = await apiClient.get('/waste-posts', { params: filters });
    return withNormalizedPosts(response.data);
  },

  // Get nearby materials
  getNearbyMaterials: async (latitude, longitude, radius = 50) => {
    const response = await apiClient.get('/waste-posts/nearby', {
      params: { latitude, longitude, radius },
    });
    return withNormalizedPosts(response.data);
  },

  // Get post status
  getPostStatus: async (id) => {
    const response = await apiClient.get(`/waste-posts/${id}/status`);
    return response.data;
  },

  // Search materials
  searchMaterials: async (query) => {
    const response = await apiClient.get('/waste-posts/search', {
      params: { q: query },
    });
    return withNormalizedPosts(response.data);
  },

  // Filter materials by criteria
  filterMaterials: async (filters = {}) => {
    const response = await apiClient.get('/waste-posts/filter', {
      params: filters,
    });
    return withNormalizedPosts(response.data);
  },

  // Get business profile with materials
  getBusinessProfile: async (businessId, latitude, longitude) => {
    const params = {};
    if (latitude) params.latitude = latitude;
    if (longitude) params.longitude = longitude;
    const response = await apiClient.get(`/waste-posts/business/${businessId}/profile`, { params });
    return response.data;
  },

  // Get business materials
  getBusinessMaterials: async (businessId, page = 1, limit = 20) => {
    const response = await apiClient.get(`/waste-posts/business/${businessId}/materials`, {
      params: { page, limit },
    });
    return withNormalizedPosts(response.data);
  },

  // ===== COLLECTION WORKFLOW =====

  // Business owner: Approve recycler for collection
  approveRecycler: async (postId, recyclerId) => {
    const response = await apiClient.post(`/waste-posts/${postId}/approve-recycler`, {
      recyclerId,
    });
    return response.data;
  },

  // Business owner: Cancel approval
  cancelApproval: async (postId) => {
    const response = await apiClient.post(`/waste-posts/${postId}/cancel-approval`);
    return response.data;
  },

  // Recycler: Mark waste post as picked up
  markAsPickedUp: async (postId) => {
    const response = await apiClient.post(`/waste-posts/${postId}/mark-pickup`);
    return response.data;
  },

  // Recycler: Get approved collections (pending pickup)
  getMyApprovedCollections: async (page = 1, limit = 20) => {
    const response = await apiClient.get('/waste-posts/my-approved', {
      params: { page, limit },
    });
    return withNormalizedPosts(response.data);
  },
};

export default wastePostService;
