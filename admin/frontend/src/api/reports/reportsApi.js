import apiClient from '../../shared/utils/apiClient';

export const reportsAPI = {
  getAll: async () => {
    const response = await apiClient.get('/admin/reports');
    return response.data;
  }
};
