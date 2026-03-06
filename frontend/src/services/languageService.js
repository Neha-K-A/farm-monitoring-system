import apiClient from './api.js';

const languageService = {
  getSupportedLanguages: async () => {
    const response = await apiClient.get('/language/supported');
    return response.data.data;
  },

  updateLanguagePreference: async (language) => {
    const response = await apiClient.put('/language/preference', { language });
    return response.data.data;
  },

  translateText: async (data) => {
    const response = await apiClient.get('/language/translate', {
      params: data,
    });
    return response.data.data;
  },
};

export default languageService;
