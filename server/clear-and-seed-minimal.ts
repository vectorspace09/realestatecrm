import { db } from "./db";
import { users, leads, properties, deals, tasks, activities, notifications } from "@shared/schema";
import { sql } from "drizzle-orm";

const sampleUserId = "43442431"; // Using the authenticated user ID

async function clearAndSeedMinimalData() {
  console.log("🧹 Clearing existing data...");
  
  // Clear all data in proper order (respecting foreign key constraints)
  await db.delete(notifications);
  await db.delete(activities);  
  await db.delete(deals);
  await db.delete(tasks);
  await db.delete(properties);
  await db.delete(leads);
  
  console.log("✅ Cleared all existing data");

  console.log("🌱 Creating minimal sample data...");

  // Create minimal leads - one per status
  const minimalLeads = [
    {
      id: "lead-new-001",
      firstName: "Emma",
      lastName: "Johnson", 
      email: "emma.johnson@email.com",
      phone: "(555) 123-4567",
      status: "new",
      source: "website",
      budget: 450000,
      preferredPropertyType: "house",
      preferredLocation: "Downtown",
      notes: "First-time buyer, pre-approved for mortgage",
      score: 75,
      userId: sampleUserId,
    },
    {
      id: "lead-contacted-001", 
      firstName: "Michael",
      lastName: "Chen",
      email: "michael.chen@email.com",
      phone: "(555) 234-5678",
      status: "contacted",
      source: "referral",
      budget: 650000,
      preferredPropertyType: "condo", 
      preferredLocation: "Westside",
      notes: "Looking for modern amenities, quick timeline",
      score: 85,
      userId: sampleUserId,
    },
    {
      id: "lead-qualified-001",
      firstName: "Sarah",
      lastName: "Williams", 
      email: "sarah.williams@email.com",
      phone: "(555) 345-6789",
      status: "qualified",
      source: "social_media",
      budget: 750000,
      preferredPropertyType: "house",
      preferredLocation: "Suburbs",
      notes: "Family with kids, needs good schools nearby",
      score: 90,
      userId: sampleUserId,
    },
    {
      id: "lead-proposal-001",
      firstName: "David",
      lastName: "Rodriguez",
      email: "david.rodriguez@email.com", 
      phone: "(555) 456-7890",
      status: "proposal",
      source: "cold_call",
      budget: 550000,
      preferredPropertyType: "townhouse",
      preferredLocation: "Midtown",
      notes: "Investor looking for rental property",
      score: 80,
      userId: sampleUserId,
    },
    {
      id: "lead-closed-001",
      firstName: "Lisa",
      lastName: "Thompson",
      email: "lisa.thompson@email.com",
      phone: "(555) 567-8901", 
      status: "closed",
      source: "website",
      budget: 425000,
      preferredPropertyType: "condo",
      preferredLocation: "Downtown",
      notes: "Successfully closed on downtown condo",
      score: 95,
      userId: sampleUserId,
    }
  ];

  await db.insert(leads).values(minimalLeads);
  console.log("✅ Created 5 leads (one per status)");

  // Create properties - one per status
  const minimalProperties = [
    {
      id: "prop-available-001",
      title: "Modern Downtown Condo",
      address: "123 Main Street",
      city: "Metro City",
      state: "CA",
      zipCode: "90210",
      propertyType: "condo",
      status: "available",
      price: 475000,
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1200,
      description: "Beautiful modern condo with city views and updated amenities",
      features: ["granite counters", "hardwood floors", "balcony", "gym access"],
      commission: 3.0,
      userId: sampleUserId,
    },
    {
      id: "prop-pending-001", 
      title: "Suburban Family Home",
      address: "456 Oak Avenue",
      city: "Suburbia",
      state: "CA", 
      zipCode: "90211",
      propertyType: "house",
      status: "pending",
      price: 725000,
      bedrooms: 4,
      bathrooms: 3,
      squareFeet: 2400,
      lotSize: 0.25,
      yearBuilt: 2018,
      description: "Spacious family home in excellent school district",
      features: ["open floor plan", "two-car garage", "backyard", "modern kitchen"],
      commission: 2.5,
      userId: sampleUserId,
    },
    {
      id: "prop-sold-001",
      title: "Investment Townhouse",
      address: "789 Pine Street", 
      city: "Investment Heights",
      state: "CA",
      zipCode: "90212",
      propertyType: "townhouse",
      status: "sold",
      price: 585000,
      bedrooms: 3,
      bathrooms: 2.5,
      squareFeet: 1800,
      yearBuilt: 2020,
      description: "Recently sold townhouse perfect for rental income",
      features: ["attached garage", "patio", "low HOA fees", "near transit"],
      commission: 2.8,
      userId: sampleUserId,
    },
    {
      id: "prop-withdrawn-001",
      title: "Luxury High-Rise Unit",
      address: "321 Tower Boulevard",
      city: "Skyline City", 
      state: "CA",
      zipCode: "90213",
      propertyType: "condo",
      status: "withdrawn",
      price: 850000,
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1400,
      yearBuilt: 2021,
      description: "High-end unit withdrawn from market for renovations",
      features: ["panoramic views", "concierge", "rooftop pool", "valet parking"],
      commission: 3.5,
      userId: sampleUserId,
    }
  ];

  await db.insert(properties).values(minimalProperties);
  console.log("✅ Created 4 properties (one per status)");

  // Create a couple of tasks
  const minimalTasks = [
    {
      id: "task-001",
      title: "Follow up with Emma Johnson",
      description: "Schedule property viewing for downtown area",
      priority: "high",
      status: "pending",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      leadId: "lead-new-001",
      userId: sampleUserId,
    },
    {
      id: "task-002", 
      title: "Prepare proposal for David Rodriguez",
      description: "Create investment analysis for townhouse properties",
      priority: "medium",
      status: "in_progress",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      leadId: "lead-proposal-001", 
      userId: sampleUserId,
    }
  ];

  await db.insert(tasks).values(minimalTasks);
  console.log("✅ Created 2 tasks");

  // Create one deal
  const minimalDeal = {
    id: "deal-001",
    leadId: "lead-closed-001",
    propertyId: "prop-sold-001", 
    status: "closed",
    dealValue: 585000,
    offerAmount: 585000,
    closeDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    commission: 16380, // 2.8% of 585000
    userId: sampleUserId,
  };

  await db.insert(deals).values([minimalDeal]);
  console.log("✅ Created 1 deal");

  console.log("🎉 Minimal sample data created successfully!");
  console.log("📊 Summary:");
  console.log("  - 5 leads (one per status: new, contacted, qualified, proposal, closed)");
  console.log("  - 4 properties (one per status: available, pending, sold, withdrawn)");
  console.log("  - 2 tasks (high priority follow-up, medium priority proposal)");
  console.log("  - 1 deal (closed transaction)");
}

// Only run if this file is executed directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  clearAndSeedMinimalData()
    .then(() => {
      console.log("✅ Database seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error seeding database:", error);
      process.exit(1);
    });
}

export { clearAndSeedMinimalData };