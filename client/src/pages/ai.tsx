import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import ResponsiveHeader from "@/components/layout/responsive-header";
import MobileBottomTabs from "@/components/layout/mobile-bottom-tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { 
  Bot, 
  User, 
  Send, 
  Zap, 
  Search,
  TrendingUp,
  Users,
  Building,
  DollarSign,
  Star,
  AlertCircle,
  Lightbulb,
  Target,
  BarChart3,
  MessageSquare
} from "lucide-react";

export default function AIAssistant() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content: "Hello! I'm your AI-powered real estate assistant. I can help you analyze leads, properties, market trends, and provide intelligent insights to grow your business. What would you like to know?",
      timestamp: new Date(),
      suggestions: [
        "Show me my highest scoring leads",
        "What properties match Sarah Johnson's criteria?",
        "Analyze my conversion rates this month",
        "Which leads should I prioritize today?"
      ]
    }
  ]);

  const { data: insights } = useQuery({
    queryKey: ["/api/ai/insights"],
    staleTime: 5 * 60 * 1000, // 5 minutes - AI insights don't change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: leads } = useQuery({
    queryKey: ["/api/leads"],
    retry: false,
  });

  const { data: properties } = useQuery({
    queryKey: ["/api/properties"],
    retry: false,
  });

  const aiQueryMutation = useMutation({
    mutationFn: async (query) => {
      const response = await apiRequest("POST", "/api/ai/query", { query });
      return response.json();
    },
    onSuccess: (data) => {
      const aiResponse = {
        id: messages.length + 1,
        type: "ai",
        content: data.response || "I've analyzed your request. Here's what I found...",
        timestamp: new Date(),
        data: data.data || null,
        suggestions: data.suggestions || []
      };
      setMessages(prev => [...prev, aiResponse]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to get AI response: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Check URL params for search query
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query');
    if (query) {
      setMessage(query);
    }
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const userMessage = {
      id: messages.length + 1,
      type: "user",
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Send to AI
    aiQueryMutation.mutate(message);
    setMessage("");
  };

  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase() || "U";
  };

  const renderAIData = (data) => {
    if (!data) return null;

    if (data.leads) {
      return (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium text-white mb-3">Lead Analysis Results</h4>
          <div className="space-y-2">
            {data.leads.slice(0, 3).map((lead) => (
              <div key={lead.id} className="flex items-center space-x-3 p-2 bg-white dark:bg-gray-700 rounded">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-primary-500 to-purple-600 text-white text-xs">
                    {getInitials(lead.firstName, lead.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    {lead.firstName} {lead.lastName}
                  </p>
                  <p className="text-xs text-gray-400">
                    Score: {lead.score} • Budget: ${lead.budget?.toLocaleString()}
                  </p>
                </div>
                <Badge className={
                  lead.score >= 90 ? "bg-emerald-100 text-emerald-800" :
                  lead.score >= 70 ? "bg-amber-100 text-amber-800" :
                  "bg-gray-100 text-gray-800"
                }>
                  {lead.score >= 90 ? 'Hot' : lead.score >= 70 ? 'Warm' : 'Cold'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (data.properties) {
      return (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium text-white mb-3">Property Matches</h4>
          <div className="space-y-2">
            {data.properties.slice(0, 3).map((property) => (
              <div key={property.id} className="p-2 bg-white dark:bg-gray-700 rounded">
                <p className="text-sm font-medium text-white">
                  {property.title}
                </p>
                <p className="text-xs text-gray-400">
                  ${property.price?.toLocaleString()} • {property.type} • {property.location}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>;
  }

  // Quick stats data
  const stats = [
    { 
      label: "Total Leads", 
      value: Array.isArray(leads) ? leads.length.toString() : "0", 
      icon: Users, 
      change: "+12%",
      color: "text-blue-400"
    },
    { 
      label: "Active Properties", 
      value: Array.isArray(properties) ? properties.filter(p => p.status === 'available').length.toString() : "0", 
      icon: Building, 
      change: "+8%",
      color: "text-emerald-400"
    },
    { 
      label: "High Score Leads", 
      value: Array.isArray(leads) ? leads.filter(l => l.score >= 80).length.toString() : "0", 
      icon: Star, 
      change: "+15%",
      color: "text-amber-400"
    },
    { 
      label: "This Month", 
      value: Array.isArray(leads) ? leads.filter(l => new Date(l.createdAt) > new Date(Date.now() - 30*24*60*60*1000)).length.toString() : "0", 
      icon: TrendingUp, 
      change: "+23%",
      color: "text-purple-400"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <ResponsiveHeader />
      
      <main className="flex-1 flex flex-col overflow-hidden pb-20 lg:pb-6">
        {/* Quick Stats */}
        <div className="p-4 lg:p-6 border-b border-gray-800">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className={`text-xs ${stat.color}`}>{stat.change}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gray-700`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 lg:p-6 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AI Assistant</h1>
                <p className="text-sm text-gray-400">Ask questions about your leads, properties, and business insights</p>
              </div>
            </div>
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start space-x-2 max-w-[80%] ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className={`text-sm ${
                      msg.type === 'user' 
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                        : 'bg-gradient-to-r from-primary-500 to-purple-600 text-white'
                    }`}>
                      {msg.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`rounded-lg px-4 py-3 ${
                    msg.type === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-white'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    {msg.data && renderAIData(msg.data)}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {msg.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs bg-white/10 border-white/20 text-gray-700 dark:text-gray-300 hover:bg-white/20"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {aiQueryMutation.isPending && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-r from-primary-500 to-purple-600 text-white">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Search/Ask Bar at Bottom */}
          <div className="border-t border-gray-800 p-4 lg:p-6">
            <div className="flex space-x-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask AI about leads, properties, market trends, or anything else..."
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-primary-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={aiQueryMutation.isPending}
                />
              </div>
              <Button 
                onClick={handleSendMessage}
                disabled={!message.trim() || aiQueryMutation.isPending}
                className="bg-primary-600 hover:bg-primary-700 px-6"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Quick Suggestion Buttons */}
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                "Show high-scoring leads",
                "Properties under $500k",
                "Recent activity",
                "Conversion rates"
              ].map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setMessage(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </main>

      <MobileBottomTabs />
    </div>
  );
}