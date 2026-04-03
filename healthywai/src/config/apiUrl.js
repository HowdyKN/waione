import Constants from 'expo-constants';

const DEFAULT_DEV = 'http://localhost:3000/api';

/**
 * Express mounts all JSON routes under `/api` (see backend `app.use('/api', routes)`).
 * Base URL must end with `/api` so axios posts to `/auth/register` → `.../api/auth/register`.
 */
function ensureApiSuffix(url) {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim().replace(/\/+$/, '');
  if (trimmed.endsWith('/api')) return trimmed;
  return `${trimmed}/api`;
}

/**
 * API base URL: EXPO_PUBLIC_API_URL (build) → app.config extra → app.json extra → localhost.
 * Set EXPO_PUBLIC_API_URL on Render to your backend origin, with or without `/api` (we normalize).
 * Example: https://your-service.onrender.com or https://your-service.onrender.com/api
 */
export function getApiBaseUrl() {
  const fromEnv =
    typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL;
  if (fromEnv) return ensureApiSuffix(fromEnv);

  // app.config.js merges EXPO_PUBLIC_API_URL into extra at build time — must be used on web too.
  // Deployed sites must not fall through to localhost (browser "localhost" is the user's PC, not Render).
  const fromExtra = Constants.expoConfig?.extra?.apiUrl;
  if (fromExtra) return ensureApiSuffix(fromExtra);

  return DEFAULT_DEV;
}
