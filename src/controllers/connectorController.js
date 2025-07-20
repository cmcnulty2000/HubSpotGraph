const graphConnectorService = require('../services/graphConnectorService');
const hubspotService = require('../services/hubspotService');
const logger = require('../utils/logger');
const Joi = require('joi');

class ConnectorController {
  async createConnector(req, res) {
    try {
      logger.info('Creating Graph connector...');
      const result = await graphConnectorService.createConnector();
      
      res.status(201).json({
        success: true,
        message: 'Connector created successfully',
        data: result
      });
    } catch (error) {
      logger.error('Error creating connector:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create connector',
        error: error.message
      });
    }
  }

  async createSchema(req, res) {
    try {
      logger.info('Creating connector schema...');
      const result = await graphConnectorService.createSchema();
      
      res.status(201).json({
        success: true,
        message: 'Schema created successfully',
        data: result
      });
    } catch (error) {
      logger.error('Error creating schema:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create schema',
        error: error.message
      });
    }
  }

  async syncData(req, res) {
    try {
      logger.info('Starting data synchronization...');
      
      // Start sync in background for large datasets
      graphConnectorService.syncData()
        .then(result => {
          logger.info('Data sync completed:', result);
        })
        .catch(error => {
          logger.error('Data sync failed:', error);
        });

      res.status(202).json({
        success: true,
        message: 'Data synchronization started',
        note: 'This is a background process. Check logs for completion status.'
      });
    } catch (error) {
      logger.error('Error starting data sync:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start data synchronization',
        error: error.message
      });
    }
  }

  async getConnectionStatus(req, res) {
    try {
      const status = await graphConnectorService.getConnectionStatus();
      
      res.status(200).json({
        success: true,
        data: status
      });
    } catch (error) {
      logger.error('Error getting connection status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get connection status',
        error: error.message
      });
    }
  }

  async deleteConnector(req, res) {
    try {
      logger.info('Deleting Graph connector...');
      const result = await graphConnectorService.deleteConnector();
      
      res.status(200).json({
        success: true,
        message: 'Connector deleted successfully',
        data: result
      });
    } catch (error) {
      logger.error('Error deleting connector:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete connector',
        error: error.message
      });
    }
  }

  async searchHubSpot(req, res) {
    try {
      const schema = Joi.object({
        query: Joi.string().required().min(1),
        objectTypes: Joi.array().items(
          Joi.string().valid('contacts', 'companies', 'deals', 'tickets')
        ).default(['contacts', 'companies', 'deals', 'tickets']),
        limit: Joi.number().integer().min(1).max(100).default(10)
      });

      const { error, value } = schema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request parameters',
          error: error.details[0].message
        });
      }

      const { query, objectTypes, limit } = value;
      
      logger.info(`Searching HubSpot for: ${query}`);
      const results = await hubspotService.searchAll(query, objectTypes);
      
      res.status(200).json({
        success: true,
        data: {
          query,
          results: results.map(result => ({
            objectType: result.objectType,
            count: result.results.length,
            items: result.results.slice(0, limit)
          }))
        }
      });
    } catch (error) {
      logger.error('Error searching HubSpot:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search HubSpot',
        error: error.message
      });
    }
  }

  async getContacts(req, res) {
    try {
      const schema = Joi.object({
        limit: Joi.number().integer().min(1).max(100).default(20),
        after: Joi.string().optional()
      });

      const { error, value } = schema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request parameters',
          error: error.details[0].message
        });
      }

      const { limit, after } = value;
      const contacts = await hubspotService.getContacts(limit, after);
      
      res.status(200).json({
        success: true,
        data: contacts
      });
    } catch (error) {
      logger.error('Error fetching contacts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch contacts',
        error: error.message
      });
    }
  }

  async getCompanies(req, res) {
    try {
      const schema = Joi.object({
        limit: Joi.number().integer().min(1).max(100).default(20),
        after: Joi.string().optional()
      });

      const { error, value } = schema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request parameters',
          error: error.details[0].message
        });
      }

      const { limit, after } = value;
      const companies = await hubspotService.getCompanies(limit, after);
      
      res.status(200).json({
        success: true,
        data: companies
      });
    } catch (error) {
      logger.error('Error fetching companies:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch companies',
        error: error.message
      });
    }
  }

  async getDeals(req, res) {
    try {
      const schema = Joi.object({
        limit: Joi.number().integer().min(1).max(100).default(20),
        after: Joi.string().optional()
      });

      const { error, value } = schema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request parameters',
          error: error.details[0].message
        });
      }

      const { limit, after } = value;
      const deals = await hubspotService.getDeals(limit, after);
      
      res.status(200).json({
        success: true,
        data: deals
      });
    } catch (error) {
      logger.error('Error fetching deals:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch deals',
        error: error.message
      });
    }
  }

  async getTickets(req, res) {
    try {
      const schema = Joi.object({
        limit: Joi.number().integer().min(1).max(100).default(20),
        after: Joi.string().optional()
      });

      const { error, value } = schema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request parameters',
          error: error.details[0].message
        });
      }

      const { limit, after } = value;
      const tickets = await hubspotService.getTickets(limit, after);
      
      res.status(200).json({
        success: true,
        data: tickets
      });
    } catch (error) {
      logger.error('Error fetching tickets:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tickets',
        error: error.message
      });
    }
  }

  async getHubSpotAccountInfo(req, res) {
    try {
      const accountInfo = await hubspotService.getAccountInfo();
      
      res.status(200).json({
        success: true,
        data: accountInfo
      });
    } catch (error) {
      logger.error('Error fetching account info:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch account info',
        error: error.message
      });
    }
  }

  async healthCheck(req, res) {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          hubspot: 'unknown',
          graph: 'unknown'
        }
      };

      // Test HubSpot connection
      try {
        await hubspotService.getAccountInfo();
        health.services.hubspot = 'connected';
      } catch (error) {
        health.services.hubspot = 'disconnected';
        health.status = 'degraded';
      }

      // Test Graph connection
      try {
        await graphConnectorService.getConnectionStatus();
        health.services.graph = 'connected';
      } catch (error) {
        health.services.graph = 'disconnected';
        health.status = 'degraded';
      }

      const statusCode = health.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json({
        success: health.status === 'healthy',
        data: health
      });
    } catch (error) {
      logger.error('Health check failed:', error);
      res.status(503).json({
        success: false,
        message: 'Health check failed',
        error: error.message
      });
    }
  }
}

module.exports = new ConnectorController();