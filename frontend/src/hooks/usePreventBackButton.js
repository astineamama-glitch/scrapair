import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook to prevent browser back-button from showing protected pages after logout
 * 
 * Usage:
 *   const ProtectedComponent = () => {
 *     usePreventBackButton(['/business', '/recycler']);
 *     return <Dashboard />;
 *   };
 * 
 * How it works:
 * 1. Listens for browser back button (popstate event)
 * 2. On back, checks if user still has token in localStorage
 * 3. If no token → Redirects to home page
 * 4. Prevents showing cached pages of protected routes
 * 
 * @param {string[]} protectedRoutes - Array of route prefixes to protect (e.g., ['/business', '/recycler'])
 * @param {string} redirectTo - Where to redirect if not authenticated (default: '/')
 */
export const usePreventBackButton = (
  protectedRoutes = [],
  redirectTo = '/'
) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle browser back button press
    const handlePopState = (event) => {
      // Get current route path
      const currentPath = window.location.pathname;

      // Check if this is a protected route
      const isProtectedRoute = protectedRoutes.some(route =>
        currentPath.startsWith(route)
      );

      if (isProtectedRoute) {
        // Check if user still has valid token
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        // If no token or user, force redirect
        if (!token || !user) {
          event.preventDefault();
          navigate(redirectTo, { replace: true });
        }
      }
    };

    // Listen for browser back/forward button
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate, protectedRoutes, redirectTo]);
};

export default usePreventBackButton;
