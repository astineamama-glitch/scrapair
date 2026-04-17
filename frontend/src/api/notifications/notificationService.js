import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const notificationService = {
  getNotifications: async (page = 1, limit = 20) => {
    const res = await axios.get(`${API_BASE}/notifications?page=${page}&limit=${limit}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  markAsRead: async (notificationId) => {
    const res = await axios.put(`${API_BASE}/notifications/${notificationId}/read`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  getUnreadCount: async () => {
    const res = await axios.get(`${API_BASE}/notifications/unread-count`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  deleteNotification: async (notificationId) => {
    const res = await axios.delete(`${API_BASE}/notifications/${notificationId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },
};

export default notificationService;
