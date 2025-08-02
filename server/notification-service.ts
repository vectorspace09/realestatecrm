import { storage } from "./storage";
import type { InsertNotification, Lead, Property, Deal, Task } from "@shared/schema";

/**
 * Notification Service - Automatically generates notifications for lead journey events
 */
export class NotificationService {
  
  // Lead Journey Notifications
  static async onLeadCreated(lead: Lead, userId: string): Promise<void> {
    const notification: InsertNotification = {
      userId,
      type: 'lead_added',
      title: 'New Lead Added',
      message: `${lead.firstName} ${lead.lastName} submitted a new inquiry${lead.source ? ` via ${lead.source}` : ''}`,
      actionUrl: `/leads/${lead.id}`,
      entityType: 'lead',
      entityId: lead.id,
      metadata: {
        leadName: `${lead.firstName} ${lead.lastName}`,
        leadScore: lead.score,
        source: lead.source,
        budget: lead.budget,
        timestamp: new Date().toISOString()
      }
    };
    
    await storage.createNotification(notification);
  }

  static async onLeadStatusChanged(lead: Lead, oldStatus: string, newStatus: string, userId: string): Promise<void> {
    let title = 'Lead Status Updated';
    let message = `${lead.firstName} ${lead.lastName} moved from ${oldStatus} to ${newStatus}`;
    
    // Customize notification based on status change
    switch (newStatus) {
      case 'qualified':
        title = 'Lead Qualified';
        message = `${lead.firstName} ${lead.lastName} has been qualified and is ready for follow-up`;
        break;
      case 'contacted':
        title = 'Lead Contacted';
        message = `Successfully contacted ${lead.firstName} ${lead.lastName}`;
        break;
      case 'meeting_scheduled':
        title = 'Meeting Scheduled';
        message = `Meeting scheduled with ${lead.firstName} ${lead.lastName}`;
        break;
      case 'proposal_sent':
        title = 'Proposal Sent';
        message = `Proposal sent to ${lead.firstName} ${lead.lastName}`;
        break;
      case 'negotiating':
        title = 'Negotiation Started';
        message = `Entered negotiation phase with ${lead.firstName} ${lead.lastName}`;
        break;
      case 'closed_won':
        title = 'Lead Converted';
        message = `${lead.firstName} ${lead.lastName} converted to customer!`;
        break;
      case 'closed_lost':
        title = 'Lead Lost';
        message = `${lead.firstName} ${lead.lastName} marked as lost`;
        break;
    }

    const notification: InsertNotification = {
      userId,
      type: 'lead_status_changed',
      title,
      message,
      actionUrl: `/leads/${lead.id}`,
      entityType: 'lead',
      entityId: lead.id,
      metadata: {
        leadName: `${lead.firstName} ${lead.lastName}`,
        oldStatus,
        newStatus,
        leadScore: lead.score,
        timestamp: new Date().toISOString()
      }
    };
    
    await storage.createNotification(notification);
  }

  static async onLeadScoreChanged(lead: Lead, oldScore: number, newScore: number, userId: string): Promise<void> {
    // Only notify for significant score changes (increase of 20+ points or crossing 80+ threshold)
    const scoreDiff = newScore - oldScore;
    const isHighScore = newScore >= 80;
    const wasLowScore = oldScore < 80;
    
    if (scoreDiff >= 20 || (isHighScore && wasLowScore)) {
      const notification: InsertNotification = {
        userId,
        type: 'lead_score_changed',
        title: isHighScore ? 'High-Value Lead Identified' : 'Lead Score Improved',
        message: `${lead.firstName} ${lead.lastName} score increased from ${oldScore} to ${newScore}${isHighScore ? ' - Priority follow-up recommended' : ''}`,
        actionUrl: `/leads/${lead.id}`,
        entityType: 'lead',
        entityId: lead.id,
        metadata: {
          leadName: `${lead.firstName} ${lead.lastName}`,
          oldScore,
          newScore,
          scoreDiff,
          isHighValue: isHighScore,
          timestamp: new Date().toISOString()
        }
      };
      
      await storage.createNotification(notification);
    }
  }

  // Property Notifications
  static async onPropertyViewed(property: Property, viewerName: string, userId: string): Promise<void> {
    const notification: InsertNotification = {
      userId,
      type: 'property_viewed',
      title: 'Property Viewed',
      message: `${viewerName} viewed "${property.title}" - Consider following up`,
      actionUrl: `/properties/${property.id}`,
      entityType: 'property',
      entityId: property.id,
      metadata: {
        propertyTitle: property.title,
        viewerName,
        propertyPrice: property.price,
        timestamp: new Date().toISOString()
      }
    };
    
    await storage.createNotification(notification);
  }

  static async onPropertyStatusChanged(property: Property, oldStatus: string, newStatus: string, userId: string): Promise<void> {
    let title = 'Property Status Updated';
    let message = `"${property.title}" status changed from ${oldStatus} to ${newStatus}`;
    
    switch (newStatus) {
      case 'available':
        title = 'Property Listed';
        message = `"${property.title}" is now available for viewing`;
        break;
      case 'under_offer':
        title = 'Property Under Offer';
        message = `"${property.title}" has received an offer`;
        break;
      case 'sold':
        title = 'Property Sold';
        message = `"${property.title}" has been sold successfully!`;
        break;
      case 'withdrawn':
        title = 'Property Withdrawn';
        message = `"${property.title}" has been withdrawn from market`;
        break;
    }

    const notification: InsertNotification = {
      userId,
      type: 'property_status_changed',
      title,
      message,
      actionUrl: `/properties/${property.id}`,
      entityType: 'property',
      entityId: property.id,
      metadata: {
        propertyTitle: property.title,
        oldStatus,
        newStatus,
        propertyPrice: property.price,
        timestamp: new Date().toISOString()
      }
    };
    
    await storage.createNotification(notification);
  }

  // Deal Notifications
  static async onDealCreated(deal: Deal, leadName: string, propertyTitle: string, userId: string): Promise<void> {
    const notification: InsertNotification = {
      userId,
      type: 'deal_created',
      title: 'New Deal Created',
      message: `Deal created for ${leadName} on "${propertyTitle}" worth $${deal.dealValue?.toLocaleString()}`,
      actionUrl: `/deals/${deal.id}`,
      entityType: 'deal',
      entityId: deal.id,
      metadata: {
        leadName,
        propertyTitle,
        dealValue: deal.dealValue,
        timestamp: new Date().toISOString()
      }
    };
    
    await storage.createNotification(notification);
  }

  static async onDealStatusChanged(deal: Deal, oldStatus: string, newStatus: string, leadName: string, propertyTitle: string, userId: string): Promise<void> {
    let title = 'Deal Status Updated';
    let message = `Deal with ${leadName} moved from ${oldStatus} to ${newStatus}`;
    
    switch (newStatus) {
      case 'offer':
        title = 'Offer Stage';
        message = `Deal with ${leadName} entered offer stage`;
        break;
      case 'inspection':
        title = 'Inspection Scheduled';
        message = `Property inspection scheduled for ${leadName}`;
        break;
      case 'legal':
        title = 'Legal Review';
        message = `Deal with ${leadName} in legal review stage`;
        break;
      case 'payment':
        title = 'Payment Processing';
        message = `Processing payment for ${leadName}'s deal`;
        break;
      case 'handover':
        title = 'Deal Closed Successfully';
        message = `Deal with ${leadName} completed! Commission: $${deal.commission?.toLocaleString()}`;
        break;
      case 'cancelled':
        title = 'Deal Cancelled';
        message = `Deal with ${leadName} has been cancelled`;
        break;
    }

    const notification: InsertNotification = {
      userId,
      type: 'deal_status_changed',
      title,
      message,
      actionUrl: `/deals/${deal.id}`,
      entityType: 'deal',
      entityId: deal.id,
      metadata: {
        leadName,
        propertyTitle,
        oldStatus,
        newStatus,
        dealValue: deal.dealValue,
        commission: deal.commission,
        timestamp: new Date().toISOString()
      }
    };
    
    await storage.createNotification(notification);
  }

  // Task Notifications
  static async onTaskDueSoon(task: Task, userId: string): Promise<void> {
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const hoursUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    let urgency = 'due soon';
    if (hoursUntilDue <= 1) urgency = 'due in 1 hour';
    else if (hoursUntilDue <= 24) urgency = `due in ${hoursUntilDue} hours`;
    else urgency = `due in ${Math.ceil(hoursUntilDue / 24)} days`;

    const notification: InsertNotification = {
      userId,
      type: 'task_due',
      title: 'Task Due Soon',
      message: `"${task.title}" is ${urgency}`,
      actionUrl: `/tasks`,
      entityType: 'task',
      entityId: task.id,
      metadata: {
        taskTitle: task.title,
        dueDate: task.dueDate,
        hoursUntilDue,
        priority: task.priority,
        timestamp: new Date().toISOString()
      }
    };
    
    await storage.createNotification(notification);
  }

  static async onTaskCompleted(task: Task, userId: string): Promise<void> {
    const notification: InsertNotification = {
      userId,
      type: 'task_completed',
      title: 'Task Completed',
      message: `"${task.title}" has been completed`,
      actionUrl: `/tasks`,
      entityType: 'task',
      entityId: task.id,
      metadata: {
        taskTitle: task.title,
        completedAt: new Date().toISOString(),
        priority: task.priority,
        timestamp: new Date().toISOString()
      }
    };
    
    await storage.createNotification(notification);
  }

  // Follow-up Reminders
  static async createFollowUpReminder(leadId: string, leadName: string, userId: string, followUpType: string = 'general'): Promise<void> {
    let message = `Time to follow up with ${leadName}`;
    
    switch (followUpType) {
      case 'initial':
        message = `Initial follow-up needed for ${leadName}`;
        break;
      case 'viewing':
        message = `Follow up on property viewing with ${leadName}`;
        break;
      case 'proposal':
        message = `Check on proposal status with ${leadName}`;
        break;
      case 'negotiation':
        message = `Continue negotiation discussion with ${leadName}`;
        break;
    }

    const notification: InsertNotification = {
      userId,
      type: 'follow_up',
      title: 'Follow-up Reminder',
      message,
      actionUrl: `/leads/${leadId}`,
      entityType: 'lead',
      entityId: leadId,
      metadata: {
        leadName,
        followUpType,
        timestamp: new Date().toISOString()
      }
    };
    
    await storage.createNotification(notification);
  }

  // AI Insights Notifications
  static async onAIInsightGenerated(insight: string, relevantEntity: string, entityId: string, userId: string): Promise<void> {
    const notification: InsertNotification = {
      userId,
      type: 'ai_insight',
      title: 'AI Insight Generated',
      message: insight,
      actionUrl: `/ai`,
      entityType: relevantEntity as any,
      entityId,
      metadata: {
        insight,
        relevantEntity,
        timestamp: new Date().toISOString()
      }
    };
    
    await storage.createNotification(notification);
  }
}