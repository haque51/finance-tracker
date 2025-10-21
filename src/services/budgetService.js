import api from './api';
import { API_ENDPOINTS } from '../config/api.config';

/**
 * Budget service
 * Handles CRUD operations for budgets
 */
class BudgetService {
  /**
   * Get budgets with optional filters
   * @param {number} month - Month (1-12)
   * @param {number} year - Year (e.g., 2025)
   * @returns {Promise<Array>} List of budgets
   */
  async getBudgets(month, year) {
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year);

      const url = params.toString()
        ? `${API_ENDPOINTS.BUDGETS}?${params}`
        : API_ENDPOINTS.BUDGETS;

      const response = await api.get(url);
      return response.data.data.map(this._mapBudgetFromAPI);
    } catch (error) {
      console.error('Get budgets error:', error);
      throw error;
    }
  }

  /**
   * Get single budget by ID
   * @param {string} id - Budget ID
   * @returns {Promise<Object>} Budget object
   */
  async getBudget(id) {
    try {
      const response = await api.get(`${API_ENDPOINTS.BUDGETS}/${id}`);
      return this._mapBudgetFromAPI(response.data.data);
    } catch (error) {
      console.error('Get budget error:', error);
      throw error;
    }
  }

  /**
   * Create new budget
   * @param {Object} budgetData - Budget data
   * @returns {Promise<Object>} Created budget
   */
  async createBudget(budgetData) {
    try {
      const apiData = this._mapBudgetToAPI(budgetData);
      const response = await api.post(API_ENDPOINTS.BUDGETS, apiData);
      return this._mapBudgetFromAPI(response.data.data);
    } catch (error) {
      console.error('Create budget error:', error);
      throw error;
    }
  }

  /**
   * Update budget
   * @param {string} id - Budget ID
   * @param {Object} budgetData - Updated budget data
   * @returns {Promise<Object>} Updated budget
   */
  async updateBudget(id, budgetData) {
    try {
      const apiData = this._mapBudgetToAPI(budgetData);
      const response = await api.put(`${API_ENDPOINTS.BUDGETS}/${id}`, apiData);
      return this._mapBudgetFromAPI(response.data.data);
    } catch (error) {
      console.error('Update budget error:', error);
      throw error;
    }
  }

  /**
   * Delete budget
   * @param {string} id - Budget ID
   * @returns {Promise<void>}
   */
  async deleteBudget(id) {
    try {
      await api.delete(`${API_ENDPOINTS.BUDGETS}/${id}`);
    } catch (error) {
      console.error('Delete budget error:', error);
      throw error;
    }
  }

  /**
   * Map budget from API format to frontend format
   * @private
   */
  _mapBudgetFromAPI(apiBudget) {
    return {
      id: apiBudget.id,
      categoryId: apiBudget.category_id,
      amount: apiBudget.amount,
      month: apiBudget.month,
      year: apiBudget.year,
      spent: apiBudget.spent,
      createdAt: apiBudget.created_at,
      updatedAt: apiBudget.updated_at,
      categoryName: apiBudget.category_name,
      categoryColor: apiBudget.category_color,
    };
  }

  /**
   * Map budget from frontend format to API format
   * @private
   */
  _mapBudgetToAPI(budget) {
    return {
      category_id: budget.categoryId || budget.category_id,
      amount: budget.amount,
      month: budget.month,
      year: budget.year,
    };
  }
}

export default new BudgetService();
