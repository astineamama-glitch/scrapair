import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const messageService = {
  getConversations: async (page = 1) => {
    const res = await axios.get(`${API_BASE}/messages/conversations?page=${page}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  getMessages: async (conversationId, page = 1) => {
    const res = await axios.get(`${API_BASE}/messages/${conversationId}?page=${page}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  sendMessage: async (conversationId, message) => {
    const res = await axios.post(`${API_BASE}/messages/${conversationId}`, { message }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  startConversation: async (participantId, initialMessage = '') => {
    const res = await axios.post(`${API_BASE}/messages/start`, { participantId, initialMessage }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  markAsRead: async (conversationId) => {
    const res = await axios.put(`${API_BASE}/messages/${conversationId}/read`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  deleteConversation: async (conversationId) => {
    const res = await axios.delete(`${API_BASE}/messages/${conversationId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },
};

export default messageService;
