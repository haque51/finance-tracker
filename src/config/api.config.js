/**
 * API Configuration
 * Centralized API endpoints and configuration
 */

// Get API URL from environment variable or use default
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://lumina-finance-backend-production.up.railway.app';

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
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_REFRESH: '/api/auth/refresh',
  AUTH_ME: '/api/auth/me',

  // Accounts
  ACCOUNTS: '/api/accounts',
  ACCOUNT_SUMMARY: '/api/accounts/summary',

  // Transactions
  TRANSACTIONS: '/api/transactions',
  TRANSACTIONS_BULK: '/api/transactions/bulk',
  TRANSACTIONS_RECONCILE: '/api/transactions/:id/reconcile',

  // Categories
  CATEGORIES: '/api/categories',
  CATEGORIES_TREE: '/api/categories/tree',

  // Budgets
  BUDGETS: '/api/budgets',
  BUDGETS_SUMMARY: '/api/budgets/summary',

  // Goals
  GOALS: '/api/goals',

  // Recurring Transactions
  RECURRING: '/api/recurring',
  RECURRING_PROCESS: '/api/recurring/process',

  // Analytics
  ANALYTICS_OVERVIEW: '/api/analytics/overview',
  ANALYTICS_DASHBOARD: '/api/analytics/dashboard',
  ANALYTICS_TRENDS: '/api/analytics/trends',
  ANALYTICS_CATEGORY_BREAKDOWN: '/api/analytics/category-breakdown',
  ANALYTICS_SPENDING: '/api/analytics/spending',
  ANALYTICS_NET_WORTH: '/api/analytics/net-worth',

  // Currency
  CURRENCY_RATES: '/api/currency/rates',
  CURRENCY_CONVERT: '/api/currency/convert',
};

export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};
