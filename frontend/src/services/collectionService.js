import apiClient from './api';
import {
  normalizeCollection,
  normalizeCollections,
  normalizeCollectionResponse,
} from '../shared/utils/collectionNormalizer';

const collectionService = {
  requestCollection: async (postId, proposedDate = null, notes = null) => {
    try {
      const payload = { postId };

      if (proposedDate) {
        payload.proposedDate = proposedDate;
      }

      if (notes) {
        payload.notes = notes;
      }

      const response = await apiClient.post('/collections/request', payload);
      return normalizeCollectionResponse(response.data);
    } catch (error) {
      const errorData = error.data || {};
      const msg = errorData.message || error.message || 'Failed to request collection';
      const code = errorData.code;
      throw new Error(msg, { cause: { code } });
    }
  },

  approveCollection: async (collectionId) => {
    try {
      const response = await apiClient.put(`/collections/${collectionId}/approve`, {});
      return normalizeCollectionResponse(response.data);
    } catch (error) {
      const msg = error.message || error.data?.message || 'Failed to approve collection';
      throw new Error(msg);
    }
  },

  rejectCollection: async (collectionId, reason = null) => {
    try {
      const payload = reason ? { reason } : {};
      const response = await apiClient.put(`/collections/${collectionId}/reject`, payload);
      return normalizeCollectionResponse(response.data);
    } catch (error) {
      const msg = error.message || error.data?.message || 'Failed to reject collection';
      throw new Error(msg);
    }
  },

  getCollectionDetails: async (id) => {
    try {
      const response = await apiClient.get(`/collections/${id}`);
      return normalizeCollection(response.data?.data || response.data || response);
    } catch (error) {
      const msg = error.message || error.data?.message || 'Failed to fetch collection details';
      throw new Error(msg);
    }
  },

  getAvailablePosts: async (filters = {}) => {
    try {
      const response = await apiClient.get('/collections/available', { params: filters });
      return response.data?.data || response.data || response;
    } catch (error) {
      const msg = error.message || error.data?.message || 'Failed to fetch available posts';
      throw new Error(msg);
    }
  },

  scheduleCollection: async (collectionId, data) => {
    try {
      const response = await apiClient.put(`/collections/${collectionId}/schedule`, data);
      return normalizeCollectionResponse(response.data);
    } catch (error) {
      const msg = error.message || error.data?.message || 'Failed to schedule collection';
      throw new Error(msg);
    }
  },

  confirmCollection: async (collectionId) => {
    try {
      const response = await apiClient.put(`/collections/${collectionId}/confirm`, {});
      return normalizeCollectionResponse(response.data);
    } catch (error) {
      const msg = error.message || error.data?.message || 'Failed to confirm collection';
      throw new Error(msg);
    }
  },

  acceptMaterials: async (collectionId) => {
    try {
      const response = await apiClient.put(`/collections/${collectionId}/accept-materials`, {});
      return normalizeCollectionResponse(response.data);
    } catch (error) {
      const msg = error.message || error.data?.message || 'Failed to accept materials';
      throw new Error(msg);
    }
  },

  getUserCollections: async (filters = {}) => {
    try {
      const response = await apiClient.get('/collections', { params: filters });
      return normalizeCollections(response.data?.data || response.data || response);
    } catch (error) {
      const msg = error.message || error.data?.message || 'Failed to fetch collections';
      throw new Error(msg);
    }
  },

  getAllCollections: async (filters = {}) => {
    try {
      const response = await apiClient.get('/collections', { params: filters });
      return normalizeCollections(response.data?.data || response.data || response);
    } catch (error) {
      const msg = error.message || error.data?.message || 'Failed to fetch collections';
      throw new Error(msg);
    }
  },

  cancelCollection: async (collectionId, cancellationReason = null) => {
    try {
      const payload = {};

      if (cancellationReason) {
        payload.cancellationReason = cancellationReason;
      }

      const response = await apiClient.put(`/collections/${collectionId}/cancel`, payload);
      return normalizeCollectionResponse(response.data);
    } catch (error) {
      const msg = error.message || error.data?.message || 'Failed to cancel collection';
      throw new Error(msg);
    }
  },
};

export default collectionService;
