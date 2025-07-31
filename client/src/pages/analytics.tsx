import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import DesktopHeader from "@/components/layout/desktop-header";
import MobileBottomTabs from "@/components/layout/mobile-bottom-tabs";
import AIChat from "@/components/layout/ai-chat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Users, Building, DollarSign, Calendar, BarChart3, PieChart, Download, Target, Zap } from "lucide-react";

export default function Analytics() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics/detailed"],
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

  if (analyticsLoading || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <DesktopHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <DesktopHeader />
      
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
              <p className="text-gray-600 dark:text-gray-400">Comprehensive insights into your real estate business</p>
            </div>
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Last 30 Days
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Advanced Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      ${analytics.totalRevenue.toLocaleString()}
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                      <span className="text-sm text-emerald-600 dark:text-emerald-400">{analytics.closedDeals} closed deals</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.conversionRate}%</p>
                    <div className="flex items-center mt-2">
                      <Target className="w-4 h-4 text-blue-500 mr-1" />
                      <span className="text-sm text-blue-600 dark:text-blue-400">{analytics.qualifiedLeads}/{analytics.totalLeads} qualified</span>
                    </div>
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
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Lead Score</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.averageLeadScore}</p>
                    <div className="flex items-center mt-2">
                      <Zap className="w-4 h-4 text-purple-500 mr-1" />
                      <span className="text-sm text-purple-600 dark:text-purple-400">AI optimized</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Pipeline</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.activePipeline}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-amber-500 mr-1" />
                      <span className="text-sm text-amber-600 dark:text-amber-400">${analytics.averageDealValue.toLocaleString()} avg</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                    <Building className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-lg text-gray-900 dark:text-white">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Revenue Trend
                </CardTitle>
                <CardDescription>Monthly revenue over the past 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Revenue Chart</p>
                    <p className="text-sm text-gray-400 mt-2">Interactive chart coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-lg text-gray-900 dark:text-white">
                  <PieChart className="w-5 h-5 mr-2" />
                  Lead Sources
                </CardTitle>
                <CardDescription>Distribution of leads by source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.leadsBySource.map((source, index) => {
                    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-red-500'];
                    const percentage = analytics.totalLeads > 0 ? Math.round((source.count / analytics.totalLeads) * 100) : 0;
                    
                    return (
                      <div key={source.source} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 ${colors[index % colors.length]} rounded-full mr-3`}></div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{source.source}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">{percentage}%</span>
                          <Badge variant="secondary">{source.count} leads</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Top Performing Properties</CardTitle>
                <CardDescription>Properties with highest engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topPerformingProperties.slice(0, 3).map((property, index) => (
                    <div key={property.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{property.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">${property.price?.toLocaleString()}</p>
                      </div>
                      <Badge className={index === 0 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100" : 
                                      index === 1 ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100" : 
                                      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"}>
                        {property.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Lead Quality Score</CardTitle>
                <CardDescription>Average AI-generated lead scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">High Quality (90-100)</span>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
                        {analytics.totalLeads > 0 ? Math.round((analytics.highValueLeads.length / analytics.totalLeads) * 100) : 0}%
                      </span>
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
                        {analytics.highValueLeads.length}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Task Completion</span>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">{analytics.taskCompletionRate}%</span>
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                        {analytics.completedTasks}/{analytics.completedTasks + analytics.pendingTasks}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Properties Sold</span>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
                        {analytics.totalProperties > 0 ? Math.round((analytics.soldProperties / analytics.totalProperties) * 100) : 0}%
                      </span>
                      <Badge variant="secondary">{analytics.soldProperties}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Activity Summary</CardTitle>
                <CardDescription>Recent activity metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tasks Completed</span>
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{analytics.completedTasks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pending Tasks</span>
                    <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{analytics.pendingTasks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Properties</span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{analytics.totalProperties}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Generation */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-white">Generate Reports</CardTitle>
              <CardDescription>Create detailed reports for your business analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Lead Performance Report</span>
                    <span className="text-xs text-gray-500 mt-1">Detailed lead analytics and conversion data</span>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Property Market Analysis</span>
                    <span className="text-xs text-gray-500 mt-1">Market trends and property performance</span>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Revenue & Commission Report</span>
                    <span className="text-xs text-gray-500 mt-1">Financial performance and projections</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
      </main>

      <MobileBottomTabs />
      <AIChat />
    </div>
  );
}