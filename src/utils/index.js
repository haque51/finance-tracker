/**
 * Utility functions
 */

/**
 * Create a page URL for routing
 * @param {string} pageName - Name of the page
 * @returns {string} - URL path
 */
export function createPageUrl(pageName) {
  return `/${pageName}`;
}

// Export other utilities as needed
export default {
  createPageUrl
};
