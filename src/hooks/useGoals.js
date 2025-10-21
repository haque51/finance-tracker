import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import goalService from '../services/goalService';
import { getErrorMessage } from '../utils/errorHandler';

export const useGoals = () => {
  const { goals, setGoals, loadGoals } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createGoal = async (goalData) => {
    try {
      setLoading(true);
      setError(null);
      const newGoal = await goalService.createGoal(goalData);
      setGoals([...goals, newGoal]);
      return newGoal;
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateGoal = async (id, goalData) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await goalService.updateGoal(id, goalData);
      setGoals(goals.map(goal => goal.id === id ? updated : goal));
      return updated;
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await goalService.deleteGoal(id);
      setGoals(goals.filter(goal => goal.id !== id));
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshGoals = async (status) => {
    try {
      setLoading(true);
      setError(null);
      await loadGoals(status);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    refreshGoals,
  };
};
