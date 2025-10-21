import React, { createContext, useState, useEffect } from 'react';
import accountService from '../services/accountService';
import transactionService from '../services/transactionService';
import categoryService from '../services/categoryService';
import tokenManager from '../services/tokenManager';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = tokenManager.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const userData = tokenManager.getUser();
        setUser(userData);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  /**
   * Load accounts from API
   */
  const loadAccounts = async (filters = {}) => {
    try {
      const data = await accountService.getAccounts(filters);
      setAccounts(data);
      return data;
    } catch (error) {
      console.error('Failed to load accounts:', error);
      throw error;
    }
  };

  /**
   * Load transactions from API
   */
  const loadTransactions = async (filters = {}, page = 1, limit = 50) => {
    try {
      const data = await transactionService.getTransactions(filters, page, limit);
      setTransactions(data.transactions);
      return data;
    } catch (error) {
      console.error('Failed to load transactions:', error);
      throw error;
    }
  };

  /**
   * Load categories from API
   */
  const loadCategories = async (filters = {}) => {
    try {
      const data = await categoryService.getCategoriesTree();
      setCategories(data);
      return data;
    } catch (error) {
      console.error('Failed to load categories:', error);
      throw error;
    }
  };

  /**
   * Login user
   */
  const login = (userData, token, refreshToken) => {
    tokenManager.setTokens(token, refreshToken);
    tokenManager.setUser(userData);
    setUser(userData);
    setIsAuthenticated(true);
  };

  /**
   * Logout user
   */
  const logout = () => {
    tokenManager.clearTokens();
    setUser(null);
    setIsAuthenticated(false);
    setAccounts([]);
    setTransactions([]);
    setCategories([]);
  };

  /**
   * Initialize app data (load accounts, categories after login)
   */
  const initializeAppData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadAccounts(),
        loadCategories(),
      ]);
    } catch (error) {
      console.error('Failed to initialize app data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    // User state
    user,
    setUser,
    isAuthenticated,
    isLoading,
    login,
    logout,

    // Data state
    accounts,
    setAccounts,
    transactions,
    setTransactions,
    categories,
    setCategories,

    // Data loading functions
    loadAccounts,
    loadTransactions,
    loadCategories,
    initializeAppData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
