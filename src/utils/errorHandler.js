/**
 * Error handling utilities
 */

/**
 * Extract error message from various error formats
 * @param {Error|Object} error - Error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  // Handle API response errors
  if (error.response) {
    // Server responded with error status
    const { data, status } = error.response;

    if (data?.message) {
      return data.message;
    }

    if (data?.error) {
      return data.error;
    }

    // Default status-based messages
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'You are not authorized. Please log in.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Request failed with status ${status}`;
    }
  }

  // Handle request errors (network issues, etc.)
  if (error.request) {
    return 'Network error. Please check your connection.';
  }

  // Handle other errors
  if (error.message) {
    return error.message;
  }

  return 'An unexpected error occurred.';
};

/**
 * Check if error is authentication related
 * @param {Error|Object} error - Error object
 * @returns {boolean} True if auth error
 */
export const isAuthError = (error) => {
  return error.response?.status === 401;
};

/**
 * Log error for debugging
 * @param {string} context - Context where error occurred
 * @param {Error|Object} error - Error object
 */
export const logError = (context, error) => {
  console.error(`[${context}]`, {
    message: getErrorMessage(error),
    details: error,
  });
};
