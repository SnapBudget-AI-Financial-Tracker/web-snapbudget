import api from './api';

/**
 * Get all transactions for the current user
 * @returns {Promise<Array>} List of transactions
 */
const getTransactions = async () => {
  const response = await api.get('/transactions');
  return response.data;
};

/**
 * Get a single transaction by ID
 * @param {string} id Transaction ID
 * @returns {Promise<Object>} Transaction object
 */
const getTransactionById = async (id) => {
  const response = await api.get(`/transactions/${id}`);
  return response.data;
};

/**
 * Create a new transaction
 * @param {Object} transactionData Transaction data (amount, category, description, date, receiptUrl)
 * @returns {Promise<Object>} Created transaction
 */
const createTransaction = async (transactionData) => {
  const response = await api.post('/transactions', transactionData);
  return response.data;
};

/**
 * Update an existing transaction
 * @param {string} id Transaction ID
 * @param {Object} transactionData Updated transaction data
 * @returns {Promise<Object>} Updated transaction
 */
const updateTransaction = async (id, transactionData) => {
  const response = await api.put(`/transactions/${id}`, transactionData);
  return response.data;
};

/**
 * Delete a transaction
 * @param {string} id Transaction ID
 * @returns {Promise<Object>} Success message
 */
const deleteTransaction = async (id) => {
  const response = await api.delete(`/transactions/${id}`);
  return response.data;
};

const transactionService = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};

export default transactionService;
