import axios from 'axios';
import GitHubAuth from './githubAuth';

const GITHUB_API_BASE = 'https://api.github.com';

class GitHubAPI {
  constructor() {
    this.client = axios.create({
      baseURL: GITHUB_API_BASE,
      timeout: 10000, // 10 second timeout
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    // Add request interceptor to include token
    this.client.interceptors.request.use(async (config) => {
      const token = await GitHubAuth.getStoredToken();
      if (token) {
        config.headers.Authorization = `token ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await GitHubAuth.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  async getCurrentUser() {
    try {
      console.log('Fetching current user from GitHub API...');
      const token = await GitHubAuth.getStoredToken();
      console.log('Token exists:', !!token);
      
      const response = await this.client.get('/user');
      console.log('Get current user success');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching current user:', error);
      console.error('Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data,
      });
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status,
      };
    }
  }

  async getUserRepositories(username = null, options = {}) {
    try {
      console.log('Fetching repositories...', { username, options });
      const token = await GitHubAuth.getStoredToken();
      console.log('Token exists for repo fetch:', !!token);
      
      const endpoint = username 
        ? `/users/${username}/repos`
        : '/user/repos';
      
      const params = {
        sort: options.sort || 'updated',
        direction: options.direction || 'desc',
        per_page: options.perPage || 100,
        page: options.page || 1,
        type: options.type || 'all', // all, owner, member
      };

      const response = await this.client.get(endpoint, { params });
      console.log('Repositories fetched successfully:', response.data?.length || 0);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching repositories:', error);
      console.error('Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data,
      });
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status,
      };
    }
  }

  async getRepository(owner, repo) {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching repository:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async getRepositoryBranches(owner, repo) {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/branches`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching branches:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async getRepositoryCommits(owner, repo, options = {}) {
    try {
      const params = {
        per_page: options.perPage || 30,
        page: options.page || 1,
        sha: options.branch || 'main',
      };

      const response = await this.client.get(
        `/repos/${owner}/${repo}/commits`,
        { params }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching commits:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async getRepositoryIssues(owner, repo, options = {}) {
    try {
      const params = {
        state: options.state || 'open',
        per_page: options.perPage || 30,
        page: options.page || 1,
      };

      const response = await this.client.get(
        `/repos/${owner}/${repo}/issues`,
        { params }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching issues:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async getRepositoryPullRequests(owner, repo, options = {}) {
    try {
      const params = {
        state: options.state || 'open',
        per_page: options.perPage || 30,
        page: options.page || 1,
      };

      const response = await this.client.get(
        `/repos/${owner}/${repo}/pulls`,
        { params }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching pull requests:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async updateRepository(owner, repo, updates) {
    try {
      const response = await this.client.patch(`/repos/${owner}/${repo}`, updates);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating repository:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async deleteRepository(owner, repo) {
    try {
      await this.client.delete(`/repos/${owner}/${repo}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting repository:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async createRepository(repoData) {
    try {
      const response = await this.client.post('/user/repos', repoData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating repository:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async forkRepository(owner, repo) {
    try {
      const response = await this.client.post(`/repos/${owner}/${repo}/forks`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error forking repository:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async starRepository(owner, repo) {
    try {
      await this.client.put(`/user/starred/${owner}/${repo}`);
      return { success: true };
    } catch (error) {
      console.error('Error starring repository:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async unstarRepository(owner, repo) {
    try {
      await this.client.delete(`/user/starred/${owner}/${repo}`);
      return { success: true };
    } catch (error) {
      console.error('Error unstarring repository:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async isRepositoryStarred(owner, repo) {
    try {
      await this.client.get(`/user/starred/${owner}/${repo}`);
      return { success: true, starred: true };
    } catch (error) {
      if (error.response?.status === 404) {
        return { success: true, starred: false };
      }
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }
}

export default new GitHubAPI();

