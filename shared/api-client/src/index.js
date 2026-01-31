import APIClient from './client';
import AuthService from './auth';
import endpoints from './endpoints';

// Create default API client instance
const createAPIClient = (baseURL) => {
  const client = new APIClient(baseURL);
  const auth = new AuthService(client);

  return {
    client,
    auth,
    endpoints
  };
};

export default createAPIClient;
export { APIClient, AuthService, endpoints };










