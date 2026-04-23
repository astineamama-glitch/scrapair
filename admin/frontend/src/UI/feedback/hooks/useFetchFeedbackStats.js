/**
 * useFetchFeedbackStats Hook
 * Custom hook for fetching feedback statistics
 */

import { useState, useEffect } from 'react';
import feedbackAPI from '../../../api/feedback/feedbackApi';

export const useFetchFeedbackStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await feedbackAPI.getStats();
        setStats(response.data || null);
      } catch (err) {
        setError(err.message || 'Failed to fetch feedback statistics');
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const refresh = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await feedbackAPI.getStats();
      setStats(response.data || null);
    } catch (err) {
      setError(err.message || 'Failed to fetch feedback statistics');
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, refresh };
};

export default useFetchFeedbackStats;
