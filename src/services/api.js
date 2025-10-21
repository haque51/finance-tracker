/**
 * API Service
 * Centralized HTTP client for API requests
 */

import { API_BASE_URL, API_CONFIG } from '../config/api.config';
import tokenManager from './tokenManager';
import { handleApiError } from '../utils/errorHandler';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = API_CONFIG.timeout;
  }

  /**
   * Get default headers with authorization
   * @private
   * @returns {Object} Headers object
   */
  _getHeaders() {
    const headers = { ...API_CONFIG.headers };
    const token = tokenManager.getToken();

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Make HTTP request with timeout
   * @private
   * @param {string} url - Request URL
   * @param {Object} options - Fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async _fetchWithTimeout(url, options) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        const timeoutError = new Error('Request timeout');
        timeoutError.code = 'ECONNABORTED';
        throw timeoutError;
      }
      throw error;
    }
  }

  /**
   * Process API response
   * @private
   * @param {Response} response - Fetch response
   * @returns {Promise<Object>} Parsed response data
   */
  async _handleResponse(response) {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    let data;
    try {
      if (isJson) {
        data = await response.json();
      } else {
        data = await response.text();
      }
    } catch (parseError) {
      // If JSON parsing fails, try to get text
      console.error('Failed to parse response:', parseError);
      try {
        data = await response.text();
      } catch (textError) {
        data = { error: 'Failed to parse server response' };
      }
    }

    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401) {
        tokenManager.clearTokens();
        // Optionally redirect to login
        window.location.href = '/login';
      }

      // Handle different data types
      let errorMessage = 'Request failed';
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data.error) {
        errorMessage = data.error;
      } else if (data.message) {
        errorMessage = data.message;
      }

      const error = new Error(errorMessage);
      error.response = {
        status: response.status,
        data: data,
      };
      throw error;
    }

    return { data, status: response.status };
  }

  /**
   * Make GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} config - Request configuration
   * @returns {Promise<Object>} Response data
   */
  async get(endpoint, config = {}) {
    try {
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
      const headers = { ...this._getHeaders(), ...config.headers };

      const response = await this._fetchWithTimeout(url, {
        method: 'GET',
        headers,
      });

      return await this._handleResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Make POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} config - Request configuration
   * @returns {Promise<Object>} Response data
   */
  async post(endpoint, data = {}, config = {}) {
    try {
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
      const headers = { ...this._getHeaders(), ...config.headers };

      const response = await this._fetchWithTimeout(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      return await this._handleResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Make PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} config - Request configuration
   * @returns {Promise<Object>} Response data
   */
  async put(endpoint, data = {}, config = {}) {
    try {
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
      const headers = { ...this._getHeaders(), ...config.headers };

      const response = await this._fetchWithTimeout(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });

      return await this._handleResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Make PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} config - Request configuration
   * @returns {Promise<Object>} Response data
   */
  async patch(endpoint, data = {}, config = {}) {
    try {
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
      const headers = { ...this._getHeaders(), ...config.headers };

      const response = await this._fetchWithTimeout(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      });

      return await this._handleResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Make DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} config - Request configuration
   * @returns {Promise<Object>} Response data
   */
  async delete(endpoint, config = {}) {
    try {
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
      const headers = { ...this._getHeaders(), ...config.headers };

      const response = await this._fetchWithTimeout(url, {
        method: 'DELETE',
        headers,
      });

      return await this._handleResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }
}

const apiService = new ApiService();
export default apiService;
