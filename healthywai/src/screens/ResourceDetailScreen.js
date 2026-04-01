import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import createAPIClient from '../api-client/index';
import { getApiBaseUrl } from '../config/apiUrl';

const apiClient = createAPIClient(getApiBaseUrl());

export default function ResourceDetailScreen() {
  const { resourceId } = useLocalSearchParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (resourceId) loadResource();
  }, [resourceId]);

  const loadResource = async () => {
    try {
      setLoading(true);
      const response = await apiClient.client.get(`/resources/${resourceId}`);
      if (response.data.success) {
        setResource(response.data.data.resource);
      } else {
        Alert.alert('Error', 'Resource not found');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load resource');
      console.error('Load resource error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!resource) {
    return (
      <View style={styles.centerContainer}>
        <Text>Resource not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{resource.name || 'Resource'}</Text>
        {resource.description && (
          <Text style={styles.description}>{resource.description}</Text>
        )}
        <Text style={styles.meta}>
          Created: {new Date(resource.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </ScrollView>
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
  content: {
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    lineHeight: 24
  },
  meta: {
    fontSize: 14,
    color: '#999',
    marginTop: 8
  }
});


