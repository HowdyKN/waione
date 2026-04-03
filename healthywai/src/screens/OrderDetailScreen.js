import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../context/AuthContext';

function formatMoney(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams();
  const { apiClient } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!orderId) return;
    try {
      setError(null);
      const res = await apiClient.orders.getOrder(orderId);
      if (res?.success && res?.data?.order) {
        setOrder(res.data.order);
      } else {
        setError('Order not found.');
      }
    } catch (e) {
      setError(e.message || 'Failed to load order.');
    } finally {
      setLoading(false);
    }
  }, [apiClient, orderId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errText}>{error || 'Not found'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.status}>Status: {order.status}</Text>
      <Text style={styles.meta}>Customer ID: {order.customerNumber}</Text>
      <Text style={styles.meta}>Placed: {new Date(order.createdAt).toLocaleString()}</Text>
      <Text style={styles.meta}>Delivery date: {order.deliveryDate}</Text>
      {order.deliveryWindow ? (
        <Text style={styles.meta}>Window: {order.deliveryWindow}</Text>
      ) : null}
      <Text style={styles.total}>Total: {formatMoney(order.totalCents)}</Text>

      <Text style={styles.section}>Items</Text>
      {(order.items || []).map((line) => (
        <View key={line.id} style={styles.line}>
          <Text style={styles.lineName}>
            {line.product?.name || 'Product'} × {line.quantity}
          </Text>
          <Text style={styles.linePrice}>
            {formatMoney(line.unitPriceCents * line.quantity)}
          </Text>
        </View>
      ))}

      <Text style={styles.section}>Delivery address</Text>
      <Text style={styles.addr}>{order.addressLine1}</Text>
      {order.addressLine2 ? <Text style={styles.addr}>{order.addressLine2}</Text> : null}
      <Text style={styles.addr}>
        {order.city}
        {order.state ? `, ${order.state}` : ''} {order.postalCode || ''}
      </Text>
      <Text style={styles.addr}>{order.country}</Text>

      {order.notes ? (
        <>
          <Text style={styles.section}>Notes</Text>
          <Text style={styles.addr}>{order.notes}</Text>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errText: { color: '#b00020' },
  status: { fontSize: 18, fontWeight: '700', marginBottom: 8, textTransform: 'capitalize' },
  meta: { color: '#444', marginBottom: 4 },
  total: { fontSize: 16, fontWeight: '600', marginTop: 12, marginBottom: 16 },
  section: { fontWeight: '600', marginTop: 16, marginBottom: 8 },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  lineName: { flex: 1, paddingRight: 8 },
  linePrice: { fontWeight: '500' },
  addr: { color: '#333', marginBottom: 4 }
});
