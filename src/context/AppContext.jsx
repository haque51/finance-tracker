/**
 * App Context
 * Global application state management for authentication and data
 */

import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import accountService from '../services/accountService';
import transactionService from '../services/transactionService';
import categoryService from '../services/categoryService';
import { getUser, getAccessToken } from '../utils/tokenManager';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // State for app data
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [exchangeRates, setExchangeRates] = useState({});

  // Check if user is logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      const savedUser = getUser();

      if (token && savedUser) {
        try {
          // Verify token is still valid by fetching current user
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          setIsAuthenticated(true);
        } catch (error) {
          // Token expired or invalid
          console.error('Auth initialization failed:', error);
          setUser(null);
          setIsAuthenticated(false);
        }
      }

      setIsLoading(false);
    };

    initAuth();
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
   * @param {string} email - User email
   * @param {string} password - User password
   */
  const login = async (email, password) => {
    try {
      const user = await authService.login(email, password);
      setUser(user);
      setIsAuthenticated(true);
      return user;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Register new user
   * @param {Object} userData - Registration data
   */
  const register = async (userData) => {
    try {
      const user = await authService.register(userData);
      setUser(user);
      setIsAuthenticated(true);
      return user;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);

      // Clear all app data
      setAccounts([]);
      setTransactions([]);
      setCategories([]);
      setBudgets([]);
      setGoals([]);
      setRecurringTransactions([]);
      setExchangeRates({});
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear state even if API call fails
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  /**
   * Update user profile
   * @param {Object} updates - User updates
   */
  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    // Note: This only updates local state
    // Backend profile update will be added in Settings integration
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
    // Auth state
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,

    // App data state
    accounts,
    setAccounts,
    transactions,
    setTransactions,
    categories,
    setCategories,
    budgets,
    setBudgets,
    goals,
    setGoals,
    recurringTransactions,
    setRecurringTransactions,
    exchangeRates,
    setExchangeRates,

    // Data loading functions (Phase 3)
    loadAccounts,
    loadTransactions,
    loadCategories,
    initializeAppData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook for using the context
export const useApp = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
