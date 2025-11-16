/**
 * Feature Access Control
 * Manages feature availability based on user subscription tier
 */

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  BASIC: 'basic',
  PREMIUM: 'premium',
};

// Feature definitions
export const FEATURES = {
  // Dashboard
  DASHBOARD_BASIC: 'dashboard_basic',
  DASHBOARD_ADVANCED: 'dashboard_advanced',

  // Accounts
  UNLIMITED_ACCOUNTS: 'unlimited_accounts',
  MULTI_CURRENCY: 'multi_currency',

  // Transactions
  UNLIMITED_TRANSACTIONS: 'unlimited_transactions',
  TRANSACTION_HISTORY: 'transaction_history', // All history vs last 3-6 months

  // Categories
  CUSTOM_CATEGORIES: 'custom_categories',
  UNLIMITED_CATEGORIES: 'unlimited_categories',

  // Budget
  BASIC_BUDGET: 'basic_budget',
  ADVANCED_BUDGET: 'advanced_budget',
  UNLIMITED_BUDGET_CATEGORIES: 'unlimited_budget_categories',

  // Advanced Features (Premium only)
  RECURRING_TRANSACTIONS: 'recurring_transactions',
  FINANCIAL_GOALS: 'financial_goals',
  DEBT_PAYOFF: 'debt_payoff',
  AI_INSIGHTS: 'ai_insights',
  SMART_ALERTS: 'smart_alerts',
  AUTO_CATEGORIZATION: 'auto_categorization',
  CUSTOM_REPORTS: 'custom_reports',
  DATA_EXPORT: 'data_export',
  FORECASTING: 'forecasting',
  RECONCILIATION: 'reconciliation',
};

// Limits for basic tier
export const BASIC_LIMITS = {
  MAX_ACCOUNTS: 5,
  MAX_CATEGORIES: 10,
  MAX_BUDGET_CATEGORIES: 5,
  TRANSACTION_HISTORY_MONTHS: 6, // Only last 6 months
};

// Feature access map
const FEATURE_ACCESS = {
  [SUBSCRIPTION_TIERS.BASIC]: [
    FEATURES.DASHBOARD_BASIC,
    FEATURES.BASIC_BUDGET,
  ],
  [SUBSCRIPTION_TIERS.PREMIUM]: [
    // All basic features
    FEATURES.DASHBOARD_BASIC,
    FEATURES.BASIC_BUDGET,

    // Premium features
    FEATURES.DASHBOARD_ADVANCED,
    FEATURES.UNLIMITED_ACCOUNTS,
    FEATURES.MULTI_CURRENCY,
    FEATURES.UNLIMITED_TRANSACTIONS,
    FEATURES.TRANSACTION_HISTORY,
    FEATURES.CUSTOM_CATEGORIES,
    FEATURES.UNLIMITED_CATEGORIES,
    FEATURES.ADVANCED_BUDGET,
    FEATURES.UNLIMITED_BUDGET_CATEGORIES,
    FEATURES.RECURRING_TRANSACTIONS,
    FEATURES.FINANCIAL_GOALS,
    FEATURES.DEBT_PAYOFF,
    FEATURES.AI_INSIGHTS,
    FEATURES.SMART_ALERTS,
    FEATURES.AUTO_CATEGORIZATION,
    FEATURES.CUSTOM_REPORTS,
    FEATURES.DATA_EXPORT,
    FEATURES.FORECASTING,
    FEATURES.RECONCILIATION,
  ],
};

/**
 * Check if a user has access to a specific feature
 * @param {Object} user - User object with subscription_tier property
 * @param {string} feature - Feature constant from FEATURES
 * @returns {boolean} True if user has access
 */
export const hasFeatureAccess = (user, feature) => {
  if (!user) return false;

  // Default to basic if no tier specified
  const tier = user.subscription_tier || SUBSCRIPTION_TIERS.BASIC;

  const allowedFeatures = FEATURE_ACCESS[tier] || FEATURE_ACCESS[SUBSCRIPTION_TIERS.BASIC];
  return allowedFeatures.includes(feature);
};

/**
 * Check if a user is on premium tier
 * @param {Object} user - User object
 * @returns {boolean} True if premium user
 */
export const isPremiumUser = (user) => {
  if (!user) return false;
  return user.subscription_tier === SUBSCRIPTION_TIERS.PREMIUM;
};

/**
 * Check if a user is on basic tier
 * @param {Object} user - User object
 * @returns {boolean} True if basic user
 */
export const isBasicUser = (user) => {
  if (!user) return true;
  return !user.subscription_tier || user.subscription_tier === SUBSCRIPTION_TIERS.BASIC;
};

/**
 * Get user tier display name
 * @param {Object} user - User object
 * @returns {string} Tier display name
 */
export const getTierDisplayName = (user) => {
  if (!user || !user.subscription_tier) return 'Basic';

  return user.subscription_tier === SUBSCRIPTION_TIERS.PREMIUM ? 'Premium' : 'Basic';
};

/**
 * Check if user has reached account limit
 * @param {Object} user - User object
 * @param {number} currentCount - Current number of accounts
 * @returns {boolean} True if limit reached
 */
export const hasReachedAccountLimit = (user, currentCount) => {
  if (isPremiumUser(user)) return false;
  return currentCount >= BASIC_LIMITS.MAX_ACCOUNTS;
};

/**
 * Check if user has reached category limit
 * @param {Object} user - User object
 * @param {number} currentCount - Current number of categories
 * @returns {boolean} True if limit reached
 */
export const hasReachedCategoryLimit = (user, currentCount) => {
  if (isPremiumUser(user)) return false;
  return currentCount >= BASIC_LIMITS.MAX_CATEGORIES;
};

/**
 * Check if user has reached budget category limit
 * @param {Object} user - User object
 * @param {number} currentCount - Current number of budget categories
 * @returns {boolean} True if limit reached
 */
export const hasReachedBudgetLimit = (user, currentCount) => {
  if (isPremiumUser(user)) return false;
  return currentCount >= BASIC_LIMITS.MAX_BUDGET_CATEGORIES;
};

/**
 * Get remaining quota for a limit
 * @param {Object} user - User object
 * @param {string} limitType - 'accounts', 'categories', or 'budget'
 * @param {number} currentCount - Current count
 * @returns {Object} { remaining, limit, unlimited }
 */
export const getRemainingQuota = (user, limitType, currentCount) => {
  if (isPremiumUser(user)) {
    return { remaining: Infinity, limit: Infinity, unlimited: true };
  }

  let limit;
  switch (limitType) {
    case 'accounts':
      limit = BASIC_LIMITS.MAX_ACCOUNTS;
      break;
    case 'categories':
      limit = BASIC_LIMITS.MAX_CATEGORIES;
      break;
    case 'budget':
      limit = BASIC_LIMITS.MAX_BUDGET_CATEGORIES;
      break;
    default:
      limit = 0;
  }

  return {
    remaining: Math.max(0, limit - currentCount),
    limit,
    unlimited: false,
  };
};

/**
 * Get list of all premium features
 * @returns {Array} List of premium feature names
 */
export const getPremiumFeatures = () => {
  return [
    { id: FEATURES.UNLIMITED_ACCOUNTS, name: 'Unlimited Accounts', icon: '💳' },
    { id: FEATURES.UNLIMITED_TRANSACTIONS, name: 'Unlimited Transaction History', icon: '📊' },
    { id: FEATURES.CUSTOM_CATEGORIES, name: 'Custom Categories', icon: '🏷️' },
    { id: FEATURES.RECURRING_TRANSACTIONS, name: 'Recurring Transactions', icon: '🔄' },
    { id: FEATURES.FINANCIAL_GOALS, name: 'Financial Goals', icon: '🎯' },
    { id: FEATURES.DEBT_PAYOFF, name: 'Debt Payoff Planning', icon: '💰' },
    { id: FEATURES.AI_INSIGHTS, name: 'AI-Powered Insights', icon: '🤖' },
    { id: FEATURES.SMART_ALERTS, name: 'Smart Alerts', icon: '🔔' },
    { id: FEATURES.AUTO_CATEGORIZATION, name: 'Auto-Categorization Rules', icon: '⚡' },
    { id: FEATURES.CUSTOM_REPORTS, name: 'Custom Report Builder', icon: '📈' },
    { id: FEATURES.DATA_EXPORT, name: 'Data Export (CSV/PDF)', icon: '📥' },
    { id: FEATURES.MULTI_CURRENCY, name: 'Multi-Currency Support', icon: '💱' },
    { id: FEATURES.FORECASTING, name: 'Financial Forecasting', icon: '🔮' },
    { id: FEATURES.RECONCILIATION, name: 'Account Reconciliation', icon: '✅' },
  ];
};

export default {
  SUBSCRIPTION_TIERS,
  FEATURES,
  BASIC_LIMITS,
  hasFeatureAccess,
  isPremiumUser,
  isBasicUser,
  getTierDisplayName,
  hasReachedAccountLimit,
  hasReachedCategoryLimit,
  hasReachedBudgetLimit,
  getRemainingQuota,
  getPremiumFeatures,
};
