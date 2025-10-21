/**
 * Error Handler Utility
 * Provides consistent error handling across the application
 */

/**
 * Extract user-friendly error message from error object
 * @param {Error|Object} error - Error object
 * @returns {string} Error message
 */
export const getErrorMessage = (error) => {
  // API error response
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  // API error message
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // Failed to fetch (CORS, network error, server down)
  if (error?.message?.includes('Failed to fetch') || error?.message?.includes('fetch')) {
    return 'Unable to connect to server. The API server may be down or unreachable. Please try again later or contact support.';
  }

  // Network error
  if (error?.message === 'Network Error' || error?.name === 'NetworkError') {
    return 'Network error. Please check your internet connection and try again.';
  }

  // Timeout error
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return 'Request timeout. The server is taking too long to respond. Please try again.';
  }

  // CORS error
  if (error?.message?.includes('CORS')) {
    return 'Server configuration error (CORS). Please contact support.';
  }

  // Generic error message
  if (error?.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Handle API errors and throw appropriate error
 * @param {Error} error - Error object
 * @throws {Error} Formatted error
 */
export const handleApiError = (error) => {
  const message = getErrorMessage(error);
  const formattedError = new Error(message);
  formattedError.originalError = error;

  // Add status code if available
  if (error?.response?.status) {
    formattedError.statusCode = error.response.status;
  }

  throw formattedError;
};

/**
 * Check if error is authentication error (401)
 * @param {Error} error - Error object
 * @returns {boolean} True if auth error
 */
export const isAuthError = (error) => {
  return error?.response?.status === 401 || error?.statusCode === 401;
};

/**
 * Check if error is validation error (400)
 * @param {Error} error - Error object
 * @returns {boolean} True if validation error
 */
export const isValidationError = (error) => {
  return error?.response?.status === 400 || error?.statusCode === 400;
};

/**
 * Check if error is not found error (404)
 * @param {Error} error - Error object
 * @returns {boolean} True if not found error
 */
export const isNotFoundError = (error) => {
  return error?.response?.status === 404 || error?.statusCode === 404;
};

/**
 * Log error to console (can be extended to send to error tracking service)
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 */
export const logError = (error, context = '') => {
  console.error(`[Error${context ? ` - ${context}` : ''}]:`, error);

  // In production, you might want to send to error tracking service
  // e.g., Sentry, LogRocket, etc.
};
