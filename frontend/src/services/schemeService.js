import apiClient from './api.js';

const schemeService = {
  getSchemes: async (params = {}) => {
    const response = await apiClient.get('/scheme', { params });
    return response.data.data;
  },

  getAllSchemes: async (params = {}) => {
    const response = await apiClient.get('/scheme', { params });
    return response.data.data;
  },

  getRelevantSchemes: async () => {
    const response = await apiClient.get('/scheme/relevant');
    return response.data.data;
  },

  getSchemeById: async (id) => {
    const response = await apiClient.get(`/scheme/${id}`);
    return response.data.data;
  },

  seedSchemes: async () => {
    const response = await apiClient.post('/scheme/seed');
    return response.data.data;
  },

  applyForScheme: async (schemeId) => {
    const response = await apiClient.post(`/scheme/${schemeId}/apply`);
    return response.data.data;
  },
};

export default schemeService;
