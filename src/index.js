const app = require('./app');
const { config } = require('./config/config');
const logger = require('./utils/logger');

const PORT = config.app.port;

// Create logs directory if it doesn't exist
const fs = require('fs');
const path = require('path');
const logsDir = path.join(__dirname, '..', 'logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Start the server
const server = app.listen(PORT, () => {
  logger.info(`🚀 HubSpot Graph Connector started on port ${PORT}`);
  logger.info(`📊 Environment: ${config.app.nodeEnv}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/api/health`);
  logger.info(`📖 API documentation: http://localhost:${PORT}/`);
});

// Handle server shutdown
server.on('close', () => {
  logger.info('Server closed');
});

module.exports = server;