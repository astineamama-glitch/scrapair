import apiClient from './api';

const materialService = {
  // Get all materials (with optional filters)
  getMaterials: async (filters = {}) => {
    const response = await apiClient.get('/materials', { params: filters });
    return response.data;
  },

  // Get material by ID
  getMaterialById: async (id) => {
    const response = await apiClient.get(`/materials/${id}`);
    return response.data;
  },

  // Create new material
  createMaterial: async (data) => {
    const response = await apiClient.post('/materials', data);
    return response.data;
  },

  // Update material
  updateMaterial: async (id, data) => {
    const response = await apiClient.put(`/materials/${id}`, data);
    return response.data;
  },

  // Delete material
  deleteMaterial: async (id) => {
    const response = await apiClient.delete(`/materials/${id}`);
    return response.data;
  },

  // Get user's materials
  getUserMaterials: async () => {
    const response = await apiClient.get('/materials/user/all');
    return response.data;
  },
};

export default materialService;
