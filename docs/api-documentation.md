# HubSpot Graph Connector - API Documentation

## Overview

The HubSpot Graph Connector provides a RESTful API for managing Microsoft Graph connections to HubSpot CRM data. This API enables you to create connectors, synchronize data, and search HubSpot information through Microsoft Graph.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, the API uses optional authentication. For production deployments, implement proper authentication middleware.

## Response Format

All API responses follow this standard format:

```json
{
  "success": boolean,
  "message": "string (optional)",
  "data": object,
  "error": "string (only on errors)"
}
```

## Endpoints

### Connector Management

#### Create Connector

Creates a new Microsoft Graph connector for HubSpot data.

**Endpoint:** `POST /api/connector`

**Response:**
```json
{
  "success": true,
  "message": "Connector created successfully",
  "data": {
    "id": "hubspot-connector",
    "name": "HubSpot Connector",
    "description": "Microsoft Graph connector for HubSpot CRM data",
    "state": "ready"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Failed to create connector",
  "error": "Connector already exists"
}
```

#### Create Schema

Creates the data schema for the connector, defining how HubSpot data will be structured in Microsoft Graph.

**Endpoint:** `POST /api/connector/schema`

**Response:**
```json
{
  "success": true,
  "message": "Schema created successfully",
  "data": {
    "baseType": "microsoft.graph.externalItem",
    "properties": [...]
  }
}
```

#### Sync Data

Initiates data synchronization from HubSpot to Microsoft Graph. This is an asynchronous operation.

**Endpoint:** `POST /api/connector/sync`

**Response:**
```json
{
  "success": true,
  "message": "Data synchronization started",
  "note": "This is a background process. Check logs for completion status."
}
```

#### Get Connection Status

Retrieves the current status of the Graph connector.

**Endpoint:** `GET /api/connector/status`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "hubspot-connector",
    "name": "HubSpot Connector",
    "state": "ready",
    "description": "Microsoft Graph connector for HubSpot CRM data"
  }
}
```

#### Delete Connector

Removes the Graph connector and all associated data.

**Endpoint:** `DELETE /api/connector`

**Response:**
```json
{
  "success": true,
  "message": "Connector deleted successfully",
  "data": {
    "success": true
  }
}
```

### HubSpot Data Access

#### Universal Search

Search across all HubSpot object types (contacts, companies, deals, tickets).

**Endpoint:** `GET /api/hubspot/search`

**Query Parameters:**
- `query` (required): Search term
- `objectTypes` (optional): Array of object types to search. Default: `["contacts", "companies", "deals", "tickets"]`
- `limit` (optional): Maximum results per object type. Default: 10, Max: 100

**Example Request:**
```bash
GET /api/hubspot/search?query=john&limit=5
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "john",
    "results": [
      {
        "objectType": "contacts",
        "count": 2,
        "items": [
          {
            "id": "1",
            "properties": {
              "firstname": "John",
              "lastname": "Doe",
              "email": "john@example.com"
            }
          }
        ]
      },
      {
        "objectType": "companies",
        "count": 1,
        "items": [...]
      }
    ]
  }
}
```

#### Get Contacts

Retrieve HubSpot contacts with pagination support.

**Endpoint:** `GET /api/hubspot/contacts`

**Query Parameters:**
- `limit` (optional): Number of contacts to return. Default: 20, Max: 100
- `after` (optional): Pagination cursor for next page

**Example Request:**
```bash
GET /api/hubspot/contacts?limit=10&after=cursor123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "1",
        "properties": {
          "firstname": "John",
          "lastname": "Doe",
          "email": "john@example.com",
          "company": "Acme Corp",
          "phone": "+1-555-0123",
          "lastmodifieddate": "2023-12-01T10:00:00.000Z"
        }
      }
    ],
    "paging": {
      "next": {
        "after": "cursor456"
      }
    }
  }
}
```

#### Get Companies

Retrieve HubSpot companies with pagination support.

**Endpoint:** `GET /api/hubspot/companies`

**Query Parameters:**
- `limit` (optional): Number of companies to return. Default: 20, Max: 100
- `after` (optional): Pagination cursor for next page

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "1",
        "properties": {
          "name": "Acme Corporation",
          "domain": "acme.com",
          "industry": "Technology",
          "city": "San Francisco",
          "state": "California",
          "country": "United States"
        }
      }
    ],
    "paging": {
      "next": {
        "after": "cursor789"
      }
    }
  }
}
```

#### Get Deals

Retrieve HubSpot deals with pagination support.

**Endpoint:** `GET /api/hubspot/deals`

**Query Parameters:**
- `limit` (optional): Number of deals to return. Default: 20, Max: 100
- `after` (optional): Pagination cursor for next page

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "1",
        "properties": {
          "dealname": "Big Enterprise Deal",
          "amount": "50000",
          "dealstage": "negotiation",
          "pipeline": "sales-pipeline",
          "closedate": "2024-01-15T00:00:00.000Z"
        }
      }
    ],
    "paging": {
      "next": {
        "after": "cursor101112"
      }
    }
  }
}
```

#### Get Tickets

Retrieve HubSpot tickets with pagination support.

**Endpoint:** `GET /api/hubspot/tickets`

**Query Parameters:**
- `limit` (optional): Number of tickets to return. Default: 20, Max: 100
- `after` (optional): Pagination cursor for next page

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "1",
        "properties": {
          "subject": "Technical Support Request",
          "hs_ticket_priority": "HIGH",
          "hs_pipeline_stage": "open",
          "hs_ticket_category": "Technical Issue"
        }
      }
    ],
    "paging": {
      "next": {
        "after": "cursor131415"
      }
    }
  }
}
```

#### Get HubSpot Account Info

Retrieve information about the connected HubSpot account.

**Endpoint:** `GET /api/hubspot/account`

**Response:**
```json
{
  "success": true,
  "data": {
    "portalId": 12345678,
    "timeZone": "US/Pacific",
    "companyCurrency": "USD",
    "additionalCurrencies": [],
    "utcOffset": "-08:00"
  }
}
```

### Health & Monitoring

#### Health Check

Check the health status of the connector and its dependencies.

**Endpoint:** `GET /api/health`

**Response (Healthy):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2023-12-01T10:00:00.000Z",
    "services": {
      "hubspot": "connected",
      "graph": "connected"
    }
  }
}
```

**Response (Degraded):**
```json
{
  "success": false,
  "data": {
    "status": "degraded",
    "timestamp": "2023-12-01T10:00:00.000Z",
    "services": {
      "hubspot": "disconnected",
      "graph": "connected"
    }
  }
}
```

## Error Codes

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `202` - Accepted (for asynchronous operations)
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable

### Common Error Responses

#### Validation Error
```json
{
  "success": false,
  "message": "Invalid request parameters",
  "error": "\"query\" is required"
}
```

#### Rate Limit Error
```json
{
  "success": false,
  "message": "Rate limit exceeded",
  "error": "Too many requests. Please try again later."
}
```

#### Service Unavailable
```json
{
  "success": false,
  "message": "HubSpot service unavailable",
  "error": "Unable to connect to HubSpot API"
}
```

## Rate Limiting

The API respects HubSpot's rate limits:
- **Burst limit**: 100 requests per 10 seconds
- **Daily limit**: 40,000 requests per day (for Professional accounts)

When rate limits are exceeded, the API will return a 429 status code with retry information.

## Pagination

All list endpoints support pagination using cursor-based pagination:

1. Make an initial request without the `after` parameter
2. Use the `after` value from the response's `paging.next.after` field for subsequent requests
3. Continue until `paging.next` is not present in the response

**Example Pagination Flow:**

```bash
# First request
GET /api/hubspot/contacts?limit=20

# Use the 'after' cursor from the response
GET /api/hubspot/contacts?limit=20&after=cursor123

# Continue until no more pages
GET /api/hubspot/contacts?limit=20&after=cursor456
```

## Search Queries

The search endpoint supports various query formats:

### Simple Text Search
```bash
GET /api/hubspot/search?query=john
```

### Email Search
```bash
GET /api/hubspot/search?query=john@example.com
```

### Company Search
```bash
GET /api/hubspot/search?query=acme
```

### Filtered Object Type Search
```bash
GET /api/hubspot/search?query=tech&objectTypes=["companies"]
```

## Data Schema

### Contact Properties
- `firstname` - First name
- `lastname` - Last name
- `email` - Email address
- `company` - Company name
- `phone` - Phone number
- `lastmodifieddate` - Last modified timestamp

### Company Properties
- `name` - Company name
- `domain` - Company domain
- `industry` - Industry
- `city` - City
- `state` - State/Province
- `country` - Country
- `hs_lastmodifieddate` - Last modified timestamp

### Deal Properties
- `dealname` - Deal name
- `amount` - Deal amount
- `dealstage` - Current deal stage
- `pipeline` - Sales pipeline
- `closedate` - Expected close date
- `hs_lastmodifieddate` - Last modified timestamp

### Ticket Properties
- `subject` - Ticket subject
- `hs_ticket_priority` - Priority level
- `hs_pipeline_stage` - Current status
- `hs_ticket_category` - Category
- `hs_lastmodifieddate` - Last modified timestamp

## Examples

### Complete Setup Workflow

```bash
# 1. Create the connector
curl -X POST http://localhost:3000/api/connector

# 2. Create the schema
curl -X POST http://localhost:3000/api/connector/schema

# 3. Start data synchronization
curl -X POST http://localhost:3000/api/connector/sync

# 4. Check sync status
curl http://localhost:3000/api/connector/status
```

### Search and Data Retrieval

```bash
# Search for a specific contact
curl "http://localhost:3000/api/hubspot/search?query=john@example.com"

# Get recent contacts
curl "http://localhost:3000/api/hubspot/contacts?limit=10"

# Search companies in tech industry
curl "http://localhost:3000/api/hubspot/search?query=technology&objectTypes=[\"companies\"]"

# Get high-value deals
curl "http://localhost:3000/api/hubspot/deals?limit=50"
```

### Monitoring

```bash
# Check health
curl http://localhost:3000/api/health

# Get account information
curl http://localhost:3000/api/hubspot/account
```

This API documentation provides comprehensive information for integrating with the HubSpot Graph Connector. For additional support, refer to the main README file or create an issue in the repository.