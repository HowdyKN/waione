import Constants from 'expo-constants';

const DEFAULT_DEV = 'http://localhost:3000/api';

/**
 * API base URL: EXPO_PUBLIC_API_URL (build) → app.config extra → app.json extra → localhost.
 * Set EXPO_PUBLIC_API_URL on Render (or locally) to point at the hosted backend, e.g.
 * https://your-service.onrender.com/api
 */
export function getApiBaseUrl() {
  const fromEnv =
    typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv;

  const fromExtra = Constants.expoConfig?.extra?.apiUrl;
  if (fromExtra) return fromExtra;

  return DEFAULT_DEV;
}
