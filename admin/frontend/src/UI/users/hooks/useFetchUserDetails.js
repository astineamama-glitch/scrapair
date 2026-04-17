import { useState, useEffect } from 'react';
import { usersAPI } from '../../../api/user';

export const useFetchUserDetails = (userId) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await usersAPI.getById(userId);
        setUser(response.user);
      } catch (err) {
        setError(err.error || 'Failed to fetch user details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const verifyUser = async (isVerified) => {
    try {
      await usersAPI.verify(userId, !isVerified);
      setUser({ ...user, isVerified: !isVerified });
    } catch (err) {
      setError(err.error || 'Failed to verify user');
      throw err;
    }
  };

  const deleteUser = async () => {
    try {
      await usersAPI.delete(userId);
      return true;
    } catch (err) {
      setError(err.error || 'Failed to delete user');
      throw err;
    }
  };

  return { user, loading, error, verifyUser, deleteUser };
};
