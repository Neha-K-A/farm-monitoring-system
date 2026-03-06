import apiClient from './api.js';

const soilService = {
  addSoilTest: async (farmId, data) => {
    const response = await apiClient.post(`/soil/${farmId}/test`, data);
    return response.data.data;
  },

  getSoilRecords: async (farmId) => {
    const response = await apiClient.get(`/soil/farm/${farmId}`);
    return response.data.data;
  },

  getLatestSoil: async (farmId) => {
    const response = await apiClient.get(`/soil/farm/${farmId}/latest`);
    return response.data.data;
  },
};

export default soilService;
