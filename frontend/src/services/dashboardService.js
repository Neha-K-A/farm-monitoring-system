import api from './api.js';

const dashboardService = {
    // GET /api/v1/dashboard/summary
    getSummary: async () => {
        const { data } = await api.get('/dashboard/summary');
        return data?.data || data;
    },

    // GET /api/v1/analytics/predictions
    getPredictions: async () => {
        const { data } = await api.get('/analytics/predictions');
        return data?.data || data;
    },

    // GET /api/v1/finance/harvest-cost
    getHarvestCost: async () => {
        const { data } = await api.get('/finance/harvest-cost');
        return data?.data || data;
    },

    // GET /api/v1/weather/mock — public, no auth required
    getWeatherMock: async () => {
        const { data } = await api.get('/weather/mock');
        return data?.data || data;
    },
};

export default dashboardService;
