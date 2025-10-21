export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'https://lumina-finance-api-dev.onrender.com',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  REFRESH: '/api/auth/refresh',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
  CHANGE_PASSWORD: '/api/auth/change-password',

  // Accounts
  ACCOUNTS: '/api/accounts',
  ACCOUNT_SUMMARY: '/api/accounts/summary',

  // Transactions
  TRANSACTIONS: '/api/transactions',
  TRANSACTIONS_BULK: '/api/transactions/bulk-import',
  TRANSACTIONS_RECONCILE: '/api/transactions/:id/reconcile',

  // Categories
  CATEGORIES: '/api/categories',
  CATEGORIES_TREE: '/api/categories/tree',

  // Budgets
  BUDGETS: '/api/budgets',

  // Goals
  GOALS: '/api/goals',

  // Recurring
  RECURRING: '/api/recurring',
  RECURRING_PROCESS: '/api/recurring/process',

  // Analytics
  ANALYTICS_DASHBOARD: '/api/analytics/dashboard',
  ANALYTICS_SPENDING: '/api/analytics/spending',
  ANALYTICS_NET_WORTH: '/api/analytics/net-worth',
  ANALYTICS_TRENDS: '/api/analytics/monthly-trends',

  // Currency
  CURRENCY_RATES: '/api/currency/rates',
  CURRENCY_CONVERT: '/api/currency/convert',
};
