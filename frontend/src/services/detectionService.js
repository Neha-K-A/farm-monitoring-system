import apiClient from './api.js';

const detectionService = {
  detectDisease: async (formData) => {
    const response = await apiClient.post('/detection/detect/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  getDetectionResults: async (params = {}) => {
    const response = await apiClient.get('/detection/results', { params });
    return response.data.data;
  },

  getPipelineStatus: async () => {
    const response = await apiClient.get('/detection/status');
    return response.data.data;
  },
};

export default detectionService;
