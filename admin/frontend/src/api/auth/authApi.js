import apiClient from '../../shared/utils/apiClient';
import { API_ENDPOINTS } from '../../shared/constants/apiEndpoints';

export const authAPI = {
  login: async (username, password) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH_LOGIN, {
      username,
      password
    });
    if (response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('adminToken');
  }
};
