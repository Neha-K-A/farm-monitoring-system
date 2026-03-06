import { createContext, useContext, useState, useEffect } from 'react';
import localStorage_API from '../utils/localStorage.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage_API.getUser();
    const accessToken = localStorage_API.getAccessToken();

    if (storedUser && accessToken) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (userData, accessToken, refreshToken) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage_API.setAccessToken(accessToken);
    localStorage_API.setRefreshToken(refreshToken);
    localStorage_API.setUser(userData);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage_API.clearTokens();
    localStorage_API.clearUser();
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage_API.setUser(userData);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};
