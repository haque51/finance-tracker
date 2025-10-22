/**
 * App Context
 * Global application state management for authentication and data
 */

import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import accountService from '../services/accountService';
import transactionService from '../services/transactionService';
import categoryService from '../services/categoryService';
import budgetService from '../services/budgetService';
import goalService from '../services/goalService';
import recurringService from '../services/recurringService';
import analyticsService from '../services/analyticsService';
import currencyService from '../services/currencyService';
import tokenManager from '../services/tokenManager';

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
      const token = tokenManager.getToken();
      const savedUser = tokenManager.getUser();

      console.log('🔐 Auth Init - Token exists:', !!token, 'User exists:', !!savedUser);

      if (token && savedUser) {
        // Trust the stored token and user
        // Don't verify with backend on every page load to avoid delays
        setUser(savedUser);
        setIsAuthenticated(true);
        console.log('✅ Auth restored from localStorage:', savedUser.email);
      } else {
        console.log('❌ No auth found in localStorage');
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
   * Create multiple categories in bulk (for new users)
   */
  const createCategoriesBulk = async (categoriesArray) => {
    try {
      const data = await categoryService.createCategoriesBulk(categoriesArray);
      return data;
    } catch (error) {
      console.error('Failed to create categories in bulk:', error);
      throw error;
    }
  };

  /**
   * Load budgets from API (Phase 4)
   */
  const loadBudgets = async (month, year) => {
    try {
      const data = await budgetService.getBudgets(month, year);
      setBudgets(data);
      return data;
    } catch (error) {
      console.error('Failed to load budgets:', error);
      throw error;
    }
  };

  /**
   * Load goals from API (Phase 4)
   */
  const loadGoals = async (status) => {
    try {
      const data = await goalService.getGoals(status);
      setGoals(data);
      return data;
    } catch (error) {
      console.error('Failed to load goals:', error);
      throw error;
    }
  };

  /**
   * Load recurring transactions from API (Phase 4)
   */
  const loadRecurringTransactions = async () => {
    try {
      const data = await recurringService.getRecurringTransactions();
      setRecurringTransactions(data);
      return data;
    } catch (error) {
      console.error('Failed to load recurring transactions:', error);
      throw error;
    }
  };

  /**
   * Load exchange rates from API (Phase 4)
   */
  const loadExchangeRates = async () => {
    try {
      const data = await currencyService.getExchangeRates();
      // Convert array to object for easier lookup
      const ratesObject = {};
      data.forEach(rate => {
        const key = `${rate.base_currency}_${rate.target_currency}`;
        ratesObject[key] = rate.rate;
      });
      setExchangeRates(ratesObject);
      return ratesObject;
    } catch (error) {
      console.error('Failed to load exchange rates:', error);
      throw error;
    }
  };

  /**
   * Load dashboard data (Phase 4)
   */
  const loadDashboard = async (month) => {
    try {
      const data = await analyticsService.getDashboard(month);
      return data;
    } catch (error) {
      console.error('Failed to load dashboard:', error);
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
      console.log('🔑 Attempting login for:', email);
      const response = await authService.login({ email, password });
      console.log('📦 Login response structure:', {
        hasUser: !!response.user,
        hasToken: !!response.token,
        hasRefreshToken: !!response.refreshToken,
        userName: response.user?.name,
        userEmail: response.user?.email
      });

      // authService.login returns { user, token, refreshToken }
      // We only need to set the user object in state (tokens are already stored by authService)
      setUser(response.user);
      setIsAuthenticated(true);

      // Verify tokens were stored
      const storedToken = tokenManager.getToken();
      const storedUser = tokenManager.getUser();

      console.log('✅ Login successful - User set:', response.user?.email);
      console.log('✅ isAuthenticated set to: true');
      console.log('💾 Verification - Token stored:', !!storedToken);
      console.log('💾 Verification - User stored:', !!storedUser);
      console.log('👤 Stored user data:', storedUser);

      if (!storedToken || !storedUser) {
        console.error('⚠️ WARNING: Tokens or user not stored in localStorage!');
      }

      return response.user;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  /**
   * Register new user
   * @param {Object} userData - Registration data
   */
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      // authService.register returns { user, token, refreshToken }
      // We only need to set the user object in state (tokens are already stored by authService)
      setUser(response.user);
      setIsAuthenticated(true);
      return response.user;
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
    createCategoriesBulk,
    initializeAppData,

    // Phase 4 loading functions
    loadBudgets,
    loadGoals,
    loadRecurringTransactions,
    loadExchangeRates,
    loadDashboard,
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
