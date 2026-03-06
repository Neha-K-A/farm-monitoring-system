import apiClient from './api.js';

const waterService = {
  logWaterUsage: async (data) => {
    const response = await apiClient.post('/water/log', data);
    return response.data.data;
  },

  getWaterLogs: async (farmId) => {
    const response = await apiClient.get(`/water/farm/${farmId}`);
    return response.data.data;
  },

  getWaterStats: async (farmId) => {
    const response = await apiClient.get(`/water/farm/${farmId}/stats`);
    return response.data.data;
  },

  setWaterTarget: async (farmId, data) => {
    const response = await apiClient.put(`/water/farm/${farmId}/target`, data);
    return response.data.data;
  },
};

export default waterService;
