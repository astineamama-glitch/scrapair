/**
 * useWastePosts Hook (Business)
 * Manages business' own waste posts
 * Handles fetch, create, update, delete operations
 */

import { useState, useCallback, useEffect } from 'react';
import wastePostService from '../../services/wastePostService';

export const useWastePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    sortBy: 'recent',
  });

  // Fetch business' waste posts
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await wastePostService.getOwnPosts({
        status: filters.status === 'all' ? undefined : filters.status,
      });
      setPosts(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [filters.status]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Create waste post
  const createPost = useCallback(async (postData) => {
    try {
      setError('');
      const response = await wastePostService.create(postData);
      setPosts((prev) => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to create post');
      throw err;
    }
  }, []);

  // Update waste post
  const updatePost = useCallback(async (postId, postData) => {
    try {
      setError('');
      const response = await wastePostService.update(postId, postData);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? response.data : p))
      );
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to update post');
      throw err;
    }
  }, []);

  // Delete waste post
  const deletePost = useCallback(async (postId) => {
    try {
      setError('');
      await wastePostService.delete(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      setError(err.message || 'Failed to delete post');
      throw err;
    }
  }, []);

  // Mark post as inactive
  const deactivatePost = useCallback(async (postId) => {
    return updatePost(postId, { status: 'inactive' });
  }, [updatePost]);

  // Mark post as active
  const activatePost = useCallback(async (postId) => {
    return updatePost(postId, { status: 'active' });
  }, [updatePost]);

  // Filter by status
  const setStatus = useCallback((status) => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  // Get stats
  const stats = {
    total: posts.length,
    active: posts.filter((p) => p.status === 'active').length,
    inactive: posts.filter((p) => p.status === 'inactive').length,
    inCollection: posts.filter((p) => p.status === 'in-collection').length,
  };

  return {
    posts,
    loading,
    error,
    filters,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    deactivatePost,
    activatePost,
    setStatus,
    stats,
  };
};
