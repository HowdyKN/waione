import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import { GitHubAuthProvider, useGitHubAuth } from './src/context/GitHubAuthContext';

function AppNavigator() {
  const { user, loading } = useGitHubAuth();
  const [error, setError] = useState(null);

  // Don't call checkAuth here - it's already called in the provider's useEffect
  // This component just reads the state

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#238636" />
        <Text style={styles.loadingText}>Loading...</Text>
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
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
    <GitHubAuthProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </GitHubAuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d1117',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8b949e',
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: '#da3633',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

