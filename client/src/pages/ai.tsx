import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import DesktopHeader from "@/components/layout/desktop-header";
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

  return (
    <div className="min-h-screen bg-gray-900">
      <DesktopHeader />
      
      <div className="hidden lg:block">
        <main className="p-6 pb-20">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <Bot className="w-7 h-7 mr-3 text-primary-600" />
                AI Assistant
              </h1>
              <p className="text-gray-400">Ask questions about your leads, properties, and market insights</p>
            </div>
            <Badge className="bg-gradient-to-r from-primary-500 to-purple-600 text-white mt-4 lg:mt-0">
              <Zap className="w-3 h-3 mr-1" />
              Powered by AI
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Interface */}
            <div className="lg:col-span-2 space-y-6">
              {/* Messages */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Conversation</CardTitle>
                  <CardDescription>Chat with AI to get insights about your real estate business</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
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
                  
                  {/* Input */}
                  <div className="flex space-x-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask about leads, properties, market trends, or anything else..."
                      className="flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={aiQueryMutation.isPending}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!message.trim() || aiQueryMutation.isPending}
                      className="bg-primary-600 hover:bg-primary-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-400">Total Leads</span>
                      </div>
                      <span className="font-semibold text-white">{leads?.length || 0}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-gray-400">Properties</span>
                      </div>
                      <span className="font-semibold text-white">{properties?.length || 0}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-gray-400">Hot Leads</span>
                      </div>
                      <span className="font-semibold text-white">
                        {leads?.filter(lead => lead.score >= 90).length || 0}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm text-gray-400">Avg. Budget</span>
                      </div>
                      <span className="font-semibold text-white">
                        ${leads?.length ? Math.round(leads.reduce((sum, lead) => sum + (lead.budget || 0), 0) / leads.length).toLocaleString() : '0'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Insights */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2 text-amber-500" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights?.insights?.slice(0, 3).map((insight, index) => (
                      <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{insight}</p>
                      </div>
                    )) || (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          AI insights are being generated based on your current data...
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Sample Questions */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
                    Sample Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      "What leads should I call today?",
                      "Show me properties under $500k",
                      "Which lead has the highest budget?",
                      "Analyze my conversion funnel",
                      "Find leads interested in condos",
                      "What's my average deal size?"
                    ].map((question, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left h-auto p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                        onClick={() => handleSuggestionClick(question)}
                      >
                        <Search className="w-3 h-3 mr-2 flex-shrink-0" />
                        <span className="text-xs">{question}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <main className="p-4 pb-20">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Bot className="w-7 h-7 mr-3 text-primary-600" />
              AI Assistant
            </h1>
            <p className="text-gray-400">Ask questions about your leads and properties</p>
          </div>

          {/* Mobile Chat Interface */}
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-lg text-white">Chat with AI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start space-x-2 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <Avatar className="w-6 h-6 flex-shrink-0">
                        <AvatarFallback className={`text-xs ${
                          msg.type === 'user' 
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                            : 'bg-gradient-to-r from-primary-500 to-purple-600 text-white'
                        }`}>
                          {msg.type === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`rounded-lg px-3 py-2 ${
                        msg.type === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-white'
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                        {msg.data && renderAIData(msg.data)}
                        {msg.suggestions && msg.suggestions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {msg.suggestions.slice(0, 2).map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="text-xs bg-white/10 border-white/20 text-gray-700 dark:text-gray-300"
                                onClick={() => handleSuggestionClick(suggestion)}
                              >
                                {suggestion.slice(0, 25)}...
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
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-gradient-to-r from-primary-500 to-purple-600 text-white">
                          <Bot className="w-3 h-3" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                        <div className="flex items-center space-x-1">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Mobile Input */}
              <div className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about your business..."
                  className="flex-1 text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={aiQueryMutation.isPending}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!message.trim() || aiQueryMutation.isPending}
                  size="sm"
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats - Mobile */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-white">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-white">{leads?.length || 0}</p>
                  <p className="text-xs text-gray-400">Total Leads</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Building className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold text-white">{properties?.length || 0}</p>
                  <p className="text-xs text-gray-400">Properties</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Star className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {leads?.filter(lead => lead.score >= 90).length || 0}
                  </p>
                  <p className="text-xs text-gray-400">Hot Leads</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-bold text-white">
                    ${leads?.length ? Math.round(leads.reduce((sum, lead) => sum + (lead.budget || 0), 0) / leads.length).toLocaleString() : '0'}
                  </p>
                  <p className="text-xs text-gray-400">Avg. Budget</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      <MobileBottomTabs />
    </div>
  );
}