import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import ResponsiveHeader from "@/components/layout/responsive-header";
import MobileBottomTabs from "@/components/layout/mobile-bottom-tabs";
import AIChat from "@/components/layout/ai-chat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Clock, Wrench } from "lucide-react";

export default function WorkflowBuilder() {
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
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <ResponsiveHeader />
      
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Workflow Builder</h1>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Automate your real estate workflows with intelligent automation sequences
              </p>
              <Badge variant="secondary" className="mt-4 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                <Clock className="w-3 h-3 mr-1" />
                Coming Soon
              </Badge>
            </div>

            {/* Coming Soon Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Lead Nurturing Workflows</CardTitle>
                  <CardDescription>Automated follow-up sequences for different lead types</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-gray-400">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Trigger emails based on lead behavior and interests</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Schedule follow-up calls and meetings automatically</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Send personalized property recommendations</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Transaction Management</CardTitle>
                  <CardDescription>Streamline your deal process from offer to closing</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-gray-400">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Automated document collection and reminders</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Timeline tracking with milestone notifications</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Client update sequences throughout the process</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Marketing Automation</CardTitle>
                  <CardDescription>Automated marketing campaigns and listing promotions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-gray-400">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Social media posting schedules for new listings</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Email campaigns for buyer and seller leads</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Market report distribution to your database</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Client Onboarding</CardTitle>
                  <CardDescription>Welcome sequences for new clients and referrals</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-gray-400">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Welcome packages and introduction materials</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Expectation setting and process education</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Initial consultation scheduling and preparation</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Workflow Builder Preview */}
            <Card className="bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border-primary-200 dark:border-primary-800">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white mb-2">Visual Workflow Builder</CardTitle>
                <CardDescription className="text-lg">
                  Drag-and-drop interface for creating complex automation sequences
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="bg-gray-800 rounded-lg p-8 shadow-inner">
                  <div className="flex items-center justify-center space-x-4 mb-8">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <Wrench className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Powerful Automation Engine
                      </h3>
                      <p className="text-gray-400">
                        Build sophisticated workflows with triggers, conditions, and actions
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
                      </div>
                      <h4 className="font-medium text-white mb-2">Set Triggers</h4>
                      <p className="text-sm text-gray-400">
                        Define what events start your workflows
                      </p>
                    </div>
                    
                    <div>
                      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">2</span>
                      </div>
                      <h4 className="font-medium text-white mb-2">Add Conditions</h4>
                      <p className="text-sm text-gray-400">
                        Create smart logic for different scenarios
                      </p>
                    </div>
                    
                    <div>
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <span className="text-purple-600 dark:text-purple-400 font-bold">3</span>
                      </div>
                      <h4 className="font-medium text-white mb-2">Execute Actions</h4>
                      <p className="text-sm text-gray-400">
                        Automate emails, tasks, and updates
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification */}
            <div className="text-center mt-12">
              <p className="text-gray-400 mb-4">
                Get notified when Workflow Builder launches
              </p>
              <Badge variant="outline" className="text-primary-600 border-primary-200">
                Feature in Development
              </Badge>
            </div>
          </div>
        </main>

      <MobileBottomTabs />
      <AIChat />
    </div>
  );
}