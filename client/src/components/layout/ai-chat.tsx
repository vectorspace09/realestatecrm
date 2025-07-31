import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, Send, Bot, User, Minimize2, Maximize2 } from "lucide-react";

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content: "Hi! I'm your AI assistant. I can help you with lead scoring, property matching, and market insights. What can I help you with today?",
      timestamp: new Date()
    }
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      type: "user",
      content: message,
      timestamp: new Date()
    };
    
    setMessages([...messages, newMessage]);
    setMessage("");
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: "ai",
        content: "I understand you're asking about " + message + ". Let me analyze your data and provide some insights...",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700 text-white shadow-lg z-50"
      >
        <Bot className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-80 h-96'
    }`}>
      <Card className="w-full h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">AI Assistant</CardTitle>
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
              className="w-6 h-6 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about leads, properties, or insights..."
                  className="flex-1 text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button 
                  onClick={handleSendMessage}
                  size="sm"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-3"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}