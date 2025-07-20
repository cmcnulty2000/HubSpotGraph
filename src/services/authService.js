const { ConfidentialClientApplication } = require('@azure/msal-node');
const { Client } = require('@microsoft/microsoft-graph-client');
const { config } = require('../config/config');
const logger = require('../utils/logger');

class AuthService {
  constructor() {
    this.msalConfig = {
      auth: {
        clientId: config.graph.clientId,
        clientSecret: config.graph.clientSecret,
        authority: `https://login.microsoftonline.com/${config.graph.tenantId}`
      }
    };
    
    this.msalClient = new ConfidentialClientApplication(this.msalConfig);
  }

  async getAccessToken() {
    try {
      const clientCredentialRequest = {
        scopes: config.graph.scopes,
      };

      const response = await this.msalClient.acquireTokenByClientCredential(clientCredentialRequest);
      logger.info('Successfully acquired access token');
      return response.accessToken;
    } catch (error) {
      logger.error('Error acquiring access token:', error);
      throw new Error('Failed to acquire access token');
    }
  }

  async getGraphClient() {
    try {
      const accessToken = await this.getAccessToken();
      
      const graphClient = Client.init({
        authProvider: (done) => {
          done(null, accessToken);
        }
      });

      return graphClient;
    } catch (error) {
      logger.error('Error creating Graph client:', error);
      throw new Error('Failed to create Graph client');
    }
  }

  async validateToken(token) {
    try {
      // Simple token validation - in production, use proper JWT validation
      if (!token || typeof token !== 'string') {
        return false;
      }
      
      // Additional validation logic can be added here
      return true;
    } catch (error) {
      logger.error('Token validation error:', error);
      return false;
    }
  }
}

module.exports = new AuthService();