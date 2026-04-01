/**
 * Merges env into Expo config. Set EXPO_PUBLIC_API_URL at build time (e.g. Render)
 * to override app.json extra.apiUrl for production.
 */
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    apiUrl:
      process.env.EXPO_PUBLIC_API_URL ??
      config.extra?.apiUrl ??
      'http://localhost:3000/api',
  },
});
