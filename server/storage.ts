import {
  users,
  leads,
  properties,
  deals,
  tasks,
  activities,
  leadPropertyMatches,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, ilike, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
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
}

export class DatabaseStorage implements IStorage {
  // User operations
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
    totalLeads: number;
    activeProperties: number;
    activeDeals: number;
    monthlyRevenue: number;
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
    
    const [monthlyRevenueResult] = await db
      .select({ 
        revenue: sql<number>`COALESCE(SUM(${deals.dealValue}), 0)` 
      })
      .from(deals)
      .where(
        and(
          eq(deals.status, "closed"),
          sql`${deals.actualCloseDate} >= date_trunc('month', CURRENT_DATE)`
        )
      );
    
    const recentActivities = await db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(10);

    return {
      totalLeads: totalLeadsResult.count,
      activeProperties: activePropertiesResult.count,
      activeDeals: activeDealsResult.count,
      monthlyRevenue: monthlyRevenueResult.revenue || 0,
      recentActivities,
    };
  }
}

export const storage = new DatabaseStorage();
