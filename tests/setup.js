// Test setup and configuration
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';

// Mock environment variables for testing
process.env.TENANT_ID = 'test-tenant-id';
process.env.CLIENT_ID = 'test-client-id';
process.env.CLIENT_SECRET = 'test-client-secret';
process.env.HUBSPOT_API_KEY = 'test-hubspot-api-key';
process.env.HUBSPOT_CLIENT_ID = 'test-hubspot-client-id';
process.env.HUBSPOT_CLIENT_SECRET = 'test-hubspot-client-secret';
process.env.HUBSPOT_REDIRECT_URI = 'http://localhost:3000/auth/hubspot/callback';

// Increase test timeout for async operations
jest.setTimeout(30000);