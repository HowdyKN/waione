import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import GitHubAuth from '../services/githubAuth';
import GitHubAPI from '../services/githubApi';

const GitHubAuthContext = createContext();

export const useGitHubAuth = () => {
  const context = useContext(GitHubAuthContext);
  if (!context) {
    throw new Error('useGitHubAuth must be used within GitHubAuthProvider');
  }
  return context;
};

export const GitHubAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [repositories, setRepositories] = useState([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const checkingRef = useRef(false); // Prevent concurrent checks

  const checkAuth = useCallback(async () => {
    // Prevent multiple simultaneous checks
    if (checkingRef.current) {
      console.log('[checkAuth] Already checking, skipping duplicate call');
      return;
    }
    
    checkingRef.current = true;
    console.log('[checkAuth] Starting check, authChecked:', authChecked, 'hasUser:', !!user);
    let timeoutId;
    try {
      setLoading(true);
      console.log('[checkAuth] Starting authentication check...');
      
      // Quick check - just see if we have a token and stored user
      const token = await GitHubAuth.getStoredToken();
      const storedUser = await GitHubAuth.getStoredUser();
      
      console.log('[checkAuth] Token exists:', !!token);
      console.log('[checkAuth] Stored user exists:', !!storedUser);
      
      // If we have both token and stored user, use them immediately
      if (token && storedUser) {
        console.log('[checkAuth] Using stored user data');
        setUser(storedUser);
        setAuthChecked(true);
        setLoading(false);
        
        // Refresh user data in background (don't block) - but don't clear user if it fails
        GitHubAPI.getCurrentUser()
          .then((result) => {
            if (result.success && result.data) {
              GitHubAuth.storeUser(result.data);
              // Only update user if we still have a valid token
              GitHubAuth.getStoredToken().then((currentToken) => {
                if (currentToken) {
                  setUser(result.data);
                  console.log('[checkAuth] User data refreshed');
                }
              });
            } else {
              console.log('[checkAuth] Background refresh failed - using stored user');
              // Don't clear user or token - keep using stored data
            }
          })
          .catch((err) => {
            console.error('[checkAuth] Background refresh error:', err);
            // Don't clear user on background refresh error
          });
        
        checkingRef.current = false;
        return;
      }
      
      // If we have a token but no stored user, try to fetch user
      if (token && !storedUser) {
        console.log('[checkAuth] Token exists but no stored user - fetching...');
        try {
          const result = await Promise.race([
            GitHubAPI.getCurrentUser(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('API call timeout')), 5000)
            )
          ]);
          
          if (result.success && result.data) {
            await GitHubAuth.storeUser(result.data);
            setUser(result.data);
            setAuthChecked(true);
            console.log('[checkAuth] User fetched and stored');
            setLoading(false);
            checkingRef.current = false;
            return;
          } else {
            console.log('[checkAuth] Failed to fetch user - clearing auth');
            await GitHubAuth.logout();
            setUser(null);
            setAuthChecked(true);
            setLoading(false);
            checkingRef.current = false;
            return;
          }
        } catch (apiError) {
          console.error('[checkAuth] Error fetching user:', apiError);
          await GitHubAuth.logout();
          setUser(null);
          setAuthChecked(true);
          setLoading(false);
          checkingRef.current = false;
          return;
        }
      }
      
      // No token - not authenticated
      console.log('[checkAuth] No token - not authenticated');
      setUser(null);
      setAuthChecked(true);
      setLoading(false);
      
    } catch (error) {
      console.error('[checkAuth] Error:', error);
      setUser(null);
      setAuthChecked(true);
      setLoading(false);
      // Try to clear auth on error
      try {
        await GitHubAuth.logout();
      } catch (logoutError) {
        console.error('[checkAuth] Error during logout:', logoutError);
      }
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      // Always set loading to false and reset checking flag in finally
      console.log('[checkAuth] Setting loading to false');
      setLoading(false);
      setAuthChecked(true);
      checkingRef.current = false;
    }
  }, []); // Empty deps - only create once

  useEffect(() => {
    // Only run checkAuth once on mount
    let mounted = true;
    let safetyTimeout;
    
    const performCheck = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('[useEffect] Error in checkAuth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    performCheck();
    
    // Safety timeout to prevent infinite loading
    safetyTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('[useEffect] Safety timeout - forcing loading to false');
        setLoading(false);
      }
    }, 10000);
    
    return () => {
      mounted = false;
      if (safetyTimeout) {
        clearTimeout(safetyTimeout);
      }
    };
  }, []); // Empty dependency array - only run once on mount

  const login = useCallback(async () => {
    try {
      setLoading(true);
      console.log('[login] Starting authentication...');
      const result = await GitHubAuth.authenticate();
      console.log('[login] Auth result:', result.success ? 'success' : 'failed');
      
      if (result.success) {
        // Fetch user data
        console.log('[login] Fetching user data...');
        const userResult = await GitHubAPI.getCurrentUser();
        if (userResult.success && userResult.data) {
          const userData = userResult.data;
          await GitHubAuth.storeUser(userData);
          setUser(userData);
          setAuthChecked(true); // Mark as checked after successful login
          setLoading(false);
          console.log('[login] Login complete, user set');
          return { success: true };
        } else {
          console.error('[login] Failed to fetch user:', userResult.error);
          setLoading(false);
          return { success: false, error: userResult.error || 'Failed to fetch user data' };
        }
      }
      
      setLoading(false);
      return { success: false, error: result.error || 'Authentication failed' };
    } catch (error) {
      console.error('[login] Login error:', error);
      setLoading(false);
      return { success: false, error: error.message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await GitHubAuth.logout();
      setUser(null);
      setRepositories([]);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRepositories = useCallback(async (options = {}) => {
    try {
      setReposLoading(true);
      console.log('fetchRepositories called');
      
      // Check if user is authenticated before fetching
      const isAuthenticated = await GitHubAuth.isAuthenticated();
      if (!isAuthenticated) {
        console.log('Not authenticated, cannot fetch repositories');
        return { success: false, error: 'Not authenticated' };
      }
      
      const result = await GitHubAPI.getUserRepositories(null, options);
      
      if (result.success) {
        console.log('Repositories fetched successfully:', result.data?.length || 0);
        setRepositories(result.data || []);
        return { success: true, data: result.data };
      }
      
      console.error('Failed to fetch repositories:', result.error);
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Error fetching repositories:', error);
      return { success: false, error: error.message };
    } finally {
      setReposLoading(false);
      console.log('fetchRepositories complete');
    }
  }, []);

  const refreshRepositories = useCallback(async () => {
    return fetchRepositories();
  }, [fetchRepositories]);

  const value = {
    user,
    loading,
    repositories,
    reposLoading,
    login,
    logout,
    checkAuth,
    fetchRepositories,
    refreshRepositories,
  };

  return (
    <GitHubAuthContext.Provider value={value}>
      {children}
    </GitHubAuthContext.Provider>
  );
};

