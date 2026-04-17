/**
 * useCollectionRequests Hook (Business)
 * Manages incoming collection requests from recyclers
 * Handles approve, reject, and status tracking
 */

import { useState, useCallback, useEffect } from 'react';

export const useCollectionRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'pending',
  });

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      // TODO: Replace with actual API call
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(
        `${apiUrl}/collections/requests?status=${filters.status}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [filters.status]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Approve collection request
  const approveRequest = useCallback(async (requestId, approvalData) => {
    try {
      setError('');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/collections/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(approvalData || {}),
      });

      if (!response.ok) throw new Error('Failed to approve request');
      const data = await response.json();

      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'approved' } : r))
      );

      return data.data;
    } catch (err) {
      setError(err.message || 'Failed to approve request');
      throw err;
    }
  }, []);

  // Reject collection request
  const rejectRequest = useCallback(async (requestId, reason) => {
    try {
      setError('');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/collections/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reason: reason || '' }),
      });

      if (!response.ok) throw new Error('Failed to reject request');

      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected' } : r))
      );
    } catch (err) {
      setError(err.message || 'Failed to reject request');
      throw err;
    }
  }, []);

  // Cancel scheduled collection
  const cancelRequest = useCallback(async (requestId) => {
    try {
      setError('');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/collections/${requestId}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to cancel request');

      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'cancelled' } : r))
      );
    } catch (err) {
      setError(err.message || 'Failed to cancel request');
      throw err;
    }
  }, []);

  // Filter by status
  const setStatusFilter = useCallback((status) => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  // Get stats
  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
    completed: requests.filter((r) => r.status === 'completed').length,
  };

  return {
    requests,
    loading,
    error,
    filters,
    fetchRequests,
    approveRequest,
    rejectRequest,
    cancelRequest,
    setStatusFilter,
    stats,
  };
};
