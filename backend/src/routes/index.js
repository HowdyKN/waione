const express = require('express');
const authRoutes = require('./auth');
const resourceRoutes = require('./resources');
const githubRoutes = require('./github');
const productRoutes = require('./products');
const orderRoutes = require('./orders');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
router.use('/auth', authRoutes);

// Resource routes (example CRUD operations)
router.use('/resources', resourceRoutes);

// Catalog & orders
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);

// GitHub OAuth routes
router.use('/github', githubRoutes);

module.exports = router;


