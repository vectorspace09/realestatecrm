import { storage } from "./storage";
import type { InsertNotification } from "@shared/schema";

export async function seedNotifications() {
  try {
    // Get the first user to assign notifications to
    const users = await storage.getUsers();
    if (!users || users.length === 0) {
      console.log("No users found, skipping notification seeding");
      return;
    }

    const userId = users[0].id;

    // Create sample notifications
    const notifications: InsertNotification[] = [
      {
        userId,
        type: 'lead_added',
        title: 'New Lead Added',
        message: 'Sarah Johnson submitted a new inquiry for downtown condos',
        actionUrl: '/leads',
        entityType: 'lead',
        metadata: {
          leadName: 'Sarah Johnson',
          propertyType: 'condo',
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString() // 2 minutes ago
        }
      },
      {
        userId,
        type: 'deal_closed',
        title: 'Deal Closed',
        message: 'Michael Chen successfully closed the Skyview property deal',
        actionUrl: '/deals',
        entityType: 'deal',
        isRead: true, // This one is already read
        metadata: {
          leadName: 'Michael Chen',
          propertyTitle: 'Skyview Property',
          dealValue: 450000,
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1 hour ago
        }
      },
      {
        userId,
        type: 'follow_up',
        title: 'Follow-up Reminder',
        message: 'Time to follow up with Emma Davis about property viewing',
        actionUrl: '/leads',
        entityType: 'lead',
        metadata: {
          leadName: 'Emma Davis',
          action: 'property_viewing',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
        }
      },
      {
        userId,
        type: 'task_due',
        title: 'Task Due Soon',
        message: 'Property inspection scheduled for tomorrow needs preparation',
        actionUrl: '/tasks',
        entityType: 'task',
        metadata: {
          taskTitle: 'Property inspection preparation',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
        }
      },
      {
        userId,
        type: 'property_viewed',
        title: 'Property Viewed',
        message: 'Jennifer Wilson viewed the downtown loft listing',
        actionUrl: '/properties',
        entityType: 'property',
        isRead: true,
        metadata: {
          viewerName: 'Jennifer Wilson',
          propertyTitle: 'Downtown Loft',
          viewCount: 3,
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() // 8 hours ago
        }
      }
    ];

    // Insert notifications
    for (const notification of notifications) {
      await storage.createNotification(notification);
    }

    console.log(`✓ Seeded ${notifications.length} notifications for user ${userId}`);
  } catch (error) {
    console.error("Error seeding notifications:", error);
  }
}

// Run if this file is executed directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.argv[1] === __filename) {
  seedNotifications().then(() => {
    console.log("Notification seeding completed");
    process.exit(0);
  }).catch((error) => {
    console.error("Notification seeding failed:", error);
    process.exit(1);
  });
}