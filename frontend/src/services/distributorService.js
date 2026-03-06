import apiClient from './api.js';

const distributorService = {
  getDistributors: async (params = {}) => {
    const response = await apiClient.get('/distributor', { params });
    return response.data.data;
  },

  getNearbyDistributors: async (params = {}) => {
    const response = await apiClient.get('/distributor/nearby', { params });
    return response.data.data;
  },

  getDistributorById: async (id) => {
    const response = await apiClient.get(`/distributor/${id}`);
    return response.data.data;
  },
};

export default distributorService;
