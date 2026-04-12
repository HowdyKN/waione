const express = require('express');
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');
const {
  embeddedCheckoutValidator,
  syncCheckoutSessionValidator
} = require('../validators/paymentValidator');

const router = express.Router();

router.get('/config', paymentController.getPaymentConfig);

router.post(
  '/embedded-checkout',
  authenticateToken,
  embeddedCheckoutValidator,
  paymentController.createEmbeddedCheckoutSession
);

router.post(
  '/sync-checkout-session',
  authenticateToken,
  syncCheckoutSessionValidator,
  paymentController.syncCheckoutSession
);

module.exports = router;
