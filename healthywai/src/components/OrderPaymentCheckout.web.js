import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';

/**
 * Stripe Embedded Checkout (Option B — in-page, no redirect until Stripe completes 3DS / return_url).
 */
export default function OrderPaymentCheckout({ publishableKey, clientSecret }) {
  const stripePromise = useMemo(
    () => (publishableKey ? loadStripe(publishableKey) : null),
    [publishableKey]
  );

  if (!publishableKey || !clientSecret || !stripePromise) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Payment could not be initialized.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Pay securely</Text>
      <Text style={styles.hint}>
        Complete your card details below. You will return here after payment.
      </Text>
      <View style={styles.embed}>
        <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6
  },
  hint: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18
  },
  embed: {
    minHeight: 420,
    width: '100%'
  },
  fallback: {
    padding: 16
  },
  fallbackText: {
    color: '#b00020'
  }
});
