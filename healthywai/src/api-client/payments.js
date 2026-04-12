import endpoints from './endpoints';

class PaymentsApi {
  constructor(apiClient) {
    this.api = apiClient;
  }

  async getConfig() {
    const response = await this.api.get(endpoints.payments.config);
    return response.data;
  }

  async createEmbeddedCheckout(orderId) {
    const response = await this.api.post(endpoints.payments.embeddedCheckout, {
      orderId
    });
    return response.data;
  }

  async syncCheckoutSession(sessionId) {
    const response = await this.api.post(endpoints.payments.syncCheckoutSession, {
      sessionId
    });
    return response.data;
  }
}

export default PaymentsApi;
