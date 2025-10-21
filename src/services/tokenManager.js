/**
 * Token Manager
 * Handles JWT token storage and retrieval
 */

const TOKEN_KEY = 'lumina_finance_token';
const REFRESH_TOKEN_KEY = 'lumina_finance_refresh_token';
const USER_KEY = 'lumina_finance_user';

class TokenManager {
  /**
   * Get access token from localStorage
   * @returns {string|null} Access token
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Get refresh token from localStorage
   * @returns {string|null} Refresh token
   */
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Set tokens in localStorage
   * @param {string} token - Access token
   * @param {string} refreshToken - Refresh token
   */
  setTokens(token, refreshToken) {
    localStorage.setItem(TOKEN_KEY, token);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  /**
   * Set access token only
   * @param {string} token - Access token
   */
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Remove all tokens from localStorage
   */
  clearTokens() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /**
   * Get user data from localStorage
   * @returns {Object|null} User object
   */
  getUser() {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Set user data in localStorage
   * @param {Object} user - User object
   */
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  /**
   * Check if user is authenticated (has valid token)
   * @returns {boolean} True if authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  }
}

export default new TokenManager();
