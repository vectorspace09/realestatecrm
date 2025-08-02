import {
  users,
  leads,
  properties,
  deals,
  tasks,
  activities,
  leadPropertyMatches,
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
    totalLeads: number;
    activeProperties: number;
    activeDeals: number;
    monthlyRevenue: number;
    recentActivities: Activity[];
  }>;
  
  getDetailedAnalytics(userId?: string): Promise<any>;
  
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
  async getLeads(filters?: { status?: string; assignedTo?: string; search?: string }): Promise<Lead[]> {
    const conditions = [];
    if (filters?.status) {
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
    
    if (conditions.length > 0) {
      return await db.select().from(leads).where(and(...conditions)).orderBy(desc(leads.createdAt));
    }
    
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
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
  async getProperties(filters?: { status?: string; propertyType?: string; search?: string }): Promise<Property[]> {
    const conditions = [];
    if (filters?.status) {
      conditions.push(eq(properties.status, filters.status));
    }
    if (filters?.propertyType) {
      conditions.push(eq(properties.propertyType, filters.propertyType));
    }
    if (filters?.search) {
      conditions.push(
        sql`${properties.title} ILIKE ${`%${filters.search}%`} OR ${properties.address} ILIKE ${`%${filters.search}%`}`
      );
    }
    
    if (conditions.length > 0) {
      return await db.select().from(properties).where(and(...conditions)).orderBy(desc(properties.createdAt));
    }
    
    return await db.select().from(properties).orderBy(desc(properties.createdAt));
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
      return await db.select().from(deals).where(and(...conditions)).orderBy(desc(deals.createdAt));
    }
    
    return await db.select().from(deals).orderBy(desc(deals.createdAt));
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
      return await db.select().from(tasks).where(and(...conditions)).orderBy(desc(tasks.createdAt));
    }
    
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
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
      return await db.select().from(activities).where(and(...conditions)).orderBy(desc(activities.createdAt));
    }
    
    return await db.select().from(activities).orderBy(desc(activities.createdAt));
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

  // Dashboard/Analytics operations
  async getDashboardMetrics(userId?: string): Promise<{
    totalLeads: string;
    activeProperties: string;
    activeDeals: string;
    totalRevenue: string;
    recentActivities: Activity[];
  }> {
    const [totalLeadsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(leads);
    
    const [activePropertiesResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(properties)
      .where(eq(properties.status, "available"));
    
    const [activeDealsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(deals)
      .where(inArray(deals.status, ["offer", "inspection", "legal", "payment"]));
    
    // Calculate total revenue from all completed deals and commissions
    const [totalRevenueResult] = await db
      .select({ 
        revenue: sql<number>`COALESCE(SUM(${deals.commission}), 0)` 
      })
      .from(deals)
      .where(inArray(deals.status, ["handover", "payment"]));
    
    const recentActivities = await db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(10);

    return {
      totalLeads: totalLeadsResult.count.toString(),
      activeProperties: activePropertiesResult.count.toString(),
      activeDeals: activeDealsResult.count.toString(),
      totalRevenue: (totalRevenueResult.revenue || 0).toString(),
      recentActivities,
    };
  }

  // Detailed Analytics operations
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
    // Get all data
    const allLeads = await db.select().from(leads);
    const allProperties = await db.select().from(properties);
    const allDeals = await db.select().from(deals);
    const allTasks = await db.select().from(tasks);

    // Calculate metrics
    const totalLeads = allLeads.length;
    const qualifiedLeads = allLeads.filter(lead => lead.status === 'qualified').length;
    const conversionRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;
    const averageLeadScore = allLeads.length > 0 ? 
      Math.round(allLeads.reduce((sum, lead) => sum + (lead.score || 0), 0) / allLeads.length) : 0;

    const totalProperties = allProperties.length;
    const soldProperties = allProperties.filter(prop => prop.status === 'sold').length;
    const activeListings = allProperties.filter(prop => prop.status === 'available').length;
    const averagePropertyPrice = allProperties.length > 0 ?
      Math.round(allProperties.reduce((sum, prop) => sum + (prop.price || 0), 0) / allProperties.length) : 0;

    const totalDeals = allDeals.length;
    const activePipeline = allDeals.filter(deal => 
      ['offer', 'inspection', 'legal', 'payment'].includes(deal.status)
    ).length;
    const closedDeals = allDeals.filter(deal => deal.status === 'handover').length;
    const totalRevenue = allDeals
      .filter(deal => ['handover', 'payment'].includes(deal.status))
      .reduce((sum, deal) => sum + (deal.commission || 0), 0);
    const averageDealValue = allDeals.length > 0 ?
      Math.round(allDeals.reduce((sum, deal) => sum + (deal.dealValue || 0), 0) / allDeals.length) : 0;

    const pendingTasks = allTasks.filter(task => task.status === 'pending').length;
    const completedTasks = allTasks.filter(task => task.status === 'completed').length;
    const taskCompletionRate = (pendingTasks + completedTasks) > 0 ?
      Math.round((completedTasks / (pendingTasks + completedTasks)) * 100) : 0;

    // Lead sources analysis
    const leadSourceCounts = allLeads.reduce((acc, lead) => {
      const source = lead.source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const leadsBySource = Object.entries(leadSourceCounts).map(([source, count]) => ({
      source: source.charAt(0).toUpperCase() + source.slice(1),
      count
    }));

    // Deal status analysis
    const dealStatusData = allDeals.reduce((acc, deal) => {
      const status = deal.status;
      if (!acc[status]) {
        acc[status] = { count: 0, value: 0 };
      }
      acc[status].count += 1;
      acc[status].value += deal.dealValue || 0;
      return acc;
    }, {} as Record<string, { count: number; value: number }>);
    const dealsByStatus = Object.entries(dealStatusData).map(([status, data]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count: data.count,
      value: data.value
    }));

    // Revenue by month (last 6 months)
    const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      // Calculate revenue for this month (simplified - in real app would use proper date filtering)
      const monthRevenue = Math.random() * 50000; // Replace with actual calculation
      
      return {
        month: monthName,
        revenue: Math.round(monthRevenue)
      };
    }).reverse();

    // Top performing properties (highest price, available/sold)
    const topPerformingProperties = allProperties
      .filter(prop => ['available', 'sold'].includes(prop.status))
      .sort((a, b) => (b.price || 0) - (a.price || 0))
      .slice(0, 5);

    // High value leads (score > 75)
    const highValueLeads = allLeads
      .filter(lead => (lead.score || 0) > 75)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 10);

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
      leadsBySource,
      dealsByStatus,
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
      query = query.limit(filters.limit);
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

  // Settings methods
  async updateUserProfile(userId: string, profileData: any): Promise<void> {
    await db
      .update(users)
      .set({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        bio: profileData.bio,
        license: profileData.license,
        brokerage: profileData.brokerage,
        experience: profileData.experience,
        specialties: profileData.specialties,
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
