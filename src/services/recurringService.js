import api from './api';
import { API_ENDPOINTS } from '../config/api.config';

/**
 * Recurring transaction service
 * Handles CRUD operations for recurring transactions
 */
class RecurringService {
  /**
   * Get all recurring transactions
   * @returns {Promise<Array>} List of recurring transactions
   */
  async getRecurringTransactions() {
    try {
      const response = await api.get(API_ENDPOINTS.RECURRING);
      return response.data.map(this._mapRecurringFromAPI);
    } catch (error) {
      console.error('Get recurring transactions error:', error);
      throw error;
    }
  }

  /**
   * Get single recurring transaction by ID
   * @param {string} id - Recurring transaction ID
   * @returns {Promise<Object>} Recurring transaction object
   */
  async getRecurringTransaction(id) {
    try {
      const response = await api.get(`${API_ENDPOINTS.RECURRING}/${id}`);
      return this._mapRecurringFromAPI(response.data);
    } catch (error) {
      console.error('Get recurring transaction error:', error);
      throw error;
    }
  }

  /**
   * Create new recurring transaction
   * @param {Object} recurringData - Recurring transaction data
   * @returns {Promise<Object>} Created recurring transaction
   */
  async createRecurring(recurringData) {
    try {
      const apiData = this._mapRecurringToAPI(recurringData);
      const response = await api.post(API_ENDPOINTS.RECURRING, apiData);
      return this._mapRecurringFromAPI(response.data);
    } catch (error) {
      console.error('Create recurring transaction error:', error);
      throw error;
    }
  }

  /**
   * Update recurring transaction
   * @param {string} id - Recurring transaction ID
   * @param {Object} recurringData - Updated recurring transaction data
   * @returns {Promise<Object>} Updated recurring transaction
   */
  async updateRecurring(id, recurringData) {
    try {
      const apiData = this._mapRecurringToAPI(recurringData);
      const response = await api.put(`${API_ENDPOINTS.RECURRING}/${id}`, apiData);
      return this._mapRecurringFromAPI(response.data);
    } catch (error) {
      console.error('Update recurring transaction error:', error);
      throw error;
    }
  }

  /**
   * Delete recurring transaction
   * @param {string} id - Recurring transaction ID
   * @returns {Promise<void>}
   */
  async deleteRecurring(id) {
    try {
      await api.delete(`${API_ENDPOINTS.RECURRING}/${id}`);
    } catch (error) {
      console.error('Delete recurring transaction error:', error);
      throw error;
    }
  }

  /**
   * Process due recurring transactions
   * Creates actual transactions from recurring templates
   * @returns {Promise<Object>} Processing results
   */
  async processRecurring() {
    try {
      const response = await api.post(API_ENDPOINTS.RECURRING_PROCESS);
      return response.data;
    } catch (error) {
      console.error('Process recurring transactions error:', error);
      throw error;
    }
  }

  /**
   * Map recurring transaction from API format to frontend format
   * @private
   */
  _mapRecurringFromAPI(apiRecurring) {
    return {
      id: apiRecurring.id,
      accountId: apiRecurring.account_id,
      categoryId: apiRecurring.category_id,
      type: apiRecurring.type,
      amount: apiRecurring.amount,
      description: apiRecurring.description,
      frequency: apiRecurring.frequency,
      startDate: apiRecurring.start_date,
      endDate: apiRecurring.end_date,
      nextOccurrence: apiRecurring.next_occurrence,
      isActive: apiRecurring.is_active,
      userId: apiRecurring.user_id,
      user_id: apiRecurring.user_id, // Keep both formats for compatibility
      createdBy: apiRecurring.created_by || apiRecurring.user_id, // Fallback to user_id
      created_by: apiRecurring.created_by || apiRecurring.user_id, // Fallback to user_id
      createdAt: apiRecurring.created_at,
      updatedAt: apiRecurring.updated_at,
      accountName: apiRecurring.account_name,
      categoryName: apiRecurring.category_name,
    };
  }

  /**
   * Map recurring transaction from frontend format to API format
   * @private
   */
  _mapRecurringToAPI(recurring) {
    return {
      account_id: recurring.accountId || recurring.account_id,
      category_id: recurring.categoryId || recurring.category_id,
      type: recurring.type,
      amount: recurring.amount,
      description: recurring.description,
      frequency: recurring.frequency,
      start_date: recurring.startDate || recurring.start_date,
      end_date: recurring.endDate || recurring.end_date,
      is_active: recurring.isActive !== undefined ? recurring.isActive : recurring.is_active,
    };
  }
}

const recurringService = new RecurringService();
export default recurringService;
