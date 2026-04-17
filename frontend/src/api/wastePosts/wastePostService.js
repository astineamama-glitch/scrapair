import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const wastePostService = {
  createPost: async (postData, imageFile) => {
    const formData = new FormData();
    Object.keys(postData).forEach(key => formData.append(key, postData[key]));
    if (imageFile) formData.append('image', imageFile);
    const res = await axios.post(`${API_BASE}/waste-posts`, formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  getPost: async (postId) => {
    const res = await axios.get(`${API_BASE}/waste-posts/${postId}`);
    return res.data;
  },

  getUserPosts: async (userId, page = 1, limit = 10) => {
    const res = await axios.get(`${API_BASE}/waste-posts?userId=${userId}&page=${page}&limit=${limit}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  searchPosts: async (query, filters = {}) => {
    const params = new URLSearchParams({ q: query, ...filters });
    const res = await axios.get(`${API_BASE}/waste-posts/search?${params}`);
    return res.data;
  },

  updatePost: async (postId, updates, imageFile) => {
    const formData = new FormData();
    Object.keys(updates).forEach(key => formData.append(key, updates[key]));
    if (imageFile) formData.append('image', imageFile);
    const res = await axios.put(`${API_BASE}/waste-posts/${postId}`, formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  deletePost: async (postId) => {
    const res = await axios.delete(`${API_BASE}/waste-posts/${postId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  getByCategory: async (category, page = 1) => {
    const res = await axios.get(`${API_BASE}/waste-posts/category/${category}?page=${page}`);
    return res.data;
  },
};

export default wastePostService;
