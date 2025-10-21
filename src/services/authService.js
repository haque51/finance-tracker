/**
 * Authentication Service
 * Handles user registration, login, logout, profile management
 */

import api from './api';
import { API_ENDPOINTS } from '../config/api.config';
import { setTokens, clearTokens, setUser } from '../utils/tokenManager';

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - Full name
   * @param {string} userData.email - Email address
   * @param {string} userData.password - Password (min 8 chars, uppercase, lowercase, number)
   * @param {string} userData.baseCurrency - Base currency code (EUR, USD, BDT)
   * @returns {Promise<Object>} User object
   */
  async register(userData) {
    try {
      const response = await api.post(API_ENDPOINTS.REGISTER, {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        base_currency: userData.baseCurrency || userData.base_currency || 'EUR',
      });

      const { access_token, refresh_token, user } = response.data.data;

      // Store tokens and user
      setTokens(access_token, refresh_token);
      setUser(this._mapUserFromAPI(user));

      return this._mapUserFromAPI(user);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User object
   */
  async login(email, password) {
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, {
        email,
        password,
      });

      const { access_token, refresh_token, user } = response.data.data;

      // Store tokens and user
      setTokens(access_token, refresh_token);
      setUser(this._mapUserFromAPI(user));

      return this._mapUserFromAPI(user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   * Clears tokens and calls backend logout endpoint
   */
  async logout() {
    try {
      // Call backend logout (optional, since we're clearing tokens anyway)
      await api.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      // Don't throw on logout errors, always clear tokens
      console.error('Logout error:', error);
    } finally {
      clearTokens();
    }
  }

  /**
   * Get current user profile
   * @returns {Promise<Object>} User object
   */
  async getCurrentUser() {
    try {
      const response = await api.get(API_ENDPOINTS.ME);
      const user = this._mapUserFromAPI(response.data.data);
      setUser(user);
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Response data
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.post(API_ENDPOINTS.CHANGE_PASSWORD, {
        current_password: currentPassword,
        new_password: newPassword,
      });

      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Map user object from API format to frontend format
   * @private
   * @param {Object} apiUser - User object from API (snake_case)
   * @returns {Object} User object in frontend format (camelCase)
   */
  _mapUserFromAPI(apiUser) {
    return {
      id: apiUser.id,
      name: apiUser.name,
      email: apiUser.email,
      theme: 'light', // Default, not stored in backend
      baseCurrency: apiUser.base_currency,
      secondaryCurrencies: apiUser.secondary_currencies?.enabled_currencies || [],
      monthlyIncomeGoal: apiUser.monthly_income_goal || 0,
      monthlySavingsGoal: apiUser.monthly_savings_goal || 0,
      createdAt: apiUser.created_at,
      updatedAt: apiUser.updated_at,
    };
  }

  /**
   * Map user object from frontend format to API format
   * @private
   * @param {Object} user - User object in frontend format (camelCase)
   * @returns {Object} User object for API (snake_case)
   */
  _mapUserToAPI(user) {
    return {
      name: user.name,
      email: user.email,
      base_currency: user.baseCurrency,
      secondary_currencies: {
        enabled_currencies: user.secondaryCurrencies || [],
      },
      monthly_income_goal: user.monthlyIncomeGoal,
      monthly_savings_goal: user.monthlySavingsGoal,
    };
  }
}

const authService = new AuthService();
export default authService;
