import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Safe version of useAuth hook - returns default values if not in provider
 * Use this for components that may render before AuthProvider is ready
 */
export const useAuthSafe = () => {
  const context = useContext(AuthContext);
  
  // Return safe defaults if context not available
  if (!context) {
    return {
      user: null,
      token: null,
      loading: false,
      login: () => {},
      logout: () => {},
      updateUser: () => {},
      isAuthenticated: false,
    };
  }

  return context;
};

export default useAuthSafe;
