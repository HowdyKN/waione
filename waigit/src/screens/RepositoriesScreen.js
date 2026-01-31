import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useGitHubAuth } from '../context/GitHubAuthContext';
import GitHubAPI from '../services/githubApi';

export default function RepositoriesScreen() {
  const navigation = useNavigation();
  const { user, repositories, reposLoading, fetchRepositories, refreshRepositories } = useGitHubAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Debug logging
  useEffect(() => {
    console.log('RepositoriesScreen rendered', {
      hasUser: !!user,
      userLogin: user?.login,
      reposCount: repositories.length,
      reposLoading,
    });
  }, [user, repositories, reposLoading]);

  useEffect(() => {
    if (user) {
      console.log('User is logged in, fetching repositories...');
      setError(null);
      fetchRepositories().then((result) => {
        if (result.success) {
          console.log('Repositories fetched:', result.data?.length || 0);
          setError(null);
        } else {
          console.error('Failed to fetch repositories:', result.error);
          setError(result.error || 'Failed to load repositories');
        }
      }).catch((err) => {
        console.error('Exception fetching repositories:', err);
        setError(err.message || 'An error occurred');
      });
    } else {
      console.log('No user, skipping repository fetch');
    }
  }, [user, fetchRepositories]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshRepositories();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getLanguageColor = (language) => {
    const colors = {
      JavaScript: '#f1e05a',
      TypeScript: '#2b7489',
      Python: '#3572A5',
      Java: '#b07219',
      'C++': '#f34b7d',
      C: '#555555',
      'C#': '#239120',
      Go: '#00ADD8',
      Rust: '#dea584',
      PHP: '#4F5D95',
      Ruby: '#701516',
      Swift: '#ffac45',
      Kotlin: '#A97BFF',
      HTML: '#e34c26',
      CSS: '#563d7c',
      Shell: '#89e051',
      Default: '#8b949e',
    };
    return colors[language] || colors.Default;
  };

  const renderRepository = ({ item }) => (
    <TouchableOpacity
      style={styles.repoCard}
      onPress={() => navigation.navigate('RepositoryDetail', { repository: item })}
    >
      <View style={styles.repoHeader}>
        <Text style={styles.repoName}>{item.name}</Text>
        {item.private && (
          <View style={styles.privateBadge}>
            <Text style={styles.privateText}>Private</Text>
          </View>
        )}
      </View>

      {item.description && (
        <Text style={styles.repoDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.repoMeta}>
        {item.language && (
          <View style={styles.metaItem}>
            <View
              style={[
                styles.languageDot,
                { backgroundColor: getLanguageColor(item.language) },
              ]}
            />
            <Text style={styles.metaText}>{item.language}</Text>
          </View>
        )}

        {item.stargazers_count > 0 && (
          <View style={styles.metaItem}>
            <Text style={styles.metaText}>⭐ {item.stargazers_count}</Text>
          </View>
        )}

        {item.forks_count > 0 && (
          <View style={styles.metaItem}>
            <Text style={styles.metaText}>🍴 {item.forks_count}</Text>
          </View>
        )}

        <Text style={styles.metaText}>
          Updated {formatDate(item.updated_at)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (reposLoading && repositories.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#238636" />
          <Text style={styles.loadingText}>Loading repositories...</Text>
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Repositories</Text>
        <Text style={styles.headerSubtitle}>
          {repositories.length} {repositories.length === 1 ? 'repository' : 'repositories'}
        </Text>
      </View>

      <FlatList
        data={repositories}
        renderItem={renderRepository}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#238636"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No repositories found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  header: {
    padding: 16,
    backgroundColor: '#161b22',
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#c9d1d9',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8b949e',
  },
  listContent: {
    padding: 16,
  },
  repoCard: {
    backgroundColor: '#161b22',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#21262d',
  },
  repoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  repoName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#58a6ff',
    flex: 1,
  },
  privateBadge: {
    backgroundColor: '#21262d',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  privateText: {
    fontSize: 12,
    color: '#8b949e',
    fontWeight: '500',
  },
  repoDescription: {
    fontSize: 14,
    color: '#8b949e',
    marginBottom: 12,
    lineHeight: 20,
  },
  repoMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#8b949e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8b949e',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8b949e',
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: '#da3633',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

