import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

export const AuthProvider = ({ children, apiClient }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const isAuthenticated = await apiClient.auth.isAuthenticated();
      if (isAuthenticated) {
        try {
          const response = await apiClient.auth.getCurrentUser();
          if (response && response.success) {
            setUser(response.data.user);
          } else {
            // Invalid token or user not found, clear tokens
            await apiClient.client.clearTokens();
            setUser(null);
          }
        } catch (userError) {
          // Handle 500 errors and other server errors gracefully
          console.error('Error fetching current user:', userError);
          const status = userError.status || userError.response?.status;
          
          if (status === 500) {
            // Server error - clear tokens and continue without user
            console.warn('Server error during auth check, clearing tokens');
            await apiClient.client.clearTokens();
            setUser(null);
          } else if (status === 401 || status === 403) {
            // Unauthorized - clear tokens
            await apiClient.client.clearTokens();
            setUser(null);
          } else {
            // Network or other errors - clear tokens to be safe
            await apiClient.client.clearTokens();
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // Clear tokens on any error to ensure clean state
      try {
        await apiClient.client.clearTokens();
      } catch (clearError) {
        console.error('Error clearing tokens:', clearError);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiClient.auth.login(email, password);
      if (response.success) {
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiClient.auth.register(userData);
      if (response.success) {
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await apiClient.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      await apiClient.client.clearTokens();
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

