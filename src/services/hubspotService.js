const axios = require('axios');
const { config } = require('../config/config');
const logger = require('../utils/logger');

class HubSpotService {
  constructor() {
    this.baseURL = config.hubspot.baseUrl;
    this.apiKey = config.hubspot.apiKey;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => {
        logger.error('HubSpot API error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Contacts
  async getContacts(limit = 100, after = null) {
    try {
      const params = { limit };
      if (after) params.after = after;

      const response = await this.client.get('/crm/v3/objects/contacts', { params });
      logger.info(`Retrieved ${response.data.results.length} contacts`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching contacts:', error);
      throw error;
    }
  }

  async getContact(contactId) {
    try {
      const response = await this.client.get(`/crm/v3/objects/contacts/${contactId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching contact ${contactId}:`, error);
      throw error;
    }
  }

  async searchContacts(query, limit = 100) {
    try {
      const searchData = {
        query,
        limit,
        sorts: [{ propertyName: 'lastmodifieddate', direction: 'DESCENDING' }],
        properties: ['firstname', 'lastname', 'email', 'company', 'phone', 'lastmodifieddate']
      };

      const response = await this.client.post('/crm/v3/objects/contacts/search', searchData);
      logger.info(`Found ${response.data.results.length} contacts matching query: ${query}`);
      return response.data;
    } catch (error) {
      logger.error('Error searching contacts:', error);
      throw error;
    }
  }

  // Companies
  async getCompanies(limit = 100, after = null) {
    try {
      const params = { limit };
      if (after) params.after = after;

      const response = await this.client.get('/crm/v3/objects/companies', { params });
      logger.info(`Retrieved ${response.data.results.length} companies`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching companies:', error);
      throw error;
    }
  }

  async getCompany(companyId) {
    try {
      const response = await this.client.get(`/crm/v3/objects/companies/${companyId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching company ${companyId}:`, error);
      throw error;
    }
  }

  async searchCompanies(query, limit = 100) {
    try {
      const searchData = {
        query,
        limit,
        sorts: [{ propertyName: 'hs_lastmodifieddate', direction: 'DESCENDING' }],
        properties: ['name', 'domain', 'industry', 'city', 'state', 'country']
      };

      const response = await this.client.post('/crm/v3/objects/companies/search', searchData);
      logger.info(`Found ${response.data.results.length} companies matching query: ${query}`);
      return response.data;
    } catch (error) {
      logger.error('Error searching companies:', error);
      throw error;
    }
  }

  // Deals
  async getDeals(limit = 100, after = null) {
    try {
      const params = { limit };
      if (after) params.after = after;

      const response = await this.client.get('/crm/v3/objects/deals', { params });
      logger.info(`Retrieved ${response.data.results.length} deals`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching deals:', error);
      throw error;
    }
  }

  async getDeal(dealId) {
    try {
      const response = await this.client.get(`/crm/v3/objects/deals/${dealId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching deal ${dealId}:`, error);
      throw error;
    }
  }

  async searchDeals(query, limit = 100) {
    try {
      const searchData = {
        query,
        limit,
        sorts: [{ propertyName: 'hs_lastmodifieddate', direction: 'DESCENDING' }],
        properties: ['dealname', 'amount', 'dealstage', 'pipeline', 'closedate']
      };

      const response = await this.client.post('/crm/v3/objects/deals/search', searchData);
      logger.info(`Found ${response.data.results.length} deals matching query: ${query}`);
      return response.data;
    } catch (error) {
      logger.error('Error searching deals:', error);
      throw error;
    }
  }

  // Tickets
  async getTickets(limit = 100, after = null) {
    try {
      const params = { limit };
      if (after) params.after = after;

      const response = await this.client.get('/crm/v3/objects/tickets', { params });
      logger.info(`Retrieved ${response.data.results.length} tickets`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching tickets:', error);
      throw error;
    }
  }

  async getTicket(ticketId) {
    try {
      const response = await this.client.get(`/crm/v3/objects/tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching ticket ${ticketId}:`, error);
      throw error;
    }
  }

  // Generic search across all objects
  async searchAll(query, objectTypes = ['contacts', 'companies', 'deals', 'tickets']) {
    try {
      const searchPromises = objectTypes.map(async (objectType) => {
        try {
          const method = `search${objectType.charAt(0).toUpperCase() + objectType.slice(1, -1)}s`;
          if (this[method]) {
            const results = await this[method](query, 10); // Limit to 10 per object type
            return {
              objectType,
              results: results.results || []
            };
          }
        } catch (error) {
          logger.warn(`Error searching ${objectType}:`, error.message);
          return {
            objectType,
            results: []
          };
        }
      });

      const allResults = await Promise.all(searchPromises);
      return allResults.filter(result => result && result.results && result.results.length > 0);
    } catch (error) {
      logger.error('Error in global search:', error);
      throw error;
    }
  }

  // Get account info
  async getAccountInfo() {
    try {
      const response = await this.client.get('/integrations/v1/me');
      return response.data;
    } catch (error) {
      logger.error('Error fetching account info:', error);
      throw error;
    }
  }
}

module.exports = new HubSpotService();