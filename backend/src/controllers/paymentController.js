const { validationResult } = require('express-validator');
const Stripe = require('stripe');
const db = require('../models');
const { Order, OrderItem, Product, User } = db;
const { markOrderPaidFromCheckoutSession } = require('../services/stripeOrderPayment');
const {
  getOrderDeleteCutoffDays,
  decorateOrderForClient
} = require('../utils/orderDeletePolicy');

const orderInclude = [
  {
    model: OrderItem,
    as: 'items',
    include: [{ model: Product, as: 'product', attributes: ['id', 'sku', 'name', 'priceCents'] }]
  }
];

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

function getFrontendBaseUrl() {
  const raw = process.env.FRONTEND_URL || process.env.CORS_ORIGIN?.split(',')?.[0]?.trim() || '';
  return raw.replace(/\/+$/, '');
}

/**
 * GET /api/payments/config — whether Stripe is configured (for UI).
 */
const getPaymentConfig = async (req, res) => {
  const publishable = process.env.STRIPE_PUBLISHABLE_KEY || '';
  const enabled = Boolean(getStripe() && publishable);
  return res.json({
    success: true,
    data: {
      stripePaymentsEnabled: enabled,
      publishableKey: enabled ? publishable : null,
      /** Same Checkout Session + PaymentIntent can power native Payment Sheet later. */
      nativePaymentSheetReady: false
    }
  });
};

/**
 * POST /api/payments/embedded-checkout — Embedded Checkout Session (web).
 * Body: { orderId }
 */
const createEmbeddedCheckoutSession = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const stripe = getStripe();
    const publishable = process.env.STRIPE_PUBLISHABLE_KEY;
    if (!stripe || !publishable) {
      return res.status(503).json({
        success: false,
        message: 'Card payments are not configured on the server.'
      });
    }

    const { orderId } = req.body;
    const order = await Order.findOne({
      where: { id: orderId, userId: req.user.id },
      include: orderInclude
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This order is already paid.'
      });
    }

    if (order.totalCents < 1) {
      return res.status(400).json({
        success: false,
        message: 'Nothing to charge for this order.'
      });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'firstName', 'lastName']
    });

    const lineItems = [];
    const plain = order.get({ plain: true });
    let sumCents = 0;
    for (const item of plain.items || []) {
      const name = item.product?.name || `Item ${item.productId}`;
      const line = item.quantity * item.unitPriceCents;
      sumCents += line;
      lineItems.push({
        quantity: item.quantity,
        price_data: {
          currency: (plain.currency || 'USD').toLowerCase(),
          unit_amount: item.unitPriceCents,
          product_data: {
            name: name.slice(0, 120)
          }
        }
      });
    }
    if (sumCents !== order.totalCents) {
      console.error('Order line totals do not match order.totalCents', sumCents, order.totalCents);
      return res.status(500).json({
        success: false,
        message: 'Order total could not be reconciled for payment.'
      });
    }

    const base = getFrontendBaseUrl();
    if (!base) {
      return res.status(503).json({
        success: false,
        message: 'FRONTEND_URL is not set; cannot build Stripe return URL.'
      });
    }

    const returnUrl = `${base}/order/payment-return?session_id={CHECKOUT_SESSION_ID}`;

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'payment',
      line_items: lineItems,
      return_url: returnUrl,
      client_reference_id: order.id,
      metadata: {
        orderId: order.id,
        userId: req.user.id
      },
      customer_email: user?.email || undefined
    });

    await order.update({
      stripeCheckoutSessionId: session.id
    });

    return res.json({
      success: true,
      data: {
        clientSecret: session.client_secret,
        publishableKey,
        sessionId: session.id,
        orderId: order.id
      }
    });
  } catch (err) {
    console.error('createEmbeddedCheckoutSession:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Could not start checkout.'
    });
  }
};

/**
 * POST /api/payments/sync-checkout-session — after return_url redirect; webhook may lag.
 * Body: { sessionId }
 */
const syncCheckoutSession = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({ success: false, message: 'Stripe not configured.' });
    }

    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent']
    });

    const orderId = session.metadata?.orderId;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Invalid session.' });
    }

    const order = await Order.findOne({
      where: { id: orderId, userId: req.user.id }
    });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    await markOrderPaidFromCheckoutSession(session);

    const full = await Order.findByPk(order.id, { include: orderInclude });
    const cutoffDays = getOrderDeleteCutoffDays();

    return res.json({
      success: true,
      data: {
        order: decorateOrderForClient(full, cutoffDays),
        orderDeleteCutoffDays: cutoffDays,
        sessionPaymentStatus: session.payment_status
      }
    });
  } catch (err) {
    console.error('syncCheckoutSession:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Could not sync payment.'
    });
  }
};

module.exports = {
  getPaymentConfig,
  createEmbeddedCheckoutSession,
  syncCheckoutSession
};
