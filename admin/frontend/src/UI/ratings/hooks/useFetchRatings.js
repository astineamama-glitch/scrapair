import { useState, useEffect } from 'react';
import { ratingsAPI } from '../../../api/ratings';

export const useFetchRatings = () => {
  const [ratings, setRatings] = useState({ users: [], posts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [usersData, postsData] = await Promise.all([
          ratingsAPI.getUsers(),
          ratingsAPI.getPosts()
        ]);
        setRatings({
          users: usersData.data || [],
          posts: postsData.data || []
        });
      } catch (err) {
        setError(err.error || 'Failed to fetch ratings');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { ratings, loading, error };
};
