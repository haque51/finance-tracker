import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import categoryService from '../services/categoryService';
import { getErrorMessage } from '../utils/errorHandler';

/**
 * Custom hook for category operations
 */
export const useCategories = () => {
  const { categories, setCategories, loadCategories } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCategory = async (categoryData) => {
    try {
      setLoading(true);
      setError(null);
      const newCategory = await categoryService.createCategory(categoryData);
      // Reload tree structure to maintain hierarchy
      await loadCategories();
      return newCategory;
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id, categoryData) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await categoryService.updateCategory(id, categoryData);
      // Reload tree structure to maintain hierarchy
      await loadCategories();
      return updated;
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await categoryService.deleteCategory(id);
      // Reload tree structure
      await loadCategories();
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      await loadCategories();
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshCategories,
  };
};
