import api from './api';
import { API_ENDPOINTS } from '../config/api.config';

/**
 * Currency service
 * Handles currency exchange rates and conversions
 */
class CurrencyService {
  /**
   * Get all exchange rates
   * @returns {Promise<Array>} List of exchange rates
   */
  async getExchangeRates() {
    try {
      const response = await api.get(API_ENDPOINTS.CURRENCY_RATES);
      return response.data.data;
    } catch (error) {
      console.error('Get exchange rates error:', error);
      throw error;
    }
  }

  /**
   * Get specific exchange rate
   * @param {string} from - From currency code (e.g., "EUR")
   * @param {string} to - To currency code (e.g., "USD")
   * @returns {Promise<Object>} Exchange rate data
   */
  async getExchangeRate(from, to) {
    try {
      const response = await api.get(`${API_ENDPOINTS.CURRENCY_RATES}/${from}/${to}`);
      return response.data.data;
    } catch (error) {
      console.error('Get exchange rate error:', error);
      throw error;
    }
  }

  /**
   * Create or update exchange rate
   * @param {string} baseCurrency - Base currency code
   * @param {string} targetCurrency - Target currency code
   * @param {number} rate - Exchange rate
   * @returns {Promise<Object>} Created/updated rate
   */
  async setExchangeRate(baseCurrency, targetCurrency, rate) {
    try {
      const response = await api.post(API_ENDPOINTS.CURRENCY_RATES, {
        base_currency: baseCurrency,
        target_currency: targetCurrency,
        rate,
      });
      return response.data.data;
    } catch (error) {
      console.error('Set exchange rate error:', error);
      throw error;
    }
  }

  /**
   * Convert amount between currencies
   * @param {number} amount - Amount to convert
   * @param {string} from - From currency code
   * @param {string} to - To currency code
   * @returns {Promise<Object>} Conversion result
   */
  async convertCurrency(amount, from, to) {
    try {
      const response = await api.post(API_ENDPOINTS.CURRENCY_CONVERT, {
        amount,
        from_currency: from,
        to_currency: to,
      });
      return response.data.data;
    } catch (error) {
      console.error('Convert currency error:', error);
      throw error;
    }
  }
}

export default new CurrencyService();
