const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const { registerValidator, loginValidator, refreshTokenValidator } = require('../validators/authValidator');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', registerValidator, authController.register);

// Login
router.post('/login', loginValidator, authController.login);

// Refresh token
router.post('/refresh', refreshTokenValidator, authController.refreshToken);

// Logout
router.post('/logout', authenticateToken, authController.logout);

// Get current user
router.get('/me', authenticateToken, authController.getCurrentUser);

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










