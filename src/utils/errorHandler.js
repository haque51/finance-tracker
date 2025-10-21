/**
 * Extract error message from API error response
 * @param {Error} error - Error object from axios
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  // Network error
  if (!error.response) {
    return 'Network error. Please check your connection.';
  }

  // API error response
  const { data, status } = error.response;

  // Backend sends: { status: "error", error: "message" }
  if (data?.error) {
    return data.error;
  }

  // Fallback based on status code
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Unauthorized. Please login again.';
    case 403:
      return 'Access denied.';
    case 404:
      return 'Resource not found.';
    case 409:
      return 'Conflict. Resource already exists.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return `Error: ${status}`;
  }
};

/**
 * Handle API error and show user-friendly message
 * @param {Error} error - Error object from axios
 * @param {Function} showError - Function to display error (e.g., alert, toast)
 */
export const handleApiError = (error, showError = alert) => {
  const message = getErrorMessage(error);
  showError(message);
  console.error('API Error:', error);
};
