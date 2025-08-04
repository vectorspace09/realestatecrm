import { storage } from './storage';
import type { InsertCommunication } from '@shared/schema';

export async function seedCommunications() {
  const userId = "43442431"; // Default user ID

  const sampleCommunications: InsertCommunication[] = [
    // Recent email communications
    {
      userId,
      leadId: "lead-new-001",
      type: "email",
      direction: "outbound",
      subject: "Welcome to PRA Developers - Your Property Search Begins",
      content: "Hi Emma,\n\nThank you for your interest in finding your dream home with PRA Developers. I'm excited to help you through this journey.\n\nBased on your preferences for a 2-3 bedroom property in Manhattan with a budget of $800,000, I have some excellent options to show you.\n\nCould we schedule a call this week to discuss your requirements in detail?\n\nBest regards,\nReal Estate Team",
      status: "sent",
      metadata: {
        sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        emailOpened: true,
        clickedLinks: 1
      }
    },
    {
      userId,
      leadId: "lead-new-001", 
      type: "email",
      direction: "inbound",
      subject: "Re: Welcome to PRA Developers",
      content: "Hi,\n\nThank you for reaching out. I'm very interested in seeing what properties you have available. I'm flexible this week for a call.\n\nBest,\nEmma",
      status: "received",
      metadata: {
        receivedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString()
      }
    },
    
    // Phone calls
    {
      userId,
      leadId: "lead-contacted-002",
      type: "call",
      direction: "outbound", 
      content: "Initial consultation call - discussed property requirements, budget, and timeline. Michael is looking for a 3-bedroom condo in downtown area, budget up to $1.2M. Scheduled property viewing for this weekend.",
      status: "completed",
      metadata: {
        duration: "18 minutes",
        outcome: "positive",
        calledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        nextAction: "Schedule property viewing"
      }
    },
    {
      userId,
      leadId: "lead-qualified-003",
      type: "call",
      direction: "inbound",
      content: "Sarah called to inquire about the luxury apartment listing on 5th Avenue. Very interested, pre-approved for $2M. Wants to schedule viewing ASAP.",
      status: "completed", 
      metadata: {
        duration: "12 minutes",
        outcome: "very positive",
        calledAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        leadQuality: "hot"
      }
    },

    // SMS messages
    {
      userId,
      leadId: "lead-meeting-004",
      type: "sms",
      direction: "outbound",
      content: "Hi David, just confirming our appointment tomorrow at 2 PM to view the Brooklyn Heights property. Address: 123 Main St. See you there!",
      status: "delivered",
      metadata: {
        sentAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        deliveryStatus: "delivered"
      }
    },
    {
      userId,
      leadId: "lead-meeting-004",
      type: "sms", 
      direction: "inbound",
      content: "Perfect! Looking forward to it. Can we also see the penthouse unit if available?",
      status: "received",
      metadata: {
        receivedAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString()
      }
    },

    // More recent emails
    {
      userId,
      leadId: "lead-proposal-005",
      type: "email",
      direction: "outbound", 
      subject: "Property Proposal - Downtown Luxury Condo",
      content: "Dear Jennifer,\n\nFollowing our conversation yesterday, I'm pleased to present this exclusive downtown luxury condo that perfectly matches your criteria.\n\nProperty Details:\n- 2 bedrooms, 2 bathrooms\n- 1,200 sq ft\n- Manhattan location\n- $950,000\n- Move-in ready\n\nThe building features a gym, rooftop terrace, and 24/7 concierge. This property won't last long in the current market.\n\nWould you like to schedule a viewing this weekend?\n\nBest regards,\nPRA Developers Team",
      status: "sent",
      metadata: {
        sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        attachments: ["property_photos.pdf", "floor_plan.pdf"],
        aiGenerated: false
      }
    },

    // WhatsApp message
    {
      userId,
      leadId: "lead-negotiating-006", 
      type: "whatsapp",
      direction: "outbound",
      content: "Hi Robert! Great news - the seller has accepted your revised offer of $1.8M for the penthouse. We can proceed with the paperwork. Congratulations! 🎉",
      status: "delivered",
      metadata: {
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        platform: "whatsapp_business"
      }
    },

    // Follow-up emails
    {
      userId,
      leadId: "lead-new-007",
      type: "email", 
      direction: "outbound",
      subject: "Following up on your property inquiry",
      content: "Hi Lisa,\n\nI wanted to follow up on your recent inquiry about properties in the $600-800K range. \n\nI have 3 new listings that just came on the market this week that would be perfect for you:\n\n1. Charming 2BR in Greenwich Village - $750K\n2. Modern 1BR with city views - $680K  \n3. Renovated 2BR in Chelsea - $795K\n\nWould you be available for a quick call to discuss these options?\n\nBest,\nReal Estate Team",
      status: "sent",
      metadata: {
        sentAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        followUpSequence: 2,
        aiGenerated: true
      }
    },

    // Meeting scheduled
    {
      userId,
      leadId: "lead-qualified-008",
      type: "meeting",
      direction: "outbound",
      content: "Consultation meeting scheduled to discuss investment property portfolio expansion. Client interested in 3-4 rental properties in emerging neighborhoods.",
      status: "scheduled",
      scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      metadata: {
        scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        meetingType: "consultation",
        duration: "60 minutes",
        location: "Office conference room"
      }
    }
  ];

  console.log('Seeding communications...');
  
  for (const communication of sampleCommunications) {
    try {
      await storage.createCommunication(communication);
      console.log(`Created communication: ${communication.type} - ${communication.subject || 'No subject'}`);
    } catch (error) {
      console.error('Error creating communication:', error);
    }
  }
  
  console.log('Communications seeding completed!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedCommunications().catch(console.error);
}