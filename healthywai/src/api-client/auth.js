import AsyncStorage from '@react-native-async-storage/async-storage';
import APIClient from './client';
import endpoints from './endpoints';

class AuthService {
  constructor(apiClient) {
    this.api = apiClient;
  }

  _getAttemptedUrl(error) {
    const baseURL =
      error?.config?.baseURL ||
      error?.response?.config?.baseURL ||
      null;
    const url =
      error?.config?.url ||
      error?.response?.config?.url ||
      null;
    if (!baseURL && !url) return null;
    if (!baseURL) return url;
    if (!url) return baseURL;
    return `${baseURL}${url}`;
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Response with success status and data
   * @throws {Error} Error with status, message, and errors array
   */
  async register(userData) {
    try {
      console.log('[AuthService] Registering user with data:', { ...userData, password: '***' });
      const response = await this.api.post(endpoints.auth.register, userData);
      console.log('[AuthService] Registration response:', response.data?.success ? 'Success' : 'Failed');
      
      // Store tokens if provided
      if (response.data?.success && response.data?.data?.tokens) {
        await this.api.setTokens(
          response.data.data.tokens.accessToken,
          response.data.data.tokens.refreshToken
        );
      }
      
      return response.data;
    } catch (error) {
      console.error('[AuthService] Registration error:', error);
      // Transform axios error into a structured error
      throw this._handleError(error);
    }
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} deviceInfo - Optional device information
   * @returns {Promise<Object>} Response with success status and data
   * @throws {Error} Error with status and message
   */
  async login(email, password, deviceInfo = null) {
    try {
      console.log('[AuthService] Logging in user:', email);
      const response = await this.api.post(endpoints.auth.login, {
        email,
        password,
        deviceInfo
      });
      console.log('[AuthService] Login response:', response.data?.success ? 'Success' : 'Failed');
      
      if (response.data?.success && response.data?.data?.tokens) {
        await this.api.setTokens(
          response.data.data.tokens.accessToken,
          response.data.data.tokens.refreshToken
        );
      }
      
      return response.data;
    } catch (error) {
      console.error('[AuthService] Login error:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Logout user
   * @returns {Promise<Object>} Response with success status
   */
  async logout() {
    try {
      await this.api.post(endpoints.auth.logout);
    } catch (error) {
      // Log error but don't throw - we want to clear tokens regardless
      console.error('Logout API error:', error);
    } finally {
      // Always clear tokens, even if API call fails
      await this.api.clearTokens();
    }
  }

  /**
   * Refresh access token
   * @returns {Promise<Object>} Response with new tokens
   * @throws {Error} Error if refresh fails
   */
  async refreshToken() {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await this.api.post(endpoints.auth.refresh, {
        refreshToken
      });
      
      if (response.data?.success && response.data?.data?.tokens) {
        await this.api.setTokens(
          response.data.data.tokens.accessToken,
          response.data.data.tokens.refreshToken
        );
      }
      
      return response.data;
    } catch (error) {
      // Clear tokens on refresh failure
      await this.api.clearTokens();
      throw this._handleError(error);
    }
  }

  /**
   * Get current authenticated user
   * @returns {Promise<Object>} Response with user data
   * @throws {Error} Error with status and message
   */
  async getCurrentUser() {
    try {
      const response = await this.api.get(endpoints.auth.me);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Save default delivery address on the user profile (PATCH /auth/me).
   */
  async updateProfileAddress(payload) {
    try {
      const response = await this.api.patch(endpoints.auth.me, payload);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Check if user is authenticated (has valid token)
   * @returns {Promise<boolean>} True if authenticated
   */
  async isAuthenticated() {
    try {
      const token = await this.api.getToken();
      return !!token;
    } catch (error) {
      return false;
    }
  }

  /**
   * Handle and transform axios errors into structured errors
   * @private
   * @param {Error} error - Axios error object
   * @returns {Error} Structured error with status, message, and errors
   */
  _handleError(error) {
    // Server responded with error status
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage =
        data?.message ||
        data?.error ||
        this._getDefaultMessageForStatus(status);
      
      const err = new Error(errorMessage);
      err.status = status;
      err.errors = data?.errors || null;
      err.data = data || null;
      err.response = error.response;
      err.attemptedUrl = this._getAttemptedUrl(error);
      return err;
    }
    
    // Request was made but no response received
    if (error.request) {
      let errorMessage = 'Unable to connect to the server.';
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running.';
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNRESET') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage =
          'Unable to reach the API. For a deployed site, set EXPO_PUBLIC_API_URL to your backend HTTPS URL when building (localhost only works on your own machine). Then confirm CORS allows this site origin.';
      }
      
      const err = new Error(errorMessage);
      err.status = 0;
      err.errors = null;
      err.request = error.request;
      err.code = error.code;
      err.attemptedUrl = this._getAttemptedUrl(error);
      return err;
    }
    
    // Error setting up the request
    const err = new Error(error.message || 'An unexpected error occurred');
    err.status = 0;
    err.errors = null;
    err.code = error.code;
    err.attemptedUrl = this._getAttemptedUrl(error);
    return err;
  }

  /**
   * Get default error message for HTTP status code
   * @private
   * @param {number} status - HTTP status code
   * @returns {string} Default error message
   */
  _getDefaultMessageForStatus(status) {
    const messages = {
      400: 'Invalid request. Please check your input.',
      401: 'Authentication required.',
      403: 'Access denied.',
      404: 'Resource not found.',
      409: 'A conflict occurred. This email may already be registered.',
      422: 'Validation failed. Please check your input.',
      500: 'Server error. Please try again later.',
      503: 'Service unavailable. Please try again later.'
    };
    
    return messages[status] || 'An error occurred. Please try again.';
  }
}

export default AuthService;
