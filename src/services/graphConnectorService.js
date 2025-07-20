const authService = require('./authService');
const hubspotService = require('./hubspotService');
const { config } = require('../config/config');
const logger = require('../utils/logger');

class GraphConnectorService {
  constructor() {
    this.connectorId = config.connector.id;
    this.connectionId = config.connection.id;
  }

  async createConnector() {
    try {
      const graphClient = await authService.getGraphClient();
      
      const connector = {
        id: this.connectorId,
        name: config.connector.name,
        description: config.connector.description,
        state: 'ready'
      };

      const response = await graphClient
        .api('/external/connections')
        .post(connector);

      logger.info('Successfully created Graph connector:', response);
      return response;
    } catch (error) {
      if (error.code === 'Request_BadRequest' && error.message.includes('already exists')) {
        logger.info('Connector already exists, updating...');
        return await this.updateConnector();
      }
      logger.error('Error creating connector:', error);
      throw error;
    }
  }

  async updateConnector() {
    try {
      const graphClient = await authService.getGraphClient();
      
      const connector = {
        name: config.connector.name,
        description: config.connector.description,
        state: 'ready'
      };

      const response = await graphClient
        .api(`/external/connections/${this.connectorId}`)
        .patch(connector);

      logger.info('Successfully updated Graph connector');
      return response;
    } catch (error) {
      logger.error('Error updating connector:', error);
      throw error;
    }
  }

  async createSchema() {
    try {
      const graphClient = await authService.getGraphClient();
      
      const schema = {
        baseType: 'microsoft.graph.externalItem',
        properties: [
          {
            name: 'title',
            type: 'string',
            isSearchable: true,
            isRetrievable: true,
            isQueryable: true,
            labels: ['title']
          },
          {
            name: 'content',
            type: 'string',
            isSearchable: true,
            isRetrievable: true
          },
          {
            name: 'url',
            type: 'string',
            isRetrievable: true,
            labels: ['url']
          },
          {
            name: 'objectType',
            type: 'string',
            isSearchable: true,
            isRetrievable: true,
            isQueryable: true,
            isRefinable: true
          },
          {
            name: 'email',
            type: 'string',
            isSearchable: true,
            isRetrievable: true,
            isQueryable: true
          },
          {
            name: 'company',
            type: 'string',
            isSearchable: true,
            isRetrievable: true,
            isQueryable: true,
            isRefinable: true
          },
          {
            name: 'industry',
            type: 'string',
            isSearchable: true,
            isRetrievable: true,
            isRefinable: true
          },
          {
            name: 'lastModified',
            type: 'dateTime',
            isRetrievable: true,
            isQueryable: true,
            isRefinable: true
          },
          {
            name: 'dealAmount',
            type: 'double',
            isRetrievable: true,
            isQueryable: true,
            isRefinable: true
          },
          {
            name: 'dealStage',
            type: 'string',
            isSearchable: true,
            isRetrievable: true,
            isRefinable: true
          }
        ]
      };

      const response = await graphClient
        .api(`/external/connections/${this.connectorId}/schema`)
        .post(schema);

      logger.info('Successfully created schema');
      return response;
    } catch (error) {
      logger.error('Error creating schema:', error);
      throw error;
    }
  }

  async syncData() {
    try {
      logger.info('Starting data synchronization...');
      
      const syncStats = {
        contacts: 0,
        companies: 0,
        deals: 0,
        tickets: 0,
        errors: 0
      };

      // Sync contacts
      try {
        await this.syncContacts();
        syncStats.contacts = await this.getContactCount();
      } catch (error) {
        logger.error('Error syncing contacts:', error);
        syncStats.errors++;
      }

      // Sync companies
      try {
        await this.syncCompanies();
        syncStats.companies = await this.getCompanyCount();
      } catch (error) {
        logger.error('Error syncing companies:', error);
        syncStats.errors++;
      }

      // Sync deals
      try {
        await this.syncDeals();
        syncStats.deals = await this.getDealCount();
      } catch (error) {
        logger.error('Error syncing deals:', error);
        syncStats.errors++;
      }

      // Sync tickets
      try {
        await this.syncTickets();
        syncStats.tickets = await this.getTicketCount();
      } catch (error) {
        logger.error('Error syncing tickets:', error);
        syncStats.errors++;
      }

      logger.info('Data synchronization completed:', syncStats);
      return syncStats;
    } catch (error) {
      logger.error('Error during data sync:', error);
      throw error;
    }
  }

  async syncContacts() {
    try {
      const graphClient = await authService.getGraphClient();
      let after = null;
      let contactCount = 0;

      do {
        const contactsData = await hubspotService.getContacts(100, after);
        
        for (const contact of contactsData.results) {
          try {
            const externalItem = this.transformContactToExternalItem(contact);
            
            await graphClient
              .api(`/external/connections/${this.connectorId}/items/${externalItem.id}`)
              .put(externalItem);
            
            contactCount++;
          } catch (error) {
            logger.warn(`Error syncing contact ${contact.id}:`, error.message);
          }
        }

        after = contactsData.paging?.next?.after;
        logger.info(`Synced ${contactCount} contacts so far...`);
        
      } while (after);

      logger.info(`Successfully synced ${contactCount} contacts`);
      return contactCount;
    } catch (error) {
      logger.error('Error syncing contacts:', error);
      throw error;
    }
  }

  async syncCompanies() {
    try {
      const graphClient = await authService.getGraphClient();
      let after = null;
      let companyCount = 0;

      do {
        const companiesData = await hubspotService.getCompanies(100, after);
        
        for (const company of companiesData.results) {
          try {
            const externalItem = this.transformCompanyToExternalItem(company);
            
            await graphClient
              .api(`/external/connections/${this.connectorId}/items/${externalItem.id}`)
              .put(externalItem);
            
            companyCount++;
          } catch (error) {
            logger.warn(`Error syncing company ${company.id}:`, error.message);
          }
        }

        after = companiesData.paging?.next?.after;
        logger.info(`Synced ${companyCount} companies so far...`);
        
      } while (after);

      logger.info(`Successfully synced ${companyCount} companies`);
      return companyCount;
    } catch (error) {
      logger.error('Error syncing companies:', error);
      throw error;
    }
  }

  async syncDeals() {
    try {
      const graphClient = await authService.getGraphClient();
      let after = null;
      let dealCount = 0;

      do {
        const dealsData = await hubspotService.getDeals(100, after);
        
        for (const deal of dealsData.results) {
          try {
            const externalItem = this.transformDealToExternalItem(deal);
            
            await graphClient
              .api(`/external/connections/${this.connectorId}/items/${externalItem.id}`)
              .put(externalItem);
            
            dealCount++;
          } catch (error) {
            logger.warn(`Error syncing deal ${deal.id}:`, error.message);
          }
        }

        after = dealsData.paging?.next?.after;
        logger.info(`Synced ${dealCount} deals so far...`);
        
      } while (after);

      logger.info(`Successfully synced ${dealCount} deals`);
      return dealCount;
    } catch (error) {
      logger.error('Error syncing deals:', error);
      throw error;
    }
  }

  async syncTickets() {
    try {
      const graphClient = await authService.getGraphClient();
      let after = null;
      let ticketCount = 0;

      do {
        const ticketsData = await hubspotService.getTickets(100, after);
        
        for (const ticket of ticketsData.results) {
          try {
            const externalItem = this.transformTicketToExternalItem(ticket);
            
            await graphClient
              .api(`/external/connections/${this.connectorId}/items/${externalItem.id}`)
              .put(externalItem);
            
            ticketCount++;
          } catch (error) {
            logger.warn(`Error syncing ticket ${ticket.id}:`, error.message);
          }
        }

        after = ticketsData.paging?.next?.after;
        logger.info(`Synced ${ticketCount} tickets so far...`);
        
      } while (after);

      logger.info(`Successfully synced ${ticketCount} tickets`);
      return ticketCount;
    } catch (error) {
      logger.error('Error syncing tickets:', error);
      throw error;
    }
  }

  transformContactToExternalItem(contact) {
    const properties = contact.properties || {};
    
    return {
      id: `contact_${contact.id}`,
      content: {
        type: 'text',
        value: `${properties.firstname || ''} ${properties.lastname || ''} - ${properties.email || ''} - ${properties.company || ''}`
      },
      properties: {
        title: `${properties.firstname || ''} ${properties.lastname || ''}`.trim() || 'Unknown Contact',
        content: `Contact: ${properties.firstname || ''} ${properties.lastname || ''}\nEmail: ${properties.email || ''}\nCompany: ${properties.company || ''}\nPhone: ${properties.phone || ''}`,
        url: `https://app.hubspot.com/contacts/${contact.id}`,
        objectType: 'contact',
        email: properties.email || '',
        company: properties.company || '',
        lastModified: properties.lastmodifieddate ? new Date(properties.lastmodifieddate).toISOString() : new Date().toISOString()
      }
    };
  }

  transformCompanyToExternalItem(company) {
    const properties = company.properties || {};
    
    return {
      id: `company_${company.id}`,
      content: {
        type: 'text',
        value: `${properties.name || ''} - ${properties.domain || ''} - ${properties.industry || ''}`
      },
      properties: {
        title: properties.name || 'Unknown Company',
        content: `Company: ${properties.name || ''}\nDomain: ${properties.domain || ''}\nIndustry: ${properties.industry || ''}\nLocation: ${properties.city || ''}, ${properties.state || ''} ${properties.country || ''}`,
        url: `https://app.hubspot.com/companies/${company.id}`,
        objectType: 'company',
        company: properties.name || '',
        industry: properties.industry || '',
        lastModified: properties.hs_lastmodifieddate ? new Date(properties.hs_lastmodifieddate).toISOString() : new Date().toISOString()
      }
    };
  }

  transformDealToExternalItem(deal) {
    const properties = deal.properties || {};
    
    return {
      id: `deal_${deal.id}`,
      content: {
        type: 'text',
        value: `${properties.dealname || ''} - $${properties.amount || '0'} - ${properties.dealstage || ''}`
      },
      properties: {
        title: properties.dealname || 'Unknown Deal',
        content: `Deal: ${properties.dealname || ''}\nAmount: $${properties.amount || '0'}\nStage: ${properties.dealstage || ''}\nPipeline: ${properties.pipeline || ''}\nClose Date: ${properties.closedate || ''}`,
        url: `https://app.hubspot.com/deals/${deal.id}`,
        objectType: 'deal',
        dealAmount: parseFloat(properties.amount) || 0,
        dealStage: properties.dealstage || '',
        lastModified: properties.hs_lastmodifieddate ? new Date(properties.hs_lastmodifieddate).toISOString() : new Date().toISOString()
      }
    };
  }

  transformTicketToExternalItem(ticket) {
    const properties = ticket.properties || {};
    
    return {
      id: `ticket_${ticket.id}`,
      content: {
        type: 'text',
        value: `${properties.subject || ''} - ${properties.hs_ticket_priority || ''} - ${properties.hs_pipeline_stage || ''}`
      },
      properties: {
        title: properties.subject || 'Unknown Ticket',
        content: `Ticket: ${properties.subject || ''}\nPriority: ${properties.hs_ticket_priority || ''}\nStatus: ${properties.hs_pipeline_stage || ''}\nCategory: ${properties.hs_ticket_category || ''}`,
        url: `https://app.hubspot.com/tickets/${ticket.id}`,
        objectType: 'ticket',
        lastModified: properties.hs_lastmodifieddate ? new Date(properties.hs_lastmodifieddate).toISOString() : new Date().toISOString()
      }
    };
  }

  async getContactCount() {
    try {
      const data = await hubspotService.getContacts(1);
      return data.total || 0;
    } catch (error) {
      return 0;
    }
  }

  async getCompanyCount() {
    try {
      const data = await hubspotService.getCompanies(1);
      return data.total || 0;
    } catch (error) {
      return 0;
    }
  }

  async getDealCount() {
    try {
      const data = await hubspotService.getDeals(1);
      return data.total || 0;
    } catch (error) {
      return 0;
    }
  }

  async getTicketCount() {
    try {
      const data = await hubspotService.getTickets(1);
      return data.total || 0;
    } catch (error) {
      return 0;
    }
  }

  async deleteConnector() {
    try {
      const graphClient = await authService.getGraphClient();
      
      await graphClient
        .api(`/external/connections/${this.connectorId}`)
        .delete();

      logger.info('Successfully deleted Graph connector');
      return { success: true };
    } catch (error) {
      logger.error('Error deleting connector:', error);
      throw error;
    }
  }

  async getConnectionStatus() {
    try {
      const graphClient = await authService.getGraphClient();
      
      const response = await graphClient
        .api(`/external/connections/${this.connectorId}`)
        .get();

      return response;
    } catch (error) {
      logger.error('Error getting connection status:', error);
      throw error;
    }
  }
}

module.exports = new GraphConnectorService();