import React, { useEffect, useMemo } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';

import createAPIClient from '../src/api-client';
import { getApiBaseUrl } from '../src/config/apiUrl';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

function LoadingScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 10, color: '#666' }}>Loading...</Text>
    </View>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const first = segments[0];
    const inAuthGroup = first === '(auth)';
    const inTabsGroup = first === '(tabs)';

    const inOrderGroup = first === 'order';

    if (!user) {
      if (inTabsGroup || inOrderGroup) {
        router.replace('/login');
      }
      return;
    }

    if (inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments.join('/'), router]);

  if (loading) return <LoadingScreen />;

  // Both groups must stay registered so the URL can move from /login to /(tabs) after sign-in.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="order" />
    </Stack>
  );
}

export default function RootLayout() {
  const apiUrl = getApiBaseUrl();

  const apiClient = useMemo(() => {
    try {
      return createAPIClient(apiUrl);
    } catch (error) {
      console.error('Failed to initialize API client:', error);
      return {
        client: {
          clearTokens: async () => {},
          getToken: async () => null,
        },
        auth: {
          isAuthenticated: async () => false,
          getCurrentUser: async () => ({ success: false }),
          updateProfileAddress: async () => ({ success: false }),
          login: async () => ({ success: false, message: 'API client not initialized' }),
          requestPhoneOtp: async () => ({ success: false, message: 'API client not initialized' }),
          verifyPhoneOtp: async () => ({ success: false, message: 'API client not initialized' }),
          register: async () => ({ success: false, message: 'API client not initialized' }),
          logout: async () => {},
        },
        orders: {
          listProducts: async () => ({ success: false }),
          createOrder: async () => ({ success: false }),
          listOrders: async () => ({ success: false }),
          getOrder: async () => ({ success: false }),
        },
      };
    }
  }, [apiUrl]);

  return (
    <AuthProvider apiClient={apiClient}>
      <RootNavigator />
    </AuthProvider>
  );
}

