import apiClient from './api.js';

const farmService = {
  createFarm: async (data) => {
    const response = await apiClient.post('/farm', data);
    return response.data.data;
  },

  getFarms: async () => {
    const response = await apiClient.get('/farm');
    return response.data.data;
  },

  getFarmById: async (farmId) => {
    const response = await apiClient.get(`/farm/${farmId}`);
    return response.data.data;
  },

  updateFarm: async (farmId, data) => {
    const response = await apiClient.put(`/farm/${farmId}`, data);
    return response.data.data;
  },

  deleteFarm: async (farmId) => {
    const response = await apiClient.delete(`/farm/${farmId}`);
    return response.data.data;
  },

  getFarmSummary: async (farmId) => {
    const response = await apiClient.get(`/farm/${farmId}/summary`);
    return response.data.data;
  },
};

export default farmService;
