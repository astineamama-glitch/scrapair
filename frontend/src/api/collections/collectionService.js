import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const collectionService = {
  // Get available waste posts for collection
  getAvailablePosts: async (filters = {}, page = 1, limit = 20) => {
    const params = new URLSearchParams({ page, limit, ...filters });
    const res = await axios.get(`${API_BASE}/collections/available?${params}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  // Request a collection for a specific waste post
  requestCollection: async (postId, proposedDate, notes = null) => {
    const res = await axios.post(`${API_BASE}/collections/request`, { postId, proposedDate, notes }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  // Get all collections for the current user (as business or recycler)
  getUserCollections: async (status = null, page = 1, limit = 20) => {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append('status', status);
    const res = await axios.get(`${API_BASE}/collections?${params}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  // Approve a collection request (business owner)
  approveCollection: async (collectionId, scheduledDate) => {
    const res = await axios.put(`${API_BASE}/collections/${collectionId}/approve`, { scheduledDate }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  // Reject a collection request (business owner)
  rejectCollection: async (collectionId, reason = null) => {
    const res = await axios.put(`${API_BASE}/collections/${collectionId}/reject`, { reason }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  // Confirm pickup (both recycler and business can confirm)
  confirmPickup: async (collectionId) => {
    const res = await axios.put(`${API_BASE}/collections/${collectionId}/confirm-pickup`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },
};

export default collectionService;
