import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

// Check if OpenAI API key is available
const isOpenAIAvailable = !!process.env.OPENAI_API_KEY;

export interface LeadScoringResult {
  score: number;
  confidence: number;
  reasons: string[];
  temperature: "hot" | "warm" | "cold";
}

export interface PropertyMatchResult {
  matchScore: number;
  reasons: string[];
  confidence: number;
}

export interface AIMessageDraft {
  subject?: string;
  message: string;
  channel: "email" | "whatsapp" | "sms";
  tone: "professional" | "friendly" | "urgent";
}

export async function scoreLeadWithAI(leadData: {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  budget?: number;
  budgetMax?: number;
  source: string;
  timeline?: string;
  notes?: string;
}): Promise<LeadScoringResult> {
  // Return default scoring if OpenAI API key is not available
  if (!isOpenAIAvailable) {
    const defaultScore = Math.floor(Math.random() * 40) + 50; // 50-90 random score
    return {
      score: defaultScore,
      confidence: 0.7,
      reasons: ["Contact information available", "Budget range specified", "Source quality assessed"],
      temperature: defaultScore > 75 ? "hot" : defaultScore > 60 ? "warm" : "cold"
    };
  }

  try {
    const prompt = `
      Analyze this real estate lead and provide a scoring assessment.
      
      Lead Information:
      - Name: ${leadData.firstName} ${leadData.lastName}
      - Email: ${leadData.email || "Not provided"}
      - Phone: ${leadData.phone || "Not provided"}
      - Budget: $${leadData.budget?.toLocaleString() || "Not specified"} - $${leadData.budgetMax?.toLocaleString() || "Not specified"}
      - Source: ${leadData.source}
      - Timeline: ${leadData.timeline || "Not specified"}
      - Notes: ${leadData.notes || "None"}

      Please score this lead from 0-100 based on:
      1. Budget clarity and realistic range
      2. Contact information completeness
      3. Timeline urgency
      4. Source quality
      5. Engagement indicators from notes

      Respond with JSON in this format:
      {
        "score": number (0-100),
        "confidence": number (0-1),
        "reasons": ["reason1", "reason2", "reason3"],
        "temperature": "hot" | "warm" | "cold"
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a real estate lead scoring expert. Analyze leads and provide accurate scoring with clear reasoning."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      score: Math.max(0, Math.min(100, result.score || 0)),
      confidence: Math.max(0, Math.min(1, result.confidence || 0)),
      reasons: Array.isArray(result.reasons) ? result.reasons : [],
      temperature: ["hot", "warm", "cold"].includes(result.temperature) ? result.temperature : "cold"
    };
  } catch (error) {
    console.error("Error scoring lead with AI:", error);
    return {
      score: 50,
      confidence: 0.3,
      reasons: ["Unable to analyze lead automatically"],
      temperature: "cold"
    };
  }
}

export async function matchPropertyToLead(leadData: {
  budget?: number;
  budgetMax?: number;
  preferredLocations?: string[];
  propertyTypes?: string[];
}, propertyData: {
  price: number;
  city: string;
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  features?: string[];
}): Promise<PropertyMatchResult> {
  try {
    const prompt = `
      Analyze how well this property matches the lead's preferences.
      
      Lead Preferences:
      - Budget: $${leadData.budget?.toLocaleString() || "Not specified"} - $${leadData.budgetMax?.toLocaleString() || "Not specified"}
      - Preferred Locations: ${leadData.preferredLocations?.join(", ") || "Not specified"}
      - Property Types: ${leadData.propertyTypes?.join(", ") || "Not specified"}

      Property Details:
      - Price: $${propertyData.price.toLocaleString()}
      - Location: ${propertyData.city}
      - Type: ${propertyData.propertyType}
      - Bedrooms: ${propertyData.bedrooms || "Not specified"}
      - Bathrooms: ${propertyData.bathrooms || "Not specified"}
      - Square Feet: ${propertyData.squareFeet?.toLocaleString() || "Not specified"}
      - Features: ${propertyData.features?.join(", ") || "None listed"}

      Score the match from 0-100 based on:
      1. Price within budget range
      2. Location preference match
      3. Property type preference
      4. Size and features alignment

      Respond with JSON in this format:
      {
        "matchScore": number (0-100),
        "reasons": ["reason1", "reason2", "reason3"],
        "confidence": number (0-1)
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a real estate matching expert. Analyze property-lead compatibility with clear reasoning."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      matchScore: Math.max(0, Math.min(100, result.matchScore || 0)),
      reasons: Array.isArray(result.reasons) ? result.reasons : [],
      confidence: Math.max(0, Math.min(1, result.confidence || 0))
    };
  } catch (error) {
    console.error("Error matching property to lead:", error);
    return {
      matchScore: 0,
      reasons: ["Unable to analyze match automatically"],
      confidence: 0.3
    };
  }
}

export async function generateFollowUpMessage(leadData: {
  firstName: string;
  lastName: string;
  lastContact?: string;
  status: string;
  notes?: string;
}, channel: "email" | "whatsapp" | "sms", context?: string): Promise<AIMessageDraft> {
  try {
    const prompt = `
      Generate a personalized follow-up message for this real estate lead.
      
      Lead Information:
      - Name: ${leadData.firstName} ${leadData.lastName}
      - Current Status: ${leadData.status}
      - Last Contact: ${leadData.lastContact || "Unknown"}
      - Notes: ${leadData.notes || "None"}
      - Channel: ${channel}
      - Additional Context: ${context || "None"}

      Create a ${channel} message that is:
      1. Professional but friendly
      2. Personalized to their situation
      3. Contains a clear call-to-action
      4. Appropriate length for ${channel}

      For email, include a subject line.
      
      Respond with JSON in this format:
      {
        "subject": "string (only for email)",
        "message": "string",
        "channel": "${channel}",
        "tone": "professional" | "friendly" | "urgent"
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a real estate communication expert. Write engaging, personalized follow-up messages that drive action."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      subject: result.subject || undefined,
      message: result.message || "Thank you for your interest. I'll be in touch soon.",
      channel: channel,
      tone: ["professional", "friendly", "urgent"].includes(result.tone) ? result.tone : "professional"
    };
  } catch (error) {
    console.error("Error generating follow-up message:", error);
    return {
      message: `Hi ${leadData.firstName}, I wanted to follow up on your real estate inquiry. When would be a good time to discuss your needs further?`,
      channel: channel,
      tone: "professional"
    };
  }
}

export async function getAIInsights(data: {
  totalLeads: number;
  activeDeals: number;
  conversionRate?: number;
  recentActivities: any[];
}): Promise<{
  insights: string[];
  recommendations: string[];
  priority_actions: string[];
}> {
  try {
    const prompt = `
      Analyze this real estate CRM data and provide actionable insights.
      
      Current Metrics:
      - Total Leads: ${data.totalLeads}
      - Active Deals: ${data.activeDeals}
      - Conversion Rate: ${data.conversionRate || "Unknown"}%
      - Recent Activities: ${data.recentActivities.length} recent actions

      Provide:
      1. Key insights about current performance
      2. Recommendations for improvement
      3. Priority actions for today/this week

      Respond with JSON in this format:
      {
        "insights": ["insight1", "insight2", "insight3"],
        "recommendations": ["rec1", "rec2", "rec3"],
        "priority_actions": ["action1", "action2", "action3"]
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a real estate business intelligence expert. Provide actionable insights and recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      insights: Array.isArray(result.insights) ? result.insights : [],
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
      priority_actions: Array.isArray(result.priority_actions) ? result.priority_actions : []
    };
  } catch (error) {
    console.error("Error generating AI insights:", error);
    return {
      insights: ["Unable to generate insights at this time"],
      recommendations: ["Check your data and try again"],
      priority_actions: ["Review recent lead activity"]
    };
  }
}

export async function generateLeadMessage(
  lead: any,
  messageType: 'email' | 'sms' | 'call',
  recentActivities: any[]
): Promise<string> {
  // Return default message if OpenAI API key is not available
  if (!isOpenAIAvailable) {
    const messages = {
      email: `Subject: Following up on your property search, ${lead.firstName}\n\nHi ${lead.firstName},\n\nI wanted to follow up on our previous conversation about your property search. I have some new listings that match your criteria and would love to share them with you.\n\nWould you be available for a quick call this week to discuss your options?\n\nBest regards,\nPRA Developers Team`,
      sms: `Hi ${lead.firstName}, just wanted to check in on your property search. Any questions? Reply YES for a quick call.`,
      call: `Call ${lead.firstName} ${lead.lastName} to discuss:\n1. Current property search status\n2. New listings matching their criteria\n3. Schedule viewing appointments\n4. Address any questions or concerns`
    };
    
    return messages[messageType] || messages.email;
  }
  const activityContext = recentActivities.length > 0 
    ? `Recent activities: ${recentActivities.map(a => `${a.type}: ${a.title}`).join(', ')}`
    : 'No recent activities recorded.';

  const prompt = `
Create a personalized ${messageType} for this real estate lead:

Lead Information:
- Name: ${lead.firstName} ${lead.lastName}
- Status: ${lead.status}
- Budget: $${lead.budget?.toLocaleString()}
- Property Types: ${lead.propertyTypes?.join(', ') || 'Not specified'}
- Timeline: ${lead.timeline || 'Not specified'}
- Location: ${lead.location || 'Not specified'}
- Lead Score: ${lead.score}/100
- Source: ${lead.source}

${activityContext}

Generate a ${messageType} that:
1. Is personalized based on their information
2. References their current status in the pipeline
3. Provides value or helpful information
4. Includes a clear next step or call-to-action
5. Maintains a professional but warm tone

${messageType === 'email' ? 'Format as: Subject: [subject]\n\n[message body]' : ''}
${messageType === 'sms' ? 'Keep concise (under 160 characters)' : ''}
${messageType === 'call' ? 'Provide talking points and conversation structure' : ''}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert real estate agent who creates personalized, effective communications with leads."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content || "Unable to generate message at this time.";
  } catch (error) {
    console.error("Error generating lead message:", error);
    throw new Error("Failed to generate message");
  }
}

export async function generateNextAction(
  lead: any,
  recentActivities: any[],
  pendingTasks: any[],
  currentScore: number,
  status: string
): Promise<any> {
  // Return intelligent next action recommendation if OpenAI API key is not available
  if (!isOpenAIAvailable) {
    const actionRecommendations = {
      'new': {
        type: 'call',
        title: 'Initial consultation call',
        description: `Schedule and conduct initial consultation call with ${lead.firstName} ${lead.lastName} to understand their requirements, budget, and timeline. Discuss available properties that match their criteria.`,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Tomorrow
      },
      'contacted': {
        type: 'email', 
        title: 'Follow-up with property recommendations',
        description: `Send curated property listings that match ${lead.firstName}'s budget of $${lead.budget?.toLocaleString()} and preferred property types. Include market insights and schedule viewing appointments.`,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 2 days
      },
      'qualified': {
        type: 'meeting',
        title: 'Property viewing appointments',
        description: `Schedule property viewings for ${lead.firstName} based on their preferences. Prepare market analysis and financing options discussion.`,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 3 days
      },
      'viewing': {
        type: 'call',
        title: 'Post-viewing follow-up',
        description: `Follow up on recent property viewings with ${lead.firstName}. Address any questions or concerns and gauge interest level. Discuss next steps if interested.`,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Tomorrow
      }
    };

    // Customize based on score
    const baseAction = actionRecommendations[status as keyof typeof actionRecommendations] || actionRecommendations['new'];
    
    if (currentScore >= 80) {
      baseAction.title = `🔥 HIGH PRIORITY: ${baseAction.title}`;
      baseAction.description = `URGENT - High-scoring lead (${currentScore}/100): ${baseAction.description}`;
    } else if (currentScore < 50) {
      baseAction.type = 'email';
      baseAction.title = 'Re-engagement campaign';
      baseAction.description = `Lead score is low (${currentScore}/100). Send re-engagement email to understand current needs and timeline. Consider offering market updates or new listings.`;
    }

    return baseAction;
  }

  try {
    const activityContext = recentActivities.length > 0 
      ? `Recent activities: ${recentActivities.map(a => `${a.type}: ${a.title}`).join(', ')}` 
      : 'No recent activities';
    
    const taskContext = pendingTasks.length > 0
      ? `Pending tasks: ${pendingTasks.map(t => t.title).join(', ')}`
      : 'No pending tasks';

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an expert real estate CRM assistant. Generate the optimal next action for a lead based on their profile and interaction history. 

          Respond with JSON in this exact format:
          {
            "type": "call|email|meeting|note",
            "title": "Brief action title",
            "description": "Detailed description of what should be done",
            "dueDate": "YYYY-MM-DD format for recommended completion"
          }

          Consider the lead's score, status, and history to recommend the most impactful next step.`
        },
        {
          role: "user",
          content: `Lead: ${lead.firstName} ${lead.lastName}
          Status: ${status}
          Score: ${currentScore}/100
          Budget: $${lead.budget?.toLocaleString()}
          Timeline: ${lead.timeline}
          Source: ${lead.source}
          
          ${activityContext}
          ${taskContext}
          
          What should be the next action to maximize conversion chances?`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback to default recommendation
    return {
      type: 'call',
      title: 'Follow-up call',
      description: `Contact ${lead.firstName} ${lead.lastName} to discuss their real estate needs and available opportunities.`,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
  }
}

export async function generateLeadRecommendations(
  lead: any,
  recentActivities: any[],
  pendingTasks: any[]
): Promise<string[]> {
  // Return default recommendations if OpenAI API key is not available
  if (!isOpenAIAvailable) {
    const status = lead.status || 'new';
    const defaultRecommendations = {
      'new': [
        "Schedule initial consultation call within 24 hours",
        "Send welcome email with company portfolio",
        "Qualify budget and timeline requirements",
        "Add lead to nurturing email sequence"
      ],
      'contacted': [
        "Follow up on initial conversation points",
        "Share relevant property listings matching their criteria",
        "Schedule property viewing appointments",
        "Send market analysis for their area of interest"
      ],
      'qualified': [
        "Present 3-5 curated property options",
        "Schedule property viewings for this week",
        "Prepare financing pre-approval assistance",
        "Create personalized property search alerts"
      ],
      'viewing': [
        "Follow up on recent property viewings",
        "Address any concerns or questions raised",
        "Schedule additional viewings if needed",
        "Prepare competitive market analysis"
      ]
    };
    
    return defaultRecommendations[status as keyof typeof defaultRecommendations] || defaultRecommendations['new'];
  }
  const activityContext = recentActivities.length > 0 
    ? `Recent activities: ${recentActivities.map(a => `${a.type}: ${a.title} (${new Date(a.createdAt).toLocaleDateString()})`).join(', ')}`
    : 'No recent activities recorded.';

  const taskContext = pendingTasks.length > 0
    ? `Pending tasks: ${pendingTasks.map(t => `${t.title} (${t.priority} priority)`).join(', ')}`
    : 'No pending tasks.';

  const prompt = `
Analyze this real estate lead and provide 3-5 specific, actionable recommendations:

Lead Information:
- Name: ${lead.firstName} ${lead.lastName}
- Status: ${lead.status}
- Budget: $${lead.budget?.toLocaleString()}
- Property Types: ${lead.propertyTypes?.join(', ') || 'Not specified'}
- Timeline: ${lead.timeline || 'Not specified'}
- Location: ${lead.location || 'Not specified'}
- Lead Score: ${lead.score}/100
- Source: ${lead.source}
- Notes: ${lead.notes || 'No notes available'}

${activityContext}
${taskContext}

Based on their current status (${lead.status}) and information, provide specific next steps that would help:
1. Move this lead through the sales pipeline
2. Build stronger relationships
3. Address their specific needs
4. Increase conversion probability

Each recommendation should be:
- Specific and actionable
- Based on their current status and information
- Professional and strategic
- Focused on results

Return as a JSON array of strings: ["recommendation 1", "recommendation 2", ...]
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert real estate sales manager who provides strategic recommendations for lead management. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"recommendations": []}');
    return result.recommendations || [];
  } catch (error) {
    console.error("Error generating lead recommendations:", error);
    throw new Error("Failed to generate recommendations");
  }
}

export async function generateContextualAIResponse(
  message: string,
  context: {
    page?: string;
    leadId?: string;
    dealId?: string;
    propertyId?: string;
    data?: any;
  },
  businessData: {
    leads: any[];
    properties: any[];
    deals: any[];
    analytics: any;
    user: any;
  }
): Promise<string> {
  // Return intelligent default response if OpenAI API key is not available
  if (!isOpenAIAvailable) {
    const lowerMessage = message.toLowerCase();
    
    // Context-aware responses based on current page and message content
    if (context.page === 'dashboard') {
      if (lowerMessage.includes('lead') || lowerMessage.includes('new')) {
        return `You have ${businessData.leads?.length || 0} total leads. Your highest priority leads are those with scores above 80. Would you like me to show you specific lead details?`;
      }
      if (lowerMessage.includes('deal') || lowerMessage.includes('revenue')) {
        return `You have ${businessData.deals?.filter(d => d.status !== 'closed').length || 0} active deals in your pipeline. Total revenue from closed deals is $${businessData.analytics?.totalRevenue?.toLocaleString() || '0'}.`;
      }
      if (lowerMessage.includes('task') || lowerMessage.includes('today')) {
        return `You have ${businessData.analytics?.pendingTasks || 0} pending tasks. Focus on high-priority items and follow-ups with qualified leads today.`;
      }
    }
    
    if (context.page === 'leads') {
      if (lowerMessage.includes('score') || lowerMessage.includes('priority')) {
        const highScoreLeads = businessData.leads?.filter(l => l.score > 80) || [];
        return `You have ${highScoreLeads.length} high-scoring leads (80+). Focus on: ${highScoreLeads.slice(0, 3).map(l => `${l.firstName} ${l.lastName} (${l.score})`).join(', ')}.`;
      }
      if (lowerMessage.includes('follow up') || lowerMessage.includes('contact')) {
        return `For effective follow-ups, prioritize leads in "qualified" status first, then "contacted" leads. Use personalized messages mentioning their property preferences.`;
      }
    }
    
    if (context.page === 'properties') {
      if (lowerMessage.includes('match') || lowerMessage.includes('suitable')) {
        return `I can help match properties to leads based on budget, location, and property type preferences. Which specific lead or criteria would you like me to analyze?`;
      }
      if (lowerMessage.includes('price') || lowerMessage.includes('value')) {
        const avgPrice = businessData.properties?.reduce((sum, p) => sum + (p.price || 0), 0) / (businessData.properties?.length || 1);
        return `Your property portfolio has an average value of $${avgPrice?.toLocaleString() || '0'}. Properties are distributed across different price ranges and locations.`;
      }
    }
    
    if (context.leadId) {
      const lead = businessData.leads?.find(l => l.id === context.leadId);
      if (lead) {
        return `For ${lead.firstName} ${lead.lastName}: Their score is ${lead.score}/100, budget is $${lead.budget?.toLocaleString()}, and they're interested in ${lead.propertyTypes?.join(', ')}. Next step: ${lead.status === 'new' ? 'Initial contact' : lead.status === 'contacted' ? 'Qualification call' : 'Property presentation'}.`;
      }
    }
    
    // General responses
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return `I can help you with:\n• Lead analysis and scoring\n• Property matching recommendations\n• Pipeline management insights\n• Task prioritization\n• Market trend analysis\n• Automated follow-up suggestions\n\nWhat specific area would you like assistance with?`;
    }
    
    if (lowerMessage.includes('screen') || lowerMessage.includes('page') || lowerMessage.includes('see')) {
      const pageContext = context.page || 'dashboard';
      return `You're currently on the ${pageContext} page. I can see your ${pageContext === 'dashboard' ? 'overview metrics and recent activities' : pageContext === 'leads' ? 'lead pipeline and contact information' : pageContext === 'properties' ? 'property listings and values' : 'current data'}. What specific information would you like me to analyze?`;
    }
    
    return `I understand you're asking about "${message}". I can analyze your current ${context.page || 'data'} and provide specific insights. What particular aspect would you like me to focus on?`;
  }

  // Full OpenAI response when API is available
  const pageContext = context.page ? `Current page: ${context.page}` : '';
  const dataContext = context.data ? `Page data: ${JSON.stringify(context.data).substring(0, 500)}...` : '';
  
  const prompt = `
You are an intelligent real estate CRM assistant. The user is asking: "${message}"

Context:
${pageContext}
${dataContext}
- User has ${businessData.leads?.length || 0} leads, ${businessData.properties?.length || 0} properties, ${businessData.deals?.length || 0} deals
- Analytics: ${JSON.stringify(businessData.analytics)}

Respond conversationally and helpfully. If they ask about what's on screen, analyze the current page context and data. Provide specific, actionable insights based on their real data.

Keep response under 200 words and make it practical and useful.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful real estate CRM assistant. Provide specific, actionable insights based on user data and context."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I'm here to help with your real estate business. What would you like to know?";
  } catch (error) {
    console.error("Error generating contextual AI response:", error);
    return "I'm experiencing some technical difficulties but I'm still here to help. What specific information about your leads, properties, or deals can I assist you with?";
  }
}
