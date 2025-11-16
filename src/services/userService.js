import api from './api';
import { API_ENDPOINTS } from '../config/api.config';
import tokenManager from './tokenManager';

/**
 * User service
 * Handles user profile operations
 */
class UserService {
  /**
   * Update user profile
   * @param {Object} updates - Profile updates
   * @param {string} updates.name - User's name
   * @param {string} updates.base_currency - Base currency
   * @param {Array} updates.secondary_currencies - Secondary currencies
   * @param {string} updates.subscription_tier - Subscription tier (basic/premium)
   * @returns {Promise<Object>} Updated user data
   */
  async updateProfile(updates) {
    try {
      const response = await api.patch(API_ENDPOINTS.AUTH_PROFILE, updates);

      // Backend returns: { status: "success", data: { user: {...} } }
      const user = response.data.data;

      // Update stored user data
      tokenManager.setUser(user);

      return user;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Get current user profile
   * @returns {Promise<Object>} User data
   */
  async getCurrentUser() {
    try {
      const response = await api.get(API_ENDPOINTS.AUTH_ME);
      const user = response.data.data;

      // Update stored user data
      tokenManager.setUser(user);

      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }
}

const userService = new UserService();
export default userService;
