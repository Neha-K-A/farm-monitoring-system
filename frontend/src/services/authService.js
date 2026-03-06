import apiClient from './api.js';

const authService = {
  register: async (data) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data.data;
  },

  login: async (data) => {
    const response = await apiClient.post('/auth/login', data);
    return response.data.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await apiClient.post('/auth/refresh-token', { refreshToken });
    return response.data.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data.data;
  },
};

export default authService;
