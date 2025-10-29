import api from './api';
import { API_ENDPOINTS } from '../config/api.config';

/**
 * Goal service
 * Handles CRUD operations for financial goals
 */
class GoalService {
  /**
   * Get goals with optional status filter
   * @param {string} status - Goal status (in_progress, completed, cancelled)
   * @returns {Promise<Array>} List of goals
   */
  async getGoals(status) {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);

      const endpoint = params.toString()
        ? `${API_ENDPOINTS.GOALS}?${params}`
        : API_ENDPOINTS.GOALS;

      const response = await api.get(endpoint);
      return response.data.map(this._mapGoalFromAPI);
    } catch (error) {
      console.error('Get goals error:', error);
      throw error;
    }
  }

  /**
   * Get single goal by ID
   * @param {string} id - Goal ID
   * @returns {Promise<Object>} Goal object
   */
  async getGoal(id) {
    try {
      const response = await api.get(`${API_ENDPOINTS.GOALS}/${id}`);
      return this._mapGoalFromAPI(response.data);
    } catch (error) {
      console.error('Get goal error:', error);
      throw error;
    }
  }

  /**
   * Create new goal
   * @param {Object} goalData - Goal data
   * @returns {Promise<Object>} Created goal
   */
  async createGoal(goalData) {
    try {
      const apiData = this._mapGoalToAPI(goalData);
      const response = await api.post(API_ENDPOINTS.GOALS, apiData);
      return this._mapGoalFromAPI(response.data);
    } catch (error) {
      console.error('Create goal error:', error);
      throw error;
    }
  }

  /**
   * Update goal
   * @param {string} id - Goal ID
   * @param {Object} goalData - Updated goal data
   * @returns {Promise<Object>} Updated goal
   */
  async updateGoal(id, goalData) {
    try {
      const apiData = this._mapGoalToAPI(goalData);
      const response = await api.put(`${API_ENDPOINTS.GOALS}/${id}`, apiData);
      return this._mapGoalFromAPI(response.data);
    } catch (error) {
      console.error('Update goal error:', error);
      throw error;
    }
  }

  /**
   * Delete goal
   * @param {string} id - Goal ID
   * @returns {Promise<void>}
   */
  async deleteGoal(id) {
    try {
      await api.delete(`${API_ENDPOINTS.GOALS}/${id}`);
    } catch (error) {
      console.error('Delete goal error:', error);
      throw error;
    }
  }

  /**
   * Map goal from API format to frontend format
   * @private
   */
  _mapGoalFromAPI(apiGoal) {
    return {
      id: apiGoal.id,
      name: apiGoal.name,
      targetAmount: apiGoal.target_amount,
      currentAmount: apiGoal.current_amount,
      targetDate: apiGoal.target_date,
      linkedAccountId: apiGoal.linked_account_id,
      status: apiGoal.status,
      userId: apiGoal.user_id,
      user_id: apiGoal.user_id, // Keep both formats for compatibility
      createdBy: apiGoal.created_by || apiGoal.user_id, // Fallback to user_id
      created_by: apiGoal.created_by || apiGoal.user_id, // Fallback to user_id
      createdAt: apiGoal.created_at,
      updatedAt: apiGoal.updated_at,
      accountName: apiGoal.account_name,
      // Calculate progress percentage
      progress: apiGoal.target_amount > 0
        ? Math.round((apiGoal.current_amount / apiGoal.target_amount) * 100)
        : 0,
    };
  }

  /**
   * Map goal from frontend format to API format
   * @private
   */
  _mapGoalToAPI(goal) {
    return {
      name: goal.name,
      target_amount: goal.targetAmount || goal.target_amount,
      current_amount: goal.currentAmount || goal.current_amount,
      target_date: goal.targetDate || goal.target_date,
      linked_account_id: goal.linkedAccountId || goal.linked_account_id,
      status: goal.status,
    };
  }
}

const goalService = new GoalService();
export default goalService;
