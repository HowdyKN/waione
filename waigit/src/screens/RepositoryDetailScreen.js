import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Linking,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import GitHubAPI from '../services/githubApi';

export default function RepositoryDetailScreen() {
  const route = useRoute();
  const { repository } = route.params;
  const [repoDetails, setRepoDetails] = useState(repository);
  const [branches, setBranches] = useState([]);
  const [commits, setCommits] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadRepositoryDetails();
  }, [repository]);

  const loadRepositoryDetails = async () => {
    setLoading(true);
    const owner = repository.owner.login;
    const repo = repository.name;

    try {
      // Load detailed repository info
      const repoResult = await GitHubAPI.getRepository(owner, repo);
      if (repoResult.success) {
        setRepoDetails(repoResult.data);
      }

      // Load branches
      const branchesResult = await GitHubAPI.getRepositoryBranches(owner, repo);
      if (branchesResult.success) {
        setBranches(branchesResult.data);
      }

      // Load recent commits
      const commitsResult = await GitHubAPI.getRepositoryCommits(owner, repo, {
        perPage: 10,
      });
      if (commitsResult.success) {
        setCommits(commitsResult.data);
      }

      // Load issues
      const issuesResult = await GitHubAPI.getRepositoryIssues(owner, repo, {
        state: 'open',
        perPage: 10,
      });
      if (issuesResult.success) {
        setIssues(issuesResult.data);
      }
    } catch (error) {
      console.error('Error loading repository details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openInBrowser = (url) => {
    Linking.openURL(url).catch((err) =>
      console.error('Error opening URL:', err)
    );
  };

  const renderOverview = () => (
    <View style={styles.section}>
      {repoDetails.description && (
        <View style={styles.infoItem}>
          <Text style={styles.label}>Description</Text>
          <Text style={styles.value}>{repoDetails.description}</Text>
        </View>
      )}

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{repoDetails.stargazers_count || 0}</Text>
          <Text style={styles.statLabel}>Stars</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{repoDetails.forks_count || 0}</Text>
          <Text style={styles.statLabel}>Forks</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{repoDetails.open_issues_count || 0}</Text>
          <Text style={styles.statLabel}>Issues</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{repoDetails.watchers_count || 0}</Text>
          <Text style={styles.statLabel}>Watchers</Text>
        </View>
      </View>

      {repoDetails.language && (
        <View style={styles.infoItem}>
          <Text style={styles.label}>Language</Text>
          <Text style={styles.value}>{repoDetails.language}</Text>
        </View>
      )}

      <View style={styles.infoItem}>
        <Text style={styles.label}>Default Branch</Text>
        <Text style={styles.value}>{repoDetails.default_branch || 'main'}</Text>
      </View>

      <View style={styles.infoItem}>
        <Text style={styles.label}>Created</Text>
        <Text style={styles.value}>{formatDate(repoDetails.created_at)}</Text>
      </View>

      <View style={styles.infoItem}>
        <Text style={styles.label}>Last Updated</Text>
        <Text style={styles.value}>{formatDate(repoDetails.updated_at)}</Text>
      </View>

      {repoDetails.homepage && (
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => openInBrowser(repoDetails.homepage)}
        >
          <Text style={styles.linkText}>Visit Homepage</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.linkButton, styles.primaryButton]}
        onPress={() => openInBrowser(repoDetails.html_url)}
      >
        <Text style={[styles.linkText, styles.primaryButtonText]}>
          Open on GitHub
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderBranches = () => (
    <View style={styles.section}>
      {branches.length === 0 ? (
        <Text style={styles.emptyText}>No branches found</Text>
      ) : (
        branches.map((branch) => (
          <View key={branch.name} style={styles.branchItem}>
            <Text style={styles.branchName}>{branch.name}</Text>
            {branch.protected && (
              <View style={styles.protectedBadge}>
                <Text style={styles.protectedText}>Protected</Text>
              </View>
            )}
          </View>
        ))
      )}
    </View>
  );

  const renderCommits = () => (
    <View style={styles.section}>
      {commits.length === 0 ? (
        <Text style={styles.emptyText}>No commits found</Text>
      ) : (
        commits.map((commit) => (
          <View key={commit.sha} style={styles.commitItem}>
            <Text style={styles.commitMessage}>
              {commit.commit.message.split('\n')[0]}
            </Text>
            <Text style={styles.commitMeta}>
              {commit.commit.author.name} • {formatDate(commit.commit.author.date)}
            </Text>
            <Text style={styles.commitSha}>{commit.sha.substring(0, 7)}</Text>
          </View>
        ))
      )}
    </View>
  );

  const renderIssues = () => (
    <View style={styles.section}>
      {issues.length === 0 ? (
        <Text style={styles.emptyText}>No open issues</Text>
      ) : (
        issues.map((issue) => (
          <TouchableOpacity
            key={issue.id}
            style={styles.issueItem}
            onPress={() => openInBrowser(issue.html_url)}
          >
            <View style={styles.issueHeader}>
              <Text style={styles.issueTitle}>{issue.title}</Text>
              <Text style={styles.issueNumber}>#{issue.number}</Text>
            </View>
            <Text style={styles.issueMeta}>
              Opened by {issue.user.login} • {formatDate(issue.created_at)}
            </Text>
            {issue.labels.length > 0 && (
              <View style={styles.labelsContainer}>
                {issue.labels.map((label) => (
                  <View
                    key={label.id}
                    style={[styles.label, { backgroundColor: `#${label.color}` }]}
                  >
                    <Text style={styles.labelText}>{label.name}</Text>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.repoName}>{repoDetails.name}</Text>
          {repoDetails.private && (
            <View style={styles.privateBadge}>
              <Text style={styles.privateText}>Private</Text>
            </View>
          )}
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
            onPress={() => setActiveTab('overview')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'overview' && styles.tabTextActive,
              ]}
            >
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'branches' && styles.tabActive]}
            onPress={() => setActiveTab('branches')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'branches' && styles.tabTextActive,
              ]}
            >
              Branches ({branches.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'commits' && styles.tabActive]}
            onPress={() => setActiveTab('commits')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'commits' && styles.tabTextActive,
              ]}
            >
              Commits
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'issues' && styles.tabActive]}
            onPress={() => setActiveTab('issues')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'issues' && styles.tabTextActive,
              ]}
            >
              Issues ({issues.length})
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#238636" />
          </View>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'branches' && renderBranches()}
            {activeTab === 'commits' && renderCommits()}
            {activeTab === 'issues' && renderIssues()}
          </>
        )}
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
    padding: 16,
    backgroundColor: '#161b22',
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
    flexDirection: 'row',
    alignItems: 'center',
  },
  repoName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#c9d1d9',
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#161b22',
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#238636',
  },
  tabText: {
    fontSize: 12,
    color: '#8b949e',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#238636',
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  infoItem: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: '#8b949e',
    marginBottom: 4,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#c9d1d9',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 24,
    paddingVertical: 16,
    backgroundColor: '#161b22',
    borderRadius: 8,
  },
  statBox: {
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
  linkButton: {
    backgroundColor: '#21262d',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  primaryButton: {
    backgroundColor: '#238636',
    borderColor: '#238636',
  },
  linkText: {
    color: '#58a6ff',
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButtonText: {
    color: '#fff',
  },
  branchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#161b22',
    borderRadius: 8,
    marginBottom: 8,
  },
  branchName: {
    fontSize: 14,
    color: '#c9d1d9',
    flex: 1,
  },
  protectedBadge: {
    backgroundColor: '#21262d',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  protectedText: {
    fontSize: 10,
    color: '#8b949e',
  },
  commitItem: {
    padding: 12,
    backgroundColor: '#161b22',
    borderRadius: 8,
    marginBottom: 8,
  },
  commitMessage: {
    fontSize: 14,
    color: '#c9d1d9',
    marginBottom: 4,
  },
  commitMeta: {
    fontSize: 12,
    color: '#8b949e',
    marginBottom: 4,
  },
  commitSha: {
    fontSize: 11,
    color: '#58a6ff',
    fontFamily: 'monospace',
  },
  issueItem: {
    padding: 12,
    backgroundColor: '#161b22',
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#238636',
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  issueTitle: {
    fontSize: 14,
    color: '#c9d1d9',
    flex: 1,
    fontWeight: '500',
  },
  issueNumber: {
    fontSize: 12,
    color: '#8b949e',
  },
  issueMeta: {
    fontSize: 12,
    color: '#8b949e',
    marginBottom: 8,
  },
  labelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  label: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  labelText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8b949e',
    textAlign: 'center',
    padding: 16,
  },
});

