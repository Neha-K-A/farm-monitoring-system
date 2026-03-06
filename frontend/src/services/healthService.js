import apiClient from './api.js';

const healthService = {
  logHealth: async (data) => {
    const response = await apiClient.post('/health/log', data);
    return response.data.data;
  },

  getHealthLogs: async () => {
    const response = await apiClient.get('/health/logs');
    return response.data.data;
  },

  getHealthSummary: async () => {
    const response = await apiClient.get('/health/summary');
    return response.data.data;
  },

  getHealthTips: async () => {
    const response = await apiClient.get('/health/tips');
    return response.data.data;
  },
};

export default healthService;
