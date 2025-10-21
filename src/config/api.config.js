/**
 * API Configuration
 * Contains all API endpoints and configuration
 */

export const API_BASE_URL = 'https://lumina-finance-api-dev.onrender.com';

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  PROFILE: '/api/auth/profile',

  // Accounts
  ACCOUNTS: '/api/accounts',

  // Transactions
  TRANSACTIONS: '/api/transactions',

  // Categories
  CATEGORIES: '/api/categories',

  // Budgets
  BUDGETS: '/api/budgets',

  // Goals
  GOALS: '/api/goals',

  // Recurring Transactions
  RECURRING: '/api/recurring',
  RECURRING_PROCESS: '/api/recurring/process',

  // Analytics
  ANALYTICS_DASHBOARD: '/api/analytics/dashboard',
  ANALYTICS_SPENDING: '/api/analytics/spending',
  ANALYTICS_NET_WORTH: '/api/analytics/net-worth',
  ANALYTICS_TRENDS: '/api/analytics/trends',

  // Currency
  CURRENCY_RATES: '/api/currency/rates',
  CURRENCY_CONVERT: '/api/currency/convert',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};
