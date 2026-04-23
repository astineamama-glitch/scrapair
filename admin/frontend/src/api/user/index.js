import apiClient from '../../shared/utils/apiClient';

export const usersAPI = {
  getAll: async (filters = {}, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      type: filters.type || '',
      verified: filters.verified || '',
      search: filters.search || '',
      page: page.toString(),
      limit: limit.toString()
    });
    const response = await apiClient.get(`/api/admin/users?${params}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/admin/users/${id}`);
    return response.data;
  },

  verify: async (id, isVerified) => {
    const response = await apiClient.put(`/api/admin/users/${id}/verify`, { isVerified });
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/api/admin/users/${id}`);
    return response.data;
  }
};
