import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const reportService = {
  // Create a new report
  createReport: async (reportData) => {
    const res = await axios.post(`${API_BASE}/reports`, reportData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  // Get all reports submitted by the current user
  getMyReports: async (page = 1, limit = 20) => {
    const res = await axios.get(`${API_BASE}/reports?page=${page}&limit=${limit}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  // Get report details
  getReportDetails: async (reportId) => {
    const res = await axios.get(`${API_BASE}/reports/${reportId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  // Update a report
  updateReport: async (reportId, updates) => {
    const res = await axios.put(`${API_BASE}/reports/${reportId}`, updates, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  // Delete a report
  deleteReport: async (reportId) => {
    const res = await axios.delete(`${API_BASE}/reports/${reportId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },
};

export default reportService;
