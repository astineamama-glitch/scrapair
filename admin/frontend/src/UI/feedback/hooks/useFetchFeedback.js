/**
 * useFetchFeedback Hook
 * Custom hook for fetching feedback with filters and pagination
 */

import { useState, useEffect, useCallback } from 'react';
import feedbackAPI from '../../../api/feedback/feedbackApi';

export const useFetchFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({});

  const fetchFeedback = useCallback(async (page = 1, newFilters = {}) => {
    try {
      setLoading(true);
      setError('');
      const response = await feedbackAPI.getAll(page, pagination.limit, newFilters);
      
      setFeedback(response.data || []);
      setPagination({
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 20,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 0
      });
      setFilters(newFilters);
    } catch (err) {
      setError(err.message || 'Failed to fetch feedback');
      setFeedback([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    fetchFeedback(1, {});
  }, [fetchFeedback]);

  const goToPage = (page) => {
    fetchFeedback(page, filters);
  };

  const applyFilters = (newFilters) => {
    fetchFeedback(1, newFilters);
  };

  const refresh = () => {
    fetchFeedback(pagination.page, filters);
  };

  return {
    feedback,
    loading,
    error,
    pagination,
    filters,
    goToPage,
    applyFilters,
    refresh
  };
};

export default useFetchFeedback;
