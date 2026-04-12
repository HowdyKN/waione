import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { ORDER_SUCCESS_COPY } from '../constants/orderSuccessCopy';
import { formatDeliveryLabel } from '../utils/deliveryDates';

/**
 * After Stripe Embedded Checkout `return_url` (web). Syncs session → order, then shows success.
 */
export default function PaymentReturnScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { apiClient } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);

  const sessionId =
    typeof params.session_id === 'string'
      ? params.session_id
      : Array.isArray(params.session_id)
        ? params.session_id[0]
        : null;

  const runSync = useCallback(async () => {
    if (!sessionId) {
      setError('Missing payment session. Return to your order and try again.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.payments.syncCheckoutSession(sessionId);
      if (res?.success && res?.data?.order) {
        setOrder(res.data.order);
      } else {
        setError(res?.message || 'Could not confirm payment.');
      }
    } catch (e) {
      setError(e.message || 'Could not confirm payment.');
    } finally {
      setLoading(false);
    }
  }, [apiClient, sessionId]);

  useEffect(() => {
    runSync();
  }, [runSync]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Confirming payment…</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <ScrollView contentContainerStyle={styles.centered}>
        <Text style={styles.errTitle}>Payment status</Text>
        <Text style={styles.errBody}>{error || 'Something went wrong.'}</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(tabs)/orders')}>
          <Text style={styles.btnText}>Go to orders</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  const scheduledLabel = formatDeliveryLabel(order.deliveryDate);
  const unpaid = order.paymentStatus && order.paymentStatus !== 'paid';

  return (
    <ScrollView style={styles.successScroll} contentContainerStyle={styles.successScrollContent}>
      <View style={styles.successInner}>
        <View style={styles.iconRing} accessibilityLabel="Order received">
          <Text style={styles.iconCheck}>✓</Text>
        </View>
        <Text style={styles.successHeadline}>{ORDER_SUCCESS_COPY.headline}</Text>
        {unpaid ? (
          <Text style={styles.warn}>
            Payment is still processing. Refresh your orders in a moment. If this persists, contact
            support with your order ID.
          </Text>
        ) : null}
        <Text style={styles.successBody}>{ORDER_SUCCESS_COPY.weekendLine}</Text>
        <Text style={styles.successBody}>{ORDER_SUCCESS_COPY.discoveryLine}</Text>
        <Text style={styles.successSchedule}>
          Your delivery is scheduled for{' '}
          <Text style={styles.successScheduleEm}>{scheduledLabel}</Text> in your chosen morning
          window—we will see you then.
        </Text>
        <Text style={styles.successThanks}>{ORDER_SUCCESS_COPY.thanksLine}</Text>
        <TouchableOpacity style={styles.submit} onPress={() => router.replace('/(tabs)/orders')}>
          <Text style={styles.submitText}>View your orders</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  muted: { marginTop: 8, color: '#666' },
  errTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  errBody: { color: '#b00020', textAlign: 'center', marginBottom: 20 },
  btn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10
  },
  btnText: { color: '#fff', fontWeight: '600' },
  successScroll: { flex: 1, backgroundColor: '#f8faf8' },
  successScrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 40,
    justifyContent: 'center'
  },
  successInner: { maxWidth: 440, width: '100%', alignSelf: 'center' },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#e8f5e9',
    borderWidth: 3,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20
  },
  iconCheck: { fontSize: 36, color: '#2e7d32', fontWeight: '700' },
  successHeadline: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1b5e20',
    textAlign: 'center',
    marginBottom: 16
  },
  warn: {
    fontSize: 14,
    color: '#856404',
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    textAlign: 'center'
  },
  successBody: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 14
  },
  successSchedule: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 18,
    marginTop: 4
  },
  successScheduleEm: { fontWeight: '700', color: '#1b5e20' },
  successThanks: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 28
  },
  submit: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});
