const KEYS = {
  ACCESS_TOKEN: 'APP_ACCESS_TOKEN',
  REFRESH_TOKEN: 'APP_REFRESH_TOKEN',
  USER: 'APP_USER',
  LANGUAGE: 'APP_LANGUAGE',
  THEME: 'APP_THEME',
};

export const localStorage_API = {
  // Token Management
  setAccessToken: (token) => {
    if (token) {
      localStorage.setItem(KEYS.ACCESS_TOKEN, token);
    }
  },

  getAccessToken: () => {
    return localStorage.getItem(KEYS.ACCESS_TOKEN);
  },

  setRefreshToken: (token) => {
    if (token) {
      localStorage.setItem(KEYS.REFRESH_TOKEN, token);
    }
  },

  getRefreshToken: () => {
    return localStorage.getItem(KEYS.REFRESH_TOKEN);
  },

  clearTokens: () => {
    localStorage.removeItem(KEYS.ACCESS_TOKEN);
    localStorage.removeItem(KEYS.REFRESH_TOKEN);
  },

  // User Management
  setUser: (user) => {
    if (user) {
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
    }
  },

  getUser: () => {
    const user = localStorage.getItem(KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  clearUser: () => {
    localStorage.removeItem(KEYS.USER);
  },

  // Language Preference
  setLanguage: (language) => {
    if (language) {
      localStorage.setItem(KEYS.LANGUAGE, language);
    }
  },

  getLanguage: () => {
    return localStorage.getItem(KEYS.LANGUAGE) || 'en';
  },

  // Theme Preference
  setTheme: (theme) => {
    if (theme) {
      localStorage.setItem(KEYS.THEME, theme);
    }
  },

  getTheme: () => {
    return localStorage.getItem(KEYS.THEME) || 'light';
  },

  // Clear All
  clearAll: () => {
    localStorage.clear();
  },
};

export default localStorage_API;
