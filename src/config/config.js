require('dotenv').config();

const config = {
  // Microsoft Graph Configuration
  graph: {
    tenantId: process.env.TENANT_ID,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    scopes: ['https://graph.microsoft.com/.default']
  },

  // HubSpot Configuration
  hubspot: {
    apiKey: process.env.HUBSPOT_API_KEY,
    clientId: process.env.HUBSPOT_CLIENT_ID,
    clientSecret: process.env.HUBSPOT_CLIENT_SECRET,
    redirectUri: process.env.HUBSPOT_REDIRECT_URI,
    baseUrl: 'https://api.hubapi.com'
  },

  // Application Configuration
  app: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info'
  },

  // Connector Configuration
  connector: {
    id: process.env.CONNECTOR_ID || 'hubspot-connector',
    name: process.env.CONNECTOR_NAME || 'HubSpot Connector',
    description: process.env.CONNECTOR_DESCRIPTION || 'Microsoft Graph connector for HubSpot CRM data'
  },

  // Connection Configuration
  connection: {
    id: process.env.CONNECTION_ID || 'hubspot-connection',
    name: process.env.CONNECTION_NAME || 'HubSpot CRM Connection'
  }
};

// Validate required configuration
const validateConfig = () => {
  const required = [
    'graph.tenantId',
    'graph.clientId',
    'graph.clientSecret',
    'hubspot.apiKey'
  ];

  const missing = required.filter(key => {
    const value = key.split('.').reduce((obj, prop) => obj && obj[prop], config);
    return !value;
  });

  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }
};

module.exports = {
  config,
  validateConfig
};