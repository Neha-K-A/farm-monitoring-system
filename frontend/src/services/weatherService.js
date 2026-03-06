import apiClient from './api.js';

const weatherService = {
  getCurrentWeather: async (farmId) => {
    const response = await apiClient.get(`/weather/current/${farmId}`);
    return response.data.data;
  },

  getWeatherForecast: async (farmId) => {
    const response = await apiClient.get(`/weather/forecast/${farmId}`);
    return response.data.data;
  },

  getWeatherHistory: async (farmId) => {
    const response = await apiClient.get(`/weather/history/${farmId}`);
    return response.data.data;
  },

  getSeasonalCrops: async () => {
    const response = await apiClient.get('/weather/seasonal-crops');
    return response.data.data;
  },
};

export default weatherService;
