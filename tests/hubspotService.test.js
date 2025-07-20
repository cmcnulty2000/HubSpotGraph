// Mock axios before requiring the service
jest.mock('axios');
const axios = require('axios');
const mockedAxios = axios;

// Mock the axios create method to return a proper mock client
const mockClient = {
  get: jest.fn(),
  post: jest.fn(),
  interceptors: {
    response: {
      use: jest.fn()
    }
  }
};

mockedAxios.create.mockReturnValue(mockClient);

const hubspotService = require('../src/services/hubspotService');

describe('HubSpotService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations
    mockClient.get.mockReset();
    mockClient.post.mockReset();
  });

  describe('getContacts', () => {
    it('should fetch contacts successfully', async () => {
      const mockResponse = {
        data: {
          results: [
            {
              id: '1',
              properties: {
                firstname: 'John',
                lastname: 'Doe',
                email: 'john@example.com'
              }
            }
          ],
          total: 1
        }
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await hubspotService.getContacts(10);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].properties.firstname).toBe('John');
    });

    it('should handle API errors gracefully', async () => {
      mockClient.get.mockRejectedValue(new Error('API Error'));

      await expect(hubspotService.getContacts()).rejects.toThrow('API Error');
    });
  });

  describe('searchContacts', () => {
    it('should search contacts successfully', async () => {
      const mockResponse = {
        data: {
          results: [
            {
              id: '1',
              properties: {
                firstname: 'John',
                lastname: 'Doe',
                email: 'john@example.com'
              }
            }
          ]
        }
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await hubspotService.searchContacts('John');
      expect(result.results).toHaveLength(1);
      expect(result.results[0].properties.firstname).toBe('John');
    });
  });

  describe('searchAll', () => {
    it('should search across all object types', async () => {
      const mockContactResponse = {
        data: {
          results: [
            {
              id: '1',
              properties: { firstname: 'John', lastname: 'Doe' }
            }
          ]
        }
      };

      const mockCompanyResponse = {
        data: {
          results: [
            {
              id: '1',
              properties: { name: 'Acme Corp' }
            }
          ]
        }
      };

      mockClient.post
        .mockResolvedValueOnce(mockContactResponse)
        .mockResolvedValueOnce(mockCompanyResponse)
        .mockResolvedValue({ data: { results: [] } });

      const result = await hubspotService.searchAll('test');
      expect(result).toHaveLength(2);
      expect(result[0].objectType).toBe('contacts');
      expect(result[1].objectType).toBe('companies');
    });
  });
});