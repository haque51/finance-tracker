import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import accountService from '../services/accountService';
import { getErrorMessage } from '../utils/errorHandler';

/**
 * Custom hook for account operations
 */
export const useAccounts = () => {
  const { accounts, setAccounts, loadAccounts } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createAccount = async (accountData) => {
    try {
      setLoading(true);
      setError(null);
      const newAccount = await accountService.createAccount(accountData);
      setAccounts([...accounts, newAccount]);
      return newAccount;
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAccount = async (id, accountData) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await accountService.updateAccount(id, accountData);
      setAccounts(accounts.map(acc => acc.id === id ? updated : acc));
      return updated;
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await accountService.deleteAccount(id);
      setAccounts(accounts.filter(acc => acc.id !== id));
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      await loadAccounts();
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    accounts,
    loading,
    error,
    createAccount,
    updateAccount,
    deleteAccount,
    refreshAccounts,
  };
};
