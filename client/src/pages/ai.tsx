import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import NativeHeader from "@/components/native/native-header";
import { 
  Bot, 
  User, 
  Send, 
  Mic, 
  TrendingUp, 
  Home as HomeIcon, 
  Users, 
  Building,
  BarChart3,
  ArrowRight,
  Eye,
  Mail,
  Calendar,
  Share,
  Edit,
  MessageSquare,
  Phone,
  CheckCircle,
  DollarSign
} from "lucide-react";

interface Message {
  id: number;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  actions?: Array<{
    label: string;
    action: string;
    variant?: "default" | "outline" | "secondary";
  }>;
}

interface InsightCard {
  id: string;
  title: string;
  value: string;
  change?: string;
  icon: any;
  color: string;
  action: string;
}

export default function AIAssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current data for insights
  const { data: leads } = useQuery({
    queryKey: ["/api/leads"],
  });

  const { data: properties } = useQuery({
    queryKey: ["/api/properties"],
  });

  const { data: deals } = useQuery({
    queryKey: ["/api/deals"],
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics/detailed"],
  });

  // AI Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await apiRequest("/api/ai/chat", {
        method: "POST",
        body: { 
          message: userMessage, 
          context: { 
            page: "ai-assistant",
            data: { leads, properties, deals, analytics }
          } 
        },
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      console.log("AI Response received:", data);
      const aiResponse: Message = {
        id: Date.now(),
        type: "ai",
        content: data.response || data.message || "I'm here to help! What would you like to know?",
        timestamp: new Date(),
        actions: generateActionButtons(data.response || data.message || "")
      };
      setMessages(prev => [...prev, aiResponse]);
    },
    onError: (error: any) => {
      console.error("AI Chat Error:", error);
      const errorResponse: Message = {
        id: Date.now(),
        type: "ai", 
        content: `I'm experiencing some technical difficulties. Please try again in a moment. (Error: ${error.message || 'Unknown error'})`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    }
  });

  // Generate insight cards based on current data
  const getInsightCards = (): InsightCard[] => {
    const hotLeads = Array.isArray(leads) ? leads.filter((lead: any) => lead.score > 80)?.length : 0;
    const matchedProperties = Array.isArray(properties) ? properties.filter((prop: any) => prop.status === 'available')?.length : 0;
    const conversionRate = analytics?.conversionRate || 0;
    const recentChange = analytics?.conversionRateChange || 0;
    
    return [
      {
        id: "hot-leads",
        title: "Hot Leads",
        value: hotLeads.toString(),
        icon: TrendingUp,
        color: "bg-red-500",
        action: "View All"
      },
      {
        id: "matched-props",
        title: "Matched Props",
        value: matchedProperties.toString(),
        icon: Building,
        color: "bg-blue-500",
        action: "Explore"
      },
      {
        id: "conv-rate",
        title: "Conv Rate",
        value: `${conversionRate}%`,
        change: recentChange > 0 ? `+${recentChange}%` : `${recentChange}%`,
        icon: BarChart3,
        color: "bg-green-500",
        action: "Details"
      }
    ];
  };

  const insightCards = getInsightCards();

  // Quick prompt suggestions
  const quickPrompts = [
    { label: "Hot Leads", query: "Show me my hottest leads today" },
    { label: "Properties under $800K", query: "Find properties under $800,000" },
    { label: "Recent Visits", query: "What property visits happened recently?" },
    { label: "Recent Activity", query: "Show me recent lead activity" },
    { label: "Conversion Trends", query: "Analyze my conversion trends" },
    { label: "Revenue Forecast", query: "What's my revenue forecast?" }
  ];

  // Generate action buttons for AI responses
  const generateActionButtons = (content: string) => {
    const actions = [];
    
    if (content.toLowerCase().includes('lead')) {
      actions.push({ label: "Show Top 5 Leads", action: "show-leads", variant: "default" as const });
      actions.push({ label: "Email Summary", action: "email-summary", variant: "outline" as const });
    }
    
    if (content.toLowerCase().includes('property') || content.toLowerCase().includes('properties')) {
      actions.push({ label: "View Details", action: "view-properties", variant: "default" as const });
      actions.push({ label: "Share via WhatsApp", action: "share-whatsapp", variant: "outline" as const });
    }
    
    if (content.toLowerCase().includes('draft') || content.toLowerCase().includes('message')) {
      actions.push({ label: "Edit & Send", action: "edit-send", variant: "default" as const });
      actions.push({ label: "Schedule Message", action: "schedule", variant: "outline" as const });
    }
    
    return actions;
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(message);
    setMessage("");
  };

  const handleQuickPrompt = (query: string) => {
    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: query,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(query);
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // Voice input implementation would go here
  };

  const getDynamicGreeting = () => {
    const hour = new Date().getHours();
    const hotLeadsCount = Array.isArray(leads) ? leads.filter((lead: any) => lead.score > 80)?.length : 0;
    
    let greeting = "Good ";
    if (hour < 12) greeting += "morning";
    else if (hour < 17) greeting += "afternoon";
    else greeting += "evening";
    
    greeting += `, ${(user as any)?.firstName || 'there'}! 👋`;
    
    if (hotLeadsCount > 0) {
      greeting += `\nI've spotted ${hotLeadsCount} leads trending up today.`;
    } else {
      greeting += `\nReady to boost your real estate business today?`;
    }
    
    return greeting;
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial AI greeting
  useEffect(() => {
    if (messages.length === 0) {
      const greeting: Message = {
        id: 0,
        type: "ai",
        content: getDynamicGreeting(),
        timestamp: new Date(),
        actions: [
          { label: "Show Top Leads", action: "show-leads", variant: "default" },
          { label: "Today's Tasks", action: "show-tasks", variant: "outline" }
        ]
      };
      setMessages([greeting]);
    }
  }, [user, leads]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NativeHeader 
        title="AI Assistant" 
        showBack={true}
        onBack={() => window.history.back()}
      />
      
      <div className="p-4 space-y-4 pb-20">
        {/* Dynamic Greeting Card */}
        <Card className="bg-gradient-to-r from-primary-500 to-purple-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-relaxed whitespace-pre-line">
                  {getDynamicGreeting()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Insight Cards */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 px-1">
            Quick Insights
          </h3>
          <ScrollArea className="w-full">
            <div className="flex space-x-3 pb-2">
              {insightCards.map((card) => {
                const IconComponent = card.icon;
                return (
                  <Card key={card.id} className="flex-shrink-0 w-32 bg-white dark:bg-gray-800">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-6 h-6 ${card.color} rounded-full flex items-center justify-center`}>
                          <IconComponent className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400">{card.title}</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{card.value}</p>
                        {card.change && (
                          <p className={`text-xs ${card.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                            {card.change}
                          </p>
                        )}
                        <Button variant="ghost" size="sm" className="h-6 text-xs p-1 w-full">
                          {card.action} <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Conversation Area */}
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Conversation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-80 w-full pr-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start space-x-3 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className={`${
                          msg.type === 'user' 
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                            : 'bg-gradient-to-r from-primary-500 to-purple-600 text-white'
                        }`}>
                          {msg.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <div className={`px-4 py-3 rounded-lg ${
                          msg.type === 'user'
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}>
                          <p className="text-sm whitespace-pre-line">{msg.content}</p>
                        </div>
                        {msg.actions && msg.actions.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {msg.actions.map((action, index) => (
                              <Button
                                key={index}
                                variant={action.variant || "outline"}
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => console.log(`Action: ${action.action}`)}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {chatMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-to-r from-primary-500 to-purple-600 text-white">
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Smart Prompt Chips */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 px-1">
            Smart Prompts
          </h3>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => handleQuickPrompt(prompt.query)}
              >
                {prompt.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className={`flex-shrink-0 ${isListening ? 'bg-red-100 text-red-600' : ''}`}
            onClick={handleVoiceInput}
          >
            <Mic className="w-4 h-4" />
          </Button>
          <div className="flex-1 relative">
            <Input
              placeholder="Type your question..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="pr-12"
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!message.trim() || chatMutation.isPending}
              className="absolute right-1 top-1 bottom-1 w-8 h-8"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}