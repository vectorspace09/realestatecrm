# Real Estate CRM API Documentation

## Overview
This is a comprehensive Real Estate Management Platform API that provides AI-powered features for lead management, property listings, deal tracking, task management, and automated communications.

## Base URL
- Development: `http://localhost:5000`
- Production: `https://your-domain.com`

## Authentication
The API uses session-based authentication with Replit Auth. All endpoints require authentication unless specified otherwise.

### Headers
```
Cookie: connect.sid=<session-id>
```

## Quick Start

### Access Interactive Documentation
Visit `/api/docs` for the full interactive Swagger UI documentation.

### Get API Specification
- JSON format: `/api/docs.json`

## API Endpoints Overview

### 🔐 Authentication
- `GET /api/auth/user` - Get current authenticated user

### 📊 Dashboard & Analytics
- `GET /api/dashboard/metrics` - Get dashboard metrics
- `GET /api/analytics/detailed` - Get detailed analytics

### 👥 Lead Management
- `GET /api/leads` - List all leads with filtering
- `POST /api/leads` - Create new lead (with AI scoring)
- `GET /api/leads/{id}` - Get specific lead
- `PATCH /api/leads/{id}` - Update lead
- `PATCH /api/leads/{id}/status` - Update lead status

### 🏠 Property Management
- `GET /api/properties` - List all properties with filtering
- `POST /api/properties` - Create new property listing
- `GET /api/properties/{id}` - Get specific property
- `PATCH /api/properties/{id}` - Update property

### 💰 Deal Pipeline
- `GET /api/deals` - List all deals with filtering
- `POST /api/deals` - Create new deal
- `GET /api/deals/{id}` - Get specific deal
- `PATCH /api/deals/{id}` - Update deal

### ✅ Task Management
- `GET /api/tasks` - List all tasks with filtering
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### 💬 Communications
- `GET /api/communications` - List all communications
- `POST /api/communications` - Create communication record
- `GET /api/communications/campaigns` - List marketing campaigns
- `POST /api/communications/campaigns` - Create marketing campaign
- `GET /api/communications/templates` - List message templates
- `POST /api/communications/templates` - Create message template

### 🔔 Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/{id}/read` - Mark as read

### 🤖 AI Services
- `POST /api/ai/chat` - AI-powered contextual chat
- `GET /api/ai/insights` - Get AI insights and recommendations
- `POST /api/ai/generate-message` - Generate personalized messages
- `POST /api/ai/property-match` - Find matching properties using AI

### 📁 Object Storage
- `POST /api/objects/signed-url` - Get signed URL for file upload
- `GET /api/objects/{objectKey}` - Get object download URL
- `DELETE /api/objects/{objectKey}` - Delete object

## Key Features

### 🧠 AI-Powered Features
1. **Lead Scoring**: Automatic lead scoring using AI analysis
2. **Property Matching**: AI-powered property recommendations for leads
3. **Message Generation**: Personalized email/SMS generation
4. **Contextual Chat**: Intelligent assistant for CRM operations
5. **Insights & Analytics**: AI-driven business insights

### 📱 Real-time Features
1. **Live Notifications**: Real-time notification system
2. **Status Updates**: Live status changes across the system
3. **Activity Tracking**: Real-time activity feeds

### 🔍 Advanced Filtering
All list endpoints support comprehensive filtering:
- **Leads**: Filter by status, assigned user, search terms
- **Properties**: Filter by status, type, price range
- **Deals**: Filter by stage, assigned user
- **Tasks**: Filter by status, type, priority, assigned user
- **Communications**: Filter by lead, type, status

## Data Models

### Lead
```json
{
  "id": "uuid",
  "firstName": "string",
  "lastName": "string",
  "email": "email",
  "phone": "string",
  "source": "website|referral|social|advertising|event|other",
  "status": "new|contacted|qualified|proposal|negotiation|closed|lost",
  "score": "integer (0-100)",
  "budget": "decimal",
  "budgetMax": "decimal",
  "preferredLocations": ["string"],
  "propertyTypes": ["string"],
  "timeline": "string",
  "notes": "string",
  "assignedTo": "uuid",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Property
```json
{
  "id": "uuid",
  "title": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "zipCode": "string",
  "propertyType": "house|apartment|condo|townhouse|land|commercial",
  "status": "available|under_contract|sold|off_market",
  "price": "decimal",
  "bedrooms": "integer",
  "bathrooms": "decimal",
  "squareFeet": "integer",
  "description": "string",
  "features": ["string"],
  "images": ["url"],
  "listingAgent": "uuid",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Deal
```json
{
  "id": "uuid",
  "leadId": "uuid",
  "propertyId": "uuid",
  "stage": "inquiry|showing|offer|negotiation|under_contract|closing|closed|lost",
  "dealValue": "decimal",
  "commission": "decimal",
  "probability": "integer (0-100)",
  "expectedCloseDate": "date",
  "actualCloseDate": "date",
  "notes": "string",
  "assignedTo": "uuid",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Task
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "type": "call|email|meeting|document|visit|research",
  "priority": "high|medium|low",
  "status": "pending|in_progress|completed",
  "dueDate": "datetime",
  "completedAt": "datetime",
  "leadId": "uuid",
  "propertyId": "uuid",
  "dealId": "uuid",
  "assignedTo": "uuid",
  "createdBy": "uuid",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## Error Handling

### Standard Error Response
```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error"
    }
  ]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting
- Standard endpoints: 1000 requests per minute
- AI endpoints: 100 requests per minute
- File upload endpoints: 50 requests per minute

## Example Usage

### Create a Lead with AI Scoring
```bash
curl -X POST http://localhost:5000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123",
    "budget": 500000,
    "budgetMax": 750000,
    "preferredLocations": ["Manhattan", "Brooklyn"],
    "propertyTypes": ["apartment", "condo"],
    "timeline": "3-6 months",
    "source": "website"
  }'
```

### Get AI Property Matches
```bash
curl -X POST http://localhost:5000/api/ai/property-match \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "lead-uuid-here",
    "maxResults": 5
  }'
```

### Generate Personalized Message
```bash
curl -X POST http://localhost:5000/api/ai/generate-message \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "lead-uuid-here",
    "type": "email",
    "purpose": "follow_up",
    "tone": "professional"
  }'
```

## SDKs and Libraries
- JavaScript/TypeScript: Built-in TypeScript definitions
- cURL examples: Available in interactive docs
- Postman Collection: Available at `/api/docs.json`

## Support
- API Documentation: `/api/docs`
- Interactive Testing: Available in Swagger UI
- Rate Limits: Monitor via response headers

---

*For the most up-to-date and interactive documentation, visit `/api/docs` when the server is running.*