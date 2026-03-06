import apiClient from './api.js';

const cropService = {
  createCrop: async (data) => {
    const response = await apiClient.post('/crop', data);
    return response.data.data;
  },

  getCrops: async (params = {}) => {
    const response = await apiClient.get('/crop', { params });
    return response.data.data;
  },

  getCropById: async (cropId) => {
    const response = await apiClient.get(`/crop/${cropId}`);
    return response.data.data;
  },

  updateCrop: async (cropId, data) => {
    const response = await apiClient.put(`/crop/${cropId}`, data);
    return response.data.data;
  },

  deleteCrop: async (cropId) => {
    const response = await apiClient.delete(`/crop/${cropId}`);
    return response.data.data;
  },

  addInput: async (cropId, data) => {
    const response = await apiClient.post(`/crop/${cropId}/input`, data);
    return response.data.data;
  },

  addDisease: async (cropId, data) => {
    const response = await apiClient.post(`/crop/${cropId}/disease`, data);
    return response.data.data;
  },

  addGrowthStage: async (cropId, data) => {
    const response = await apiClient.post(`/crop/${cropId}/growth-stage`, data);
    return response.data.data;
  },

  getDueYields: async (daysAhead = 30) => {
    const response = await apiClient.get('/crop/due-yields', {
      params: { daysAhead },
    });
    return response.data.data;
  },

  calculateProfit: async (cropId) => {
    const response = await apiClient.get(`/crop/${cropId}/profit`);
    return response.data.data;
  },
};

export default cropService;
