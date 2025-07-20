const authService = require('../services/authService');
const logger = require('../utils/logger');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header is required'
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Bearer token is required'
      });
    }

    const isValid = await authService.validateToken(token);
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Add token to request for further use
    req.token = token;
    next();
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal authentication error'
    });
  }
};

// Middleware for routes that don't require authentication
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const isValid = await authService.validateToken(token);
        if (isValid) {
          req.token = token;
        }
      }
    }
    
    next();
  } catch (error) {
    logger.warn('Optional auth middleware error:', error);
    next(); // Continue without authentication
  }
};

module.exports = {
  authMiddleware,
  optionalAuth
};