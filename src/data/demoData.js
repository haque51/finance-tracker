/**
 * Demo Data for Demo Mode
 * Used when users access /demo route
 */

import { DEFAULT_CATEGORIES } from './defaultCategories';

export const demoData = {
  user: {
    id: 'user1',
    name: 'Demo User',
    email: 'demo@financetracker.com',
    theme: 'light',
    baseCurrency: 'EUR',
    monthlyIncomeGoal: 5000,
    monthlySavingsGoal: 1000
  },
  accounts: [
    { id: 'acc1', name: 'Main Checking', type: 'checking', currency: 'EUR', institution: 'Bank A', openingBalance: 5000, currentBalance: 5000, isActive: true },
    { id: 'acc2', name: 'Savings', type: 'savings', currency: 'EUR', institution: 'Bank A', openingBalance: 10000, currentBalance: 10000, isActive: true },
    { id: 'acc3', name: 'Credit Card', type: 'credit_card', currency: 'EUR', institution: 'Bank B', openingBalance: 0, currentBalance: -1500, isActive: true },
    { id: 'acc4', name: 'Car Loan', type: 'loan', currency: 'EUR', institution: 'Bank C', openingBalance: -15000, currentBalance: -12000, isActive: true, interestRate: 4.5 }
  ],
  transactions: [
    { id: 'txn1', date: '2025-10-01', type: 'income', accountId: 'acc1', payee: 'Salary', categoryId: 'cat_income_1', subcategoryId: null, amount: 4500, currency: 'EUR', memo: 'Monthly salary', isReconciled: false },
    { id: 'txn2', date: '2025-10-02', type: 'expense', accountId: 'acc1', payee: 'Supermarket', categoryId: 'cat_exp_food', subcategoryId: 'cat_exp_food_1', amount: -120, currency: 'EUR', memo: 'Groceries', isReconciled: false },
    { id: 'txn3', date: '2025-10-03', type: 'expense', accountId: 'acc3', payee: 'Restaurant', categoryId: 'cat_exp_food', subcategoryId: 'cat_exp_food_2', amount: -85, currency: 'EUR', memo: 'Dinner', isReconciled: false },
    { id: 'txn4', date: '2025-09-01', type: 'income', accountId: 'acc1', payee: 'Salary', categoryId: 'cat_income_1', subcategoryId: null, amount: 4200, currency: 'EUR', memo: 'Monthly salary', isReconciled: false },
    { id: 'txn5', date: '2025-09-15', type: 'expense', accountId: 'acc1', payee: 'Supermarket', categoryId: 'cat_exp_food', subcategoryId: 'cat_exp_food_1', amount: -150, currency: 'EUR', memo: 'Groceries', isReconciled: false },
    { id: 'txn6', date: '2025-08-01', type: 'income', accountId: 'acc1', payee: 'Salary', categoryId: 'cat_income_1', subcategoryId: null, amount: 4200, currency: 'EUR', memo: 'Monthly salary', isReconciled: false },
    { id: 'txn7', date: '2025-08-10', type: 'expense', accountId: 'acc1', payee: 'Shopping Mall', categoryId: 'cat_exp_shopping', subcategoryId: 'cat_exp_shopping_1', amount: -200, currency: 'EUR', memo: 'Shopping', isReconciled: false }
  ],
  categories: DEFAULT_CATEGORIES,
  budgets: [
    { id: 'bud1', month: '2025-10', categoryId: 'cat_exp_food', budgeted: 400 },
    { id: 'bud2', month: '2025-10', categoryId: 'cat_exp_transport', budgeted: 300 }
  ],
  goals: [
    { id: 'goal1', name: 'Emergency Fund', targetAmount: 10000, currentAmount: 10000, targetDate: '2025-12-31' },
    { id: 'goal2', name: 'Vacation', targetAmount: 3000, currentAmount: 500, targetDate: '2025-08-01' }
  ],
  recurringTransactions: [
    { id: 'rec1', name: 'Monthly Rent', accountId: 'acc1', type: 'expense', payee: 'Landlord', categoryId: 'cat_exp_housing', subcategoryId: 'cat_exp_housing_1', amount: -1200, currency: 'EUR', frequency: 'monthly', interval: 1, startDate: '2025-01-01', endDate: null, isActive: true, lastProcessed: '2025-09-01' }
  ],
  templates: [
    { id: 'tpl1', name: 'Grocery Shopping', accountId: 'acc1', type: 'expense', payee: 'Supermarket', categoryId: 'cat_exp_food', subcategoryId: 'cat_exp_food_1', amount: -100, currency: 'EUR', memo: 'Weekly groceries' }
  ],
  exchangeRates: { USD: 1.1, BDT: 0.0091, EUR: 1 },
  debtPayoffPlans: [
    { id: 'dpp1', name: 'Credit Card Payoff', strategy: 'avalanche', extraMonthlyPayment: 200, accountIds: ['acc3'], createdDate: '2025-10-01', isActive: true }
  ],
  alerts: [],
  autoCategorization: []
};

/**
 * Get empty initial state for authenticated users
 */
export const getEmptyState = () => ({
  user: {},
  accounts: [],
  transactions: [],
  categories: [],
  budgets: [],
  goals: [],
  recurringTransactions: [],
  templates: [],
  exchangeRates: { EUR: 1 },
  debtPayoffPlans: [],
  alerts: [],
  autoCategorization: []
});
