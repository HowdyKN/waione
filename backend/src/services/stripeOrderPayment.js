const { Order } = require('../models');

/**
 * Apply successful Checkout Session state to our order (idempotent).
 * @param {import('stripe').Stripe.Checkout.Session} session
 */
async function markOrderPaidFromCheckoutSession(session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) {
    return null;
  }

  const order = await Order.findByPk(orderId);
  if (!order) {
    return null;
  }

  if (order.paymentStatus === 'paid') {
    return order;
  }

  const paid =
    session.payment_status === 'paid' || session.payment_status === 'no_payment_required';
  if (!paid) {
    return order;
  }

  const pi =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id;

  await order.update({
    paymentStatus: 'paid',
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: pi || order.stripePaymentIntentId,
    paidAt: order.paidAt || new Date()
  });

  return order.reload();
}

module.exports = {
  markOrderPaidFromCheckoutSession
};
