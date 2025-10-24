/**
 * Entity Adapters
 * These adapters provide a Base44 SDK-compatible interface
 * while using our Supabase + Railway backend
 */

import accountService from '../services/accountService';
import transactionService from '../services/transactionService';
import categoryService from '../services/categoryService';
import budgetService from '../services/budgetService';
import goalService from '../services/goalService';
import recurringService from '../services/recurringService';
import authService from '../services/authService';

// Helper to convert filter object to query parameters (if needed)
const convertFiltersToParams = (filters) => {
  if (!filters) return {};
  return filters;
};

/**
 * Account Entity Adapter
 */
class AccountAdapter {
  async filter(filters = {}) {
    try {
      const accounts = await accountService.getAccounts();

      // Apply client-side filtering if filters provided
      if (Object.keys(filters).length === 0) {
        return accounts;
      }

      return accounts.filter(account => {
        return Object.keys(filters).every(key => {
          return account[key] === filters[key];
        });
      });
    } catch (error) {
      console.error('AccountAdapter.filter error:', error);
      throw error;
    }
  }

  async get(id) {
    try {
      return await accountService.getAccount(id);
    } catch (error) {
      console.error('AccountAdapter.get error:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      return await accountService.createAccount(data);
    } catch (error) {
      console.error('AccountAdapter.create error:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      return await accountService.updateAccount(id, data);
    } catch (error) {
      console.error('AccountAdapter.update error:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      return await accountService.deleteAccount(id);
    } catch (error) {
      console.error('AccountAdapter.delete error:', error);
      throw error;
    }
  }
}

/**
 * Transaction Entity Adapter
 */
class TransactionAdapter {
  async filter(filters = {}) {
    try {
      const transactions = await transactionService.getTransactions(filters);

      // Apply additional client-side filtering if needed
      if (Object.keys(filters).length === 0) {
        return transactions;
      }

      return transactions.filter(transaction => {
        return Object.keys(filters).every(key => {
          if (key === 'created_by') return true; // Backend handles this
          return transaction[key] === filters[key];
        });
      });
    } catch (error) {
      console.error('TransactionAdapter.filter error:', error);
      throw error;
    }
  }

  async get(id) {
    try {
      return await transactionService.getTransaction(id);
    } catch (error) {
      console.error('TransactionAdapter.get error:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      return await transactionService.createTransaction(data);
    } catch (error) {
      console.error('TransactionAdapter.create error:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      return await transactionService.updateTransaction(id, data);
    } catch (error) {
      console.error('TransactionAdapter.update error:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      return await transactionService.deleteTransaction(id);
    } catch (error) {
      console.error('TransactionAdapter.delete error:', error);
      throw error;
    }
  }
}

/**
 * Category Entity Adapter
 */
class CategoryAdapter {
  async filter(filters = {}) {
    try {
      const categories = await categoryService.getCategories();

      // Apply client-side filtering
      if (Object.keys(filters).length === 0) {
        return categories;
      }

      return categories.filter(category => {
        return Object.keys(filters).every(key => {
          if (key === 'created_by') return true; // Backend handles this
          return category[key] === filters[key];
        });
      });
    } catch (error) {
      console.error('CategoryAdapter.filter error:', error);
      throw error;
    }
  }

  async get(id) {
    try {
      return await categoryService.getCategory(id);
    } catch (error) {
      console.error('CategoryAdapter.get error:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      return await categoryService.createCategory(data);
    } catch (error) {
      console.error('CategoryAdapter.create error:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      return await categoryService.updateCategory(id, data);
    } catch (error) {
      console.error('CategoryAdapter.update error:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      return await categoryService.deleteCategory(id);
    } catch (error) {
      console.error('CategoryAdapter.delete error:', error);
      throw error;
    }
  }
}

/**
 * Budget Entity Adapter
 */
class BudgetAdapter {
  async filter(filters = {}) {
    try {
      // Extract month and year from filters if provided
      const { month, year } = filters;
      const budgets = await budgetService.getBudgets(month, year);

      return budgets;
    } catch (error) {
      console.error('BudgetAdapter.filter error:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      return await budgetService.createBudget(data);
    } catch (error) {
      console.error('BudgetAdapter.create error:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      return await budgetService.updateBudget(id, data);
    } catch (error) {
      console.error('BudgetAdapter.update error:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      return await budgetService.deleteBudget(id);
    } catch (error) {
      console.error('BudgetAdapter.delete error:', error);
      throw error;
    }
  }
}

/**
 * Financial Goal Entity Adapter
 */
class FinancialGoalAdapter {
  async filter(filters = {}) {
    try {
      const goals = await goalService.getGoals();

      // Apply client-side filtering
      if (Object.keys(filters).length === 0) {
        return goals;
      }

      return goals.filter(goal => {
        return Object.keys(filters).every(key => {
          if (key === 'created_by') return true;
          return goal[key] === filters[key];
        });
      });
    } catch (error) {
      console.error('FinancialGoalAdapter.filter error:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      return await goalService.createGoal(data);
    } catch (error) {
      console.error('FinancialGoalAdapter.create error:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      return await goalService.updateGoal(id, data);
    } catch (error) {
      console.error('FinancialGoalAdapter.update error:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      return await goalService.deleteGoal(id);
    } catch (error) {
      console.error('FinancialGoalAdapter.delete error:', error);
      throw error;
    }
  }
}

/**
 * Recurrent Transaction Entity Adapter
 */
class RecurrentTransactionAdapter {
  async filter(filters = {}) {
    try {
      const recurring = await recurringService.getRecurringTransactions();

      // Apply client-side filtering
      if (Object.keys(filters).length === 0) {
        return recurring;
      }

      return recurring.filter(item => {
        return Object.keys(filters).every(key => {
          if (key === 'created_by') return true;
          return item[key] === filters[key];
        });
      });
    } catch (error) {
      console.error('RecurrentTransactionAdapter.filter error:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      return await recurringService.createRecurring(data);
    } catch (error) {
      console.error('RecurrentTransactionAdapter.create error:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      return await recurringService.updateRecurring(id, data);
    } catch (error) {
      console.error('RecurrentTransactionAdapter.update error:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      return await recurringService.deleteRecurring(id);
    } catch (error) {
      console.error('RecurrentTransactionAdapter.delete error:', error);
      throw error;
    }
  }
}

/**
 * User/Auth Adapter
 */
class UserAuthAdapter {
  async me() {
    try {
      // Get current user from auth service
      const user = await authService.getCurrentUser();
      return user;
    } catch (error) {
      console.error('UserAuthAdapter.me error:', error);
      throw error;
    }
  }

  async update(data) {
    try {
      // Update user profile
      // Note: Current backend might not have this endpoint, may need to add
      console.warn('User.update not fully implemented in backend');
      return data;
    } catch (error) {
      console.error('UserAuthAdapter.update error:', error);
      throw error;
    }
  }

  async updateMyUserData(data) {
    try {
      // Update current user's data (theme, preferences, etc.)
      // For now, just return the data - backend update not implemented
      console.warn('User.updateMyUserData not fully implemented in backend');
      return data;
    } catch (error) {
      console.error('UserAuthAdapter.updateMyUserData error:', error);
      throw error;
    }
  }

  async logout() {
    // Simply clear tokens - let the calling component handle navigation
    await authService.logout();
  }
}

/**
 * Placeholder adapters for entities that might not be fully implemented yet
 */
class TransactionTemplateAdapter {
  async filter(filters = {}) {
    // TODO: Implement when backend supports templates
    console.warn('TransactionTemplate.filter not yet implemented');
    return [];
  }
  async create(data) {
    console.warn('TransactionTemplate.create not yet implemented');
    return data;
  }
  async update(id, data) {
    console.warn('TransactionTemplate.update not yet implemented');
    return data;
  }
  async delete(id) {
    console.warn('TransactionTemplate.delete not yet implemented');
    return true;
  }
}

class NetWorthSnapshotAdapter {
  async filter(filters = {}) {
    console.warn('NetWorthSnapshot.filter not yet implemented');
    return [];
  }
  async create(data) {
    console.warn('NetWorthSnapshot.create not yet implemented');
    return data;
  }
}

class DebtPayoffPlanAdapter {
  async filter(filters = {}) {
    console.warn('DebtPayoffPlan.filter not yet implemented');
    return [];
  }
  async create(data) {
    console.warn('DebtPayoffPlan.create not yet implemented');
    return data;
  }
  async update(id, data) {
    console.warn('DebtPayoffPlan.update not yet implemented');
    return data;
  }
  async delete(id) {
    console.warn('DebtPayoffPlan.delete not yet implemented');
    return true;
  }
}

class SpendingAlertAdapter {
  async filter(filters = {}) {
    console.warn('SpendingAlert.filter not yet implemented');
    return [];
  }
  async create(data) {
    console.warn('SpendingAlert.create not yet implemented');
    return data;
  }
  async update(id, data) {
    console.warn('SpendingAlert.update not yet implemented');
    return data;
  }
  async delete(id) {
    console.warn('SpendingAlert.delete not yet implemented');
    return true;
  }
}

class CategorizationRuleAdapter {
  async filter(filters = {}) {
    console.warn('CategorizationRule.filter not yet implemented');
    return [];
  }
  async create(data) {
    console.warn('CategorizationRule.create not yet implemented');
    return data;
  }
  async update(id, data) {
    console.warn('CategorizationRule.update not yet implemented');
    return data;
  }
  async delete(id) {
    console.warn('CategorizationRule.delete not yet implemented');
    return true;
  }
}

// Create instances
export const Account = new AccountAdapter();
export const Transaction = new TransactionAdapter();
export const Category = new CategoryAdapter();
export const Budget = new BudgetAdapter();
export const FinancialGoal = new FinancialGoalAdapter();
export const RecurrentTransaction = new RecurrentTransactionAdapter();
export const TransactionTemplate = new TransactionTemplateAdapter();
export const NetWorthSnapshot = new NetWorthSnapshotAdapter();
export const DebtPayoffPlan = new DebtPayoffPlanAdapter();
export const SpendingAlert = new SpendingAlertAdapter();
export const CategorizationRule = new CategorizationRuleAdapter();
export const User = new UserAuthAdapter();
