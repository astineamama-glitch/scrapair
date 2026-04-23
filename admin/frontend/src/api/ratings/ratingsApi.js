import apiClient from '../../shared/utils/apiClient';

export const ratingsAPI = {
  getUsers: async () => {
    const response = await apiClient.get('/api/admin/ratings/users');
    return response.data;
  },

  getPosts: async () => {
    const response = await apiClient.get('/api/admin/ratings/posts');
    return response.data;
  }
};
