import endpoints from './endpoints';

class OrderApi {
  constructor(apiClient) {
    this.api = apiClient;
  }

  async listProducts() {
    const response = await this.api.get(endpoints.products.list);
    return response.data;
  }

  async createOrder(payload) {
    const response = await this.api.post(endpoints.orders.create, payload);
    return response.data;
  }

  async listOrders(page = 1, limit = 20) {
    const response = await this.api.get(
      `${endpoints.orders.list}?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  async getOrder(orderId) {
    const response = await this.api.get(endpoints.orders.detail(orderId));
    return response.data;
  }

  async cancelOrder(orderId) {
    const response = await this.api.delete(endpoints.orders.cancel(orderId));
    return response.data;
  }
}

export default OrderApi;
