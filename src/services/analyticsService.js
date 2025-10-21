import api from './api';
import { API_ENDPOINTS } from '../config/api.config';

/**
 * Analytics service
 * Handles analytics and dashboard data
 */
class AnalyticsService {
  /**
   * Get dashboard metrics for a specific month
   * @param {string} month - Month in YYYY-MM format (e.g., "2025-10")
   * @returns {Promise<Object>} Dashboard data
   */
  async getDashboard(month) {
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month);

      const url = params.toString()
        ? `${API_ENDPOINTS.ANALYTICS_DASHBOARD}?${params}`
        : API_ENDPOINTS.ANALYTICS_DASHBOARD;

      const response = await api.get(url);
      return this._mapDashboardFromAPI(response.data.data);
    } catch (error) {
      console.error('Get dashboard error:', error);
      throw error;
    }
  }

  /**
   * Get spending analysis
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Object>} Spending analysis
   */
  async getSpendingAnalysis(startDate, endDate) {
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      });

      const response = await api.get(`${API_ENDPOINTS.ANALYTICS_SPENDING}?${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Get spending analysis error:', error);
      throw error;
    }
  }

  /**
   * Get net worth history
   * @returns {Promise<Object>} Net worth data
   */
  async getNetWorth() {
    try {
      const response = await api.get(API_ENDPOINTS.ANALYTICS_NET_WORTH);
      return response.data.data;
    } catch (error) {
      console.error('Get net worth error:', error);
      throw error;
    }
  }

  /**
   * Get monthly trends
   * @param {number} months - Number of months to retrieve (default: 6)
   * @returns {Promise<Array>} Monthly trend data
   */
  async getMonthlyTrends(months = 6) {
    try {
      const params = new URLSearchParams({ months: months.toString() });
      const response = await api.get(`${API_ENDPOINTS.ANALYTICS_TRENDS}?${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Get monthly trends error:', error);
      throw error;
    }
  }

  /**
   * Map dashboard data from API format
   * @private
   */
  _mapDashboardFromAPI(apiData) {
    return {
      // Metrics
      totalIncome: apiData.total_income,
      totalExpenses: apiData.total_expenses,
      netWorth: apiData.net_worth,
      savingsRate: apiData.savings_rate,

      // Charts data
      incomeVsExpenses: apiData.income_vs_expenses,
      spendingByCategory: apiData.spending_by_category,
      monthlyTrends: apiData.monthly_trends,
      netWorthByAccountType: apiData.net_worth_by_account_type,

      // Comparisons
      incomeChange: apiData.income_change,
      expenseChange: apiData.expense_change,

      // Period info
      month: apiData.month,
      year: apiData.year,
    };
  }
}

export default new AnalyticsService();
