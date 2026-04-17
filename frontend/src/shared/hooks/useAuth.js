import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * useAuth hook - provides access to authentication state and methods from context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default useAuth;
