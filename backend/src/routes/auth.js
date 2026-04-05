const express = require('express');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const authController = require('../controllers/authController');
const phoneAuthController = require('../controllers/phoneAuthController');
const {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  profileAddressValidator
} = require('../validators/authValidator');
const {
  requestPhoneOtpValidator,
  verifyPhoneOtpValidator
} = require('../validators/phoneOtpValidator');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const phoneOtpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.PHONE_OTP_REQUEST_LIMIT_PER_15M) || 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many code requests. Try again later.' }
});

const phoneOtpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.PHONE_OTP_VERIFY_LIMIT_PER_15M) || 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Try again later.' }
});

// Register
router.post('/register', registerValidator, authController.register);

// Login
router.post('/login', loginValidator, authController.login);

// Phone OTP (WhatsApp primary, SMS fallback — see services/twilioOtpDelivery.js)
router.post(
  '/phone/request',
  phoneOtpRequestLimiter,
  requestPhoneOtpValidator,
  phoneAuthController.requestPhoneOtp
);
router.post(
  '/phone/verify',
  phoneOtpVerifyLimiter,
  verifyPhoneOtpValidator,
  phoneAuthController.verifyPhoneOtp
);

// Refresh token
router.post('/refresh', refreshTokenValidator, authController.refreshToken);

// Logout
router.post('/logout', authenticateToken, authController.logout);

// Get current user
router.get('/me', authenticateToken, authController.getCurrentUser);

// Update saved delivery address on profile
router.patch(
  '/me',
  authenticateToken,
  profileAddressValidator,
  authController.updateProfileAddress
);

// OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth/failure' }),
  (req, res, next) => {
    req.provider = 'google';
    authController.handleOAuthCallback(req, res, next);
  }
);

router.get('/apple', passport.authenticate('apple'));

router.post('/apple/callback',
  passport.authenticate('apple', { session: false }),
  (req, res, next) => {
    req.provider = 'apple';
    authController.handleOAuthCallback(req, res, next);
  }
);

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: '/auth/failure' }),
  (req, res, next) => {
    req.provider = 'facebook';
    authController.handleOAuthCallback(req, res, next);
  }
);

// OAuth failure handler
router.get('/failure', (req, res) => {
  res.status(401).json({
    success: false,
    message: 'OAuth authentication failed'
  });
});

module.exports = router;










