import apiClient from '../../shared/utils/apiClient';

export const dashboardAPI = {
  getStatistics: async () => {
    const response = await apiClient.get('/admin/statistics');
    return response.data;
  }
};
