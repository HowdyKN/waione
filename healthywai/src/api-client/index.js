import APIClient from './client';
import AuthService from './auth';
import OrderApi from './orders';
import PaymentsApi from './payments';
import endpoints from './endpoints';

// Create default API client instance
const createAPIClient = (baseURL) => {
  const client = new APIClient(baseURL);
  const auth = new AuthService(client);
  const orders = new OrderApi(client);
  const payments = new PaymentsApi(client);

  return {
    client,
    auth,
    orders,
    payments,
    endpoints
  };
};

export default createAPIClient;
export { APIClient, AuthService, OrderApi, PaymentsApi, endpoints };


