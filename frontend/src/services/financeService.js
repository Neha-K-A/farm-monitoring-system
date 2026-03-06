import apiClient from './api.js';

const financeService = {
  recordTransaction: async (data) => {
    const response = await apiClient.post('/finance/transaction', data);
    return response.data.data;
  },

  getTransactions: async (params = {}) => {
    const response = await apiClient.get('/finance/transactions', { params });
    return response.data.data;
  },

  getSummary: async () => {
    const response = await apiClient.get('/finance/summary');
    return response.data.data;
  },

  getFinancialSummary: async () => {
    const response = await apiClient.get('/finance/summary');
    return response.data.data;
  },

  getProfitAnalysis: async (cropId) => {
    const response = await apiClient.get(`/finance/crop/${cropId}/profit`);
    return response.data.data;
  },

  getHarvestCost: async () => {
    const response = await apiClient.get('/finance/harvest-cost');
    return response.data.data;
  },

  // Bank account management
  saveBankAccount: async (bankDetails) => {
    const response = await apiClient.post('/finance/bank-account', bankDetails);
    return response.data.data;
  },

  getBankAccount: async () => {
    const response = await apiClient.get('/finance/bank-account');
    return response.data.data;
  },

  // Transaction status management
  updateTransactionStatus: async (transactionId, status) => {
    const response = await apiClient.put(`/finance/transaction/${transactionId}/status`, { status });
    return response.data.data;
  },

  // Convenience method to simulate transaction flow
  simulateTransactionFlow: async (transactionId) => {
    const statuses = ['initiated', 'processing', 'approved', 'transferred', 'credited'];
    const results = [];
    
    for (const status of statuses) {
      try {
        const result = await financeService.updateTransactionStatus(transactionId, status);
        results.push(result);
        // Small delay between status updates for animation
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to update status to ${status}:`, error);
        break;
      }
    }
    
    return results;
  }
};

export default financeService;
