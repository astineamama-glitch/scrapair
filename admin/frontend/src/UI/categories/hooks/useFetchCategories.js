import { useState, useEffect } from 'react';
import { categoriesAPI } from '../../../api/categories/categoriesApi';

export const useFetchCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await categoriesAPI.getAll();
        setCategories(Array.isArray(data) ? data : data.data || []);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch categories');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const deleteCategory = async (categoryId) => {
    try {
      await categoriesAPI.delete(categoryId);
      setCategories(categories.filter(c => c.id !== categoryId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category');
      throw err;
    }
  };

  const updateCategory = async (categoryId, data) => {
    try {
      const updated = await categoriesAPI.update(categoryId, data);
      setCategories(categories.map(c => c.id === categoryId ? updated : c));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update category');
      throw err;
    }
  };

  const createCategory = async (data) => {
    try {
      const newCategory = await categoriesAPI.create(data);
      setCategories([...categories, newCategory]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category');
      throw err;
    }
  };

  return { categories, loading, error, deleteCategory, updateCategory, createCategory };
};
