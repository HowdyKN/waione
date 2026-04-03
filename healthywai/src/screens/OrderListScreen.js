import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

function formatMoney(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatWhen(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function OrderListScreen() {
  const router = useRouter();
  const { apiClient } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await apiClient.orders.listOrders(1, 20);
      if (res?.success && res?.data?.orders) {
        setOrders(res.data.orders);
      } else {
        setOrders([]);
      }
    } catch (e) {
      setError(e.message || 'Failed to load orders.');
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [apiClient]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No orders yet. Place one from Home.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              router.push(`/(tabs)/orders/${item.id}`)
            }
          >
            <View style={styles.rowTop}>
              <Text style={styles.status}>{item.status}</Text>
              <Text style={styles.total}>{formatMoney(item.totalCents)}</Text>
            </View>
            <Text style={styles.meta}>
              {formatWhen(item.createdAt)} · #{item.customerNumber}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              Delivery {item.deliveryDate}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: '#b00020', padding: 16 },
  empty: { textAlign: 'center', color: '#666', marginTop: 40, paddingHorizontal: 24 },
  row: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  status: { fontWeight: '600', textTransform: 'capitalize' },
  total: { fontWeight: '600' },
  meta: { color: '#666', fontSize: 13, marginTop: 2 }
});
