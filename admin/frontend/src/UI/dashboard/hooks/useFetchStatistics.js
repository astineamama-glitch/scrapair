import { useState, useEffect } from 'react';
import { dashboardAPI } from '../../../api/dashboard';

export const useFetchStatistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await dashboardAPI.getStatistics();
        setStatistics(response.statistics || response.data);
      } catch (err) {
        setError(err.error || 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { statistics, loading, error };
};
