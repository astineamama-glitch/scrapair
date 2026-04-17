import apiClient from '../../shared/utils/apiClient';

export const monitoringAPI = {
  getLogs: async () => {
    const response = await apiClient.get('/admin/logs');
    return response.data;
  },

  clearLogs: async () => {
    const response = await apiClient.delete('/admin/logs');
    return response.data;
  }
};
