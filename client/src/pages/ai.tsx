import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import AIChat from "@/components/layout/ai-chat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, MessageSquare, Zap, TrendingUp, Users, Building, Target } from "lucide-react";

export default function AIAssistant() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
              <p className="text-gray-600 dark:text-gray-400">Your intelligent real estate companion</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              <Bot className="w-3 h-3 mr-1" />
              Online
            </Badge>
          </div>

          {/* AI Capabilities Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-lg text-gray-900 dark:text-white">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Lead Intelligence
                </CardTitle>
                <CardDescription>AI-powered lead scoring and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Automatic lead scoring (0-100)</li>
                  <li>• Buying intent analysis</li>
                  <li>• Follow-up recommendations</li>
                  <li>• Lead qualification insights</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-lg text-gray-900 dark:text-white">
                  <Building className="w-5 h-5 mr-2 text-emerald-600" />
                  Property Matching
                </CardTitle>
                <CardDescription>Smart property-to-lead matching</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Budget and preference analysis</li>
                  <li>• Location compatibility scoring</li>
                  <li>• Feature matching algorithms</li>
                  <li>• Investment potential insights</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-lg text-gray-900 dark:text-white">
                  <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
                  Communication
                </CardTitle>
                <CardDescription>Intelligent message generation</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Personalized email drafts</li>
                  <li>• Follow-up sequences</li>
                  <li>• Objection handling scripts</li>
                  <li>• Multi-channel messaging</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-lg text-gray-900 dark:text-white">
                  <TrendingUp className="w-5 h-5 mr-2 text-amber-600" />
                  Market Analysis
                </CardTitle>
                <CardDescription>Data-driven market insights</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Comparative market analysis</li>
                  <li>• Price trend predictions</li>
                  <li>• Investment opportunities</li>
                  <li>• Market timing recommendations</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-lg text-gray-900 dark:text-white">
                  <Target className="w-5 h-5 mr-2 text-red-600" />
                  Goal Tracking
                </CardTitle>
                <CardDescription>Performance optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Sales goal monitoring</li>
                  <li>• Pipeline health analysis</li>
                  <li>• Activity recommendations</li>
                  <li>• Performance benchmarking</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-lg text-gray-900 dark:text-white">
                  <Zap className="w-5 h-5 mr-2 text-indigo-600" />
                  Automation
                </CardTitle>
                <CardDescription>Streamlined workflows</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Task auto-scheduling</li>
                  <li>• Follow-up reminders</li>
                  <li>• Lead nurturing sequences</li>
                  <li>• Report generation</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-white">Quick AI Actions</CardTitle>
              <CardDescription>Get instant AI assistance with common tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Analyze Lead</span>
                    <span className="text-xs text-gray-500 mt-1">Get lead scoring and insights</span>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Match Properties</span>
                    <span className="text-xs text-gray-500 mt-1">Find ideal property matches</span>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Draft Email</span>
                    <span className="text-xs text-gray-500 mt-1">Generate personalized messages</span>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Market Report</span>
                    <span className="text-xs text-gray-500 mt-1">Create market analysis</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Performance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Leads Scored</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">247</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Properties Matched</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">156</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                    <Building className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Messages Generated</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">89</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Time Saved</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">42h</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      
      <AIChat />
    </div>
  );
}