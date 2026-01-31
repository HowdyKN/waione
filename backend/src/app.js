const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Initialize passport
require('./config/passport');

const { sequelize } = require('./models');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',')
    : process.env.NODE_ENV === 'development'
    ? true // Allow all origins in development
    : [
        'http://localhost:19006', 
        'http://localhost:19007',
        'exp://localhost:8081', // Expo Go
        'waigit://', // WAIGIT app scheme
        'healthywai://', // HealthyWAI app scheme
      ],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.path}`, {
      origin: req.headers.origin,
      'user-agent': req.headers['user-agent']?.substring(0, 50)
    });
    next();
  });
}

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  // Don't send response if headers already sent
  if (res.headersSent) {
    return next(err);
  }
  
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      error: err.message,
      stack: err.stack 
    })
  });
});

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    console.log('Attempting to connect to database...');
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Verify database tables exist by checking for users table
    try {
      const [results] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'");
      if (results.length === 0) {
        console.warn('Warning: Database tables not found. Run migrations with: npm run migrate');
        console.warn('Attempting to sync models in development mode...');
      }
    } catch (tableCheckError) {
      console.warn('Could not verify database tables:', tableCheckError.message);
    }
    
    // Sync database in development (use migrations in production)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('Database models synchronized.');
    }
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      ...(error.parent && { databaseError: error.parent.message })
    });
    
    // Provide helpful error messages
    if (error.name === 'SequelizeConnectionError' || error.name === 'SequelizeConnectionRefusedError') {
      console.error('\n❌ Database connection failed!');
      console.error('Please ensure:');
      console.error('  1. PostgreSQL is running (docker compose up -d)');
      console.error('  2. Database credentials in .env are correct');
      console.error('  3. Database "waione_db" exists');
    }
    
    process.exit(1);
  }
};

startServer();

module.exports = app;
