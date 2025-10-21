/**
 * API Configuration
 * Centralized API endpoints and configuration
 */

// Get API URL from environment variable or use default
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://lumina-finance-api-dev.onrender.com';

// Debug mode
export const DEBUG_MODE = process.env.REACT_APP_DEBUG === 'true';

// Log API configuration in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 API Configuration:');
  console.log('  - API_BASE_URL:', API_BASE_URL);
  console.log('  - Environment:', process.env.REACT_APP_ENV || 'not set');
  console.log('  - Debug Mode:', DEBUG_MODE);
}

export const API_ENDPOINTS = {
  // Authentication
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_ME: '/auth/me',

  // Accounts
  ACCOUNTS: '/accounts',
  ACCOUNT_SUMMARY: '/accounts/summary',

  // Transactions
  TRANSACTIONS: '/transactions',
  TRANSACTIONS_BULK: '/transactions/bulk',
  TRANSACTIONS_RECONCILE: '/transactions/:id/reconcile',

  // Categories
  CATEGORIES: '/categories',
  CATEGORIES_TREE: '/categories/tree',

  // Budgets
  BUDGETS: '/budgets',
  BUDGETS_SUMMARY: '/budgets/summary',

  // Goals
  GOALS: '/goals',

  // Recurring Transactions
  RECURRING: '/recurring',
  RECURRING_PROCESS: '/recurring/process',

  // Analytics
  ANALYTICS_OVERVIEW: '/analytics/overview',
  ANALYTICS_DASHBOARD: '/analytics/dashboard',
  ANALYTICS_TRENDS: '/analytics/trends',
  ANALYTICS_CATEGORY_BREAKDOWN: '/analytics/category-breakdown',
  ANALYTICS_SPENDING: '/analytics/spending',
  ANALYTICS_NET_WORTH: '/analytics/net-worth',

  // Currency
  CURRENCY_RATES: '/currency/rates',
  CURRENCY_CONVERT: '/currency/convert',
};

export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};
