import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5498';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✅ Token injection happens ONCE here (not in every page)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Standardized error response handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorData = error.response?.data || { error: error.message || 'Request failed' };
    return Promise.reject(errorData);
  }
);

export default apiClient;
