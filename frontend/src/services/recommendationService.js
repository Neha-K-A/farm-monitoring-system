import apiClient from './api.js';

const recommendationService = {
  getCropRecommendations: async (farmId) => {
    const response = await apiClient.get(`/recommendation/crop/${farmId}`);
    return response.data.data;
  },

  getIrrigationRecommendations: async (farmId) => {
    const response = await apiClient.get(`/recommendation/irrigation/${farmId}`);
    return response.data.data;
  },

  getOrganicFarmingGuide: async () => {
    const response = await apiClient.get('/recommendation/organic');
    return response.data.data;
  },

  getModernToolsRecommendations: async () => {
    const response = await apiClient.get('/recommendation/modern-tools');
    return response.data.data;
  },
};

export default recommendationService;
