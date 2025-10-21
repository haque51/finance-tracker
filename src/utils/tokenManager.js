/**
 * Token Manager
 * Handles storage and retrieval of authentication tokens
 */

const ACCESS_TOKEN_KEY = 'lumina_access_token';
const REFRESH_TOKEN_KEY = 'lumina_refresh_token';
const USER_KEY = 'lumina_user';

/**
 * Store access and refresh tokens
 * @param {string} accessToken - JWT access token
 * @param {string} refreshToken - JWT refresh token
 */
export const setTokens = (accessToken, refreshToken) => {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

/**
 * Get access token from storage
 * @returns {string|null} Access token or null if not found
 */
export const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Get refresh token from storage
 * @returns {string|null} Refresh token or null if not found
 */
export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Clear all tokens from storage
 */
export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Store user data
 * @param {Object} user - User object
 */
export const setUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

/**
 * Get user data from storage
 * @returns {Object|null} User object or null if not found
 */
export const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};

/**
 * Check if user is authenticated (has valid tokens)
 * @returns {boolean} True if user has tokens
 */
export const isAuthenticated = () => {
  return !!getAccessToken();
};
