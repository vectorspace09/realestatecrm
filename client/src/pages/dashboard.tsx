import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMobile } from "@/hooks/use-mobile";
import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import ResponsiveHeader from "@/components/layout/responsive-header";
import MobileBottomTabs from "@/components/layout/mobile-bottom-tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building, 
  DollarSign, 
  CheckSquare,
  Calendar,
  Target,
  AlertCircle,
  AlertTriangle,
  Star,
  Phone,
  Mail,
  Clock,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Bot,
  Camera,
  Eye,
  Plus,
  CheckCircle,
  MessageSquare,
  FileText,
  PlusCircle
} from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [location, navigate] = useLocation();
  const [completingTask, setCompletingTask] = useState<string | null>(null);

  // Optimize API calls with better caching and mobile-specific limits
  const { isMobile, isTablet } = useMobile();
  
  const { data: metrics } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const { data: insights } = useQuery({
    queryKey: ["/api/ai/insights"],
    staleTime: 5 * 60 * 1000, // 5 minutes - AI insights don't change frequently
    enabled: !isMobile, // Skip on mobile for performance
  });

  const { data: recentTasks } = useQuery({
    queryKey: ["/api/tasks", { limit: isMobile ? 3 : 5 }],
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const { data: recentLeads } = useQuery({
    queryKey: ["/api/leads", { limit: isMobile ? 2 : 3 }],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const { data: recentDeals } = useQuery({
    queryKey: ["/api/deals", { limit: isMobile ? 2 : 3 }],
    staleTime: 2 * 60 * 1000, // 2 minutes
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

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase() || "U";
  };

  // Task completion mutation
  const completeTaskMutation = useMutation({
    mutationFn: async ({ taskId, leadId }: { taskId: string; leadId?: string }) => {
      await apiRequest(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        body: JSON.stringify({ 
          completed: true,
          completedAt: new Date().toISOString()
        })
      });
      
      // If task is related to a lead, add activity to lead timeline
      if (leadId) {
        await apiRequest(`/api/leads/${leadId}/activities`, {
          method: 'POST',
          body: JSON.stringify({
            type: 'task_completed',
            description: `Task completed: ${recentTasks?.find(t => t.id === taskId)?.title}`,
            timestamp: new Date().toISOString()
          })
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setCompletingTask(null);
      toast({
        title: "Task Completed",
        description: "Task has been marked as complete and recorded in timeline.",
      });
    },
    onError: (error) => {
      setCompletingTask(null);
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to complete task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCompleteTask = (task: any) => {
    setCompletingTask(task.id);
    completeTaskMutation.mutate({ taskId: task.id, leadId: task.leadId });
  };

  // Priority action handlers
  const handlePriorityAction = async (actionType: string, leadId?: string) => {
    try {
      switch (actionType) {
        case 'call_high_score_lead':
          // Find the highest scoring lead and navigate to it
          const highScoreLead = recentLeads?.reduce((prev, current) => 
            (prev.score > current.score) ? prev : current
          );
          if (highScoreLead) {
            navigate(`/leads/${highScoreLead.id}?action=call`);
          }
          break;
        case 'schedule_walkthrough':
          navigate('/deals?action=schedule_walkthrough');
          break;
        case 'update_photos':
          navigate('/properties?action=update_photos');
          break;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform action. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>;
  }

  const pendingTasks = recentTasks?.filter(task => task.status === 'pending') || [];
  const highPriorityTasks = pendingTasks.filter(task => task.priority === 'high');
  const overdueTask = pendingTasks.find(task => new Date(task.dueDate) < new Date());

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <ResponsiveHeader />
      
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 pb-20 lg:pb-6">
        {/* Welcome Header - Mobile Optimized */}
          <div className="flex flex-col space-y-4">
            <div className="text-center sm:text-left">
              <h1 className="mobile-title text-white">
                Welcome back, {(user as any)?.firstName || 'Agent'}!
              </h1>
              <p className="mobile-subtitle text-gray-400 mt-1">
                Here's what's happening with your real estate business today.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100 w-full sm:w-auto justify-center">
                <Zap className="w-3 h-3 mr-1" />
                AI Insights Ready
              </Badge>
              <Button className="mobile-button bg-primary-600 hover:bg-primary-700 w-full sm:w-auto">
                <Target className="w-4 h-4 mr-2" />
                View Goals
              </Button>
            </div>
          </div>

          {/* AI-Powered Priority Insights - Mobile Optimized */}
          <Card className="bg-gradient-to-r from-primary-500 to-purple-600 border-0 text-white">
            <CardContent className="mobile-card">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                <div className="text-center sm:text-left">
                  <h2 className="text-lg sm:text-xl font-bold">AI Priority Dashboard</h2>
                  <p className="text-sm sm:text-base text-primary-100">Your top 3 action items for maximum impact</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* High Priority Task */}
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-400 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Urgent Task</p>
                      <p className="text-sm text-primary-100">
                        {overdueTask ? `${overdueTask.title.substring(0, 30)}...` : 
                         highPriorityTasks[0] ? `${highPriorityTasks[0].title.substring(0, 30)}...` :
                         'No urgent tasks'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Hot Lead */}
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Hot Lead</p>
                      <p className="text-sm text-primary-100">
                        {recentLeads?.find(lead => lead.score >= 90) 
                          ? `${recentLeads.find(lead => lead.score >= 90)?.firstName} ${recentLeads.find(lead => lead.score >= 90)?.lastName}` 
                          : 'No hot leads today'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Deal Progress */}
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Deal Progress</p>
                      <p className="text-sm text-primary-100">
                        {recentDeals?.filter(deal => deal.status === 'under_contract').length || 0} deals closing soon
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics Grid - Mobile Optimized */}
          <div className="mobile-grid">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Revenue</p>
                    <p className="text-3xl font-bold text-white">
                      ${parseInt(metrics?.totalRevenue || '0').toLocaleString()}
                    </p>
                    <div className="flex items-center mt-2">
                      <ArrowUpRight className="w-4 h-4 text-emerald-500 mr-1" />
                      <span className="text-sm text-emerald-600 dark:text-emerald-400">+23.5%</span>
                      <span className="text-xs text-gray-500 ml-2">vs last month</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Active Leads</p>
                    <p className="text-3xl font-bold text-white">
                      {metrics?.totalLeads || 0}
                    </p>
                    <div className="flex items-center mt-2">
                      <ArrowUpRight className="w-4 h-4 text-blue-500 mr-1" />
                      <span className="text-sm text-blue-600 dark:text-blue-400">+12.3%</span>
                      <span className="text-xs text-gray-500 ml-2">this week</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Properties Listed</p>
                    <p className="text-3xl font-bold text-white">
                      {metrics?.activeProperties || 0}
                    </p>
                    <div className="flex items-center mt-2">
                      <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                      <span className="text-sm text-red-600 dark:text-red-400">-5.2%</span>
                      <span className="text-xs text-gray-500 ml-2">this month</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <Building className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Conversion Rate</p>
                    <p className="text-3xl font-bold text-white">24.5%</p>
                    <div className="flex items-center mt-2">
                      <ArrowUpRight className="w-4 h-4 text-emerald-500 mr-1" />
                      <span className="text-sm text-emerald-600 dark:text-emerald-400">+8.1%</span>
                      <span className="text-xs text-gray-500 ml-2">improvement</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Priority TODOs - Redesigned */}
          <Card className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 border-0 shadow-2xl ring-1 ring-gray-700">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-white flex items-center">
                      Priority Actions
                      <Badge className="ml-3 bg-red-500 text-white border-0 animate-pulse">
                        3 urgent
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-gray-400 mt-1">
                      High-impact tasks requiring immediate attention
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => navigate('/tasks')}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* High Priority Lead Follow-up */}
              <div className="group relative overflow-hidden bg-gradient-to-r from-red-900/20 to-red-800/20 rounded-xl border border-red-500/30 hover:border-red-400/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5 animate-pulse shadow-lg shadow-red-500/50"></div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-white">Follow up with Emily Davis</h4>
                          <Badge className="bg-red-500 text-white text-xs border-0">Score: 92</Badge>
                          <Badge className="bg-orange-500 text-white text-xs border-0">Hot Lead</Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">
                          Highest scoring lead from website inquiry • Last contact: 2 days ago
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Due: Today 2:00 PM
                          </span>
                          <span className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            (555) 123-4567
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/25 transition-all duration-200"
                        onClick={() => handlePriorityAction('call_high_score_lead')}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Now
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        onClick={() => navigate('/leads/emily-davis')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deal Closing Soon */}
              <div className="group relative overflow-hidden bg-gradient-to-r from-orange-900/20 to-amber-800/20 rounded-xl border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mt-1.5 animate-pulse shadow-lg shadow-orange-500/50"></div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-white">Close Sunrise Apartments Deal</h4>
                          <Badge className="bg-orange-500 text-white text-xs border-0">$450K</Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">
                          Contract expires in 3 days • Final walkthrough pending
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Deadline: Jan 15
                          </span>
                          <span className="flex items-center">
                            <Building className="w-3 h-3 mr-1" />
                            Downtown
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-orange-500/25 transition-all duration-200"
                        onClick={() => handlePriorityAction('schedule_walkthrough')}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        onClick={() => navigate('/deals')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Update Required */}
              <div className="group relative overflow-hidden bg-gradient-to-r from-blue-900/20 to-indigo-800/20 rounded-xl border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5 animate-pulse shadow-lg shadow-blue-500/50"></div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-white">Update Maple Street Photos</h4>
                          <Badge className="bg-blue-500 text-white text-xs border-0">Photos</Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">
                          Property photos are 60+ days old • New staging completed
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Camera className="w-3 h-3 mr-1" />
                            Last updated: Nov 15
                          </span>
                          <span className="flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +25% views expected
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
                        onClick={() => handlePriorityAction('update_photos')}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Update
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        onClick={() => navigate('/properties')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Action Summary */}
              <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Complete these 3 actions to boost performance by an estimated <span className="text-emerald-400 font-semibold">15-20%</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    onClick={() => navigate('/ai')}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    AI Insights
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Leads */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg text-white">Hot Leads</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary-600">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentLeads?.slice(0, 3).map((lead) => (
                    <div key={lead.id} className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.firstName}`} />
                        <AvatarFallback className="bg-gradient-to-br from-primary-500 to-purple-600 text-white text-sm">
                          {getInitials(lead.firstName, lead.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">
                          {lead.firstName} {lead.lastName}
                        </p>
                        <p className="text-sm text-gray-400">
                          ${lead.budget?.toLocaleString()} budget • {lead.status}
                        </p>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={
                          lead.score >= 90 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100" :
                          lead.score >= 70 ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100" :
                          "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
                        }
                      >
                        {lead.score}
                      </Badge>
                    </div>
                  )) || (
                    <p className="text-gray-400 text-center py-4">
                      No recent leads
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Urgent Tasks */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg text-white">Urgent Tasks</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary-600">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTasks?.filter(task => task.priority === 'high').slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        task.type === 'call' ? 'bg-blue-100 dark:bg-blue-900' :
                        task.type === 'meeting' ? 'bg-purple-100 dark:bg-purple-900' :
                        task.type === 'document' ? 'bg-emerald-100 dark:bg-emerald-900' :
                        'bg-gray-100 dark:bg-gray-900'
                      }`}>
                        {task.type === 'call' && <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                        {task.type === 'meeting' && <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                        {task.type === 'document' && <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                        {!['call', 'meeting', 'document'].includes(task.type) && <Clock className="w-4 h-4 text-gray-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">
                          {task.title}
                        </p>
                        <p className="text-sm text-gray-400">
                          Due {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {task.leadId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/leads/${task.leadId}`)}
                            className="h-8 text-xs"
                          >
                            View Lead
                          </Button>
                        )}
                        <Button
                          variant={task.status === 'completed' ? "secondary" : "default"}
                          size="sm"
                          onClick={() => handleCompleteTask(task)}
                          disabled={completingTask === task.id}
                          className="h-8 text-xs"
                        >
                          {completingTask === task.id ? "..." : task.status === 'completed' ? "Completed" : "Complete"}
                        </Button>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-400 text-center py-4">
                      No urgent tasks
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pipeline Progress */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">Pipeline Progress</CardTitle>
                <CardDescription>This month's deal progression</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Qualified Leads</span>
                      <span className="text-sm text-gray-400">
                        {recentLeads?.filter(lead => lead.status === 'qualified').length || 0}
                      </span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Deals</span>
                      <span className="text-sm text-gray-400">
                        {recentDeals?.filter(deal => deal.status === 'under_contract').length || 0}
                      </span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Closing Soon</span>
                      <span className="text-sm text-gray-400">
                        {recentDeals?.filter(deal => 
                          deal.expectedCloseDate && 
                          new Date(deal.expectedCloseDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        ).length || 0}
                      </span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  
                  <div className="pt-2 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">Monthly Goal</span>
                      <span className="text-sm font-bold text-primary-600">68%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
              <CardDescription>Common tasks to boost your productivity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="justify-start h-auto p-4" onClick={() => navigate('/leads?action=add')}>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Add New Lead</span>
                    <span className="text-xs text-gray-500 mt-1">Capture potential client</span>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4" onClick={() => navigate('/properties?action=add')}>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">List Property</span>
                    <span className="text-xs text-gray-500 mt-1">Add new listing</span>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4" onClick={() => navigate('/tasks?action=add')}>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Schedule Task</span>
                    <span className="text-xs text-gray-500 mt-1">Plan your activities</span>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4" onClick={() => navigate('/ai')}>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">AI Analysis</span>
                    <span className="text-xs text-gray-500 mt-1">Get insights & recommendations</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
      </main>
      
      <MobileBottomTabs />
    </div>
  );
}