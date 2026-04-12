const Stripe = require('stripe');
const { markOrderPaidFromCheckoutSession } = require('../services/stripeOrderPayment');

/**
 * Stripe webhook — requires raw body (see app.js). Do not parse JSON before this route.
 */
const handleStripeWebhook = async (req, res) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return res.status(503).send('Webhook not configured');
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).send('Stripe not configured');
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const sig = req.headers['stripe-signature'];
  if (!sig) {
    return res.status(400).send('Missing stripe-signature');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        await markOrderPaidFromCheckoutSession(event.data.object);
        break;
      case 'checkout.session.async_payment_failed':
        // optional: mark failed — metadata orderId
        break;
      default:
        break;
    }
  } catch (e) {
    console.error('Stripe webhook handler error:', e);
    return res.status(500).json({ received: false });
  }

  res.json({ received: true });
};

module.exports = {
  handleStripeWebhook
};
