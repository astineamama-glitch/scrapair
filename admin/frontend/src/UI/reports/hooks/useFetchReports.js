import { useState, useEffect } from 'react';
import { reportsAPI } from '../../../api/reports';

export const useFetchReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await reportsAPI.getAll();
        setReports(response.data || []);
      } catch (err) {
        setError(err.error || 'Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { reports, loading, error };
};
