const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const authConfig = require('../config/auth');
const { User, Session } = require('../models');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, authConfig.jwt.secret);

    // Check if session exists and is active
    const session = await Session.findOne({
      where: {
        token: token,
        userId: decoded.userId,
        isActive: true,
        expiresAt: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session'
      });
    }

    // Get user
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Attach user and token to request
    req.user = user;
    req.token = token;
    req.session = session;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    // Log database errors for debugging
    if (error.name === 'SequelizeDatabaseError' || error.name === 'SequelizeConnectionError') {
      console.error('Database error in authentication:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Database connection error. Please try again later.'
      });
    }
    
    next(error);
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, authConfig.jwt.secret);
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['password'] }
      });
      if (user && user.isActive) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Log error but continue without authentication if token is invalid
    if (error.name !== 'JsonWebTokenError' && error.name !== 'TokenExpiredError') {
      console.error('Optional auth error:', error);
    }
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};


