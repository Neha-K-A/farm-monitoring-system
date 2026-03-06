import apiClient from './api.js';

const marketService = {
  createListing: async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === 'productPhoto' && data[key]) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });
    const response = await apiClient.post('/market/listings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  getListings: async (params = {}) => {
    const response = await apiClient.get('/market/listings', { params });
    return response.data.data;
  },

  getMyListings: async () => {
    const response = await apiClient.get('/market/my-listings');
    return response.data.data;
  },

  getListingById: async (id) => {
    const response = await apiClient.get(`/market/listings/${id}`);
    return response.data.data;
  },

  updateListing: async (id, data) => {
    const response = await apiClient.put(`/market/listings/${id}`, data);
    return response.data.data;
  },

  deleteListing: async (id) => {
    const response = await apiClient.delete(`/market/listings/${id}`);
    return response.data.data;
  },

  sendInquiry: async (id, data) => {
    const response = await apiClient.post(`/market/listings/${id}/inquire`, data);
    return response.data.data;
  },
};

export default marketService;
