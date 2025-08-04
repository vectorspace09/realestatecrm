import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertLeadSchema, insertPropertySchema, insertDealSchema, insertTaskSchema, insertNotificationSchema, insertCommunicationSchema } from "@shared/schema";
import { scoreLeadWithAI, matchPropertyToLead, generateFollowUpMessage, getAIInsights, generateLeadMessage, generateLeadRecommendations, generateContextualAIResponse, generateNextAction } from "./openai";
import { NotificationService } from "./notification-service";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
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
      
      // Generate notification for new lead
      await NotificationService.onLeadCreated(lead, userId);
      
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
      const userId = req.user.claims.sub;
      
      // Get old lead data for comparison
      const oldLead = await storage.getLead(id);
      const lead = await storage.updateLead(id, updates);
      
      // Check for score changes and generate notifications
      if (oldLead && lead && updates.score && oldLead.score !== updates.score) {
        await NotificationService.onLeadScoreChanged(lead, oldLead.score || 0, updates.score, userId);
      }
      
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
      const userId = req.user.claims.sub;
      
      // Get old lead data for comparison
      const oldLead = await storage.getLead(id);
      const lead = await storage.updateLeadStatus(id, status);
      
      // Generate notification for status change
      if (oldLead && lead && oldLead.status !== status) {
        await NotificationService.onLeadStatusChanged(lead, oldLead.status || 'new', status, userId);
      }
      
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
      const userId = req.user.claims.sub;
      
      // Get old property data for comparison
      const oldProperty = await storage.getProperty(id);
      const property = await storage.updateProperty(id, updates);
      
      // Generate notification for status change
      if (oldProperty && property && updates.status && oldProperty.status !== updates.status) {
        await NotificationService.onPropertyStatusChanged(property, oldProperty.status || 'draft', updates.status, userId);
      }
      
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
      const userId = req.user.claims.sub;
      
      // Get old property data
      const oldProperty = await storage.getProperty(id);
      const property = await storage.updatePropertyStatus(id, status);
      
      // Generate notification for property status change
      if (oldProperty && property && oldProperty.status !== status) {
        await NotificationService.onPropertyStatusChanged(property, oldProperty.status || 'draft', status, userId);
      }
      
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
      
      // Get lead and property info for notification
      if (deal.leadId && deal.propertyId) {
        const [lead, property] = await Promise.all([
          storage.getLead(deal.leadId),
          storage.getProperty(deal.propertyId)
        ]);
        
        if (lead && property) {
          const leadName = `${lead.firstName} ${lead.lastName}`;
          await NotificationService.onDealCreated(deal, leadName, property.title, userId);
        }
      }
      
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
      const userId = req.user.claims.sub;
      
      // Validate status
      const validStatuses = ['offer', 'inspection', 'legal', 'payment', 'handover', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid deal status" });
      }
      
      // Get old deal data
      const oldDeal = await storage.getDeal(id);
      const deal = await storage.updateDealStatus(id, status);
      
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      // Generate notification for deal status change
      if (oldDeal && deal.leadId && deal.propertyId) {
        const [lead, property] = await Promise.all([
          storage.getLead(deal.leadId),
          storage.getProperty(deal.propertyId)
        ]);
        
        if (lead && property) {
          const leadName = `${lead.firstName} ${lead.lastName}`;
          await NotificationService.onDealStatusChanged(
            deal, 
            oldDeal.status || 'pending', 
            status, 
            leadName, 
            property.title, 
            userId
          );
        }
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

  app.patch('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const updatedTask = await storage.updateTask(id, updateData);
      res.json(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.post("/api/tasks/:id/complete", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { completed, completedAt } = req.body;
      const userId = req.user.claims.sub;
      
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const updatedTask = await storage.updateTask(id, {
        ...task,
        status: completed ? 'completed' : 'pending',
        completedAt: completed ? completedAt : null
      });

      // Generate notification for task completion
      if (completed && updatedTask) {
        await NotificationService.onTaskCompleted(updatedTask, userId);
      }

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

  app.post('/api/ai/generate-next-action', isAuthenticated, async (req: any, res) => {
    try {
      const { lead, recentActivities, pendingTasks, currentScore, status } = req.body;
      const nextAction = await generateNextAction(lead, recentActivities, pendingTasks, currentScore, status);
      res.json({ nextAction });
    } catch (error) {
      console.error("Error generating next action:", error);
      res.status(500).json({ message: "Failed to generate next action" });
    }
  });

  // AI Chat routes
  app.post("/api/ai/chat", isAuthenticated, async (req: any, res) => {
    try {
      const { message, context } = req.body;
      const userId = req.user?.claims?.sub || req.user?.id;
      
      // Get current user data for context
      const [leads, properties, deals, analytics] = await Promise.all([
        storage.getLeads({}),
        storage.getProperties({}),
        storage.getDeals({}),
        storage.getDetailedAnalytics(userId)
      ]);

      // Generate intelligent response based on context and message
      const response = await generateContextualAIResponse(message, context, {
        leads,
        properties, 
        deals,
        analytics,
        user: userId ? await storage.getUser(userId) : null
      });
      
      res.json({ response });
    } catch (error) {
      console.error("Error in AI chat:", error);
      res.status(500).json({ 
        message: "Failed to process AI chat",
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  });

  // Settings routes
  app.get('/api/settings/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const profile = {
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: '',
        bio: '',
        license: '',
        brokerage: '',
        experience: '',
        specialties: ''
      };
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put('/api/settings/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = req.body;
      
      // Update user profile
      await storage.updateUserProfile(userId, profileData);
      
      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get('/api/settings/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = await storage.getUserNotificationSettings(userId);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching notification settings:", error);
      res.status(500).json({ message: "Failed to fetch notification settings" });
    }
  });

  app.put('/api/settings/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = req.body;
      
      await storage.updateUserNotificationSettings(userId, settings);
      
      res.json({ message: "Notification settings updated successfully" });
    } catch (error) {
      console.error("Error updating notification settings:", error);
      res.status(500).json({ message: "Failed to update notification settings" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { isRead, limit = 20 } = req.query;
      
      const filters: any = { limit: parseInt(limit) };
      if (isRead !== undefined) {
        filters.isRead = isRead === 'true';
      }
      
      const notifications = await storage.getNotifications(userId, filters);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(validatedData);
      res.json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid notification data", errors: error.errors });
      }
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const notification = await storage.markNotificationAsRead(id);
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.patch('/api/notifications/read-all', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.get('/api/notifications/unread-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      res.status(500).json({ message: "Failed to fetch unread notification count" });
    }
  });

  // Communication routes
  app.get('/api/communications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { leadId, type, direction, limit = 50 } = req.query;
      
      const filters: any = { userId };
      if (leadId) filters.leadId = leadId;
      if (type) filters.type = type;
      if (direction) filters.direction = direction;
      if (limit) filters.limit = parseInt(limit);
      
      const communications = await storage.getCommunications(filters);
      res.json(communications);
    } catch (error) {
      console.error("Error fetching communications:", error);
      res.status(500).json({ message: "Failed to fetch communications" });
    }
  });

  app.post('/api/communications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const communicationData = {
        ...req.body,
        userId
      };
      
      const communication = await storage.createCommunication(communicationData);
      res.json(communication);
    } catch (error) {
      console.error("Error creating communication:", error);
      res.status(500).json({ message: "Failed to create communication" });
    }
  });

  app.get('/api/communications/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getCommunicationStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching communication stats:", error);
      res.status(500).json({ message: "Failed to fetch communication stats" });
    }
  });

  app.patch('/api/communications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const communication = await storage.updateCommunication(id, updateData);
      res.json(communication);
    } catch (error) {
      console.error("Error updating communication:", error);
      res.status(500).json({ message: "Failed to update communication" });
    }
  });

  app.delete('/api/communications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCommunication(id);
      res.json({ message: "Communication deleted successfully" });
    } catch (error) {
      console.error("Error deleting communication:", error);
      res.status(500).json({ message: "Failed to delete communication" });
    }
  });

  // Communication actions (send email, log call, etc.)
  app.post('/api/communications/send-email', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { leadId, subject, content, generateWithAI } = req.body;
      
      let emailContent = content;
      let emailSubject = subject;
      
      // Generate AI email if requested
      if (generateWithAI && leadId) {
        const lead = await storage.getLead(leadId);
        if (lead) {
          const activities = await storage.getActivities({ leadId });
          const generatedMessage = await generateLeadMessage(lead, 'email', activities);
          
          // Parse subject and content from AI response
          const lines = generatedMessage.split('\n');
          const subjectLine = lines.find(line => line.startsWith('Subject:'));
          if (subjectLine) {
            emailSubject = subjectLine.replace('Subject:', '').trim();
            emailContent = lines.slice(lines.indexOf(subjectLine) + 1).join('\n').trim();
          } else {
            emailContent = generatedMessage;
          }
        }
      }
      
      // Create communication record
      const communication = await storage.createCommunication({
        userId,
        leadId,
        type: 'email',
        direction: 'outbound',
        subject: emailSubject,
        content: emailContent,
        status: 'sent',
        metadata: { 
          sentAt: new Date().toISOString(),
          aiGenerated: generateWithAI 
        }
      });
      
      // In a real app, you would integrate with an email service here
      // For now, we just log the communication
      console.log(`Email sent: ${emailSubject} to lead ${leadId}`);
      
      res.json({ 
        success: true, 
        communication,
        message: "Email sent and logged successfully" 
      });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  app.post('/api/communications/log-call', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { leadId, duration, outcome, notes } = req.body;
      
      const communication = await storage.createCommunication({
        userId,
        leadId,
        type: 'call',
        direction: 'outbound',
        content: notes || 'Phone call completed',
        status: 'sent',
        metadata: { 
          duration: duration,
          outcome: outcome,
          calledAt: new Date().toISOString()
        }
      });
      
      res.json({ 
        success: true, 
        communication,
        message: "Call logged successfully" 
      });
    } catch (error) {
      console.error("Error logging call:", error);
      res.status(500).json({ message: "Failed to log call" });
    }
  });

  app.post('/api/communications/schedule-appointment', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { leadId, appointmentDate, notes } = req.body;
      
      const communication = await storage.createCommunication({
        userId,
        leadId,
        type: 'meeting',
        direction: 'outbound',
        content: notes || 'Appointment scheduled',
        status: 'scheduled',
        scheduledFor: new Date(appointmentDate),
        metadata: { 
          scheduledAt: new Date().toISOString(),
          appointmentType: 'consultation'
        }
      });
      
      res.json({ 
        success: true, 
        communication,
        message: "Appointment scheduled successfully" 
      });
    } catch (error) {
      console.error("Error scheduling appointment:", error);
      res.status(500).json({ message: "Failed to schedule appointment" });
    }
  });

  app.get('/api/settings/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await storage.getUserPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  app.put('/api/settings/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = req.body;
      
      await storage.updateUserPreferences(userId, preferences);
      
      res.json({ message: "Preferences updated successfully" });
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  // Get AI insights
  app.get("/api/ai/insights", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const analytics = await storage.getDetailedAnalytics(userId);
      
      const insights = [
        `You have ${analytics.totalLeads} total leads with ${analytics.qualifiedLeads} qualified leads (${analytics.conversionRate}% conversion rate).`,
        `${analytics.activePipeline} deals are currently in your pipeline with average value of $${analytics.averageDealValue.toLocaleString()}.`,
        `Your task completion rate is ${analytics.taskCompletionRate}% with ${analytics.pendingTasks} tasks pending.`,
        `Top lead sources: ${analytics.leadsBySource.slice(0, 2).map(s => `${s.source} (${s.count})`).join(', ')}.`,
        `Total revenue from closed deals: $${analytics.totalRevenue.toLocaleString()}.`
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
      const userId = (req.user as any)?.claims?.sub;
      
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
        const highPriorityLeads = leads.filter(lead => (lead.score || 0) >= 80 && ['new', 'contacted'].includes(lead.status || ''));
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

  // Object Storage routes for property images
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/objects/:objectPath(*)", isAuthenticated, async (req, res) => {
    const userId = (req.user as any)?.claims?.sub;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.put("/api/property-images", isAuthenticated, async (req, res) => {
    if (!req.body.imageURL) {
      return res.status(400).json({ error: "imageURL is required" });
    }

    const userId = (req.user as any)?.claims?.sub;

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.imageURL,
        {
          owner: userId,
          visibility: "public", // Property images should be public
        },
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting property image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
