/**
 * useCollectionHistory Hook (Recycler)
 * Manages recycler's collection history and statistics
 * Tracks past collections, ratings, earnings
 */

import { useState, useCallback, useEffect } from 'react';

export const useCollectionHistory = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
  });

  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.dateRange !== 'all') params.append('dateRange', filters.dateRange);

      const response = await fetch(`${apiUrl}/recycler/collections?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch collections');
      const data = await response.json();
      setCollections(data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load collections');
      setCollections([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  // Rate a completed collection
  const rateCollection = useCallback(async (collectionId, rating, review) => {
    try {
      setError('');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(
        `${apiUrl}/collections/${collectionId}/rate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ rating, review }),
        }
      );

      if (!response.ok) throw new Error('Failed to submit rating');

      // Update collection with rating
      setCollections((prev) =>
        prev.map((c) =>
          c.id === collectionId
            ? { ...c, rating, review, hasRated: true }
            : c
        )
      );
    } catch (err) {
      setError(err.message || 'Failed to submit rating');
      throw err;
    }
  }, []);

  // Filter by status
  const setStatusFilter = useCallback((status) => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  // Filter by date range
  const setDateRangeFilter = useCallback((dateRange) => {
    setFilters((prev) => ({ ...prev, dateRange }));
  }, []);

  // Calculate stats
  const stats = {
    totalCollections: collections.length,
    completedCollections: collections.filter((c) => c.status === 'completed').length,
    cancelledCollections: collections.filter((c) => c.status === 'cancelled').length,
    averageRating:
      collections.filter((c) => c.rating).length > 0
        ? (
            collections
              .filter((c) => c.rating)
              .reduce((sum, c) => sum + c.rating, 0) /
            collections.filter((c) => c.rating).length
          ).toFixed(1)
        : 0,
    totalMaterialsCollected: collections.reduce(
      (sum, c) => sum + (c.materialCount || 0),
      0
    ),
  };

  return {
    collections,
    loading,
    error,
    filters,
    fetchCollections,
    rateCollection,
    setStatusFilter,
    setDateRangeFilter,
    stats,
  };
};
