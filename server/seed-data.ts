import { storage } from "./storage";

async function seedDatabase() {
  console.log('🌱 Seeding database with sample data...');

  try {
    // Sample leads
    const leads = [
      {
        firstName: 'John',
        lastName: 'Smith', 
        email: 'john.smith@email.com',
        phone: '+1-555-0123',
        source: 'website',
        status: 'new',
        budget: 500000,
        budgetMax: 750000,
        preferredLocations: ['Downtown', 'Midtown'],
        propertyTypes: ['condo', 'apartment'],
        timeline: '3_months',
        notes: 'Looking for modern condo with city views',
        score: 85
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.j@email.com', 
        phone: '+1-555-0124',
        source: 'referral',
        status: 'qualified',
        budget: 800000,
        budgetMax: 1200000,
        preferredLocations: ['Suburb', 'Waterfront'],
        propertyTypes: ['house', 'townhouse'],
        timeline: '6_months',
        notes: 'Family of 4, needs good schools nearby',
        score: 92
      },
      {
        firstName: 'Mike',
        lastName: 'Chen',
        email: 'mike.chen@email.com',
        phone: '+1-555-0125', 
        source: 'social_media',
        status: 'contacted',
        budget: 300000,
        budgetMax: 450000,
        preferredLocations: ['Urban'],
        propertyTypes: ['studio', 'apartment'],
        timeline: '1_month',
        notes: 'First-time buyer, prefers move-in ready',
        score: 78
      },
      {
        firstName: 'Emma',
        lastName: 'Davis',
        email: 'emma.davis@email.com',
        phone: '+1-555-0126',
        source: 'website',
        status: 'proposal',
        budget: 1500000,
        budgetMax: 2000000,
        preferredLocations: ['Luxury District'],
        propertyTypes: ['penthouse', 'condo'],
        timeline: '2_months',
        notes: 'Seeking luxury penthouse with premium amenities',
        score: 96
      },
      {
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@email.com',
        phone: '+1-555-0127',
        source: 'referral',
        status: 'nurturing',
        budget: 600000,
        budgetMax: 850000,
        preferredLocations: ['Suburb'],
        propertyTypes: ['house'],
        timeline: '12_months',
        notes: 'Planning to move next year, wants single family home',
        score: 65
      }
    ];

    // Sample properties
    const properties = [
      {
        title: 'Modern Downtown Condo',
        address: '123 Main Street, Unit 15A',
        city: 'New York',
        state: 'NY', 
        zipCode: '10001',
        propertyType: 'condo',
        status: 'available',
        price: 650000,
        bedrooms: 2,
        bathrooms: 2.0,
        squareFeet: 1200,
        yearBuilt: 2018,
        description: 'Stunning modern condo with floor-to-ceiling windows and city views',
        features: ['City View', 'Modern Kitchen', 'In-unit Laundry', 'Gym'],
        commission: 3.0
      },
      {
        title: 'Family Suburban Home',
        address: '456 Oak Drive',
        city: 'Westchester', 
        state: 'NY',
        zipCode: '10583',
        propertyType: 'house',
        status: 'available', 
        price: 950000,
        bedrooms: 4,
        bathrooms: 3.5,
        squareFeet: 2800,
        lotSize: 0.5,
        yearBuilt: 2010,
        description: 'Beautiful colonial home in top-rated school district',
        features: ['Large Yard', 'Updated Kitchen', 'Hardwood Floors', 'Garage'],
        commission: 2.5
      },
      {
        title: 'Cozy Studio Apartment',
        address: '789 Broadway, Apt 4B',
        city: 'New York',
        state: 'NY',
        zipCode: '10003', 
        propertyType: 'studio',
        status: 'available',
        price: 375000,
        bedrooms: 0,
        bathrooms: 1.0,
        squareFeet: 500,
        yearBuilt: 1985,
        description: 'Charming studio in prime location, recently renovated',
        features: ['Renovated', 'Prime Location', 'Exposed Brick'],
        commission: 4.0
      },
      {
        title: 'Luxury Penthouse Suite',
        address: '999 Park Avenue, PH1',
        city: 'New York',
        state: 'NY',
        zipCode: '10028',
        propertyType: 'penthouse',
        status: 'available',
        price: 1800000,
        bedrooms: 3,
        bathrooms: 3.5,
        squareFeet: 2500,
        yearBuilt: 2020,
        description: 'Ultra-luxury penthouse with panoramic city views and premium finishes',
        features: ['Panoramic Views', 'Chef Kitchen', 'Private Terrace', 'Concierge'],
        commission: 2.0
      },
      {
        title: 'Charming Townhouse',
        address: '321 Maple Street',
        city: 'Brooklyn',
        state: 'NY',
        zipCode: '11201',
        propertyType: 'townhouse',
        status: 'sold',
        price: 1100000,
        bedrooms: 3,
        bathrooms: 2.5,
        squareFeet: 1800,
        yearBuilt: 1920,
        description: 'Historic townhouse with modern updates in trendy neighborhood',
        features: ['Historic Charm', 'Modern Updates', 'Private Garden', 'Original Details'],
        commission: 3.5
      }
    ];

    // Create leads
    for (const leadData of leads) {
      try {
        await storage.createLead(leadData);
        console.log(`✅ Created lead: ${leadData.firstName} ${leadData.lastName}`);
      } catch (err) {
        console.log(`❌ Error creating lead ${leadData.firstName}: ${err.message}`);
      }
    }

    // Create properties
    for (const propertyData of properties) {
      try {
        await storage.createProperty(propertyData);
        console.log(`✅ Created property: ${propertyData.title}`);
      } catch (err) {
        console.log(`❌ Error creating property ${propertyData.title}: ${err.message}`);
      }
    }

    // Create sample tasks
    const tasks = [
      {
        title: 'Follow up with John Smith',
        description: 'Call regarding downtown condo preferences',
        type: 'call',
        priority: 'high',
        status: 'pending',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
      },
      {
        title: 'Prepare market analysis for Sarah Johnson',
        description: 'Research comparable properties in Westchester area',
        type: 'research',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
      },
      {
        title: 'Schedule property showing',
        description: 'Arrange viewing for Mike Chen - studio apartment',
        type: 'showing',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
      }
    ];

    for (const taskData of tasks) {
      try {
        await storage.createTask(taskData);
        console.log(`✅ Created task: ${taskData.title}`);
      } catch (err) {
        console.log(`❌ Error creating task ${taskData.title}: ${err.message}`);
      }
    }

    console.log('🎉 Sample data seeded successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • ${leads.length} leads created`);
    console.log(`   • ${properties.length} properties created`);
    console.log(`   • ${tasks.length} tasks created`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

export { seedDatabase };

// Run if called directly
seedDatabase().then(() => process.exit(0));