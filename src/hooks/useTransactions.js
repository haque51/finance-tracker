import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import transactionService from '../services/transactionService';
import { getErrorMessage } from '../utils/errorHandler';

/**
 * Custom hook for transaction operations
 */
export const useTransactions = () => {
  const { transactions, setTransactions, loadTransactions, loadAccounts } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createTransaction = async (transactionData) => {
    try {
      setLoading(true);
      setError(null);
      const newTransaction = await transactionService.createTransaction(transactionData);
      setTransactions([newTransaction, ...transactions]);
      // Refresh accounts to update balances
      await loadAccounts();
      return newTransaction;
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (id, transactionData) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await transactionService.updateTransaction(id, transactionData);
      setTransactions(transactions.map(txn => txn.id === id ? updated : txn));
      // Refresh accounts to update balances
      await loadAccounts();
      return updated;
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await transactionService.deleteTransaction(id);
      setTransactions(transactions.filter(txn => txn.id !== id));
      // Refresh accounts to update balances
      await loadAccounts();
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleReconciliation = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await transactionService.toggleReconciliation(id);
      setTransactions(transactions.map(txn => txn.id === id ? updated : txn));
      return updated;
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshTransactions = async (filters, page, limit) => {
    try {
      setLoading(true);
      setError(null);
      const data = await loadTransactions(filters, page, limit);
      return data;
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    transactions,
    loading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    toggleReconciliation,
    refreshTransactions,
  };
};
