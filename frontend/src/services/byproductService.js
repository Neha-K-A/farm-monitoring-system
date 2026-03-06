import apiClient from './api.js';

const byproductService = {
  createByProduct: async (data) => {
    const response = await apiClient.post('/byproduct', data);
    return response.data.data;
  },

  getByProducts: async (params = {}) => {
    const response = await apiClient.get('/byproduct', { params });
    return response.data.data;
  },

  getByProductSuggestions: async (cropType = null) => {
    const response = await apiClient.get('/byproduct/suggestions', {
      params: { cropType },
    });
    return response.data.data;
  },

  updateByProduct: async (id, data) => {
    const response = await apiClient.put(`/byproduct/${id}`, data);
    return response.data.data;
  },

  deleteByProduct: async (id) => {
    const response = await apiClient.delete(`/byproduct/${id}`);
    return response.data.data;
  },
};

export default byproductService;
