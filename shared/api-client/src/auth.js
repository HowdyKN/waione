import APIClient from './client';
import endpoints from './endpoints';

class AuthService {
  constructor(apiClient) {
    this.api = apiClient;
  }

  async register(userData) {
    try {
      const response = await this.api.post(endpoints.auth.register, userData);
      if (response.data.success && response.data.data.tokens) {
        await this.api.setTokens(
          response.data.data.tokens.accessToken,
          response.data.data.tokens.refreshToken
        );
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async login(email, password, deviceInfo = null) {
    try {
      const response = await this.api.post(endpoints.auth.login, {
        email,
        password,
        deviceInfo
      });
      if (response.data.success && response.data.data.tokens) {
        await this.api.setTokens(
          response.data.data.tokens.accessToken,
          response.data.data.tokens.refreshToken
        );
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      const response = await this.api.post(endpoints.auth.logout);
      await this.api.clearTokens();
      return response.data;
    } catch (error) {
      // Clear tokens even if logout fails
      await this.api.clearTokens();
      throw this.handleError(error);
    }
  }

  async refreshToken() {
    try {
      const refreshToken = await this.api.getToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      const response = await this.api.post(endpoints.auth.refresh, {
        refreshToken
      });
      if (response.data.success && response.data.data.tokens) {
        await this.api.setTokens(
          response.data.data.tokens.accessToken,
          response.data.data.tokens.refreshToken
        );
      }
      return response.data;
    } catch (error) {
      await this.api.clearTokens();
      throw this.handleError(error);
    }
  }

  async getCurrentUser() {
    try {
      const response = await this.api.get(endpoints.auth.me);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async isAuthenticated() {
    try {
      const token = await this.api.getToken();
      return !!token;
    } catch (error) {
      return false;
    }
  }

  handleError(error) {
    if (error.response) {
      // Server responded with error
      return {
        message: error.response.data?.message || 'An error occurred',
        status: error.response.status,
        errors: error.response.data?.errors || null
      };
    } else if (error.request) {
      // Request made but no response
      return {
        message: 'Network error. Please check your connection.',
        status: 0
      };
    } else {
      // Error setting up request
      return {
        message: error.message || 'An unexpected error occurred',
        status: 0
      };
    }
  }
}

export default AuthService;










