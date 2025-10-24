import api from './api';
import { API_ENDPOINTS } from '../config/api.config';

/**
 * Account service
 * Handles CRUD operations for accounts
 */
class AccountService {
  /**
   * Get all accounts with optional filters
   * @param {Object} filters - Filter options
   * @param {string} filters.type - Account type (checking, savings, credit_card, loan, investment, cash)
   * @param {string} filters.currency - Currency code (EUR, USD, BDT, etc.)
   * @param {boolean} filters.is_active - Active status
   * @returns {Promise<Array>} List of accounts
   */
  async getAccounts(filters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.type) params.append('type', filters.type);
      if (filters.currency) params.append('currency', filters.currency);
      if (filters.isActive !== undefined) params.append('is_active', filters.isActive);

      const url = params.toString()
        ? `${API_ENDPOINTS.ACCOUNTS}?${params}`
        : API_ENDPOINTS.ACCOUNTS;

      const response = await api.get(url);

      // Backend returns: { status: "success", data: [...] }
      return response.data.data.map(this._mapAccountFromAPI);
    } catch (error) {
      console.error('Get accounts error:', error);
      throw error;
    }
  }

  /**
   * Get single account by ID
   * @param {string} id - Account ID
   * @returns {Promise<Object>} Account object
   */
  async getAccount(id) {
    try {
      const response = await api.get(`${API_ENDPOINTS.ACCOUNTS}/${id}`);
      return this._mapAccountFromAPI(response.data.data);
    } catch (error) {
      console.error('Get account error:', error);
      throw error;
    }
  }

  /**
   * Create new account
   * @param {Object} accountData - Account data
   * @returns {Promise<Object>} Created account
   */
  async createAccount(accountData) {
    try {
      const apiData = this._mapAccountToAPI(accountData);
      const response = await api.post(API_ENDPOINTS.ACCOUNTS, apiData);
      return this._mapAccountFromAPI(response.data.data);
    } catch (error) {
      console.error('Create account error:', error);
      throw error;
    }
  }

  /**
   * Update account
   * @param {string} id - Account ID
   * @param {Object} accountData - Updated account data
   * @returns {Promise<Object>} Updated account
   */
  async updateAccount(id, accountData) {
    try {
      const apiData = this._mapAccountToAPI(accountData);
      const response = await api.put(`${API_ENDPOINTS.ACCOUNTS}/${id}`, apiData);
      return this._mapAccountFromAPI(response.data.data);
    } catch (error) {
      console.error('Update account error:', error);
      throw error;
    }
  }

  /**
   * Delete account
   * @param {string} id - Account ID
   * @returns {Promise<void>}
   */
  async deleteAccount(id) {
    try {
      await api.delete(`${API_ENDPOINTS.ACCOUNTS}/${id}`);
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  }

  /**
   * Get account summary (net worth, by currency, etc.)
   * @returns {Promise<Object>} Summary data
   */
  async getAccountSummary() {
    try {
      const response = await api.get(API_ENDPOINTS.ACCOUNT_SUMMARY);
      return response.data.data;
    } catch (error) {
      console.error('Get account summary error:', error);
      throw error;
    }
  }

  /**
   * Map account from API format to frontend format
   * @private
   */
  _mapAccountFromAPI(apiAccount) {
    return {
      id: apiAccount.id,
      name: apiAccount.name,
      type: apiAccount.type,
      currency: apiAccount.currency,
      openingBalance: apiAccount.opening_balance,
      currentBalance: apiAccount.current_balance,
      balance: apiAccount.current_balance, // Alias for compatibility
      isActive: apiAccount.is_active,
      institution: apiAccount.institution,
      creditLimit: apiAccount.credit_limit,
      interestRate: apiAccount.interest_rate,
      notes: apiAccount.notes,
      transactionCount: apiAccount.transaction_count,
      createdAt: apiAccount.created_at,
      updatedAt: apiAccount.updated_at,
    };
  }

  /**
   * Map account from frontend format to API format
   * @private
   */
  _mapAccountToAPI(account) {
    const apiData = {
      name: account.name,
      type: account.type,
      currency: account.currency,
      opening_balance: account.openingBalance !== undefined ? account.openingBalance : account.opening_balance,
    };

    // Include balance fields if provided
    if (account.balance !== undefined) {
      apiData.balance = account.balance;
    }

    if (account.balance_eur !== undefined) {
      apiData.balance_eur = account.balance_eur;
    }

    // Include created_by if provided (for user association)
    if (account.created_by !== undefined && account.created_by !== null && account.created_by !== '') {
      apiData.created_by = account.created_by;
    }

    // Only include optional fields if they have values
    if (account.institution !== undefined && account.institution !== null && account.institution !== '') {
      apiData.institution = account.institution;
    }

    if (account.notes !== undefined && account.notes !== null && account.notes !== '') {
      apiData.notes = account.notes;
    }

    if (account.isActive !== undefined) {
      apiData.is_active = account.isActive;
    } else if (account.is_active !== undefined) {
      apiData.is_active = account.is_active;
    }

    if (account.creditLimit !== undefined) {
      apiData.credit_limit = account.creditLimit;
    } else if (account.credit_limit !== undefined) {
      apiData.credit_limit = account.credit_limit;
    }

    if (account.interestRate !== undefined) {
      apiData.interest_rate = account.interestRate;
    } else if (account.interest_rate !== undefined) {
      apiData.interest_rate = account.interest_rate;
    }

    return apiData;
  }
}

const accountService = new AccountService();
export default accountService;
