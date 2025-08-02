import type { InsertNotification } from '@shared/schema';

// Utility function to generate notifications when certain actions occur
export function createLeadNotification(leadName: string, userId: string): InsertNotification {
  return {
    userId,
    type: 'lead_added',
    title: 'New Lead Added',
    message: `${leadName} submitted a new inquiry and has been added to your leads.`,
    actionUrl: '/leads',
    entityType: 'lead',
    metadata: {
      leadName,
      timestamp: new Date().toISOString()
    }
  };
}

export function createDealNotification(leadName: string, propertyTitle: string, userId: string, dealValue?: number): InsertNotification {
  return {
    userId,
    type: 'deal_closed',
    title: 'Deal Closed Successfully',
    message: `${leadName} successfully closed the deal for ${propertyTitle}${dealValue ? ` worth $${dealValue.toLocaleString()}` : ''}.`,
    actionUrl: '/deals',
    entityType: 'deal',
    metadata: {
      leadName,
      propertyTitle,
      dealValue,
      timestamp: new Date().toISOString()
    }
  };
}

export function createFollowUpNotification(leadName: string, userId: string): InsertNotification {
  return {
    userId,
    type: 'follow_up',
    title: 'Follow-up Reminder',
    message: `Time to follow up with ${leadName} about their property inquiry.`,
    actionUrl: '/leads',
    entityType: 'lead',
    metadata: {
      leadName,
      timestamp: new Date().toISOString()
    }
  };
}

export function createTaskDueNotification(taskTitle: string, userId: string): InsertNotification {
  return {
    userId,
    type: 'task_due',
    title: 'Task Due Soon',
    message: `"${taskTitle}" is due soon. Don't forget to complete it.`,
    actionUrl: '/tasks',
    entityType: 'task',
    metadata: {
      taskTitle,
      timestamp: new Date().toISOString()
    }
  };
}

export function createPropertyViewedNotification(propertyTitle: string, viewerName: string, userId: string): InsertNotification {
  return {
    userId,
    type: 'property_viewed',
    title: 'Property Viewed',
    message: `${viewerName} viewed the property "${propertyTitle}". Consider following up.`,
    actionUrl: '/properties',
    entityType: 'property',
    metadata: {
      propertyTitle,
      viewerName,
      timestamp: new Date().toISOString()
    }
  };
}