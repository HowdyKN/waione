import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import Constants from 'expo-constants';

import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import createAPIClient from '../../shared/api-client/src/index';

const Stack = createNativeStackNavigator();

// Get API URL from app config
const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api';

// Initialize API client
const apiClient = createAPIClient(apiUrl);

function AppNavigator() {
  const { user, loading, checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
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










