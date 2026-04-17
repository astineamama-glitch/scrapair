import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './shared/context/AuthContext';
import { RoleProvider, useRoleContext } from './shared/context/RoleContext';
import { NotificationProvider, useNotifications } from './shared/context/NotificationContext';
import socketService from './services/socketService';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { USER_ROLES, ROLE_ROUTES } from './shared/constants/roles';
// Common Pages
import {
  LandingPage,
  RoleSelectionPage,
  EmailVerificationPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  EditProfilePage,
  ConversationPage,
  MessagesPage,
  NotificationsPage,
  WastePostDetailsPage,
  CollectionDetailPage,
  UserReportsPage
} from './UI/common/pages';

// Business Pages
import {
  BusinessLoginPage,
  BusinessSignupPage,
  BusinessDashboard,
  CreateWastePostPage,
  EditWastePostPage,
  MyPostsPage,
  ManageCollectionRequestsPage,
  PendingApprovalsPage,
  RequestCollectionPage
} from './UI/business/pages';

// Recycler Pages
import {
  RecyclerLoginPage,
  RecyclerSignupPage,
  RecyclerDashboard,
  MarketplacePage,
  ScheduleCollectionPage,
  ApprovedCollectionsPage,
  CollectionsPage
} from './UI/recycler/pages';

// MUI Theme Configuration (Consistent across all pages)
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0F172A', // Deep Slate/Midnight
    },
    secondary: {
      main: '#38BDF8', // Sky Blue accent
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700 },
    h5: { color: '#64748B' }
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, padding: '10px 24px' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' },
      },
    },
  },
});

// Component to set up socket connection when user is authenticated
const AppContent = () => {
  const { user, token } = useAuth();
  const { handleNewNotification } = useNotifications();
  const notificationListenerRef = React.useRef(false);

  useEffect(() => {
    if (user && token) {
      // Connect socket when user logs in
      const socket = socketService.connect(token);
      // Listen for new notifications (only register listener once)
      if (!notificationListenerRef.current) {
        socketService.onNotification((notification) => {
          handleNewNotification(notification);
        });
        notificationListenerRef.current = true;
      }

      return () => {
        // Don't disconnect on unmount, as we need socket throughout the app
      };
    }
  }, [user && token && user.id]); // Only reconnect if user/token actually changes

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/role-selection" element={<RoleSelectionPage />} />
      
      {/* Auth Routes */}
      <Route path="/business/login" element={<BusinessLoginPage />} />
      <Route path="/business/signup" element={<BusinessSignupPage />} />
      <Route path="/recycler/login" element={<RecyclerLoginPage />} />
      <Route path="/recycler/signup" element={<RecyclerSignupPage />} />
      <Route path="/email-verification" element={<EmailVerificationPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      {/* Business Dashboard */}
      <Route 
        path="/business/dashboard" 
        element={
          <ProtectedRoute requiredRole="business">
            <BusinessDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Waste Post Routes (Phase 1) */}
      <Route 
        path="/waste-post/create" 
        element={
          <ProtectedRoute requiredRole="business">
            <CreateWastePostPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/waste-post/edit/:postId" 
        element={
          <ProtectedRoute requiredRole="business">
            <EditWastePostPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/waste-post/:postId" 
        element={<WastePostDetailsPage />}
      />
      <Route 
        path="/business/posts" 
        element={
          <ProtectedRoute requiredRole="business">
            <MyPostsPage />
          </ProtectedRoute>
        } 
      />
      <Route path="/marketplace" element={<MarketplacePage />} />
      
      {/* Collection Routes (Phase 2) */}
      <Route path="/collections" element={<CollectionsPage />} />
      <Route 
        path="/collection/request/:postId" 
        element={
          <ProtectedRoute requiredRole="recycler">
            <RequestCollectionPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/collection/schedule/:collectionId" 
        element={
          <ProtectedRoute requiredRole="business">
            <ScheduleCollectionPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/collection/:collectionId" 
        element={<CollectionDetailPage />}
      />
      
      {/* Messaging Routes (Phase 3) */}
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/messages/:conversationId" element={<ConversationPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      
      {/* Edit Profile Route (Both Business & Recycler) */}
      <Route 
        path="/edit-profile" 
        element={<EditProfilePage />}
      />
      
      {/* Recycler Dashboard */}
      <Route 
        path="/recycler/dashboard" 
        element={
          <ProtectedRoute requiredRole="recycler">
            <RecyclerDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Recycler Approved Collections */}
      <Route 
        path="/recycler/approved-collections" 
        element={
          <ProtectedRoute requiredRole="recycler">
            <ApprovedCollectionsPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Business Pending Approvals */}
      <Route 
        path="/business/pending-approvals" 
        element={
          <ProtectedRoute requiredRole="business">
            <PendingApprovalsPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Business Manage Collection Requests */}
      <Route 
        path="/business/collection-requests" 
        element={
          <ProtectedRoute requiredRole="business">
            <ManageCollectionRequestsPage />
          </ProtectedRoute>
        } 
      />

      {/* User Reports Page */}
      <Route 
        path="/my-reports" 
        element={
          <ProtectedRoute>
            <UserReportsPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;

