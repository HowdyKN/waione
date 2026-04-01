import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import createAPIClient from '../api-client/index';
import { getApiBaseUrl } from '../config/apiUrl';

const apiClient = createAPIClient(getApiBaseUrl());

export default function ResourcesScreen() {
  const router = useRouter();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const response = await apiClient.client.get('/resources');
      if (response.data.success) {
        setResources(response.data.data.resources || []);
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to load resources';
      setErrorMessage(msg);
      Alert.alert('Error', msg);
      console.error('Load resources error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => router.push(`/resources/${item.id}`)}
    >
      <Text style={styles.itemTitle}>{item.name || 'Resource'}</Text>
      {item.description && (
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {errorMessage && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadResources}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={resources}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No resources found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  list: {
    padding: 16
  },
  item: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4
  },
  itemDescription: {
    fontSize: 14,
    color: '#666'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100
  },
  emptyText: {
    fontSize: 16,
    color: '#999'
  },
  errorBanner: {
    backgroundColor: '#fff5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ffcccc',
    padding: 12
  },
  errorBannerText: {
    color: '#b00020',
    fontSize: 14
  },
  retryButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  }
});


