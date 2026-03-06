import apiClient from './api.js';

const userService = {
  getProfile: async () => {
    const response = await apiClient.get('/user/profile');
    return response.data.data;
  },

  updateProfile: async (data) => {
    const response = await apiClient.put('/user/profile', data);
    return response.data.data;
  },

  updateHealthProfile: async (data) => {
    const response = await apiClient.put('/user/health-profile', data);
    return response.data.data;
  },

  uploadProfilePhoto: async (file) => {
    const formData = new FormData();
    formData.append('profilePhoto', file);
    const response = await apiClient.post('/user/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  getWomenJournal: async () => {
    const response = await apiClient.get('/user/women/journal');
    return response.data.data;
  },

  getWomenFriendlyTools: async () => {
    const response = await apiClient.get('/user/women/tools');
    return response.data.data;
  },

  deleteAccount: async (password) => {
    const response = await apiClient.delete('/user/account', {
      data: { password },
    });
    return response.data.data;
  },
};

export default userService;
