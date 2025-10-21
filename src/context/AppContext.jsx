import React, { createContext, useState, useEffect } from 'react';
import budgetService from '../services/budgetService';
import goalService from '../services/goalService';
import recurringService from '../services/recurringService';
import analyticsService from '../services/analyticsService';
import currencyService from '../services/currencyService';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Authentication state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Core data state
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  // Phase 4 data state
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [exchangeRates, setExchangeRates] = useState({});

  // Loading state
  const [loading, setLoading] = useState(false);

  /**
   * Initialize app data on mount
   */
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  /**
   * Load accounts from API
   * This would be implemented in Phase 3
   */
  const loadAccounts = async () => {
    try {
      // Placeholder - would call accountService.getAccounts()
      console.log('loadAccounts called');
      return [];
    } catch (error) {
      console.error('Failed to load accounts:', error);
      throw error;
    }
  };

  /**
   * Load transactions from API
   * This would be implemented in Phase 3
   */
  const loadTransactions = async (filters) => {
    try {
      // Placeholder - would call transactionService.getTransactions(filters)
      console.log('loadTransactions called with filters:', filters);
      return [];
    } catch (error) {
      console.error('Failed to load transactions:', error);
      throw error;
    }
  };

  /**
   * Load categories from API
   * This would be implemented in Phase 3
   */
  const loadCategories = async () => {
    try {
      // Placeholder - would call categoryService.getCategories()
      console.log('loadCategories called');
      return [];
    } catch (error) {
      console.error('Failed to load categories:', error);
      throw error;
    }
  };

  /**
   * Load budgets from API
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
   * Load goals from API
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
   * Load recurring transactions from API
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
   * Load exchange rates from API
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
   * Load dashboard data
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
   */
  const login = (userData, token) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  /**
   * Logout user
   */
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    // Clear all data
    setAccounts([]);
    setTransactions([]);
    setCategories([]);
    setBudgets([]);
    setGoals([]);
    setRecurringTransactions([]);
    setExchangeRates({});
  };

  const value = {
    // Authentication
    user,
    isAuthenticated,
    login,
    logout,

    // Core data
    accounts,
    setAccounts,
    transactions,
    setTransactions,
    categories,
    setCategories,

    // Phase 4 data
    budgets,
    setBudgets,
    goals,
    setGoals,
    recurringTransactions,
    setRecurringTransactions,
    exchangeRates,
    setExchangeRates,

    // Loading state
    loading,
    setLoading,

    // Data loading functions
    loadAccounts,
    loadTransactions,
    loadCategories,
    loadBudgets,
    loadGoals,
    loadRecurringTransactions,
    loadExchangeRates,
    loadDashboard,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
