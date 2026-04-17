/**
 * useMarketplaceSearch Hook (Recycler)
 * Manages marketplace search/filter with debouncing
 * Handles waste material discovery
 */

import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from '../../shared/hooks/useDebounce';
import wastePostService from '../../services/wastePostService';

export const useMarketplaceSearch = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);

  const [rawFilters, setRawFilters] = useState({
    searchQuery: '',
    wasteType: '',
    city: '',
  });

  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(rawFilters.searchQuery, 500);

  // Create effective filters with debounced search
  const filters = {
    ...rawFilters,
    searchQuery: debouncedSearchQuery,
  };

  // Fetch categories once on mount
  const fetchCategories = useCallback(async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/waste-posts/categories`);
      const data = await response.json();
      setCategories(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch materials based on filters
  const searchMaterials = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await wastePostService.getMarketplace({
        wasteType: filters.wasteType || undefined,
        city: filters.city || undefined,
        searchQuery: filters.searchQuery || undefined,
      });
      setMaterials(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to search materials');
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Trigger search when debounced filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      searchMaterials();
    }, 300); // Small delay to batch rapid filter changes

    return () => clearTimeout(timer);
  }, [filters, searchMaterials]);

  // Update filter without debounce
  const updateFilter = useCallback((filterName, value) => {
    setRawFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setRawFilters({
      searchQuery: '',
      wasteType: '',
      city: '',
    });
  }, []);

  // Group materials by status
  const activeMaterials = materials.filter((m) => m.status === 'active');
  const inCollectionMaterials = materials.filter((m) => m.status === 'in-collection');

  return {
    materials,
    activeMaterials,
    inCollectionMaterials,
    loading,
    error,
    categories,
    rawFilters,
    filters,
    updateFilter,
    clearFilters,
    searchMaterials,
  };
};
