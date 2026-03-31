import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, lastError } = useAuth();
  const [submitError, setSubmitError] = useState(null);
  const [statusBanner, setStatusBanner] = useState(null);

  const handleLogin = async () => {
    if (!email || !password) {
      const msg = 'Please fill in all fields';
      setStatusBanner({ type: 'error', text: msg });
      Alert.alert('Error', msg);
      return;
    }

    setLoading(true);
    setSubmitError(null);
    setStatusBanner(null);
    try {
      const result = await login(email, password);

      if (!result.success) {
        const msg = result.message || 'Invalid credentials';
        setSubmitError(msg);
        setStatusBanner({ type: 'error', text: msg });
        Alert.alert('Login Failed', msg);
        return;
      }

      setStatusBanner({ type: 'success', text: 'Signed in successfully. Loading your home…' });
    } catch (error) {
      console.error('Login error:', error);
      const msg = error.message || 'Unable to connect to the server';
      setSubmitError(msg);
      setStatusBanner({ type: 'error', text: msg });
      Alert.alert('Login Failed', `Login failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>HealthyWAI1</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        {statusBanner?.type === 'success' && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{statusBanner.text}</Text>
          </View>
        )}

        {(submitError || lastError?.message || statusBanner?.type === 'error') && (
          <View style={styles.submitErrorBox}>
            <Text style={styles.submitErrorText}>
              {submitError || lastError?.message || statusBanner?.text}
            </Text>
            {!!lastError?.status && (
              <Text style={styles.submitErrorMeta}>Error code: {lastError.status}</Text>
            )}
            {!!lastError?.attemptedUrl && (
              <Text style={styles.submitErrorMeta}>Tried: {lastError.attemptedUrl}</Text>
            )}
            {!!lastError?.code && (
              <Text style={styles.submitErrorMeta}>Network code: {lastError.code}</Text>
            )}
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.passwordToggleText}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push('/register')}
        >
          <Text style={styles.linkText}>
            Don't have an account? Sign up
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16
  },
  passwordToggle: {
    padding: 12,
    paddingRight: 16
  },
  passwordToggleText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500'
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center'
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14
  },
  submitErrorBox: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#ffcccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16
  },
  submitErrorText: {
    color: '#b00020',
    fontSize: 14
  },
  submitErrorMeta: {
    marginTop: 6,
    color: '#666',
    fontSize: 12
  },
  successBox: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#a5d6a7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16
  },
  successText: {
    color: '#1b5e20',
    fontSize: 14
  }
});


