import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, Send, Bot, User, Minimize2, Maximize2, MessageCircle } from "lucide-react";

export default function AIChat() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content: "Hi! I'm your intelligent AI assistant. I can analyze what's on your screen, help with lead management, property matching, and provide business insights. What can I help you with?",
      timestamp: new Date()
    }
  ]);

  // Get current page context
  const getCurrentPageContext = () => {
    const path = location.split('/')[1] || 'dashboard';
    const pageContexts: Record<string, string> = {
      'dashboard': 'dashboard',
      'leads': 'leads', 
      'lead-detail': 'lead-detail',
      'properties': 'properties',
      'deals': 'deals',
      'tasks': 'tasks',
      'analytics': 'analytics',
      'ai': 'ai-assistant'
    };
    return pageContexts[path] || 'dashboard';
  };

  // AI Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const context = {
        page: getCurrentPageContext(),
        data: {
          currentPage: location,
          timestamp: new Date()
        }
      };
      
      const response = await apiRequest("/api/ai/chat", {
        method: "POST",
        body: { message: userMessage, context },
      });
      return response;
    },
    onSuccess: (data: any) => {
      const aiResponse = {
        id: messages.length + 1,
        type: "ai",
        content: data.response || "I'm here to help! What would you like to know?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    },
    onError: (error) => {
      console.error("AI Chat Error:", error);
      const errorResponse = {
        id: messages.length + 1,
        type: "ai", 
        content: "I'm experiencing some technical difficulties, but I can still help! What specific information about your leads, properties, or deals can I assist you with?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    }
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const userMessage = {
      id: messages.length + 1,
      type: "user",
      content: message,
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    chatMutation.mutate(message);
    setMessage("");
  };

  // Handle suggested questions
  const handleQuickQuestion = (question: string) => {
    const userMessage = {
      id: messages.length + 1,
      type: "user",
      content: question,
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    chatMutation.mutate(question);
  };

  const getQuickSuggestions = () => {
    const context = getCurrentPageContext();
    const suggestions: Record<string, string[]> = {
      'dashboard': ["What's my top priority today?", "Show lead pipeline status", "Any urgent tasks?"],
      'leads': ["Which leads should I contact first?", "What's on this page?", "Show high-scoring leads"],
      'properties': ["Which properties match my leads?", "Analyze property values", "What's on screen?"],
      'deals': ["What deals need attention?", "Show pipeline status", "Revenue forecast"],
      'analytics': ["Explain these metrics", "What insights do you see?", "Performance summary"],
      'tasks': ["What should I prioritize?", "Show overdue tasks", "Task recommendations"]
    };
    return suggestions[context] || ["What can you help me with?", "Analyze my data", "What's on this page?"];
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-24 right-6 lg:bottom-6 lg:right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
        >
          <MessageCircle className="w-7 h-7" />
        </Button>
        <div className="absolute -top-2 -right-1">
          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-24 right-6 lg:bottom-6 lg:right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-80 h-96'
    }`}>
      <Card className="w-full h-full bg-card border-border shadow-xl">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2 px-4 py-3 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-white">AI Assistant</CardTitle>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs">
                Online
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-6 h-6 p-0 text-muted-foreground hover:text-muted-foreground dark:text-muted-foreground dark:hover:text-muted-foreground"
            >
              {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 p-0 text-muted-foreground hover:text-muted-foreground dark:text-muted-foreground dark:hover:text-muted-foreground"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
        
        {!isMinimized && (
          <>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 max-h-64">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start space-x-2 max-w-[80%] ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <Avatar className="w-6 h-6 flex-shrink-0">
                      <AvatarFallback className={`text-xs ${
                        msg.type === 'user' 
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                          : 'bg-gradient-to-r from-primary-500 to-purple-600 text-white'
                      }`}>
                        {msg.type === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`px-3 py-2 rounded-lg text-sm ${
                      msg.type === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-card dark:bg-card text-white'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
            
            {/* Quick suggestions */}
            {!chatMutation.isPending && (
              <div className="px-4 py-2 border-t border-border">
                <div className="flex flex-wrap gap-1">
                  {getQuickSuggestions().map((suggestion: string, index: number) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm" 
                      className="text-xs h-6 px-2"
                      onClick={() => handleQuickQuestion(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="p-4 border-t border-border">
              <div className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about what's on screen, leads, properties..."
                  className="flex-1 text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={chatMutation.isPending}
                />
                <Button 
                  onClick={handleSendMessage}
                  size="sm"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-3"
                  disabled={chatMutation.isPending || !message.trim()}
                >
                  {chatMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}