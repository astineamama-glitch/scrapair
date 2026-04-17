import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ratingService = {
  createRating: async (targetId, targetType, rating, comment = '') => {
    const res = await axios.post(`${API_BASE}/ratings`, { targetId, targetType, rating, comment }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  getRatings: async (targetId, targetType, page = 1) => {
    const res = await axios.get(`${API_BASE}/ratings?targetId=${targetId}&targetType=${targetType}&page=${page}`);
    return res.data;
  },

  getAverageRating: async (targetId, targetType) => {
    const res = await axios.get(`${API_BASE}/ratings/${targetId}/average?type=${targetType}`);
    return res.data;
  },

  updateRating: async (ratingId, rating, comment) => {
    const res = await axios.put(`${API_BASE}/ratings/${ratingId}`, { rating, comment }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  deleteRating: async (ratingId) => {
    const res = await axios.delete(`${API_BASE}/ratings/${ratingId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  getMyRatings: async (page = 1) => {
    const res = await axios.get(`${API_BASE}/ratings/my-ratings?page=${page}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },
};

export default ratingService;
