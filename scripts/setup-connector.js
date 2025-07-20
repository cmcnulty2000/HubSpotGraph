#!/usr/bin/env node

const { config, validateConfig } = require('../src/config/config');
const logger = require('../src/utils/logger');
const graphConnectorService = require('../src/services/graphConnectorService');

async function setupConnector() {
  try {
    logger.info('🚀 Starting HubSpot Graph Connector setup...');
    
    // Validate configuration
    try {
      validateConfig();
      logger.info('✅ Configuration validated');
    } catch (error) {
      logger.error('❌ Configuration validation failed:', error.message);
      process.exit(1);
    }

    // Step 1: Create the connector
    logger.info('📝 Creating Graph connector...');
    try {
      await graphConnectorService.createConnector();
      logger.info('✅ Graph connector created successfully');
    } catch (error) {
      logger.error('❌ Failed to create connector:', error.message);
      throw error;
    }

    // Step 2: Create the schema
    logger.info('🗂️  Creating connector schema...');
    try {
      await graphConnectorService.createSchema();
      logger.info('✅ Schema created successfully');
    } catch (error) {
      logger.error('❌ Failed to create schema:', error.message);
      throw error;
    }

    // Wait a moment for schema to be processed
    logger.info('⏳ Waiting for schema to be processed...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 3: Initial data sync
    logger.info('📊 Starting initial data synchronization...');
    try {
      const syncResult = await graphConnectorService.syncData();
      logger.info('✅ Data synchronization completed:', syncResult);
    } catch (error) {
      logger.warn('⚠️ Data sync encountered issues:', error.message);
      logger.info('💡 You can manually sync data later using: POST /api/connector/sync');
    }

    logger.info('🎉 HubSpot Graph Connector setup completed successfully!');
    logger.info('🔗 Your connector is now ready to use with Microsoft Copilot');
    logger.info('📖 API endpoints are available at: http://localhost:3000/');
    
  } catch (error) {
    logger.error('💥 Setup failed:', error.message);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const forceRecreate = args.includes('--force') || args.includes('-f');

if (forceRecreate) {
  logger.info('🔄 Force recreation mode enabled');
  
  // Delete existing connector first
  graphConnectorService.deleteConnector()
    .then(() => {
      logger.info('🗑️ Existing connector deleted');
      setTimeout(setupConnector, 2000); // Wait before recreating
    })
    .catch((error) => {
      logger.warn('⚠️ Could not delete existing connector:', error.message);
      setupConnector(); // Continue with setup anyway
    });
} else {
  setupConnector();
}