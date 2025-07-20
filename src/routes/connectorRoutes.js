const express = require('express');
const connectorController = require('../controllers/connectorController');

const router = express.Router();

// Connector management routes
router.post('/connector', connectorController.createConnector);
router.post('/connector/schema', connectorController.createSchema);
router.post('/connector/sync', connectorController.syncData);
router.get('/connector/status', connectorController.getConnectionStatus);
router.delete('/connector', connectorController.deleteConnector);

// HubSpot data routes
router.get('/hubspot/search', connectorController.searchHubSpot);
router.get('/hubspot/contacts', connectorController.getContacts);
router.get('/hubspot/companies', connectorController.getCompanies);
router.get('/hubspot/deals', connectorController.getDeals);
router.get('/hubspot/tickets', connectorController.getTickets);
router.get('/hubspot/account', connectorController.getHubSpotAccountInfo);

// Health check
router.get('/health', connectorController.healthCheck);

module.exports = router;