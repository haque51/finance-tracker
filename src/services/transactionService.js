import api from './api';
import { API_ENDPOINTS } from '../config/api.config';

/**
 * Transaction service
 * Handles CRUD operations for transactions
 */
class TransactionService {
  /**
   * Get transactions with filters and pagination
   * @param {Object} filters - Filter options
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 50)
   * @returns {Promise<Object>} { transactions: [], pagination: {} }
   */
  async getTransactions(filters = {}, page = 1, limit = 50) {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);

      if (filters.type) params.append('type', filters.type);
      if (filters.accountId) params.append('account_id', filters.accountId);
      if (filters.categoryId) params.append('category_id', filters.categoryId);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      if (filters.minAmount) params.append('min_amount', filters.minAmount);
      if (filters.maxAmount) params.append('max_amount', filters.maxAmount);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`${API_ENDPOINTS.TRANSACTIONS}?${params}`);

      // Backend returns: { status: "success", data: { transactions: [...], pagination: {...} } }
      const { transactions, pagination } = response.data.data;

      return {
        transactions: transactions.map(this._mapTransactionFromAPI),
        pagination,
      };
    } catch (error) {
      console.error('Get transactions error:', error);
      throw error;
    }
  }

  /**
   * Get single transaction by ID
   * @param {string} id - Transaction ID
   * @returns {Promise<Object>} Transaction object
   */
  async getTransaction(id) {
    try {
      const response = await api.get(`${API_ENDPOINTS.TRANSACTIONS}/${id}`);
      return this._mapTransactionFromAPI(response.data.data);
    } catch (error) {
      console.error('Get transaction error:', error);
      throw error;
    }
  }

  /**
   * Create new transaction
   * @param {Object} transactionData - Transaction data
   * @returns {Promise<Object>} Created transaction
   */
  async createTransaction(transactionData) {
    try {
      const apiData = this._mapTransactionToAPI(transactionData);
      const response = await api.post(API_ENDPOINTS.TRANSACTIONS, apiData);
      return this._mapTransactionFromAPI(response.data.data);
    } catch (error) {
      console.error('Create transaction error:', error);
      throw error;
    }
  }

  /**
   * Update transaction
   * @param {string} id - Transaction ID
   * @param {Object} transactionData - Updated transaction data
   * @returns {Promise<Object>} Updated transaction
   */
  async updateTransaction(id, transactionData) {
    try {
      const apiData = this._mapTransactionToAPI(transactionData);
      const response = await api.put(`${API_ENDPOINTS.TRANSACTIONS}/${id}`, apiData);
      return this._mapTransactionFromAPI(response.data.data);
    } catch (error) {
      console.error('Update transaction error:', error);
      throw error;
    }
  }

  /**
   * Delete transaction
   * @param {string} id - Transaction ID
   * @returns {Promise<void>}
   */
  async deleteTransaction(id) {
    try {
      await api.delete(`${API_ENDPOINTS.TRANSACTIONS}/${id}`);
    } catch (error) {
      console.error('Delete transaction error:', error);
      throw error;
    }
  }

  /**
   * Toggle transaction reconciliation status
   * @param {string} id - Transaction ID
   * @returns {Promise<Object>} Updated transaction
   */
  async toggleReconciliation(id) {
    try {
      const endpoint = API_ENDPOINTS.TRANSACTIONS_RECONCILE.replace(':id', id);
      const response = await api.patch(endpoint);
      return this._mapTransactionFromAPI(response.data.data);
    } catch (error) {
      console.error('Toggle reconciliation error:', error);
      throw error;
    }
  }

  /**
   * Bulk import transactions
   * @param {Array} transactions - Array of transaction objects
   * @returns {Promise<Object>} Import results
   */
  async bulkImport(transactions) {
    try {
      const apiTransactions = transactions.map(this._mapTransactionToAPI);
      const response = await api.post(API_ENDPOINTS.TRANSACTIONS_BULK, {
        transactions: apiTransactions,
      });
      return response.data.data;
    } catch (error) {
      console.error('Bulk import error:', error);
      throw error;
    }
  }

  /**
   * Map transaction from API format to frontend format
   * @private
   */
  _mapTransactionFromAPI(apiTxn) {
    return {
      id: apiTxn.id,
      type: apiTxn.type,
      accountId: apiTxn.account_id,
      toAccountId: apiTxn.to_account_id,
      categoryId: apiTxn.category_id,
      amount: apiTxn.amount,
      currency: apiTxn.currency,
      description: apiTxn.description,
      date: apiTxn.transaction_date,
      reconciled: apiTxn.is_reconciled,
      notes: apiTxn.notes,
      createdAt: apiTxn.created_at,
      updatedAt: apiTxn.updated_at,
      // Joined data from backend
      accountName: apiTxn.account_name,
      toAccountName: apiTxn.to_account_name,
      categoryName: apiTxn.category_name,
      categoryColor: apiTxn.category_color,
    };
  }

  /**
   * Map transaction from frontend format to API format
   * @private
   */
  _mapTransactionToAPI(txn) {
    return {
      type: txn.type,
      account_id: txn.accountId || txn.account_id,
      to_account_id: txn.toAccountId || txn.to_account_id,
      category_id: txn.categoryId || txn.category_id,
      amount: txn.amount,
      description: txn.description,
      transaction_date: txn.date || txn.transaction_date,
      is_reconciled: txn.reconciled !== undefined ? txn.reconciled : txn.is_reconciled,
      notes: txn.notes,
    };
  }
}

export default new TransactionService();
