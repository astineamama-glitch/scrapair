import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Protected Route - Checks if admin is authenticated
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
