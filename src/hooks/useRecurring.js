import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import recurringService from '../services/recurringService';
import { getErrorMessage } from '../utils/errorHandler';

/**
 * Custom hook for recurring transaction operations
 */
export const useRecurring = () => {
  const { recurringTransactions, setRecurringTransactions, loadRecurringTransactions, loadTransactions, loadAccounts } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createRecurring = async (recurringData) => {
    try {
      setLoading(true);
      setError(null);
      const newRecurring = await recurringService.createRecurring(recurringData);
      setRecurringTransactions([...recurringTransactions, newRecurring]);
      return newRecurring;
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRecurring = async (id, recurringData) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await recurringService.updateRecurring(id, recurringData);
      setRecurringTransactions(recurringTransactions.map(rec => rec.id === id ? updated : rec));
      return updated;
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRecurring = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await recurringService.deleteRecurring(id);
      setRecurringTransactions(recurringTransactions.filter(rec => rec.id !== id));
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const processRecurring = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await recurringService.processRecurring();
      // Refresh transactions and accounts after processing
      await loadTransactions();
      await loadAccounts();
      return result;
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshRecurring = async () => {
    try {
      setLoading(true);
      setError(null);
      await loadRecurringTransactions();
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    recurringTransactions,
    loading,
    error,
    createRecurring,
    updateRecurring,
    deleteRecurring,
    processRecurring,
    refreshRecurring,
  };
};
