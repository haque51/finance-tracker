/**
 * Error Handler Utility
 * Centralized error handling and user-friendly error messages
 */

/**
 * Extract user-friendly error message from API error response
 * @param {Error} error - Error object from API
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  // Network error
  if (!error.response) {
    return 'Network error. Please check your internet connection.';
  }

  // HTTP error with response
  const { status, data } = error.response;

  // Extract message from response
  if (data?.message) {
    return data.message;
  }

  if (data?.error) {
    return data.error;
  }

  // Default messages based on status code
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Authentication failed. Please login again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'Resource not found.';
    case 409:
      return 'This resource already exists.';
    case 422:
      return 'Validation error. Please check your input.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

/**
 * Log error to console (can be extended to send to logging service)
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 */
export const logError = (error, context = '') => {
  console.error(`[${context}]`, error);

  // In production, you might want to send errors to a logging service
  // Example: Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === 'production') {
    // sendToLoggingService(error, context);
  }
};

/**
 * Handle validation errors from backend
 * @param {Object} error - Error object from API
 * @returns {Object} Object with field-specific error messages
 */
export const getValidationErrors = (error) => {
  if (error.response?.data?.errors) {
    return error.response.data.errors;
  }
  return {};
};

/**
 * Check if error is a network error
 * @param {Error} error - Error object
 * @returns {boolean} True if network error
 */
export const isNetworkError = (error) => {
  return !error.response && error.message === 'Network Error';
};

/**
 * Check if error is an authentication error
 * @param {Error} error - Error object
 * @returns {boolean} True if authentication error
 */
export const isAuthError = (error) => {
  return error.response?.status === 401;
};
