import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to DispatchWAI</Text>
      {user && (
        <Text style={styles.subtitle}>
          Hello, {user.firstName} {user.lastName}!
        </Text>
      )}
      <Text style={styles.description}>
        Your dispatch and logistics management solution
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center'
  },
  description: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 16
  }
});










