import api from './api';
import { API_ENDPOINTS } from '../config/api.config';

/**
 * Exchange Rates History Service
 * Handles historical exchange rates for accurate historical balance calculations
 */
class ExchangeRatesService {
  /**
   * Get historical exchange rates for a specific month
   * @param {string} month - Month in format "YYYY-MM" (e.g., "2025-01")
   * @returns {Promise<Object>} Exchange rates object for the specified month
   */
  async getHistoricalRates(month) {
    try {
      const endpoint = API_ENDPOINTS.EXCHANGE_RATES_HISTORICAL.replace(':month', month);
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Get historical exchange rates error:', error);
      // Return null instead of throwing for missing data (not a critical error)
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Save exchange rates snapshot for a specific month
   * @param {string} month - Month in format "YYYY-MM"
   * @param {Object} rates - Exchange rates object (e.g., {USD: 0.92, BDT: 0.0084, EUR: 1})
   * @returns {Promise<Object>} Saved exchange rates record
   */
  async saveRatesSnapshot(month, rates) {
    try {
      const response = await api.post(API_ENDPOINTS.EXCHANGE_RATES_SNAPSHOT, {
        month,
        rates
      });
      return response.data;
    } catch (error) {
      console.error('Save exchange rates snapshot error:', error);
      throw error;
    }
  }

  /**
   * Get list of months with available exchange rate history
   * @returns {Promise<Array>} List of months with available data
   */
  async getAvailableMonths() {
    try {
      const response = await api.get(API_ENDPOINTS.EXCHANGE_RATES_AVAILABLE_MONTHS);
      return response.data;
    } catch (error) {
      console.error('Get available months error:', error);
      throw error;
    }
  }

  /**
   * Delete exchange rate history for a specific month
   * @param {string} month - Month in format "YYYY-MM"
   * @returns {Promise<Object>} Success response
   */
  async deleteRatesForMonth(month) {
    try {
      const endpoint = API_ENDPOINTS.EXCHANGE_RATES_HISTORICAL.replace(':month', month);
      const response = await api.delete(endpoint);
      return response.data;
    } catch (error) {
      console.error('Delete exchange rates error:', error);
      throw error;
    }
  }
}

export default new ExchangeRatesService();
