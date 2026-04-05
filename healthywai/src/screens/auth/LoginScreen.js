import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

function channelHint(channel) {
  if (channel === 'whatsapp') return 'Check WhatsApp for your code.';
  if (channel === 'sms') return 'We sent a text (SMS) with your code.';
  if (channel === 'simulated')
    return 'Development mode: the code was logged on the API server.';
  return 'If you do not receive a code, try SMS only below and request again.';
}

export default function LoginScreen() {
  const router = useRouter();
  const [mode, setMode] = useState('phone');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [preferSms, setPreferSms] = useState(false);
  const [deliveryChannel, setDeliveryChannel] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login, requestPhoneOtp, verifyPhoneOtp, lastError } = useAuth();
  const [submitError, setSubmitError] = useState(null);
  const [statusBanner, setStatusBanner] = useState(null);

  const clearErrors = () => {
    setSubmitError(null);
    setStatusBanner(null);
  };

  const handleSendCode = async () => {
    if (!phone.trim()) {
      setSubmitError('Enter your phone number.');
      return;
    }
    setLoading(true);
    clearErrors();
    try {
      const result = await requestPhoneOtp(phone.trim(), preferSms);
      if (!result.success) {
        setSubmitError(result.message || 'Could not send code.');
        return;
      }
      const ch = result.data?.channel;
      setDeliveryChannel(ch || null);
      setCodeSent(true);
      setStatusBanner({
        type: 'success',
        text: 'Code sent. ' + channelHint(ch)
      });
    } catch (error) {
      setSubmitError(error.message || 'Could not send code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!otp.trim() || otp.trim().length !== 6) {
      setSubmitError('Enter the 6-digit code.');
      return;
    }
    setLoading(true);
    clearErrors();
    try {
      const result = await verifyPhoneOtp(phone.trim(), otp.trim());
      if (!result.success) {
        setSubmitError(result.message || 'Invalid code.');
        return;
      }
      setStatusBanner({
        type: 'success',
        text: 'Signed in successfully. Loading your home…'
      });
    } catch (error) {
      setSubmitError(error.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setSubmitError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    clearErrors();
    try {
      const result = await login(email, password);

      if (!result.success) {
        const msg = result.message || 'Invalid credentials';
        setSubmitError(msg);
        setStatusBanner({ type: 'error', text: msg });
        return;
      }

      setStatusBanner({ type: 'success', text: 'Signed in successfully. Loading your home…' });
    } catch (error) {
      console.error('Login error:', error);
      const msg = error.message || 'Unable to connect to the server';
      setSubmitError(msg);
      setStatusBanner({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>HealthyWAI</Text>
        <Text style={styles.subtitle}>
          {mode === 'phone' ? 'Sign in with your phone' : 'Sign in with email'}
        </Text>

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

        {mode === 'phone' ? (
          <>
            <Text style={styles.label}>Phone number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. +1 555 123 4567"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
              editable={!loading}
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>SMS only (no WhatsApp)</Text>
              <Switch value={preferSms} onValueChange={setPreferSms} />
            </View>

            {!codeSent ? (
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendCode}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Sending…' : 'Send code'}
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                {deliveryChannel ? (
                  <Text style={styles.channelNote}>{channelHint(deliveryChannel)}</Text>
                ) : null}
                <Text style={styles.label}>6-digit code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="000000"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleVerifyPhone}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Verifying…' : 'Verify and sign in'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => {
                    setCodeSent(false);
                    setOtp('');
                    setDeliveryChannel(null);
                    clearErrors();
                  }}
                >
                  <Text style={styles.linkText}>Use a different number</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => {
                setMode('email');
                clearErrors();
              }}
            >
              <Text style={styles.linkText}>Use email and password instead</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
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
              onPress={() => {
                setMode('phone');
                clearErrors();
              }}
            >
              <Text style={styles.linkText}>Sign in with phone instead</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push('/register')}
            >
              <Text style={styles.linkText}>
                Don&apos;t have an account? Sign up
              </Text>
            </TouchableOpacity>
          </>
        )}

        {mode === 'phone' ? (
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push('/register')}
          >
            <Text style={styles.linkText}>Don&apos;t have an account? Sign up</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingVertical: 32
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
    marginBottom: 24,
    textAlign: 'center'
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  switchLabel: {
    fontSize: 14,
    color: '#444',
    flex: 1,
    paddingRight: 12
  },
  channelNote: {
    fontSize: 13,
    color: '#555',
    marginBottom: 12,
    lineHeight: 18
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
