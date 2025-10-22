import api from './api';
import { API_ENDPOINTS } from '../config/api.config';
import tokenManager from './tokenManager';

/**
 * Authentication service
 * Handles user authentication operations
 */
class AuthService {
  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User's full name
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @returns {Promise<Object>} User data and tokens
   */
  async register(userData) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH_REGISTER, userData);

      // Backend returns: { status: "success", data: { user: {...}, token: "...", refreshToken: "..." } }
      const { user, token, refreshToken } = response.data.data;

      // Store tokens
      tokenManager.setTokens(token, refreshToken);
      tokenManager.setUser(user);

      return { user, token, refreshToken };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User's email
   * @param {string} credentials.password - User's password
   * @returns {Promise<Object>} User data and tokens
   */
  async login(credentials) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH_LOGIN, credentials);

      // Backend returns: { status: "success", data: { user: {...}, token: "...", refreshToken: "..." } }
      const { user, token, refreshToken } = response.data.data;

      // Store tokens
      tokenManager.setTokens(token, refreshToken);
      tokenManager.setUser(user);

      return { user, token, refreshToken };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await api.post(API_ENDPOINTS.AUTH_LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens regardless of API call success
      tokenManager.clearTokens();
    }
  }

  /**
   * Refresh access token
   * @returns {Promise<string>} New access token
   */
  async refreshToken() {
    try {
      const refreshToken = tokenManager.getRefreshToken();

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post(API_ENDPOINTS.AUTH_REFRESH, {
        refreshToken,
      });

      const { token } = response.data.data;
      tokenManager.setToken(token);

      return token;
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, clear tokens and force re-login
      tokenManager.clearTokens();
      throw error;
    }
  }

  /**
   * Get current user data from API
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

  /**
   * Check if user is authenticated
   * @returns {boolean} True if authenticated
   */
  isAuthenticated() {
    return tokenManager.isAuthenticated();
  }

  /**
   * Get stored user data
   * @returns {Object|null} User data
   */
  getUser() {
    return tokenManager.getUser();
  }
}

const authService = new AuthService();
export default authService;
