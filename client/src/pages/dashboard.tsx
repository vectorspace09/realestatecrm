import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import AIChat from "@/components/layout/ai-chat";
import MetricsGrid from "@/components/dashboard/metrics-grid";
import ActivityFeed from "@/components/dashboard/activity-feed";
import LeadFunnel from "@/components/dashboard/lead-funnel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Home, Calendar, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    retry: false,
  });

  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ["/api/ai/insights"],
    retry: false,
  });

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
      <Sidebar 
        isMobile={false}
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {/* AI Today's Focus */}
          <Card className="bg-gradient-to-r from-primary-500 to-purple-600 border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Today's AI Focus</h2>
                  <p className="text-primary-100">Your personalized action plan</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 backdrop-blur">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <Flame className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Hot Leads</p>
                      <p className="text-sm text-red-100">Ready for follow-up</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-amber-500/20 border border-amber-400/30 rounded-lg p-4 backdrop-blur">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                      <Home className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">New Matches</p>
                      <p className="text-sm text-amber-100">AI property suggestions</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-rose-500/20 border border-rose-400/30 rounded-lg p-4 backdrop-blur">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Appointments</p>
                      <p className="text-sm text-rose-100">Scheduled today</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <MetricsGrid metrics={metrics as any} isLoading={metricsLoading} />

          {/* Charts and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <LeadFunnel />
            </div>
            <div>
              <ActivityFeed activities={(metrics as any)?.recentActivities || []} />
            </div>
          </div>

          {/* AI Insights */}
          {insights && !insightsLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">Key Insights</CardTitle>
                  <CardDescription>AI-powered business intelligence</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(insights as any)?.insights?.length > 0 ? (
                    (insights as any).insights.map((insight: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{insight}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No insights available</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">Recommendations</CardTitle>
                  <CardDescription>Suggested improvements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(insights as any)?.recommendations?.length > 0 ? (
                    (insights as any).recommendations.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{rec}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No recommendations available</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">Priority Actions</CardTitle>
                  <CardDescription>Focus on these today</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(insights as any)?.priority_actions?.length > 0 ? (
                    (insights as any).priority_actions.map((action: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{action}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No priority actions available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
      
      <AIChat />
    </div>
  );
}
