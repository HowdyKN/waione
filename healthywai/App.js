import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, Text } from 'react-native';
import Constants from 'expo-constants';

import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import createAPIClient from './src/api-client/index';

// Get API URL from app config
const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://10.0.4.54:3000/api';

// Initialize API client
console.log('Initializing API client with URL:', apiUrl);
let apiClient;
try {
  apiClient = createAPIClient(apiUrl);
  console.log('API client initialized successfully');
} catch (error) {
  console.error('Failed to initialize API client:', error);
  // Create a minimal fallback client to prevent app crash
  apiClient = {
    client: { 
      clearTokens: async () => {},
      getToken: async () => null
    },
    auth: {
      isAuthenticated: async () => false,
      getCurrentUser: async () => ({ success: false }),
      login: async () => ({ success: false, message: 'API client not initialized' }),
      register: async () => ({ success: false, message: 'API client not initialized' }),
      logout: async () => {}
    }
  };
}

function AppNavigator() {
  const { user, loading, checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Debug logging
  useEffect(() => {
    console.log('AppNavigator - loading:', loading, 'user:', user ? 'logged in' : 'not logged in');
  }, [loading, user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider apiClient={apiClient}>
      <AppNavigator />
    </AuthProvider>
  );
}


