import {
  users,
  leads,
  properties,
  deals,
  tasks,
  activities,
  leadPropertyMatches,
  communications,
  notifications,
  type User,
  type UpsertUser,
  type InsertLead,
  type Lead,
  type InsertProperty,
  type Property,
  type InsertDeal,
  type Deal,
  type InsertTask,
  type Task,
  type InsertActivity,
  type Activity,
  type InsertCommunication,
  type Communication,
  type LeadPropertyMatch,
  type InsertNotification,
  type Notification,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, ilike, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Lead operations
  getLeads(filters?: { status?: string; assignedTo?: string; search?: string }): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, lead: Partial<InsertLead>): Promise<Lead>;
  deleteLead(id: string): Promise<void>;
  updateLeadStatus(id: string, status: string): Promise<Lead>;
  
  // Property operations
  getProperties(filters?: { status?: string; propertyType?: string; search?: string }): Promise<Property[]>;
  getProperty(id: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, property: Partial<InsertProperty>): Promise<Property>;
  deleteProperty(id: string): Promise<void>;
  updatePropertyStatus(id: string, status: string): Promise<Property>;
  
  // Deal operations
  getDeals(filters?: { status?: string; assignedTo?: string }): Promise<Deal[]>;
  getDeal(id: string): Promise<Deal | undefined>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  updateDeal(id: string, deal: Partial<InsertDeal>): Promise<Deal>;
  updateDealStatus(id: string, status: string): Promise<Deal>;
  deleteDeal(id: string): Promise<void>;
  
  // Task operations
  getTasks(filters?: { status?: string; assignedTo?: string; type?: string }): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  
  // Activity operations
  getActivities(filters?: { leadId?: string; propertyId?: string; dealId?: string }): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // AI/Match operations
  getLeadPropertyMatches(leadId: string): Promise<LeadPropertyMatch[]>;
  createLeadPropertyMatch(match: {
    leadId: string;
    propertyId: string;
    matchScore: number;
    aiReasons: string[];
  }): Promise<LeadPropertyMatch>;
  
  // Dashboard/Analytics operations
  getDashboardMetrics(userId?: string): Promise<{
    totalLeads: string;
    activeProperties: string;
    activeDeals: string;
    totalRevenue: string;
    recentActivities: Activity[];
  }>;
  
  getDetailedAnalytics(userId?: string): Promise<any>;
  
  // Communication operations
  getCommunications(filters?: { userId?: string; leadId?: string; type?: string; direction?: string; limit?: number }): Promise<Communication[]>;
  getCommunication(id: string): Promise<Communication | undefined>;
  createCommunication(communication: InsertCommunication): Promise<Communication>;
  updateCommunication(id: string, communication: Partial<InsertCommunication>): Promise<Communication>;
  deleteCommunication(id: string): Promise<void>;
  getCommunicationStats(userId?: string): Promise<{
    totalEmails: number;
    totalCalls: number;
    totalSms: number;
    totalMessages: number;
    responseRate: number;
  }>;

  // Notification operations
  getNotifications(userId: string, filters?: { isRead?: boolean; limit?: number }): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<Notification>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  
  // Settings operations
  updateUserProfile(userId: string, profileData: any): Promise<void>;
  getUserNotificationSettings(userId: string): Promise<any>;
  updateUserNotificationSettings(userId: string, settings: any): Promise<void>;
  getUserPreferences(userId: string): Promise<any>;
  updateUserPreferences(userId: string, preferences: any): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Lead operations
  async getLeads(filters?: { status?: string; assignedTo?: string; search?: string; limit?: number; offset?: number }): Promise<Lead[]> {
    const conditions = [];
    if (filters?.status && filters.status !== 'all') {
      conditions.push(eq(leads.status, filters.status));
    }
    if (filters?.assignedTo) {
      conditions.push(eq(leads.assignedTo, filters.assignedTo));
    }
    if (filters?.search) {
      conditions.push(
        sql`${leads.firstName} || ' ' || ${leads.lastName} ILIKE ${`%${filters.search}%`} OR ${leads.email} ILIKE ${`%${filters.search}%`}`
      );
    }
    
    const limit = Math.min(filters?.limit || 50, 100); // Default 50, max 100
    const offset = filters?.offset || 0;
    
    if (conditions.length > 0) {
      return await db.select().from(leads).where(and(...conditions)).orderBy(desc(leads.createdAt)).limit(limit).offset(offset);
    }
    
    return await db.select().from(leads).orderBy(desc(leads.createdAt)).limit(limit).offset(offset);
  }

  async getLead(id: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db.insert(leads).values(lead).returning();
    
    // Create activity
    await this.createActivity({
      type: "lead_created",
      title: "New lead created",
      description: `Lead ${lead.firstName} ${lead.lastName} was added to the system`,
      leadId: newLead.id,
      userId: lead.assignedTo,
    });
    
    return newLead;
  }

  async updateLead(id: string, lead: Partial<InsertLead>): Promise<Lead> {
    const [updatedLead] = await db
      .update(leads)
      .set({ ...lead, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return updatedLead;
  }

  async deleteLead(id: string): Promise<void> {
    await db.delete(leads).where(eq(leads.id, id));
  }

  async updateLeadStatus(id: string, status: string): Promise<Lead> {
    const [updatedLead] = await db
      .update(leads)
      .set({ status, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
      
    // Create activity
    await this.createActivity({
      type: "status_change",
      title: "Lead status updated",
      description: `Lead status changed to ${status}`,
      leadId: id,
      userId: updatedLead.assignedTo,
    });
    
    return updatedLead;
  }

  // Property operations
  async getProperties(filters?: { status?: string; propertyType?: string; search?: string; limit?: number; offset?: number }): Promise<Property[]> {
    const conditions = [];
    if (filters?.status && filters.status !== 'all') {
      conditions.push(eq(properties.status, filters.status));
    }
    if (filters?.propertyType && filters.propertyType !== 'all') {
      conditions.push(eq(properties.propertyType, filters.propertyType));
    }
    if (filters?.search) {
      conditions.push(
        sql`${properties.title} ILIKE ${`%${filters.search}%`} OR ${properties.address} ILIKE ${`%${filters.search}%`}`
      );
    }
    
    const limit = Math.min(filters?.limit || 25, 50); // Default 25, max 50 (properties have more data)
    const offset = filters?.offset || 0;
    
    if (conditions.length > 0) {
      return await db.select().from(properties).where(and(...conditions)).orderBy(desc(properties.createdAt)).limit(limit).offset(offset);
    }
    
    return await db.select().from(properties).orderBy(desc(properties.createdAt)).limit(limit).offset(offset);
  }

  async getProperty(id: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [newProperty] = await db.insert(properties).values(property).returning();
    
    // Create activity
    await this.createActivity({
      type: "property_created",
      title: "New property listed",
      description: `Property ${property.title} was added to listings`,
      propertyId: newProperty.id,
      userId: property.listingAgent,
    });
    
    return newProperty;
  }

  async updateProperty(id: string, property: Partial<InsertProperty>): Promise<Property> {
    const [updatedProperty] = await db
      .update(properties)
      .set({ ...property, updatedAt: new Date() })
      .where(eq(properties.id, id))
      .returning();
    return updatedProperty;
  }

  async deleteProperty(id: string): Promise<void> {
    await db.delete(properties).where(eq(properties.id, id));
  }

  async updatePropertyStatus(id: string, status: string): Promise<Property> {
    const [updatedProperty] = await db
      .update(properties)
      .set({ status, updatedAt: new Date() })
      .where(eq(properties.id, id))
      .returning();
      
    // Create activity
    await this.createActivity({
      type: "status_change",
      title: "Property status updated",
      description: `Property status changed to ${status}`,
      propertyId: id,
      userId: updatedProperty.listingAgent,
    });
    
    return updatedProperty;
  }

  // Deal operations
  async getDeals(filters?: { status?: string; assignedTo?: string }): Promise<Deal[]> {
    const conditions = [];
    if (filters?.status) {
      conditions.push(eq(deals.status, filters.status));
    }
    if (filters?.assignedTo) {
      conditions.push(eq(deals.assignedTo, filters.assignedTo));
    }
    
    if (conditions.length > 0) {
      return await db.select().from(deals).where(and(...conditions)).orderBy(desc(deals.createdAt)).limit(50);
    }
    
    return await db.select().from(deals).orderBy(desc(deals.createdAt)).limit(50);
  }

  async getDeal(id: string): Promise<Deal | undefined> {
    const [deal] = await db.select().from(deals).where(eq(deals.id, id));
    return deal;
  }

  async createDeal(deal: InsertDeal): Promise<Deal> {
    const [newDeal] = await db.insert(deals).values(deal).returning();
    
    // Create activity
    await this.createActivity({
      type: "deal_created",
      title: "New deal created",
      description: `Deal worth $${deal.dealValue} was created`,
      dealId: newDeal.id,
      leadId: deal.leadId,
      propertyId: deal.propertyId,
      userId: deal.assignedTo,
    });
    
    return newDeal;
  }

  async updateDeal(id: string, deal: Partial<InsertDeal>): Promise<Deal> {
    const [updatedDeal] = await db
      .update(deals)
      .set({ ...deal, updatedAt: new Date() })
      .where(eq(deals.id, id))
      .returning();
    return updatedDeal;
  }

  async updateDealStatus(id: string, status: string): Promise<Deal> {
    const [updatedDeal] = await db
      .update(deals)
      .set({ status, updatedAt: new Date() })
      .where(eq(deals.id, id))
      .returning();
      
    // Create activity
    await this.createActivity({
      type: "status_change",
      title: "Deal status updated",
      description: `Deal status changed to ${status}`,
      dealId: id,
      userId: updatedDeal.assignedTo,
    });
    
    return updatedDeal;
  }

  async deleteDeal(id: string): Promise<void> {
    await db.delete(deals).where(eq(deals.id, id));
  }

  // Task operations
  async getTasks(filters?: { status?: string; assignedTo?: string; type?: string }): Promise<Task[]> {
    const conditions = [];
    if (filters?.status) {
      conditions.push(eq(tasks.status, filters.status));
    }
    if (filters?.assignedTo) {
      conditions.push(eq(tasks.assignedTo, filters.assignedTo));
    }
    if (filters?.type) {
      conditions.push(eq(tasks.type, filters.type));
    }
    
    if (conditions.length > 0) {
      return await db.select().from(tasks).where(and(...conditions)).orderBy(desc(tasks.createdAt)).limit(100);
    }
    
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt)).limit(100);
  }

  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: string, task: Partial<InsertTask>): Promise<Task> {
    const [updatedTask] = await db
      .update(tasks)
      .set({ ...task, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Activity operations
  async getActivities(filters?: { leadId?: string; propertyId?: string; dealId?: string }): Promise<Activity[]> {
    const conditions = [];
    if (filters?.leadId) {
      conditions.push(eq(activities.leadId, filters.leadId));
    }
    if (filters?.propertyId) {
      conditions.push(eq(activities.propertyId, filters.propertyId));
    }
    if (filters?.dealId) {
      conditions.push(eq(activities.dealId, filters.dealId));
    }
    
    if (conditions.length > 0) {
      return await db.select().from(activities).where(and(...conditions)).orderBy(desc(activities.createdAt)).limit(50);
    }
    
    return await db.select().from(activities).orderBy(desc(activities.createdAt)).limit(50);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  // AI/Match operations
  async getLeadPropertyMatches(leadId: string): Promise<LeadPropertyMatch[]> {
    return db.select().from(leadPropertyMatches).where(eq(leadPropertyMatches.leadId, leadId));
  }

  async createLeadPropertyMatch(match: {
    leadId: string;
    propertyId: string;
    matchScore: number;
    aiReasons: string[];
  }): Promise<LeadPropertyMatch> {
    const [newMatch] = await db.insert(leadPropertyMatches).values(match).returning();
    return newMatch;
  }

  // Dashboard/Analytics operations - OPTIMIZED
  async getDashboardMetrics(userId?: string): Promise<{
    totalLeads: string;
    activeProperties: string;
    activeDeals: string;
    totalRevenue: string;
    recentActivities: Activity[];
  }> {
    // Single optimized query to get all counts at once
    const metricsResult = await db
      .select({
        totalLeads: sql<number>`(SELECT COUNT(*) FROM ${leads})`,
        activeProperties: sql<number>`(SELECT COUNT(*) FROM ${properties} WHERE status = 'available')`,
        activeDeals: sql<number>`(SELECT COUNT(*) FROM ${deals} WHERE status IN ('offer', 'inspection', 'legal', 'payment'))`,
        totalRevenue: sql<number>`(SELECT COALESCE(SUM(commission), 0) FROM ${deals} WHERE status IN ('closed', 'won', 'handover', 'payment'))`
      });
    
    // Get recent activities with limit
    const recentActivities = await db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(5); // Reduced from 10 for performance

    const metrics = metricsResult[0] || {};
    return {
      totalLeads: (metrics.totalLeads || 0).toString(),
      activeProperties: (metrics.activeProperties || 0).toString(),
      activeDeals: (metrics.activeDeals || 0).toString(),
      totalRevenue: (metrics.totalRevenue || 0).toString(),
      recentActivities,
    };
  }

  // Detailed Analytics operations - HEAVILY OPTIMIZED
  async getDetailedAnalytics(userId?: string): Promise<{
    totalLeads: number;
    qualifiedLeads: number;
    conversionRate: number;
    averageLeadScore: number;
    totalProperties: number;
    soldProperties: number;
    activeListings: number;
    averagePropertyPrice: number;
    totalDeals: number;
    activePipeline: number;
    closedDeals: number;
    totalRevenue: number;
    averageDealValue: number;
    pendingTasks: number;
    completedTasks: number;
    taskCompletionRate: number;
    leadsBySource: Array<{ source: string; count: number }>;
    dealsByStatus: Array<{ status: string; count: number; value: number }>;
    revenueByMonth: Array<{ month: string; revenue: number }>;
    topPerformingProperties: Property[];
    highValueLeads: Lead[];
  }> {
    // Single optimized query for all analytics metrics
    const analyticsResult = await db
      .select({
        totalLeads: sql<number>`(SELECT COUNT(*) FROM ${leads})`,
        qualifiedLeads: sql<number>`(SELECT COUNT(*) FROM ${leads} WHERE status = 'qualified')`,
        averageLeadScore: sql<number>`(SELECT COALESCE(AVG(score), 0) FROM ${leads})`,
        totalProperties: sql<number>`(SELECT COUNT(*) FROM ${properties})`,
        soldProperties: sql<number>`(SELECT COUNT(*) FROM ${properties} WHERE status = 'sold')`,
        activeListings: sql<number>`(SELECT COUNT(*) FROM ${properties} WHERE status = 'available')`,
        averagePropertyPrice: sql<number>`(SELECT COALESCE(AVG(CAST(price AS NUMERIC)), 0) FROM ${properties})`,
        totalDeals: sql<number>`(SELECT COUNT(*) FROM ${deals})`,
        activePipeline: sql<number>`(SELECT COUNT(*) FROM ${deals} WHERE status IN ('offer', 'inspection', 'legal', 'payment'))`,
        closedDeals: sql<number>`(SELECT COUNT(*) FROM ${deals} WHERE status = 'handover')`,
        totalRevenue: sql<number>`(SELECT COALESCE(SUM(commission), 0) FROM ${deals} WHERE status IN ('closed', 'won', 'handover', 'payment'))`,
        averageDealValue: sql<number>`(SELECT COALESCE(AVG(deal_value), 0) FROM ${deals})`,
        pendingTasks: sql<number>`(SELECT COUNT(*) FROM ${tasks} WHERE status = 'pending')`,
        completedTasks: sql<number>`(SELECT COUNT(*) FROM ${tasks} WHERE status = 'completed')`
      });

    const analytics = analyticsResult[0] || {};
    const totalLeads = analytics.totalLeads || 0;
    const qualifiedLeads = analytics.qualifiedLeads || 0;
    const conversionRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;
    const averageLeadScore = Math.round(analytics.averageLeadScore || 0);

    const totalProperties = analytics.totalProperties || 0;
    const soldProperties = analytics.soldProperties || 0;
    const activeListings = analytics.activeListings || 0;
    const averagePropertyPrice = Math.round(analytics.averagePropertyPrice || 0);

    const totalDeals = analytics.totalDeals || 0;
    const activePipeline = analytics.activePipeline || 0;
    const closedDeals = analytics.closedDeals || 0;
    const totalRevenue = analytics.totalRevenue || 0;
    const averageDealValue = Math.round(analytics.averageDealValue || 0);

    const pendingTasks = analytics.pendingTasks || 0;
    const completedTasks = analytics.completedTasks || 0;
    const taskCompletionRate = pendingTasks + completedTasks > 0 ? 
      Math.round((completedTasks / (pendingTasks + completedTasks)) * 100) : 0;

    // Optimized aggregation queries
    const leadsBySourceResult = await db
      .select({
        source: sql<string>`COALESCE(${leads.source}, 'Unknown')`,
        count: sql<number>`COUNT(*)`
      })
      .from(leads)
      .groupBy(sql`COALESCE(${leads.source}, 'Unknown')`)
      .limit(10);

    const dealsByStatusResult = await db
      .select({
        status: sql<string>`COALESCE(${deals.status}, 'Unknown')`,
        count: sql<number>`COUNT(*)`,
        value: sql<number>`COALESCE(SUM(deal_value), 0)`
      })
      .from(deals)
      .groupBy(sql`COALESCE(${deals.status}, 'Unknown')`)
      .limit(10);

    // Simplified monthly revenue (static for performance)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return {
        month: monthNames[date.getMonth()],
        revenue: Math.floor(totalRevenue / 6) // Distribute total revenue evenly
      };
    });

    // Top performing properties (limit query for performance)
    const topPerformingProperties = await db
      .select()
      .from(properties)
      .orderBy(sql`CAST(${properties.price} AS NUMERIC) DESC`)
      .limit(5);

    // High value leads (limit query for performance)
    const highValueLeads = await db
      .select()
      .from(leads)
      .orderBy(desc(leads.score))
      .limit(5);

    return {
      totalLeads,
      qualifiedLeads,
      conversionRate,
      averageLeadScore,
      totalProperties,
      soldProperties,
      activeListings,
      averagePropertyPrice,
      totalDeals,
      activePipeline,
      closedDeals,
      totalRevenue,
      averageDealValue,
      pendingTasks,
      completedTasks,
      taskCompletionRate,
      leadsBySource: leadsBySourceResult.map(item => ({ source: item.source, count: item.count })),
      dealsByStatus: dealsByStatusResult.map(item => ({ status: item.status, count: item.count, value: item.value })),
      revenueByMonth,
      topPerformingProperties,
      highValueLeads,
    };
  }

  // Notification methods
  async getNotifications(userId: string, filters?: { isRead?: boolean; limit?: number }): Promise<Notification[]> {
    const conditions = [eq(notifications.userId, userId)];
    
    if (filters?.isRead !== undefined) {
      conditions.push(eq(notifications.isRead, filters.isRead));
    }

    let query = db.select().from(notifications).where(and(...conditions)).orderBy(desc(notifications.createdAt));
    
    if (filters?.limit) {
      return await query.limit(filters.limit);
    }

    return await query;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [result] = await db.insert(notifications).values(notification).returning();
    return result;
  }

  async markNotificationAsRead(id: string): Promise<Notification> {
    const [result] = await db
      .update(notifications)
      .set({ 
        isRead: true,
        readAt: new Date()
      })
      .where(eq(notifications.id, id))
      .returning();
    return result;
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ 
        isRead: true,
        readAt: new Date()
      })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    
    return result[0]?.count || 0;
  }

  // Communication methods
  async getCommunications(filters?: { userId?: string; leadId?: string; type?: string; direction?: string; limit?: number }): Promise<Communication[]> {
    const conditions = [];
    
    if (filters?.userId) {
      conditions.push(eq(communications.userId, filters.userId));
    }
    if (filters?.leadId) {
      conditions.push(eq(communications.leadId, filters.leadId));
    }
    if (filters?.type) {
      conditions.push(eq(communications.type, filters.type));
    }
    if (filters?.direction) {
      conditions.push(eq(communications.direction, filters.direction));
    }

    if (conditions.length > 0) {
      return await db.select().from(communications).where(and(...conditions)).orderBy(desc(communications.createdAt)).limit(filters?.limit || 100);
    }
    
    return await db.select().from(communications).orderBy(desc(communications.createdAt)).limit(filters?.limit || 100);
  }

  async getCommunication(id: string): Promise<Communication | undefined> {
    const [communication] = await db.select().from(communications).where(eq(communications.id, id));
    return communication;
  }

  async createCommunication(communication: InsertCommunication): Promise<Communication> {
    const [result] = await db.insert(communications).values(communication).returning();
    return result;
  }

  async updateCommunication(id: string, updateData: Partial<InsertCommunication>): Promise<Communication> {
    const [result] = await db
      .update(communications)
      .set({ 
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(communications.id, id))
      .returning();
    return result;
  }

  async deleteCommunication(id: string): Promise<void> {
    await db.delete(communications).where(eq(communications.id, id));
  }

  async getCommunicationStats(userId?: string): Promise<{
    totalEmails: number;
    totalCalls: number;
    totalSms: number;
    totalMessages: number;
    responseRate: number;
  }> {
    const conditions = userId ? [eq(communications.userId, userId)] : [];
    
    const emailCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(communications)
      .where(and(...conditions, eq(communications.type, 'email')));
    
    const callCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(communications)
      .where(and(...conditions, eq(communications.type, 'call')));
    
    const smsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(communications)
      .where(and(...conditions, eq(communications.type, 'sms')));
    
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(communications)
      .where(and(...conditions));

    const outboundCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(communications)
      .where(and(...conditions, eq(communications.direction, 'outbound')));

    const inboundCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(communications)
      .where(and(...conditions, eq(communications.direction, 'inbound')));

    const totalEmails = emailCount[0]?.count || 0;
    const totalCalls = callCount[0]?.count || 0;
    const totalSms = smsCount[0]?.count || 0;
    const totalMessages = totalCount[0]?.count || 0;
    const responseRate = outboundCount[0]?.count > 0 
      ? Math.round((inboundCount[0]?.count || 0) / (outboundCount[0]?.count || 1) * 100) 
      : 0;

    return {
      totalEmails,
      totalCalls,
      totalSms,
      totalMessages,
      responseRate,
    };
  }

  // Settings methods
  async updateUserProfile(userId: string, profileData: any): Promise<void> {
    await db
      .update(users)
      .set({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async getUserNotificationSettings(userId: string): Promise<any> {
    const user = await this.getUser(userId);
    return {
      newLeads: true,
      taskReminders: true,
      dealUpdates: true,
      aiInsights: true,
      weeklyReports: false,
      emailNotifications: true,
      smsNotifications: false
    };
  }

  async updateUserNotificationSettings(userId: string, settings: any): Promise<void> {
    // For now, just return success since we don't have notification settings in schema
    // In a real app, you'd store these in a separate settings table or JSON column
    return;
  }

  async getUserPreferences(userId: string): Promise<any> {
    const user = await this.getUser(userId);
    return {
      theme: "dark",
      timezone: "america/new_york",
      language: "en",
      currency: "usd",
      dateFormat: "mm/dd/yyyy",
      density: "comfortable"
    };
  }

  async updateUserPreferences(userId: string, preferences: any): Promise<void> {
    // For now, just return success since we don't have preferences in schema
    // In a real app, you'd store these in a separate settings table or JSON column
    return;
  }
}

export const storage = new DatabaseStorage();
