import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Real Estate CRM API',
      version: '1.0.0',
      description: 'A comprehensive Real Estate Management Platform API with AI-powered features',
      contact: {
        name: 'API Support',
        email: 'support@realestatecrm.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:5000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        SessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            profileImageUrl: { type: 'string', format: 'uri' },
            role: { type: 'string', enum: ['agent', 'admin', 'manager'] },
            teamId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Lead: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            source: { type: 'string', enum: ['website', 'referral', 'social', 'advertising', 'event', 'other'] },
            status: { type: 'string', enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed', 'lost'] },
            score: { type: 'integer', minimum: 0, maximum: 100 },
            budget: { type: 'number', format: 'decimal' },
            budgetMax: { type: 'number', format: 'decimal' },
            preferredLocations: { type: 'array', items: { type: 'string' } },
            propertyTypes: { type: 'array', items: { type: 'string' } },
            timeline: { type: 'string' },
            notes: { type: 'string' },
            assignedTo: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          },
          required: ['firstName', 'lastName']
        },
        CreateLead: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            source: { type: 'string', enum: ['website', 'referral', 'social', 'advertising', 'event', 'other'] },
            budget: { type: 'number', format: 'decimal' },
            budgetMax: { type: 'number', format: 'decimal' },
            preferredLocations: { type: 'array', items: { type: 'string' } },
            propertyTypes: { type: 'array', items: { type: 'string' } },
            timeline: { type: 'string' },
            notes: { type: 'string' },
            assignedTo: { type: 'string', format: 'uuid' }
          },
          required: ['firstName', 'lastName']
        },
        Property: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            address: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            zipCode: { type: 'string' },
            propertyType: { type: 'string', enum: ['house', 'apartment', 'condo', 'townhouse', 'land', 'commercial'] },
            status: { type: 'string', enum: ['available', 'under_contract', 'sold', 'off_market'] },
            price: { type: 'number', format: 'decimal' },
            bedrooms: { type: 'integer', minimum: 0 },
            bathrooms: { type: 'number', format: 'decimal' },
            squareFeet: { type: 'integer', minimum: 0 },
            lotSize: { type: 'number', format: 'decimal' },
            yearBuilt: { type: 'integer' },
            description: { type: 'string' },
            features: { type: 'array', items: { type: 'string' } },
            images: { type: 'array', items: { type: 'string', format: 'uri' } },
            virtualTourUrl: { type: 'string', format: 'uri' },
            listingAgent: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          },
          required: ['title', 'address', 'city', 'state', 'propertyType', 'price']
        },
        Deal: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            leadId: { type: 'string', format: 'uuid' },
            propertyId: { type: 'string', format: 'uuid' },
            stage: { type: 'string', enum: ['inquiry', 'showing', 'offer', 'negotiation', 'under_contract', 'closing', 'closed', 'lost'] },
            dealValue: { type: 'number', format: 'decimal' },
            commission: { type: 'number', format: 'decimal' },
            probability: { type: 'integer', minimum: 0, maximum: 100 },
            expectedCloseDate: { type: 'string', format: 'date' },
            actualCloseDate: { type: 'string', format: 'date' },
            notes: { type: 'string' },
            assignedTo: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          },
          required: ['leadId', 'stage', 'dealValue']
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            type: { type: 'string', enum: ['call', 'email', 'meeting', 'document', 'visit', 'research'] },
            priority: { type: 'string', enum: ['high', 'medium', 'low'] },
            status: { type: 'string', enum: ['pending', 'in_progress', 'completed'] },
            dueDate: { type: 'string', format: 'date-time' },
            completedAt: { type: 'string', format: 'date-time' },
            leadId: { type: 'string', format: 'uuid' },
            propertyId: { type: 'string', format: 'uuid' },
            dealId: { type: 'string', format: 'uuid' },
            assignedTo: { type: 'string', format: 'uuid' },
            createdBy: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          },
          required: ['title', 'type']
        },
        Communication: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            leadId: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['email', 'sms', 'call', 'meeting', 'note'] },
            direction: { type: 'string', enum: ['inbound', 'outbound'] },
            subject: { type: 'string' },
            content: { type: 'string' },
            status: { type: 'string', enum: ['draft', 'sent', 'delivered', 'read', 'replied', 'failed', 'scheduled'] },
            scheduledAt: { type: 'string', format: 'date-time' },
            sentAt: { type: 'string', format: 'date-time' },
            userId: { type: 'string', format: 'uuid' },
            metadata: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          },
          required: ['leadId', 'type', 'content']
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            message: { type: 'string' },
            type: { type: 'string', enum: ['lead', 'task', 'deal', 'system', 'reminder'] },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
            isRead: { type: 'boolean' },
            actionUrl: { type: 'string' },
            metadata: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' }
          },
          required: ['userId', 'title', 'message', 'type']
        },
        DashboardMetrics: {
          type: 'object',
          properties: {
            totalLeads: { type: 'integer' },
            activeDeals: { type: 'integer' },
            monthlyRevenue: { type: 'number', format: 'decimal' },
            conversionRate: { type: 'number', format: 'decimal' },
            activeTasks: { type: 'integer' },
            overdueItems: { type: 'integer' }
          }
        },
        AIInsight: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
            actionable: { type: 'boolean' },
            priority: { type: 'string', enum: ['low', 'medium', 'high'] }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } }
          }
        }
      }
    },
    security: [
      { SessionAuth: [] },
      { BearerAuth: [] }
    ]
  },
  apis: ['./server/routes.ts', './server/swagger-routes.ts']
};

const specs = swaggerJSDoc(options);

export function setupSwagger(app: Express) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Real Estate CRM API Documentation'
  }));
  
  // JSON endpoint for API spec
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
}

export { specs };