import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import ProtectedRoute from './shared/components/ProtectedRoute';
import AdminNavigation from './shared/components/AdminNavigation';
import LoginPage from './UI/auth/pages/LoginPage';
import AdminDashboard from './UI/dashboard/pages/AdminDashboard';
import AdminUsersPage from './UI/users/pages/AdminUsersPage';
import AdminUserDetailsPage from './UI/users/pages/AdminUserDetailsPage';
import AdminRatingsPage from './UI/ratings/pages/AdminRatingsPage';
import AdminReportsPage from './UI/reports/pages/AdminReportsPage';
import AdminFeedbackPage from './UI/feedback/pages/AdminFeedbackPage';
import AdminSystemLogsPage from './UI/monitoring/pages/AdminSystemLogsPage';
import AdminCategoriesPage from './UI/categories/pages/AdminCategoriesPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#27ae60'
    },
    secondary: {
      main: '#3498db'
    },
    background: {
      default: '#f8f9fa'
    }
  },
  typography: {
    fontFamily: "'Roboto', sans-serif"
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AdminNavigation />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <ProtectedRoute>
                <AdminUserDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/ratings"
            element={
              <ProtectedRoute>
                <AdminRatingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute>
                <AdminReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/feedback"
            element={
              <ProtectedRoute>
                <AdminFeedbackPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <ProtectedRoute>
                <AdminSystemLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute>
                <AdminCategoriesPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
