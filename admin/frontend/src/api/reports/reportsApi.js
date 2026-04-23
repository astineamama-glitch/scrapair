import apiClient from '../../shared/utils/apiClient';

export const reportsAPI = {
  getAll: async (page = 1, limit = 20, filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await apiClient.get('/api/admin/reports', { params });
    return response.data;
  },

  getById: async (reportId) => {
    const response = await apiClient.get(`/api/admin/reports/${reportId}`);
    return response.data;
  },

  confirmAsValid: async (reportId, data) => {
    const response = await apiClient.post(`/api/admin/reports/${reportId}/confirm-valid`, data);
    return response.data;
  },

  confirmAsInvalid: async (reportId, data) => {
    const response = await apiClient.post(`/api/admin/reports/${reportId}/confirm-invalid`, data);
    return response.data;
  },

  escalate: async (reportId, data) => {
    const response = await apiClient.post(`/api/admin/reports/${reportId}/escalate`, data);
    return response.data;
  },

  reverse: async (reportId, data) => {
    const response = await apiClient.post(`/api/admin/reports/${reportId}/reverse`, data);
    return response.data;
  }
};
