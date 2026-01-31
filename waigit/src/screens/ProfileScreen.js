import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useGitHubAuth } from '../context/GitHubAuthContext';

export default function ProfileScreen() {
  const { user, logout } = useGitHubAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No user data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          {user.avatar_url && (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          )}
          <Text style={styles.name}>{user.name || user.login}</Text>
          <Text style={styles.username}>@{user.login}</Text>
          {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.public_repos || 0}</Text>
            <Text style={styles.statLabel}>Repositories</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.followers || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.following || 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        <View style={styles.section}>
          {user.company && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Company</Text>
              <Text style={styles.infoValue}>{user.company}</Text>
            </View>
          )}
          {user.location && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{user.location}</Text>
            </View>
          )}
          {user.blog && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Website</Text>
              <Text style={styles.infoValue}>{user.blog}</Text>
            </View>
          )}
          {user.email && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member since</Text>
            <Text style={styles.infoValue}>
              {new Date(user.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
              })}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#161b22',
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#238636',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#c9d1d9',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#8b949e',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#c9d1d9',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 24,
    backgroundColor: '#161b22',
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#c9d1d9',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8b949e',
  },
  section: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  infoLabel: {
    fontSize: 14,
    color: '#8b949e',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#c9d1d9',
    flex: 1,
    textAlign: 'right',
  },
  logoutButton: {
    backgroundColor: '#da3633',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8b949e',
  },
});

