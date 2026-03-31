import React, { useEffect, useMemo } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, Platform, Text, View } from 'react-native';
import Constants from 'expo-constants';

import createAPIClient from '../src/api-client';
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

    if (!user) {
      if (inTabsGroup) {
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
    </Stack>
  );
}

export default function RootLayout() {
  // Browsers must use localhost to reach the dev backend on this machine.
  // Native devices/emulators should use LAN IP / emulator host mapping via app.json.
  const apiUrl =
    Platform.OS === 'web'
      ? 'http://localhost:3000/api'
      : (Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api');

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
          login: async () => ({ success: false, message: 'API client not initialized' }),
          register: async () => ({ success: false, message: 'API client not initialized' }),
          logout: async () => {},
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

