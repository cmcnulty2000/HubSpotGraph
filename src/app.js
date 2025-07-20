const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { config, validateConfig } = require('./config/config');
const logger = require('./utils/logger');
const connectorRoutes = require('./routes/connectorRoutes');
const { optionalAuth } = require('./middleware/authMiddleware');

// Validate configuration on startup
try {
  validateConfig();
  logger.info('Configuration validated successfully');
} catch (error) {
  logger.error('Configuration validation failed:', error.message);
  process.exit(1);
}

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    query: req.query
  });
  next();
});

// Optional authentication for all routes
app.use(optionalAuth);

// API routes
app.use('/api', connectorRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'HubSpot Graph Connector',
    version: '1.0.0',
    description: 'Microsoft Graph connector for HubSpot CRM integration',
    endpoints: {
      health: '/api/health',
      connector: {
        create: 'POST /api/connector',
        createSchema: 'POST /api/connector/schema',
        sync: 'POST /api/connector/sync',
        status: 'GET /api/connector/status',
        delete: 'DELETE /api/connector'
      },
      hubspot: {
        search: 'GET /api/hubspot/search',
        contacts: 'GET /api/hubspot/contacts',
        companies: 'GET /api/hubspot/companies',
        deals: 'GET /api/hubspot/deals',
        tickets: 'GET /api/hubspot/tickets',
        account: 'GET /api/hubspot/account'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(config.app.nodeEnv === 'development' && { stack: error.stack })
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

module.exports = app;