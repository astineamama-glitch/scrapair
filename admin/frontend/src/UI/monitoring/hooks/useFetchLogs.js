import { useState, useEffect } from 'react';
import { monitoringAPI } from '../../../api/monitoring';

export const useFetchLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await monitoringAPI.getLogs();
      setLogs(response.data || []);
    } catch (err) {
      setError(err.error || 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    try {
      await monitoringAPI.clearLogs();
      setLogs([]);
    } catch (err) {
      setError(err.error || 'Failed to clear logs');
      throw err;
    }
  };

  return { logs, loading, error, refetch: fetchLogs, clearLogs };
};
