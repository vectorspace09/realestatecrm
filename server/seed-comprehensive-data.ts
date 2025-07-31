import { storage } from "./storage";

async function seedComprehensiveData() {
  console.log('🌱 Seeding comprehensive demo data...');

  try {
    // Clear existing data first
    console.log('🧹 Clearing existing data...');

    // Comprehensive leads with varied data
    const leads = [
      {
        firstName: 'Emma',
        lastName: 'Rodriguez', 
        email: 'emma.rodriguez@email.com',
        phone: '+1-555-0101',
        source: 'website',
        status: 'new',
        budget: 750000,
        budgetMax: 950000,
        preferredLocations: ['Manhattan', 'Brooklyn Heights'],
        propertyTypes: ['apartment', 'condo'],
        timeline: '2_months',
        notes: 'Looking for luxury 2BR with Manhattan skyline views. Has pre-approval letter.',
        score: 92
      },
      {
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@tech.com',
        phone: '+1-555-0102', 
        source: 'referral',
        status: 'qualified',
        budget: 1200000,
        budgetMax: 1500000,
        preferredLocations: ['SoHo', 'Tribeca', 'West Village'],
        propertyTypes: ['loft', 'penthouse'],
        timeline: '1_month',
        notes: 'Tech executive, cash buyer. Wants move-in ready luxury property.',
        score: 96
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1-555-0103',
        source: 'facebook',
        status: 'contacted',
        budget: 450000,
        budgetMax: 650000,
        preferredLocations: ['Queens', 'Brooklyn'],
        propertyTypes: ['apartment', 'condo'],
        timeline: '3_months',
        notes: 'First-time buyer, needs FHA financing guidance.',
        score: 78
      },
      {
        firstName: 'David',
        lastName: 'Park',
        email: 'david.park@finance.com',
        phone: '+1-555-0104',
        source: 'google',
        status: 'tour',
        budget: 2000000,
        budgetMax: 2500000,
        preferredLocations: ['Upper East Side', 'Midtown East'],
        propertyTypes: ['penthouse', 'luxury_condo'],
        timeline: '1_month',
        notes: 'Investment banker looking for luxury penthouse. Very motivated buyer.',
        score: 98
      },
      {
        firstName: 'Lisa',
        lastName: 'Thompson',
        email: 'lisa.thompson@email.com',
        phone: '+1-555-0105',
        source: 'referral',
        status: 'offer',
        budget: 850000,
        budgetMax: 1000000,
        preferredLocations: ['Chelsea', 'Flatiron'],
        propertyTypes: ['apartment', 'condo'],
        timeline: 'immediate',
        notes: 'Made offer on 2BR Chelsea condo. Negotiating terms.',
        score: 94
      },
      {
        firstName: 'James',
        lastName: 'Williams',
        email: 'james.williams@email.com',
        phone: '+1-555-0106',
        source: 'website',
        status: 'closed',
        budget: 675000,
        budgetMax: 750000,
        preferredLocations: ['Williamsburg'],
        propertyTypes: ['apartment'],
        timeline: 'immediate',
        notes: 'Successfully closed on Williamsburg 1BR. Referred 2 friends.',
        score: 89
      },
      {
        firstName: 'Anna',
        lastName: 'Garcia',
        email: 'anna.garcia@email.com',
        phone: '+1-555-0107',
        source: 'phone',
        status: 'nurturing',
        budget: 300000,
        budgetMax: 400000,
        preferredLocations: ['Bronx', 'Queens'],
        propertyTypes: ['apartment'],
        timeline: '6_months',
        notes: 'Young professional, saving for larger down payment.',
        score: 65
      },
      {
        firstName: 'Robert',
        lastName: 'Kim',
        email: 'robert.kim@email.com',
        phone: '+1-555-0108',
        source: 'social_media',
        status: 'qualified',
        budget: 1800000,
        budgetMax: 2200000,
        preferredLocations: ['Upper West Side', 'Lincoln Center'],
        propertyTypes: ['penthouse', 'luxury_apartment'],
        timeline: '2_months',
        notes: 'Doctor looking for family home near Lincoln Center.',
        score: 91
      }
    ];

    // Comprehensive properties with realistic pricing
    const properties = [
      {
        title: 'Luxury Penthouse with City Views',
        address: '432 Park Avenue, PH-A',
        city: 'New York',
        state: 'NY', 
        zipCode: '10016',
        propertyType: 'penthouse',
        status: 'available',
        price: 2850000,
        bedrooms: 3,
        bathrooms: 3.5,
        squareFeet: 2800,
        yearBuilt: 2019,
        description: 'Ultra-luxury penthouse with panoramic city views, chef\'s kitchen, and private terrace.',
        features: ['City Views', 'Private Terrace', 'Chef Kitchen', 'Concierge', 'Gym'],
        commission: 2.5
      },
      {
        title: 'Modern Chelsea Loft',
        address: '175 10th Avenue, Unit 12B',
        city: 'New York',
        state: 'NY',
        zipCode: '10011',
        propertyType: 'loft',
        status: 'available', 
        price: 1650000,
        bedrooms: 2,
        bathrooms: 2.0,
        squareFeet: 1850,
        yearBuilt: 2015,
        description: 'Stunning modern loft in prime Chelsea location with high ceilings and industrial details.',
        features: ['High Ceilings', 'Exposed Brick', 'Modern Kitchen', 'Rooftop Access'],
        commission: 3.0
      },
      {
        title: 'Tribeca Family Residence',
        address: '56 Leonard Street, 8A',
        city: 'New York',
        state: 'NY',
        zipCode: '10013', 
        propertyType: 'apartment',
        status: 'pending',
        price: 3200000,
        bedrooms: 4,
        bathrooms: 3.5,
        squareFeet: 2400,
        yearBuilt: 2018,
        description: 'Elegant family residence in prestigious Tribeca with top-tier finishes.',
        features: ['Hudson River Views', 'Master Suite', 'Home Office', 'Storage'],
        commission: 2.0
      },
      {
        title: 'Brooklyn Heights Historic Townhouse',
        address: '85 Remsen Street',
        city: 'Brooklyn',
        state: 'NY',
        zipCode: '11201',
        propertyType: 'townhouse',
        status: 'available',
        price: 4500000,
        bedrooms: 5,
        bathrooms: 4.5,
        squareFeet: 4200,
        lotSize: 0.15,
        yearBuilt: 1890,
        description: 'Meticulously restored historic townhouse with modern amenities and garden.',
        features: ['Historic Details', 'Private Garden', 'Modern Kitchen', 'Wine Cellar'],
        commission: 2.5
      },
      {
        title: 'Upper East Side Classic Six',
        address: '740 Park Avenue, 4B',
        city: 'New York',
        state: 'NY',
        zipCode: '10021',
        propertyType: 'apartment',
        status: 'sold',
        price: 2100000,
        bedrooms: 3,
        bathrooms: 2.5,
        squareFeet: 1900,
        yearBuilt: 1925,
        description: 'Pre-war classic six with original details and park views.',
        features: ['Park Views', 'Pre-war Details', 'Doorman', 'Central Park Access'],
        commission: 3.0
      },
      {
        title: 'Williamsburg Waterfront Condo',
        address: '1 Grand Street, 15F',
        city: 'Brooklyn',
        state: 'NY',
        zipCode: '11249',
        propertyType: 'condo',
        status: 'available',
        price: 1250000,
        bedrooms: 2,
        bathrooms: 2.0,
        squareFeet: 1400,
        yearBuilt: 2020,
        description: 'Brand new waterfront condo with Manhattan skyline views and luxury amenities.',
        features: ['Manhattan Views', 'Waterfront', 'Pool', 'Fitness Center', 'Rooftop'],
        commission: 3.5
      }
    ];

    // Comprehensive deals with revenue
    const deals = [
      {
        leadId: null, // Will be set after leads are created
        propertyId: null, // Will be set after properties are created
        status: 'closed',
        offerAmount: 2100000,
        finalPrice: 2050000,
        commission: 61500, // 3% of final price
        expectedCloseDate: new Date('2024-01-15'),
        actualCloseDate: new Date('2024-01-12'),
        notes: 'Smooth closing, buyer very satisfied'
      },
      {
        leadId: null,
        propertyId: null,
        status: 'under_contract',
        offerAmount: 1650000,
        finalPrice: 1625000,
        commission: 48750, // 3% estimated
        expectedCloseDate: new Date('2024-02-28'),
        notes: 'In attorney review, expecting smooth close'
      },
      {
        leadId: null,
        propertyId: null,
        status: 'negotiating',
        offerAmount: 2800000,
        commission: 70000, // 2.5% estimated  
        expectedCloseDate: new Date('2024-03-15'),
        notes: 'Multiple offers, negotiating best terms'
      }
    ];

    // Comprehensive tasks
    const tasks = [
      {
        title: 'Follow up with Emma Rodriguez - Manhattan viewing',
        description: 'Schedule viewing of 3 Manhattan properties, send comparable market analysis',
        type: 'call',
        priority: 'high',
        status: 'pending',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      {
        title: 'Prepare listing presentation for Tribeca property', 
        description: 'Create marketing materials and pricing strategy for new Tribeca listing',
        type: 'document',
        priority: 'high',
        status: 'pending',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Contract review - Chelsea loft deal',
        description: 'Review purchase agreement with attorney for Chelsea loft transaction',
        type: 'meeting',
        priority: 'medium',
        status: 'in_progress',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Property showing - Brooklyn Heights townhouse',
        description: 'Conduct showing for high-net-worth client interested in historic property',
        type: 'visit',
        priority: 'high',
        status: 'pending',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Market analysis - Upper West Side comparables',
        description: 'Research recent sales for client considering UWS purchase',
        type: 'research',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Client check-in call - Recent buyer referral program',
        description: 'Follow up with recent buyers about referral opportunities',
        type: 'call',
        priority: 'low',
        status: 'completed',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ];

    // Create leads first
    const createdLeads = [];
    for (const leadData of leads) {
      try {
        const lead = await storage.createLead(leadData);
        createdLeads.push(lead);
        console.log(`✅ Created lead: ${leadData.firstName} ${leadData.lastName}`);
      } catch (err) {
        console.log(`❌ Error creating lead ${leadData.firstName}: ${(err as Error).message}`);
      }
    }

    // Create properties
    const createdProperties = [];
    for (const propertyData of properties) {
      try {
        const property = await storage.createProperty(propertyData);
        createdProperties.push(property);
        console.log(`✅ Created property: ${propertyData.title}`);
      } catch (err) {
        console.log(`❌ Error creating property ${propertyData.title}: ${(err as Error).message}`);
      }
    }

    // Create deals with proper lead/property relationships
    if (createdLeads.length > 0 && createdProperties.length > 0) {
      deals[0].leadId = createdLeads[5]?.id; // James Williams (closed deal)
      deals[0].propertyId = createdProperties[4]?.id; // Upper East Side (sold)
      deals[0].dealValue = deals[0].finalPrice || deals[0].offerAmount;
      
      deals[1].leadId = createdLeads[4]?.id; // Lisa Thompson (offer status)
      deals[1].propertyId = createdProperties[1]?.id; // Chelsea Loft
      deals[1].dealValue = deals[1].finalPrice || deals[1].offerAmount;
      
      deals[2].leadId = createdLeads[1]?.id; // Michael Chen (qualified)
      deals[2].propertyId = createdProperties[0]?.id; // Luxury Penthouse
      deals[2].dealValue = deals[2].offerAmount;
    }

    for (const dealData of deals) {
      try {
        const deal = await storage.createDeal(dealData);
        console.log(`✅ Created deal: ${dealData.status} - $${dealData.offerAmount?.toLocaleString()}`);
      } catch (err) {
        console.log(`❌ Error creating deal: ${(err as Error).message}`);
      }
    }

    // Create tasks
    for (const taskData of tasks) {
      try {
        const task = await storage.createTask(taskData);
        console.log(`✅ Created task: ${taskData.title}`);
      } catch (err) {
        console.log(`❌ Error creating task ${taskData.title}: ${(err as Error).message}`);
      }
    }

    console.log('🎉 Comprehensive demo data seeded successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • ${createdLeads.length} leads created (various stages)`);
    console.log(`   • ${createdProperties.length} properties created ($${properties.reduce((sum, p) => sum + p.price, 0).toLocaleString()} total value)`);
    console.log(`   • ${deals.length} deals created ($${deals.reduce((sum, d) => sum + (d.commission || 0), 0).toLocaleString()} commission)`);
    console.log(`   • ${tasks.length} tasks created`);
    console.log(`   • Total projected revenue: $${deals.reduce((sum, d) => sum + (d.commission || 0), 0).toLocaleString()}`);

  } catch (error) {
    console.error('❌ Error seeding comprehensive data:', error);
  }
}

// Run if called directly
seedComprehensiveData().then(() => process.exit(0));

export { seedComprehensiveData };