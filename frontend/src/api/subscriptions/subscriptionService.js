import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const subscriptionService = {
  getPlans: async () => {
    const res = await axios.get(`${API_BASE}/subscriptions/plans`);
    return res.data;
  },

  subscribeToPlan: async (planId, paymentMethod) => {
    const res = await axios.post(`${API_BASE}/subscriptions/subscribe`, { planId, paymentMethod }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  getCurrentSubscription: async () => {
    const res = await axios.get(`${API_BASE}/subscriptions/current`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  upgradePlan: async (newPlanId) => {
    const res = await axios.post(`${API_BASE}/subscriptions/upgrade`, { newPlanId }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  cancelSubscription: async () => {
    const res = await axios.post(`${API_BASE}/subscriptions/cancel`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },

  getInvoices: async (page = 1) => {
    const res = await axios.get(`${API_BASE}/subscriptions/invoices?page=${page}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.data;
  },
};

export default subscriptionService;
