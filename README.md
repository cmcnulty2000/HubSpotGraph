# HubSpot Microsoft Graph Connector

A comprehensive Microsoft Graph connector that enables Microsoft Copilot to search and interact with HubSpot CRM data. This connector allows you to find contacts, companies, deals, and tickets from HubSpot directly within Microsoft 365 applications.

## Features

- 🔗 **Microsoft Graph Integration**: Seamlessly connects HubSpot data to Microsoft Graph
- 🔍 **Universal Search**: Search across contacts, companies, deals, and tickets
- 🤖 **Copilot Ready**: Works with Microsoft Copilot for intelligent assistance
- 📊 **Real-time Sync**: Synchronize data from HubSpot to Microsoft Graph
- 🛡️ **Secure Authentication**: Uses Microsoft MSAL for secure authentication
- 📈 **Comprehensive API**: RESTful API for managing the connector
- 🧪 **Test Coverage**: Unit tests for reliability

## Prerequisites

Before setting up the connector, ensure you have:

1. **Microsoft 365 Admin Access** with permissions to create Graph connectors
2. **Azure AD App Registration** with appropriate Graph API permissions
3. **HubSpot Account** with API access
4. **Node.js 18+** installed on your system

## Setup Instructions

### 1. Azure AD App Registration

1. Go to [Azure Portal](https://portal.azure.com) → Azure Active Directory → App registrations
2. Click "New registration"
3. Configure your app:
   - Name: "HubSpot Graph Connector"
   - Supported account types: "Accounts in this organizational directory only"
   - Redirect URI: Leave blank for now
4. Note down the **Application (client) ID** and **Directory (tenant) ID**
5. Create a client secret:
   - Go to "Certificates & secrets" → "New client secret"
   - Note down the **client secret value**
6. Configure API permissions:
   - Go to "API permissions" → "Add a permission" → "Microsoft Graph"
   - Add these **Application permissions**:
     - `ExternalConnection.ReadWrite.OwnedBy`
     - `ExternalItem.ReadWrite.OwnedBy`
   - Click "Grant admin consent"

### 2. HubSpot API Setup

1. Log in to your [HubSpot account](https://app.hubspot.com)
2. Go to Settings → Integrations → Private Apps
3. Click "Create a private app"
4. Configure scopes:
   - `crm.objects.contacts.read`
   - `crm.objects.companies.read`
   - `crm.objects.deals.read`
   - `crm.objects.tickets.read`
   - `crm.schemas.contacts.read`
   - `crm.schemas.companies.read`
   - `crm.schemas.deals.read`
   - `crm.schemas.tickets.read`
5. Create the app and note down the **access token**

### 3. Project Setup

1. Clone and install dependencies:
```bash
git clone <repository-url>
cd hubspot-graph-connector
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

3. Edit `.env` with your credentials:
```env
# Microsoft Graph App Registration
TENANT_ID=your-tenant-id
CLIENT_ID=your-client-id
CLIENT_SECRET=your-client-secret

# HubSpot API Configuration
HUBSPOT_API_KEY=your-hubspot-access-token

# Application Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# Connector Configuration
CONNECTOR_ID=hubspot-connector
CONNECTOR_NAME=HubSpot Connector
CONNECTOR_DESCRIPTION=Microsoft Graph connector for HubSpot CRM data
```

### 4. Initialize the Connector

Run the setup script to create the Graph connector and initial data sync:

```bash
npm run setup
```

To force recreate an existing connector:
```bash
npm run setup -- --force
```

## Usage

### Starting the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### Manual Data Synchronization

```bash
npm run sync
```

### API Endpoints

The connector provides a RESTful API:

#### Connector Management
- `POST /api/connector` - Create the Graph connector
- `POST /api/connector/schema` - Create the connector schema
- `POST /api/connector/sync` - Start data synchronization
- `GET /api/connector/status` - Get connector status
- `DELETE /api/connector` - Delete the connector

#### HubSpot Data Access
- `GET /api/hubspot/search?query=<term>` - Search across all object types
- `GET /api/hubspot/contacts` - Get contacts
- `GET /api/hubspot/companies` - Get companies
- `GET /api/hubspot/deals` - Get deals
- `GET /api/hubspot/tickets` - Get tickets
- `GET /api/hubspot/account` - Get account information

#### Health & Monitoring
- `GET /api/health` - Health check endpoint
- `GET /` - API documentation

### Example API Calls

```bash
# Health check
curl http://localhost:3000/api/health

# Search HubSpot data
curl "http://localhost:3000/api/hubspot/search?query=john"

# Get contacts with pagination
curl "http://localhost:3000/api/hubspot/contacts?limit=20"

# Sync data
curl -X POST http://localhost:3000/api/connector/sync
```

## Microsoft Copilot Integration

Once the connector is set up and data is synchronized, you can use Microsoft Copilot to search HubSpot data:

### Example Copilot Queries

- "Find contacts from Acme Corp"
- "Show me deals worth more than $10,000"
- "What tickets are open with high priority?"
- "Find all contacts with gmail addresses"

### Search Capabilities

The connector makes the following HubSpot data searchable in Copilot:

**Contacts:**
- Name, email, phone, company
- Last modified date
- Direct links to HubSpot contact pages

**Companies:**
- Company name, domain, industry
- Location (city, state, country)
- Direct links to HubSpot company pages

**Deals:**
- Deal name, amount, stage, pipeline
- Close date, last modified date
- Direct links to HubSpot deal pages

**Tickets:**
- Subject, priority, status, category
- Last modified date
- Direct links to HubSpot ticket pages

## Data Synchronization

### Automatic Sync

Set up automatic synchronization using cron jobs or scheduled tasks:

```bash
# Add to crontab for hourly sync
0 * * * * cd /path/to/connector && npm run sync

# Or run every 6 hours
0 */6 * * * cd /path/to/connector && npm run sync
```

### Manual Sync

Trigger synchronization manually via API or script:

```bash
# Via API
curl -X POST http://localhost:3000/api/connector/sync

# Via script
npm run sync
```

## Monitoring and Logging

### Log Files

Logs are stored in the `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only

### Health Monitoring

Monitor the connector health:

```bash
curl http://localhost:3000/api/health
```

Response includes:
- Overall health status
- HubSpot connection status
- Microsoft Graph connection status

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Project Structure

```
├── src/
│   ├── config/          # Configuration management
│   ├── controllers/     # API controllers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── utils/           # Utility functions
├── scripts/             # Setup and utility scripts
├── tests/               # Unit tests
└── logs/                # Application logs
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TENANT_ID` | Azure AD tenant ID | Yes |
| `CLIENT_ID` | Azure AD app client ID | Yes |
| `CLIENT_SECRET` | Azure AD app client secret | Yes |
| `HUBSPOT_API_KEY` | HubSpot private app access token | Yes |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `LOG_LEVEL` | Logging level (error/warn/info/debug) | No |

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify Azure AD app permissions
   - Check client secret expiration
   - Ensure admin consent is granted

2. **HubSpot API Errors**
   - Verify HubSpot access token
   - Check API rate limits
   - Ensure required scopes are granted

3. **Connector Creation Fails**
   - Verify Graph API permissions
   - Check if connector ID already exists
   - Use `--force` flag to recreate

4. **Data Sync Issues**
   - Check HubSpot data access permissions
   - Monitor API rate limits
   - Review application logs

### Getting Help

- Check the `logs/` directory for detailed error messages
- Review API responses for specific error codes
- Ensure all prerequisites are met
- Verify environment variables are correctly set

## Security Considerations

- Store sensitive credentials in environment variables, never in code
- Use Azure Key Vault for production environments
- Regularly rotate client secrets and API keys
- Monitor access logs for suspicious activity
- Implement proper network security measures

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review Microsoft Graph connector documentation
- Consult HubSpot API documentation