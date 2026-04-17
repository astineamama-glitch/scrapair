import apiClient from '../../services/api';

const authService = {
  // Business-specific login
  businessLogin: async (email, password) => {
    const res = await apiClient.post(`/auth/business/login`, { email, password });
    const token = res.data.accessToken || res.data.token;
    if (token) localStorage.setItem('token', token);
    if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
    return { ...res.data, token };
  },

  // Recycler-specific login
  recyclerLogin: async (email, password) => {
    const res = await apiClient.post(`/auth/recycler/login`, { email, password });
    const token = res.data.accessToken || res.data.token;
    if (token) localStorage.setItem('token', token);
    if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
    return { ...res.data, token };
  },

  // Generic login (for backwards compatibility)
  login: async (email, password) => {
    const res = await apiClient.post(`/auth/business/login`, { email, password });
    const token = res.data.accessToken || res.data.token;
    if (token) localStorage.setItem('token', token);
    if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
    return { ...res.data, token };
  },

  // Business signup
  businessSignup: async (email, password, businessName, phoneNumber) => {
    const res = await apiClient.post(`/auth/business/signup`, { 
      email, 
      password, 
      businessName, 
      phone: phoneNumber 
    });
    if (res.data.token) localStorage.setItem('token', res.data.token);
    if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data;
  },

  // Recycler signup
  recyclerSignup: async (email, password, companyName, phoneNumber) => {
    const res = await apiClient.post(`/auth/recycler/signup`, { 
      email, 
      password, 
      companyName, 
      phone: phoneNumber 
    });
    if (res.data.token) localStorage.setItem('token', res.data.token);
    if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data;
  },

  // Generic signup (for backwards compatibility)
  register: async (email, password, role, businessName, phoneNumber) => {
    const endpoint = role === 'business' ? 'business/signup' : 'recycler/signup';
    const payload = role === 'business' 
      ? { email, password, businessName, phone: phoneNumber }
      : { email, password, name: businessName, phone: phoneNumber };
    
    const res = await apiClient.post(`/auth/${endpoint}`, payload);
    if (res.data.token) localStorage.setItem('token', res.data.token);
    if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  verifyEmail: async (email, code) => {
    const res = await apiClient.post(`/auth/verify-email`, { email, code });
    const token = res.data.accessToken || res.data.token;
    if (token) localStorage.setItem('token', token);
    if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
    return { ...res.data, token };
  },

  resetPassword: async (email) => {
    const res = await apiClient.post(`/auth/reset-password`, { email });
    return res.data;
  },

  setNewPassword: async (token, newPassword) => {
    const res = await apiClient.post(`/auth/set-password`, { token, newPassword });
    return res.data;
  },

  checkTokenValidity: async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const res = await apiClient.get(`/auth/verify`, { headers: { Authorization: `Bearer ${token}` } });
      return res.data.valid;
    } catch {
      return false;
    }
  },
};

export default authService;
