const { validationResult } = require('express-validator');
const { User, Session, OAuthProvider } = require('../models');
const { generateTokens, verifyToken } = require('../utils/jwt');
const { Op } = require('sequelize');

// Register new user
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, firstName, lastName, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      phone
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Create session
    await Session.create({
      userId: user.id,
      token: accessToken,
      refreshToken: refreshToken,
      deviceInfo: req.body.deviceInfo || null,
      ipAddress: req.ip || req.connection.remoteAddress,
      expiresAt
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific database errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    
    // Handle database connection errors
    if (error.name === 'SequelizeDatabaseError' || error.name === 'SequelizeConnectionError') {
      console.error('Database connection error during registration:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Database connection error. Please try again later.'
      });
    }
    
    // For any other unhandled error, send a proper response before calling next
    // This ensures the client always gets a response
    console.error('Unhandled registration error:', error.message || error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during registration. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { 
        error: error.message,
        stack: error.stack 
      })
    });
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'Please use OAuth to login'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Create session
    await Session.create({
      userId: user.id,
      token: accessToken,
      refreshToken: refreshToken,
      deviceInfo: req.body.deviceInfo || null,
      ipAddress: req.ip || req.connection.remoteAddress,
      expiresAt
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    // Handle database connection errors
    if (error.name === 'SequelizeDatabaseError' || error.name === 'SequelizeConnectionError') {
      return res.status(500).json({
        success: false,
        message: 'Database connection error. Please try again later.'
      });
    }
    next(error);
  }
};

// Refresh token
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = verifyToken(token, true);

    // Find session
    const session = await Session.findOne({
      where: {
        refreshToken: token,
        userId: decoded.userId,
        isActive: true
      },
      include: [{
        model: User,
        as: 'user'
      }]
    });

    if (!session || !session.user || !session.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(session.user);

    // Update session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await session.update({
      token: accessToken,
      refreshToken: newRefreshToken,
      expiresAt
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken
        }
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }
    
    // Handle database errors
    if (error.name === 'SequelizeDatabaseError' || error.name === 'SequelizeConnectionError') {
      return res.status(500).json({
        success: false,
        message: 'Database connection error. Please try again later.'
      });
    }
    
    next(error);
  }
};

// Logout
const logout = async (req, res, next) => {
  try {
    const { token } = req;

    if (token) {
      await Session.update(
        { isActive: false },
        { where: { token } }
      );
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    // Logout should succeed even if session update fails
    // Return success to ensure tokens are cleared on client
    res.json({
      success: true,
      message: 'Logout successful'
    });
  }
};

// Get current user
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: OAuthProvider,
        as: 'oauthProviders',
        attributes: ['id', 'provider', 'email']
      }]
    });

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    // Handle database errors
    if (error.name === 'SequelizeDatabaseError' || error.name === 'SequelizeConnectionError') {
      return res.status(500).json({
        success: false,
        message: 'Database connection error. Please try again later.'
      });
    }
    next(error);
  }
};

// OAuth callback handler
const handleOAuthCallback = async (req, res, next) => {
  try {
    const user = req.user; // Set by passport strategy
    const provider = req.provider; // Set by route handler

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'OAuth authentication failed'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create session
    await Session.create({
      userId: user.id,
      token: accessToken,
      refreshToken: refreshToken,
      deviceInfo: req.body.deviceInfo || null,
      ipAddress: req.ip || req.connection.remoteAddress,
      expiresAt
    });

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    // Redirect or return tokens based on request type
    if (req.headers['content-type'] === 'application/json') {
      res.json({
        success: true,
        message: 'OAuth login successful',
        data: {
          user: user.toJSON(),
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });
    } else {
      // For web OAuth flows, redirect with tokens
      const redirectUrl = `${process.env.MOBILE_REDIRECT_URL || 'exp://localhost:19006'}/auth/callback?token=${accessToken}&refreshToken=${refreshToken}`;
      res.redirect(redirectUrl);
    }
  } catch (error) {
    next(error);
  }
};

// Update saved delivery address on user profile (default address for future orders).
const updateProfileAddress = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { addressLine1, addressLine2, city, state, postalCode, country } = req.body;

    await User.update(
      {
        addressLine1,
        addressLine2: addressLine2 || null,
        city,
        state: state || null,
        postalCode: postalCode || null,
        country: country || 'US'
      },
      { where: { id: req.user.id } }
    );

    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: OAuthProvider,
          as: 'oauthProviders',
          attributes: ['id', 'provider', 'email']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Profile updated',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser,
  updateProfileAddress,
  handleOAuthCallback
};


