import apiClient from './api.js';

const notificationService = {
  getNotifications: async (params = {}) => {
    const response = await apiClient.get('/notification', { params });
    return response.data.data;
  },

  getUnreadCount: async () => {
    const response = await apiClient.get('/notification/unread-count');
    return response.data.data;
  },

  markAsRead: async (id) => {
    const response = await apiClient.put(`/notification/${id}/read`);
    return response.data.data;
  },

  deleteNotification: async (id) => {
    const response = await apiClient.delete(`/notification/${id}`);
    return response.data.data;
  },
};

export default notificationService;
