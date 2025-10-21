/**
 * API Configuration
 * Centralized API endpoint definitions
 */

// Base API URL
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://lumina-finance-api-dev.onrender.com';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  CHANGE_PASSWORD: '/api/auth/change-password',
  ME: '/api/auth/me',

  // Accounts
  ACCOUNTS: '/api/accounts',
  ACCOUNT: (id) => `/api/accounts/${id}`,

  // Transactions
  TRANSACTIONS: '/api/transactions',
  TRANSACTION: (id) => `/api/transactions/${id}`,

  // Categories
  CATEGORIES: '/api/categories',
  CATEGORY: (id) => `/api/categories/${id}`,

  // Budgets
  BUDGETS: '/api/budgets',
  BUDGET: (id) => `/api/budgets/${id}`,

  // Goals
  GOALS: '/api/goals',
  GOAL: (id) => `/api/goals/${id}`,

  // Recurring Transactions
  RECURRING_TRANSACTIONS: '/api/recurring-transactions',
  RECURRING_TRANSACTION: (id) => `/api/recurring-transactions/${id}`,

  // Exchange Rates
  EXCHANGE_RATES: '/api/exchange-rates',
};

// Request timeout (in milliseconds)
export const API_TIMEOUT = 30000;

// Token expiry buffer (refresh 5 minutes before expiry)
export const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000;
