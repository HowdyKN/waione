import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Complete the auth session
WebBrowser.maybeCompleteAuthSession();

// Get GitHub Client ID from app config or use default
// Configure in app.json under extra.githubClientId
const getGitHubClientId = () => {
  const configClientId = Constants.expoConfig?.extra?.githubClientId;
  if (configClientId && configClientId !== 'YOUR_GITHUB_CLIENT_ID') {
    return configClientId;
  }
  // Fallback to hardcoded value (WAIGIT OAuth App)
  return 'Ov23liyvEDxvs5YWU17Z';
};

const GITHUB_CLIENT_ID = getGitHubClientId();

// Get backend URL from app config or use platform-specific defaults
const getBackendUrl = () => {
  // First, try to get from app config
  const configUrl = Constants.expoConfig?.extra?.backendUrl;
  if (configUrl && configUrl !== 'http://192.168.1.248:3000') {
    return configUrl;
  }
  
  // Platform-specific defaults
  if (Platform.OS === 'android') {
    // For Android emulator, use 10.0.2.2 to access host machine's localhost
    // For physical device, you need to use your computer's IP address
    return 'http://192.168.1.248:3000';
  }
  
  if (Platform.OS === 'ios') {
    // For iOS simulator, localhost works
    return 'http://192.168.1.248:3000';
  }
  
  // Default fallback
  return 'http://192.168.1.248:3000';
};

const BACKEND_URL = getBackendUrl();

const GITHUB_REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: 'waigit',
  path: 'auth',
});

const discovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
};

const TOKEN_STORAGE_KEY = '@waigit:github_token';
const USER_STORAGE_KEY = '@waigit:github_user';

class GitHubAuth {
  async authenticate() {
    try {
      const request = new AuthSession.AuthRequest({
        clientId: GITHUB_CLIENT_ID,
        scopes: ['repo', 'read:user', 'user:email'],
        responseType: AuthSession.ResponseType.Code,
        redirectUri: GITHUB_REDIRECT_URI,
        usePKCE: false, // GitHub OAuth doesn't require PKCE
      });

      const result = await request.promptAsync(discovery);

      if (result.type === 'success') {
        const { code } = result.params;
        
        // Exchange code for token via backend
        const token = await this.exchangeCodeForToken(code);
        
        if (token) {
          await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
          return { success: true, token };
        }
      }

      if (result.type === 'cancel') {
        return { success: false, error: 'Authentication cancelled' };
      }

      return { success: false, error: 'Authentication failed' };
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, error: error.message || 'Authentication failed' };
    }
  }

  async exchangeCodeForToken(code) {
    try {
      if (!BACKEND_URL) {
        throw new Error(
          'WAIGIT backend URL not configured. Please set backendUrl in app.json.\n' +
          'See TROUBLESHOOTING.md for configuration instructions.'
        );
      }

      console.log('Exchanging code for token with backend:', `${BACKEND_URL}/api/github/token`);

      const response = await fetch(`${BACKEND_URL}/api/github/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code, 
          redirectUri: GITHUB_REDIRECT_URI 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: Failed to exchange code for token`;
        
        // Provide more helpful error messages
        if (response.status === 0 || error.message?.includes('Network request failed')) {
          throw new Error(
            `Unable to connect to backend server at ${BACKEND_URL}.\n\n` +
            `Please ensure:\n` +
            `1. Your backend server is running\n` +
            `2. The backend URL is correct\n` +
            `3. For physical devices, use your computer's IP address instead of localhost\n` +
            `4. Your device and computer are on the same network`
          );
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.access_token) {
        throw new Error('No access token received from backend');
      }

      return data.access_token;
    } catch (error) {
      console.error('Token exchange error:', error);
      
      // Provide user-friendly error messages
      if (error.message?.includes('Network request failed') || error.message?.includes('Failed to fetch')) {
        throw new Error(
          `Network error: Unable to reach backend server.\n\n` +
          `Current backend URL: ${BACKEND_URL}\n\n` +
          `For physical devices, update the backend URL in app.json to use your computer's IP address.\n` +
          `Example: "http://192.168.1.100:3000"`
        );
      }
      
      throw error;
    }
  }

  async getStoredToken() {
    try {
      return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  async getStoredUser() {
    try {
      const userJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }

  async storeUser(user) {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user:', error);
    }
  }

  async logout() {
    try {
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }

  async isAuthenticated() {
    const token = await this.getStoredToken();
    return !!token;
  }
}

export default new GitHubAuth();

