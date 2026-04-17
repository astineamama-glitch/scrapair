import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const userService = {
  getProfile: async (userId) => {
    const res = await axios.get(`${API_BASE}/users/${userId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  updateProfile: async (userId, updates) => {
    const res = await axios.put(`${API_BASE}/users/${userId}`, updates, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  changePassword: async (userId, oldPassword, newPassword) => {
    const res = await axios.post(`${API_BASE}/users/${userId}/change-password`, { oldPassword, newPassword }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  deleteAccount: async (userId, password) => {
    const res = await axios.delete(`${API_BASE}/users/${userId}`, { data: { password }, headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  getPublicProfile: async (userId) => {
    const res = await axios.get(`${API_BASE}/users/${userId}/public`);
    return res.data;
  },

  uploadProfileImage: async (userId, formData) => {
    const res = await axios.post(`${API_BASE}/users/${userId}/upload-image`, formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },
};

export default userService;
