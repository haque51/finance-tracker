import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import budgetService from '../services/budgetService';
import { getErrorMessage } from '../utils/errorHandler';

export const useBudgets = () => {
  const { budgets, setBudgets, loadBudgets } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createBudget = async (budgetData) => {
    try {
      setLoading(true);
      setError(null);
      const newBudget = await budgetService.createBudget(budgetData);
      setBudgets([...budgets, newBudget]);
      return newBudget;
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBudget = async (id, budgetData) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await budgetService.updateBudget(id, budgetData);
      setBudgets(budgets.map(budget => budget.id === id ? updated : budget));
      return updated;
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBudget = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await budgetService.deleteBudget(id);
      setBudgets(budgets.filter(budget => budget.id !== id));
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshBudgets = async (month, year) => {
    try {
      setLoading(true);
      setError(null);
      await loadBudgets(month, year);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    budgets,
    loading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    refreshBudgets,
  };
};
