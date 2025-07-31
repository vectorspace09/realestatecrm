import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

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

export async function generateLeadRecommendations(
  lead: any,
  recentActivities: any[],
  pendingTasks: any[]
): Promise<string[]> {
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
