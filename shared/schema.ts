import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("agent"),
  teamId: varchar("team_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Leads table
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  source: varchar("source").default("website"),
  status: varchar("status").default("new"),
  score: integer("score").default(0),
  budget: decimal("budget", { precision: 12, scale: 2 }),
  budgetMax: decimal("budget_max", { precision: 12, scale: 2 }),
  preferredLocations: text("preferred_locations").array(),
  propertyTypes: text("property_types").array(),
  timeline: varchar("timeline"),
  notes: text("notes"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Properties table
export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  address: text("address").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  zipCode: varchar("zip_code"),
  propertyType: varchar("property_type").notNull(),
  status: varchar("status").default("available"),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }),
  squareFeet: integer("square_feet"),
  lotSize: decimal("lot_size", { precision: 8, scale: 2 }),
  yearBuilt: integer("year_built"),
  description: text("description"),
  features: text("features").array(),
  images: text("images").array(),
  virtualTourUrl: text("virtual_tour_url"),
  listingAgent: varchar("listing_agent").references(() => users.id),
  ownerContact: text("owner_contact"),
  commission: decimal("commission", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Deals/Opportunities table
export const deals = pgTable("deals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").references(() => leads.id).notNull(),
  propertyId: varchar("property_id").references(() => properties.id).notNull(),
  status: varchar("status").default("offer"),
  dealValue: decimal("deal_value", { precision: 12, scale: 2 }).notNull(),
  offerAmount: decimal("offer_amount", { precision: 12, scale: 2 }),
  expectedCloseDate: timestamp("expected_close_date"),
  actualCloseDate: timestamp("actual_close_date"),
  commission: decimal("commission", { precision: 12, scale: 2 }),
  notes: text("notes"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").default("call"),
  priority: varchar("priority").default("medium"),
  status: varchar("status").default("pending"),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  leadId: varchar("lead_id").references(() => leads.id),
  propertyId: varchar("property_id").references(() => properties.id),
  dealId: varchar("deal_id").references(() => deals.id),
  assignedTo: varchar("assigned_to").references(() => users.id),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activities table (for timeline tracking)
export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  metadata: jsonb("metadata"),
  leadId: varchar("lead_id").references(() => leads.id),
  propertyId: varchar("property_id").references(() => properties.id),
  dealId: varchar("deal_id").references(() => deals.id),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Lead property matches (AI recommendations)
export const leadPropertyMatches = pgTable("lead_property_matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").references(() => leads.id).notNull(),
  propertyId: varchar("property_id").references(() => properties.id).notNull(),
  matchScore: integer("match_score").default(0),
  aiReasons: text("ai_reasons").array(),
  status: varchar("status").default("suggested"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
// Communications table for storing all communication records
export const communications = pgTable("communications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  leadId: varchar("lead_id").references(() => leads.id),
  propertyId: varchar("property_id").references(() => properties.id),
  dealId: varchar("deal_id").references(() => deals.id),
  type: varchar("type").notNull(), // 'email', 'sms', 'call', 'whatsapp', 'meeting'
  direction: varchar("direction").notNull(), // 'inbound', 'outbound'
  subject: varchar("subject"), // For emails
  content: text("content").notNull(),
  status: varchar("status").default("sent"), // 'draft', 'sent', 'delivered', 'failed', 'scheduled'
  scheduledFor: timestamp("scheduled_for"), // For scheduled communications
  metadata: jsonb("metadata"), // Additional data like call duration, email opens, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(), // 'lead_added', 'deal_closed', 'follow_up', 'task_due', etc.
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  actionUrl: varchar("action_url"), // Optional URL to navigate to
  entityType: varchar("entity_type"), // 'lead', 'deal', 'property', 'task'
  entityId: varchar("entity_id"), // ID of the related entity
  metadata: jsonb("metadata"), // Additional data like user names, amounts, etc.
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  leads: many(leads),
  properties: many(properties),
  deals: many(deals),
  tasks: many(tasks),
  activities: many(activities),
  notifications: many(notifications),
  communications: many(communications),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  assignedUser: one(users, {
    fields: [leads.assignedTo],
    references: [users.id],
  }),
  deals: many(deals),
  tasks: many(tasks),
  activities: many(activities),
  propertyMatches: many(leadPropertyMatches),
  communications: many(communications),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  listingAgent: one(users, {
    fields: [properties.listingAgent],
    references: [users.id],
  }),
  deals: many(deals),
  tasks: many(tasks),
  activities: many(activities),
  leadMatches: many(leadPropertyMatches),
}));

export const dealsRelations = relations(deals, ({ one, many }) => ({
  lead: one(leads, {
    fields: [deals.leadId],
    references: [leads.id],
  }),
  property: one(properties, {
    fields: [deals.propertyId],
    references: [properties.id],
  }),
  assignedUser: one(users, {
    fields: [deals.assignedTo],
    references: [users.id],
  }),
  tasks: many(tasks),
  activities: many(activities),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  lead: one(leads, {
    fields: [tasks.leadId],
    references: [leads.id],
  }),
  property: one(properties, {
    fields: [tasks.propertyId],
    references: [properties.id],
  }),
  deal: one(deals, {
    fields: [tasks.dealId],
    references: [deals.id],
  }),
  assignedUser: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
  }),
  createdByUser: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  lead: one(leads, {
    fields: [activities.leadId],
    references: [leads.id],
  }),
  property: one(properties, {
    fields: [activities.propertyId],
    references: [properties.id],
  }),
  deal: one(deals, {
    fields: [activities.dealId],
    references: [deals.id],
  }),
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

export const leadPropertyMatchesRelations = relations(leadPropertyMatches, ({ one }) => ({
  lead: one(leads, {
    fields: [leadPropertyMatches.leadId],
    references: [leads.id],
  }),
  property: one(properties, {
    fields: [leadPropertyMatches.propertyId],
    references: [properties.id],
  }),
}));

export const communicationsRelations = relations(communications, ({ one }) => ({
  user: one(users, {
    fields: [communications.userId],
    references: [users.id],
  }),
  lead: one(leads, {
    fields: [communications.leadId],
    references: [leads.id],
  }),
  property: one(properties, {
    fields: [communications.propertyId],
    references: [properties.id],
  }),
  deal: one(deals, {
    fields: [communications.dealId],
    references: [deals.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDealSchema = createInsertSchema(deals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertCommunicationSchema = createInsertSchema(communications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  readAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Deal = typeof deals.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertCommunication = z.infer<typeof insertCommunicationSchema>;
export type Communication = typeof communications.$inferSelect;
export type LeadPropertyMatch = typeof leadPropertyMatches.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
