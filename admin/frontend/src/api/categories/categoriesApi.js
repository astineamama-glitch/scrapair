import apiClient from '../../shared/utils/apiClient';

export const categoriesAPI = {
  getAll: async () => {
    const response = await apiClient.get('/admin/categories');
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/admin/categories', data);
    return response.data;
  },

  update: async (categoryId, data) => {
    const response = await apiClient.put(`/admin/categories/${categoryId}`, data);
    return response.data;
  },

  delete: async (categoryId) => {
    const response = await apiClient.delete(`/admin/categories/${categoryId}`);
    return response.data;
  }
};
