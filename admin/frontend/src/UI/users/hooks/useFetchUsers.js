import { useState, useEffect } from 'react';
import { usersAPI } from '../../../api/user';

export const useFetchUsers = (filters = {}, page = 1, limit = 10) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await usersAPI.getAll(filters, page, limit);
        setUsers(response.users || []);
        setTotalPages(response.pages || 1);
      } catch (err) {
        setError(err.error || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, page, limit]);

  const deleteUser = async (userId) => {
    try {
      await usersAPI.delete(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      setError(err.error || 'Failed to delete user');
      throw err;
    }
  };

  const verifyUser = async (userId, isVerified) => {
    try {
      await usersAPI.verify(userId, !isVerified);
      setUsers(users.map(u => u.id === userId ? { ...u, isVerified: !isVerified } : u));
    } catch (err) {
      setError(err.error || 'Failed to verify user');
      throw err;
    }
  };

  return { users, loading, error, totalPages, deleteUser, verifyUser };
};
