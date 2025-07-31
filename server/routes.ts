import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertLeadSchema, insertPropertySchema, insertDealSchema, insertTaskSchema } from "@shared/schema";
import { scoreLeadWithAI, matchPropertyToLead, generateFollowUpMessage, getAIInsights } from "./openai";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/metrics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const metrics = await storage.getDashboardMetrics(userId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Lead routes
  app.get('/api/leads', isAuthenticated, async (req: any, res) => {
    try {
      const { status, assignedTo, search } = req.query;
      const leads = await storage.getLeads({ status, assignedTo, search });
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.get('/api/leads/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const lead = await storage.getLead(id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      console.error("Error fetching lead:", error);
      res.status(500).json({ message: "Failed to fetch lead" });
    }
  });

  app.post('/api/leads', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertLeadSchema.parse(req.body);
      const userId = req.user.claims.sub;
      
      // Auto-assign to current user if not specified
      if (!validatedData.assignedTo) {
        validatedData.assignedTo = userId;
      }

      // AI scoring
      const aiScoring = await scoreLeadWithAI({
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email || undefined,
        phone: validatedData.phone || undefined,
        budget: validatedData.budget ? Number(validatedData.budget) : undefined,
        budgetMax: validatedData.budgetMax ? Number(validatedData.budgetMax) : undefined,
        source: validatedData.source || "website",
        timeline: validatedData.timeline || undefined,
        notes: validatedData.notes || undefined,
      });

      const leadData = {
        ...validatedData,
        score: aiScoring.score,
      };

      const lead = await storage.createLead(leadData);
      res.json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lead data", errors: error.errors });
      }
      console.error("Error creating lead:", error);
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  app.patch('/api/leads/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const lead = await storage.updateLead(id, updates);
      res.json(lead);
    } catch (error) {
      console.error("Error updating lead:", error);
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  app.patch('/api/leads/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const lead = await storage.updateLeadStatus(id, status);
      res.json(lead);
    } catch (error) {
      console.error("Error updating lead status:", error);
      res.status(500).json({ message: "Failed to update lead status" });
    }
  });

  app.delete('/api/leads/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteLead(id);
      res.json({ message: "Lead deleted successfully" });
    } catch (error) {
      console.error("Error deleting lead:", error);
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  // Property routes
  app.get('/api/properties', isAuthenticated, async (req: any, res) => {
    try {
      const { status, propertyType, search } = req.query;
      const properties = await storage.getProperties({ status, propertyType, search });
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get('/api/properties/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const property = await storage.getProperty(id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  app.post('/api/properties', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertPropertySchema.parse(req.body);
      const userId = req.user.claims.sub;
      
      // Auto-assign to current user if not specified
      if (!validatedData.listingAgent) {
        validatedData.listingAgent = userId;
      }

      const property = await storage.createProperty(validatedData);
      res.json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid property data", errors: error.errors });
      }
      console.error("Error creating property:", error);
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  app.patch('/api/properties/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const property = await storage.updateProperty(id, updates);
      res.json(property);
    } catch (error) {
      console.error("Error updating property:", error);
      res.status(500).json({ message: "Failed to update property" });
    }
  });

  app.patch('/api/properties/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const property = await storage.updatePropertyStatus(id, status);
      res.json(property);
    } catch (error) {
      console.error("Error updating property status:", error);
      res.status(500).json({ message: "Failed to update property status" });
    }
  });

  app.delete('/api/properties/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProperty(id);
      res.json({ message: "Property deleted successfully" });
    } catch (error) {
      console.error("Error deleting property:", error);
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  // Deal routes
  app.get('/api/deals', isAuthenticated, async (req: any, res) => {
    try {
      const { status, assignedTo } = req.query;
      const deals = await storage.getDeals({ status, assignedTo });
      res.json(deals);
    } catch (error) {
      console.error("Error fetching deals:", error);
      res.status(500).json({ message: "Failed to fetch deals" });
    }
  });

  app.post('/api/deals', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertDealSchema.parse(req.body);
      const userId = req.user.claims.sub;
      
      if (!validatedData.assignedTo) {
        validatedData.assignedTo = userId;
      }

      const deal = await storage.createDeal(validatedData);
      res.json(deal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid deal data", errors: error.errors });
      }
      console.error("Error creating deal:", error);
      res.status(500).json({ message: "Failed to create deal" });
    }
  });

  // Task routes
  app.get('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const { status, assignedTo, type } = req.query;
      const tasks = await storage.getTasks({ status, assignedTo, type });
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const userId = req.user.claims.sub;
      
      if (!validatedData.assignedTo) {
        validatedData.assignedTo = userId;
      }
      if (!validatedData.createdBy) {
        validatedData.createdBy = userId;
      }

      const task = await storage.createTask(validatedData);
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  // Activity routes
  app.get('/api/activities', isAuthenticated, async (req: any, res) => {
    try {
      const { leadId, propertyId, dealId } = req.query;
      const activities = await storage.getActivities({ leadId, propertyId, dealId });
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // AI routes
  app.post('/api/ai/score-lead', isAuthenticated, async (req: any, res) => {
    try {
      const leadData = req.body;
      const scoring = await scoreLeadWithAI(leadData);
      res.json(scoring);
    } catch (error) {
      console.error("Error scoring lead with AI:", error);
      res.status(500).json({ message: "Failed to score lead" });
    }
  });

  app.post('/api/ai/match-property', isAuthenticated, async (req: any, res) => {
    try {
      const { leadData, propertyData } = req.body;
      const match = await matchPropertyToLead(leadData, propertyData);
      res.json(match);
    } catch (error) {
      console.error("Error matching property:", error);
      res.status(500).json({ message: "Failed to match property" });
    }
  });

  app.post('/api/ai/generate-message', isAuthenticated, async (req: any, res) => {
    try {
      const { leadData, channel, context } = req.body;
      const message = await generateFollowUpMessage(leadData, channel, context);
      res.json(message);
    } catch (error) {
      console.error("Error generating message:", error);
      res.status(500).json({ message: "Failed to generate message" });
    }
  });

  app.get('/api/ai/insights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const metrics = await storage.getDashboardMetrics(userId);
      const insights = await getAIInsights(metrics);
      res.json(insights);
    } catch (error) {
      console.error("Error getting AI insights:", error);
      res.status(500).json({ message: "Failed to get AI insights" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
