import axios from 'axios';
import { API_BASE_URL } from '../utils/constants.js';
import localStorage_API from '../utils/localStorage.js';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds global timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage_API.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle 401 and refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage_API.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        localStorage_API.setAccessToken(accessToken);
        localStorage_API.setRefreshToken(newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (err) {
        localStorage_API.clearTokens();
        localStorage_API.clearUser();
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    // Fallback Mock Engine for 503 or Network Errors when Backend is Offline
    if (!error.response || error.response?.status === 503 || error.code === 'ERR_NETWORK') {
      const url = originalRequest.url;
      console.warn(`[API Mock] Network error or 503 for ${url}. Providing local simulated data.`);

      const mockResult = { data: [] };

      // Simulate specific endpoints
      if (url.includes('/api/sensors')) {
        mockResult.data = {
          moisture: 63, temperature: 28, humidity: 45, phLevel: 6.5,
          lightIntensity: 800, waterTank: 72, cropHealth: 87
        };
      } else if (url.includes('weather')) {
        mockResult.data = {
          current: { temp: 28, humidity: 45, condition: 'Sunny' },
          forecast: [
            { day: 'Mon', temp: 29 }, { day: 'Tue', temp: 30 }, { day: 'Wed', temp: 27 }
          ]
        };
      } else if (url.includes('predict')) {
        mockResult.data = [
          { crop: 'Wheat', probability: 0.92 },
          { crop: 'Corn', probability: 0.85 },
          { crop: 'Rice', probability: 0.70 }
        ];
      }

      return Promise.resolve(mockResult);
    }

    // Standardize Error Messages for API Reliability (Phase 12)
    let userFriendlyMessage = 'Something went wrong. Please try again.';

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      userFriendlyMessage = 'The server is taking too long to respond. Please check your connection and try again.';
    } else if (!error.response || error.code === 'ERR_NETWORK') {
      userFriendlyMessage = 'Network Error. Please check your internet connection or try again later.';
    } else if (error.response?.data?.message) {
      userFriendlyMessage = error.response.data.message;
    } else if (error.response?.status >= 500) {
      userFriendlyMessage = 'Our servers are experiencing issues. Please try again later.';
    }

    // Attach the friendly message to the error object so components can show it
    error.friendlyMessage = userFriendlyMessage;
    // We also overwrite the standard message so simple err.message checks catch it too
    error.message = userFriendlyMessage;

    // Make sure the response data object exists with the friendly message so hook fallbacks work
    if (!error.response) {
      error.response = { data: { message: userFriendlyMessage } };
    } else if (!error.response.data) {
      error.response.data = { message: userFriendlyMessage };
    } else if (!error.response.data.message) {
      error.response.data.message = userFriendlyMessage;
    }

    return Promise.reject(error);
  }
);

export default apiClient;
