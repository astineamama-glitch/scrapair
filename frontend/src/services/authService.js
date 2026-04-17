import apiClient from './api';

const authService = {
  // Business owner signup
  businessSignup: async (data) => {
    const response = await apiClient.post('/auth/business/signup', data);
    return response.data;
  },

  // Business owner login
  businessLogin: async (email, password) => {
    const response = await apiClient.post('/auth/business/login', { email, password });
    return response.data;
  },

  // Recycler signup
  recyclerSignup: async (data) => {
    const response = await apiClient.post('/auth/recycler/signup', data);
    return response.data;
  },

  // Recycler login
  recyclerLogin: async (email, password) => {
    const response = await apiClient.post('/auth/recycler/login', { email, password });
    return response.data;
  },

  // Email verification
  verifyEmail: async (email, code) => {
    const response = await apiClient.post('/auth/verify-email', { email, code });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (email, code, newPassword) => {
    const response = await apiClient.post('/auth/reset-password', { email, code, newPassword });
    return response.data;
  },

  // Change password
  changePassword: async (oldPassword, newPassword) => {
    const response = await apiClient.post('/users/change-password', { oldPassword, newPassword });
    return response.data;
  },

  // Get profile
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await apiClient.put('/users/profile', data);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
};

export default authService;
