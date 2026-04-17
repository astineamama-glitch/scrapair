import React, { createContext, useState, useCallback, useEffect } from 'react';
import { authService } from '../../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback((user, token) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  // Business login wrapper
  const businessLogin = useCallback(async (email, password) => {
    const response = await authService.businessLogin(email, password);
    if (response.token && response.user) {
      login(response.user, response.token);
    }
    return response;
  }, [login]);

  // Recycler login wrapper
  const recyclerLogin = useCallback(async (email, password) => {
    const response = await authService.recyclerLogin(email, password);
    if (response.token && response.user) {
      login(response.user, response.token);
    }
    return response;
  }, [login]);

  // Business signup wrapper
  const businessSignup = useCallback(async (data) => {
    const response = await authService.businessSignup(data.email, data.password, data.businessName, data.phone);
    if (response.token && response.user) {
      login(response.user, response.token);
    }
    return response;
  }, [login]);

  // Recycler signup wrapper
  const recyclerSignup = useCallback(async (data) => {
    const response = await authService.recyclerSignup(data.email, data.password, data.companyName, data.phone);
    if (response.token && response.user) {
      login(response.user, response.token);
    }
    return response;
  }, [login]);

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    businessLogin,
    recyclerLogin,
    businessSignup,
    recyclerSignup,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook to use AuthContext
export const useAuthContext = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

// Alias for convenience
export const useAuth = useAuthContext;

export default AuthContext;
