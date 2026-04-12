import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

/**
 * In-app native card entry will use Stripe Payment Sheet + same backend PaymentIntent/Customer flow.
 * Until then, orders created on device may remain unpaid until paid on the web app.
 */
export default function OrderPaymentCheckout({ orderId }) {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>Pay on the web to complete checkout</Text>
      <Text style={styles.body}>
        In-app card payments are coming next. Your order is saved. Please open HealthyWAI in a
        browser, sign in, and complete payment from your order details when available—or contact
        support with order ID:
      </Text>
      <Text style={styles.id}>{orderId || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fafafa'
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8
  },
  body: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20
  },
  id: {
    marginTop: 10,
    fontSize: 13,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    color: '#333'
  }
});
