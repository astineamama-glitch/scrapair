import apiClient from '../../shared/utils/apiClient';

export const monitoringAPI = {
  getLogs: async () => {
    const response = await apiClient.get('/api/admin/logs');
    return response.data;
  },

  clearLogs: async () => {
    const response = await apiClient.delete('/api/admin/logs');
    return response.data;
  }
};
