import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertLeadSchema, insertPropertySchema, insertDealSchema, insertTaskSchema } from "@shared/schema";
import { scoreLeadWithAI, matchPropertyToLead, generateFollowUpMessage, getAIInsights, generateLeadMessage, generateLeadRecommendations } from "./openai";
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

  // Analytics routes
  app.get('/api/analytics/detailed', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const analytics = await storage.getDetailedAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching detailed analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
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

  app.patch('/api/deals/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // Validate status
      const validStatuses = ['offer', 'inspection', 'legal', 'payment', 'handover'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid deal status" });
      }
      
      const deal = await storage.updateDealStatus(id, status);
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      res.json(deal);
    } catch (error) {
      console.error("Error updating deal status:", error);
      res.status(500).json({ message: "Failed to update deal status" });
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

  app.post("/api/tasks/:id/complete", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { completed, completedAt } = req.body;
      
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const updatedTask = await storage.updateTask(id, {
        ...task,
        status: completed ? 'completed' : 'pending',
        completedAt: completed ? completedAt : null
      });

      res.json(updatedTask);
    } catch (error) {
      console.error("Error completing task:", error);
      res.status(500).json({ message: "Failed to complete task" });
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
      const { lead, messageType, recentActivities } = req.body;
      const message = await generateLeadMessage(lead, messageType, recentActivities);
      res.json({ message });
    } catch (error) {
      console.error("Error generating message:", error);
      res.status(500).json({ message: "Failed to generate message" });
    }
  });

  app.post('/api/ai/lead-recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const { lead, recentActivities, pendingTasks } = req.body;
      const recommendations = await generateLeadRecommendations(lead, recentActivities, pendingTasks);
      res.json({ recommendations });
    } catch (error) {
      console.error("Error generating lead recommendations:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // Get AI insights
  app.get("/api/ai/insights", isAuthenticated, async (req, res) => {
    try {
      // Simulate AI insights generation
      const insights = [
        "With 21 total leads and no high-priority active deals, focus on nurturing qualified leads in your pipeline.",
        "Your highest-scoring lead (Emily Davis - 92) should be prioritized for immediate follow-up.",
        "Property inventory at $15.5M total value shows strong market positioning - highlight premium listings.",
        "Average lead score of 76 indicates quality lead generation - maintain current acquisition strategies.",
        "3 active deals worth $180k+ revenue show healthy conversion - replicate successful closing tactics."
      ];
      
      res.json({ insights });
    } catch (error) {
      console.error("Error generating AI insights:", error);
      res.status(500).json({ message: "Failed to generate insights" });
    }
  });

  // AI Query endpoint
  app.post("/api/ai/query", isAuthenticated, async (req, res) => {
    try {
      const { query } = req.body;
      const userId = req.user?.claims?.sub;
      
      // Get leads and properties for analysis
      const leads = await storage.getLeads();
      const properties = await storage.getProperties();
      
      // Simple AI query processing
      let response = "I've analyzed your request. Here's what I found:";
      let data = null;
      let suggestions = [];
      
      const queryLower = query.toLowerCase();
      
      if (queryLower.includes('lead') || queryLower.includes('client')) {
        if (queryLower.includes('high') || queryLower.includes('score') || queryLower.includes('hot')) {
          const hotLeads = leads.filter((lead: any) => lead.score >= 80).sort((a: any, b: any) => b.score - a.score);
          response = `Found ${hotLeads.length} high-scoring leads. These prospects show strong purchase intent and should be prioritized for immediate follow-up.`;
          data = { leads: hotLeads };
          suggestions = ["Show lead contact details", "Create follow-up tasks", "Find matching properties"];
        } else if (queryLower.includes('budget') || queryLower.includes('money')) {
          const sortedByBudget = leads.filter((lead: any) => lead.budget).sort((a: any, b: any) => (b.budget || 0) - (a.budget || 0));
          response = `Here are your leads sorted by budget. The highest budget is $${sortedByBudget[0]?.budget?.toLocaleString()}.`;
          data = { leads: sortedByBudget };
          suggestions = ["Show budget ranges", "Find matching properties", "Create targeted campaigns"];
        } else {
          const recentLeads = leads.slice(0, 5);
          response = `You have ${leads.length} total leads. Here are your most recent additions.`;
          data = { leads: recentLeads };
          suggestions = ["Filter by status", "Show conversion rates", "Analyze lead sources"];
        }
      } else if (queryLower.includes('property') || queryLower.includes('listing')) {
        if (queryLower.includes('price') || queryLower.includes('under') || queryLower.includes('below')) {
          const priceMatch = queryLower.match(/(\d+[,\d]*)/);
          const priceLimit = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 500000;
          const affordableProperties = properties.filter((prop: any) => prop.price <= priceLimit);
          response = `Found ${affordableProperties.length} properties under $${priceLimit.toLocaleString()}.`;
          data = { properties: affordableProperties };
          suggestions = ["Show property details", "Find interested leads", "Schedule showings"];
        } else {
          const recentProperties = properties.slice(0, 5);
          response = `You have ${properties.length} properties in your portfolio with a total value of $${properties.reduce((sum: number, p: any) => sum + (p.price || 0), 0).toLocaleString()}.`;
          data = { properties: recentProperties };
          suggestions = ["Filter by type", "Show market analysis", "Find buyer matches"];
        }
      } else if (queryLower.includes('conversion') || queryLower.includes('rate') || queryLower.includes('performance')) {
        const qualifiedLeads = leads.filter(lead => lead.status === 'qualified').length;
        const conversionRate = Math.round((qualifiedLeads / leads.length) * 100);
        response = `Your conversion rate is ${conversionRate}% with ${qualifiedLeads} qualified leads out of ${leads.length} total leads. This indicates ${conversionRate > 20 ? 'strong' : 'moderate'} lead quality.`;
        suggestions = ["Improve lead scoring", "Analyze lead sources", "Optimize follow-up process"];
      } else if (queryLower.includes('today') || queryLower.includes('priority') || queryLower.includes('call')) {
        const highPriorityLeads = leads.filter(lead => lead.score >= 80 && ['new', 'contacted'].includes(lead.status));
        response = `You should prioritize ${highPriorityLeads.length} high-scoring leads today. Focus on warm prospects who haven't been fully qualified yet.`;
        data = { leads: highPriorityLeads };
        suggestions = ["Create call tasks", "Send follow-up emails", "Schedule meetings"];
      } else {
        response = "I'm here to help with lead analysis, property matching, market insights, and performance metrics. Try asking about specific leads, properties, or business metrics.";
        suggestions = [
          "Show me my highest scoring leads",
          "What properties are under $500k?",
          "Analyze my conversion rates",
          "Which leads should I call today?"
        ];
      }
      
      res.json({ response, data, suggestions });
    } catch (error) {
      console.error("Error processing AI query:", error);
      res.status(500).json({ message: "Failed to process query" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
