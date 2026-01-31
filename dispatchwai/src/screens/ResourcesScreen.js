import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import Constants from 'expo-constants';
import createAPIClient from '../../../shared/api-client/src/index';

const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api';
const apiClient = createAPIClient(apiUrl);

export default function ResourcesScreen({ navigation }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const response = await apiClient.client.get('/resources');
      if (response.data.success) {
        setResources(response.data.data.resources || []);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load resources');
      console.error('Load resources error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('ResourceDetail', { resourceId: item.id })}
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
  }
});










