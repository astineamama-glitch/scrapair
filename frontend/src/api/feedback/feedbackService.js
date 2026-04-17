import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const feedbackService = {
  submitFeedback: async (feedbackData) => {
    const res = await axios.post(`${API_BASE}/feedback`, feedbackData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  getMyFeedback: async (page = 1) => {
    const res = await axios.get(`${API_BASE}/feedback/my-feedback?page=${page}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  getFeedbackStats: async () => {
    const res = await axios.get(`${API_BASE}/feedback/stats`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  reportIssue: async (issueData) => {
    const res = await axios.post(`${API_BASE}/feedback/report`, issueData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  suggestFeature: async (suggestion) => {
    const res = await axios.post(`${API_BASE}/feedback/suggest-feature`, { suggestion }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },
};

export default feedbackService;
