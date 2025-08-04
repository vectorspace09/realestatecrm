import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import ResponsiveHeader from "@/components/layout/responsive-header";
import MobileBottomTabs from "@/components/layout/mobile-bottom-tabs";
import { 
  Brain, 
  Send, 
  TrendingUp, 
  Users, 
  Building, 
  CheckCircle,
  MessageSquare,
  Loader2,
  Zap,
  BarChart3,
  Target,
  Clock
} from "lucide-react";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  query: string;
  category: string;
}

const quickActions: QuickAction[] = [
  {
    id: "hot-leads",
    label: "Show Hot Leads",
    icon: <Target className="w-4 h-4" />,
    query: "Show me my hottest leads with scores above 80",
    category: "leads"
  },
  {
    id: "pipeline-summary",
    label: "Pipeline Summary",
    icon: <BarChart3 className="w-4 h-4" />,
    query: "Give me a summary of my current deal pipeline",
    category: "deals"
  },
  {
    id: "properties-under-budget",
    label: "Budget Properties",
    icon: <Building className="w-4 h-4" />,
    query: "Show properties under $500k available now",
    category: "properties"
  },
  {
    id: "pending-tasks",
    label: "Pending Tasks",
    icon: <CheckCircle className="w-4 h-4" />,
    query: "What tasks do I need to complete today?",
    category: "tasks"
  },
  {
    id: "revenue-analysis",
    label: "Revenue Analysis",
    icon: <TrendingUp className="w-4 h-4" />,
    query: "Analyze my revenue and conversion rates",
    category: "analytics"
  },
  {
    id: "lead-recommendations",
    label: "Lead Recommendations",
    icon: <Users className="w-4 h-4" />,
    query: "Give me actionable recommendations for my leads",
    category: "leads"
  }
];

export default function AIRedesigned() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "ai",
      content: "Hi! I'm your AI-powered real estate assistant. I can help you analyze leads, track deals, find properties, and provide business insights. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get business data for AI context
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

  // AI Chat mutation with proper error handling
  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const context = {
        page: 'ai-assistant',
        data: {
          leadsCount: Array.isArray(leads) ? leads.length : 0,
          propertiesCount: Array.isArray(properties) ? properties.length : 0,
          dealsCount: Array.isArray(deals) ? deals.length : 0,
          hasAnalytics: !!analytics
        }
      };
      
      return await apiRequest("/api/ai/chat", {
        method: "POST",
        body: { message: userMessage, context },
      });
    },
    onSuccess: (data: any) => {
      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: data.response || "I'm here to help! What would you like to know?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    },
    onError: (error) => {
      console.error("AI Chat Error:", error);
      const errorResponse: Message = {
        id: `error-${Date.now()}`,
        type: "ai",
        content: "I'm experiencing some technical difficulties. Please try asking your question again, or use the quick actions below to get specific information.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    }
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim() || chatMutation.isPending) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(inputMessage);
    setInputMessage("");
  };

  const handleQuickAction = (action: QuickAction) => {
    if (chatMutation.isPending) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: action.query,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(action.query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveHeader />
      <div className="container mx-auto p-4 max-w-6xl pt-20 lg:pt-6 pb-20 lg:pb-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Brain className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Assistant</h1>
              <p className="text-muted-foreground">Your intelligent real estate business partner</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Quick Actions Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <Zap className="w-4 h-4 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-auto p-3 text-left hover:bg-accent"
                    onClick={() => handleQuickAction(action)}
                    disabled={chatMutation.isPending}
                  >
                    <div className="flex items-start space-x-2">
                      <div className="mt-0.5">{action.icon}</div>
                      <div>
                        <div className="font-medium text-xs">{action.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {action.category}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Business Stats */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Leads</span>
                  <Badge variant="secondary">{Array.isArray(leads) ? leads.length : 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Properties</span>
                  <Badge variant="secondary">{Array.isArray(properties) ? properties.length : 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Deals</span>
                  <Badge variant="secondary">{Array.isArray(deals) ? deals.length : 0}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Conversation
                  {chatMutation.isPending && (
                    <Loader2 className="w-4 h-4 ml-2 animate-spin text-blue-500" />
                  )}
                </CardTitle>
              </CardHeader>
              
              <Separator />
              
              {/* Messages */}
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.type === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-accent text-accent-foreground'
                          }`}
                        >
                          <div className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </div>
                          <div className={`text-xs mt-1 opacity-70 ${
                            message.type === 'user' ? 'text-blue-100' : 'text-muted-foreground'
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Typing indicator */}
                    {chatMutation.isPending && (
                      <div className="flex justify-start">
                        <div className="bg-accent rounded-lg p-3">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>
              
              <Separator />
              
              {/* Input */}
              <div className="p-4 flex-shrink-0">
                <div className="flex space-x-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask about your leads, properties, deals, or get business insights..."
                    onKeyPress={handleKeyPress}
                    disabled={chatMutation.isPending}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || chatMutation.isPending}
                    size="icon"
                  >
                    {chatMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <MobileBottomTabs />
    </div>
  );
}