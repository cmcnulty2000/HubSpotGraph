#!/usr/bin/env node

const { config, validateConfig } = require('../src/config/config');
const logger = require('../src/utils/logger');
const graphConnectorService = require('../src/services/graphConnectorService');

async function syncData() {
  try {
    logger.info('🔄 Starting data synchronization...');
    
    // Validate configuration
    try {
      validateConfig();
      logger.info('✅ Configuration validated');
    } catch (error) {
      logger.error('❌ Configuration validation failed:', error.message);
      process.exit(1);
    }

    // Check connector status
    try {
      const status = await graphConnectorService.getConnectionStatus();
      logger.info('📊 Connector status:', status.state);
    } catch (error) {
      logger.error('❌ Cannot connect to Graph connector:', error.message);
      logger.info('💡 Make sure the connector is set up first: npm run setup');
      process.exit(1);
    }

    // Start data synchronization
    const syncResult = await graphConnectorService.syncData();
    
    logger.info('✅ Data synchronization completed successfully!');
    logger.info('📊 Sync statistics:', syncResult);
    
  } catch (error) {
    logger.error('💥 Data synchronization failed:', error.message);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🔄 HubSpot Graph Connector - Data Sync

Usage: npm run sync [options]

Options:
  --help, -h     Show this help message
  
Description:
  Synchronizes data from HubSpot to Microsoft Graph connector.
  This will fetch all contacts, companies, deals, and tickets from
  HubSpot and make them searchable in Microsoft Copilot.

Prerequisites:
  1. Set up environment variables in .env file
  2. Run initial setup: npm run setup
  3. Ensure HubSpot API access is configured

Example:
  npm run sync
  `);
  process.exit(0);
}

syncData();