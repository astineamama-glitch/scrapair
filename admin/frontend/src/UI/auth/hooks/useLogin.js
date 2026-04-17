import { useState } from 'react';
import { authAPI } from '../../../api';

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (username, password) => {
    try {
      setLoading(true);
      setError('');
      const response = await authAPI.login(username, password);
      return response;
    } catch (err) {
      setError(err.error || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};
