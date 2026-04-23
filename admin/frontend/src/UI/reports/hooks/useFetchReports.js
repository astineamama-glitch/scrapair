import { useState, useEffect, useCallback } from 'react';
import { reportsAPI } from '../../../api/reports';

export const useFetchReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({});

  const fetchReports = useCallback(async (page = 1, newFilters = {}) => {
    try {
      setLoading(true);
      setError('');
      const response = await reportsAPI.getAll(page, pagination.limit, newFilters);
      
      setReports(response.data || []);
      setPagination({
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 20,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 0
      });
      setFilters(newFilters);
    } catch (err) {
      setError(err.error || 'Failed to fetch reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    fetchReports(1, {});
  }, [fetchReports]);

  const goToPage = (page) => {
    fetchReports(page, filters);
  };

  const applyFilters = (newFilters) => {
    fetchReports(1, newFilters);
  };

  const refresh = () => {
    fetchReports(pagination.page, filters);
  };

  return { reports, loading, error, pagination, filters, goToPage, applyFilters, refresh };
};
