import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children, apiClient }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastError, setLastError] = useState(null);

  /**
   * Check if user is authenticated on app load
   */
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if token exists
      const isAuthenticated = await apiClient.auth.isAuthenticated();
      
      if (!isAuthenticated) {
        setUser(null);
        return;
      }
      
      // Try to get current user
      try {
        const response = await apiClient.auth.getCurrentUser();
        if (response?.success && response?.data?.user) {
          setUser(response.data.user);
        } else {
          // Invalid response, clear tokens
          await apiClient.client.clearTokens();
          setUser(null);
        }
      } catch (userError) {
        // If we get a 401/403, token is invalid - clear it
        const status = userError.status || userError.response?.status;
        if (status === 401 || status === 403) {
          await apiClient.client.clearTokens();
        }
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      // Clear tokens on any error to ensure clean state
      try {
        await apiClient.client.clearTokens();
      } catch (clearError) {
        console.error('Error clearing tokens:', clearError);
      }
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  const login = async (email, password) => {
    try {
      setLastError(null);
      const response = await apiClient.auth.login(email, password);
      
      if (response?.success && response?.data?.user) {
        setUser(response.data.user);
        return { success: true };
      }

      const failMessage = response?.message || 'Login failed. Please try again.';
      setLastError({
        message: failMessage,
        status: response?.status ?? 0,
        errors: response?.errors ?? null,
        data: response ?? null,
        code: null,
        attemptedUrl: null
      });
      return {
        success: false,
        message: failMessage
      };
    } catch (error) {
      setLastError({
        message: error?.message || 'Login failed.',
        status: error?.status || error?.response?.status || 0,
        errors: error?.errors || error?.response?.data?.errors || null,
        data: error?.data || error?.response?.data || null,
        code: error?.code || null,
        attemptedUrl: error?.attemptedUrl || null
      });
      return {
        success: false,
        message: error?.message || 'Login failed. Please check your credentials.'
      };
    }
  };

  /**
   * Register new user
   * @param {Object} userData - Registration data
   * @returns {Promise<{success: boolean, message?: string, errors?: Array}>}
   */
  const register = async (userData) => {
    try {
      setLastError(null);
      const response = await apiClient.auth.register(userData);
      
      if (response?.success && response?.data?.user) {
        setUser(response.data.user);
        return { success: true };
      }
      
      // Registration failed but got a response
      const errorMessage = response?.message || 'Registration failed. Please try again.';
      const errors = response?.errors || null;
      
      return {
        success: false,
        message: errorMessage,
        errors: errors
      };
    } catch (error) {
      // Extract error details
      const errorMessage = error.message || 'Registration failed. Please try again.';
      const errors = error.errors || error.response?.data?.errors || null;
      
      setLastError({
        message: errorMessage,
        status: error?.status || error?.response?.status || 0,
        errors,
        data: error?.data || error?.response?.data || null,
        code: error?.code || null,
        attemptedUrl: error?.attemptedUrl || null
      });

      return {
        success: false,
        message: errorMessage,
        errors: errors
      };
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await apiClient.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      // Ensure tokens are cleared
      try {
        await apiClient.client.clearTokens();
      } catch (clearError) {
        console.error('Error clearing tokens:', clearError);
      }
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
    lastError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context == null) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
