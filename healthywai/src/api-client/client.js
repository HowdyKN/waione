import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL || 'http://localhost:3000/api';
    console.log('[APIClient] Initializing with baseURL:', this.baseURL);
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem('accessToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error getting token:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retried, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await axios.post(`${this.baseURL}/auth/refresh`, {
                refreshToken
              });

              const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;

              await AsyncStorage.setItem('accessToken', accessToken);
              if (newRefreshToken) {
                await AsyncStorage.setItem('refreshToken', newRefreshToken);
              }

              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            await this.clearTokens();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async setTokens(accessToken, refreshToken) {
    try {
      await AsyncStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        await AsyncStorage.setItem('refreshToken', refreshToken);
      }
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw error;
    }
  }

  async clearTokens() {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  async getToken() {
    try {
      return await AsyncStorage.getItem('accessToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Generic request methods
  async get(url, config = {}) {
    return this.client.get(url, config);
  }

  async post(url, data, config = {}) {
    const fullUrl = `${this.baseURL}${url}`;
    console.log(`[APIClient] POST ${fullUrl}`, { 
      data: data ? { ...data, password: data.password ? '***' : undefined } : undefined 
    });
    try {
      const response = await this.client.post(url, data, config);
      console.log(`[APIClient] POST ${url} success:`, response.status);
      return response;
    } catch (error) {
      const errorDetails = {
        message: error.message,
        code: error.code,
        fullUrl: fullUrl,
        baseURL: this.baseURL,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data
        } : null,
        request: error.request ? {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL
        } : null
      };
      console.error(`[APIClient] POST ${url} error:`, errorDetails);
      
      // Provide more specific error messages
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.error(`[APIClient] Connection failed to: ${fullUrl}`);
        console.error(`[APIClient] Make sure the backend is running and accessible at this URL`);
      }
      
      throw error;
    }
  }

  async put(url, data, config = {}) {
    return this.client.put(url, data, config);
  }

  async patch(url, data, config = {}) {
    return this.client.patch(url, data, config);
  }

  async delete(url, config = {}) {
    return this.client.delete(url, config);
  }
}

export default APIClient;

