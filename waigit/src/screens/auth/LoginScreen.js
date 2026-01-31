import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  SafeAreaView,
} from 'react-native';
import { useGitHubAuth } from '../../context/GitHubAuthContext';

export default function LoginScreen() {
  const { login, loading } = useGitHubAuth();
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setError(null);
    const result = await login();
    
    if (!result.success) {
      setError(result.error || 'Failed to authenticate with GitHub');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>WAIGIT</Text>
          <Text style={styles.subtitle}>GitHub Repository Manager</Text>
        </View>

        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🐙</Text>
        </View>

        <Text style={styles.description}>
          Connect to your GitHub account to manage your repositories on the go
        </Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonText}>Sign in with GitHub</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          You'll be redirected to GitHub to authorize this app
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#24292e',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8b949e',
  },
  iconContainer: {
    marginBottom: 32,
  },
  icon: {
    fontSize: 80,
  },
  description: {
    fontSize: 16,
    color: '#c9d1d9',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#238636',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    color: '#8b949e',
    textAlign: 'center',
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: '#da3633',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});

