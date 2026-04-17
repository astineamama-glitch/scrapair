import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../shared/context/AuthContext';
import { usePreventBackButton } from '../hooks/usePreventBackButton.js';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, loading, user } = useAuth();

  // ✅ Prevent back button from showing protected pages
  usePreventBackButton(['/business', '/recycler']);

  // ✅ Additional safety: check localStorage token directly
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && !loading) {
      // Token was cleared - already handled by context
    }
  }, [loading]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // ✅ Double-check authentication
  if (!isAuthenticated || !localStorage.getItem('token')) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user?.type !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
