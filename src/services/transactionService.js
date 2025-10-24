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
    let apiData;
    try {
      apiData = this._mapTransactionToAPI(transactionData);

      // Detailed logging to debug validation issues
      console.log('=== TRANSACTION CREATE DEBUG ===');
      console.log('Frontend data:', transactionData);
      console.log('Mapped API payload:', apiData);
      console.log('Payload JSON:', JSON.stringify(apiData, null, 2));
      console.log('================================');

      const response = await api.post(API_ENDPOINTS.TRANSACTIONS, apiData);
      return this._mapTransactionFromAPI(response.data.data);
    } catch (error) {
      console.error('Create transaction error:', error);
      console.error('Failed payload was:', apiData);
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
      transferAccountId: apiTxn.to_account_id, // Alias for frontend compatibility
      categoryId: apiTxn.category_id,
      subcategoryId: apiTxn.subcategory_id,
      amount: apiTxn.amount,
      currency: apiTxn.currency || 'EUR',
      description: apiTxn.description,
      payee: apiTxn.description, // Alias for frontend compatibility
      date: apiTxn.transaction_date,
      reconciled: apiTxn.is_reconciled,
      notes: apiTxn.notes,
      memo: apiTxn.notes, // Alias for frontend compatibility
      userId: apiTxn.user_id,
      user_id: apiTxn.user_id, // Keep both formats for compatibility
      createdBy: apiTxn.created_by || apiTxn.user_id, // Fallback to user_id
      created_by: apiTxn.created_by || apiTxn.user_id, // Fallback to user_id
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
    // Build payload - only include fields backend accepts
    const payload = {
      type: txn.type,
      account_id: txn.accountId || txn.account_id,
      amount: txn.amount,
      currency: txn.currency || 'EUR',
      date: txn.date || txn.transaction_date, // Backend expects "date" not "transaction_date"
    };

    // Only include to_account_id for transfers (omit null)
    const toAccountId = txn.toAccountId || txn.to_account_id;
    if (toAccountId && txn.type === 'transfer') {
      payload.to_account_id = toAccountId;
    }

    // Only include category_id for income/expense (not for transfers, omit null)
    const categoryId = txn.categoryId || txn.category_id;
    if (categoryId && txn.type !== 'transfer') {
      payload.category_id = categoryId;
    }

    // Note: Backend does NOT accept these fields:
    // - subcategory_id (not supported)
    // - description (not supported)
    // - notes (not supported)
    // - is_reconciled (not supported on create/update)
    // - transaction_date (use "date" instead)

    return payload;
  }
}

const transactionService = new TransactionService();
export default transactionService;
