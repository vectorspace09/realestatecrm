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
import CommandBar from "@/components/ai-first/command-bar";
import ContextualFAB from "@/components/ai-first/contextual-fab";
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
  PlusCircle,
  User
} from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [location, navigate] = useLocation();
  const [completingTask, setCompletingTask] = useState<string | null>(null);

  // Optimize API calls with better caching and mobile-specific limits
  const { isMobile, isTablet } = useMobile();
  
  const { data: metrics = {} } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const { data: insights = {} } = useQuery({
    queryKey: ["/api/ai/insights"],
    staleTime: 5 * 60 * 1000, // 5 minutes - AI insights don't change frequently
    enabled: !isMobile, // Skip on mobile for performance
  });

  const { data: recentTasks = [] } = useQuery({
    queryKey: ["/api/tasks", { limit: isMobile ? 3 : 5 }],
    staleTime: 1 * 60 * 1000, // 1 minute
  }) as { data: any[] };

  const { data: recentLeads = [] } = useQuery({
    queryKey: ["/api/leads", { limit: isMobile ? 2 : 3 }],
    staleTime: 2 * 60 * 1000, // 2 minutes
  }) as { data: any[] };

  const { data: recentDeals = [] } = useQuery({
    queryKey: ["/api/deals", { limit: isMobile ? 2 : 3 }],
    staleTime: 2 * 60 * 1000, // 2 minutes
  }) as { data: any[] };

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
            description: `Task completed: ${recentTasks?.find((t: any) => t.id === taskId)?.title}`,
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
    completeTaskMutation.mutate({ 
      taskId: task.id, 
      leadId: task.leadId || task.lead?.id 
    });
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
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>;
  }

  const pendingTasks = recentTasks?.filter((task: any) => task.status === 'pending') || [];
  const highPriorityTasks = pendingTasks.filter((task: any) => task.priority === 'high');
  const overdueTask = pendingTasks.find((task: any) => new Date(task.dueDate) < new Date());

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ResponsiveHeader />
      
      {/* Command Bar - AI-First Navigation */}
      <div className="px-4 lg:px-6 pt-4">
        <CommandBar />
      </div>

      <main className="flex-1 overflow-y-auto p-4 lg:p-8 xl:p-10 space-y-6 lg:space-y-8 pb-20 lg:pb-6 max-w-7xl mx-auto w-full">
        {/* Welcome Header - Optimized Desktop Layout */}
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="text-center sm:text-left">
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  Welcome back, {(user as any)?.firstName || 'Agent'}!
                </h1>
                <p className="text-base lg:text-lg text-muted-foreground">
                  Here's what's happening with your real estate business today.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4 lg:mt-0">
                <Badge variant="secondary" className="bg-success/10 text-success border-success/20 text-center py-2 px-4">
                  <Zap className="w-4 h-4 mr-2" />
                  AI Insights Ready
                </Badge>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-6">
                  <Target className="w-4 h-4 mr-2" />
                  View Goals
                </Button>
              </div>
            </div>
          </div>

          {/* AI-Powered Priority Insights - Fixed Layout */}
          <Card className="bg-gradient-to-r from-primary to-primary/80 border-0 text-primary-foreground">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">AI Priority Dashboard</h2>
                  <p className="text-primary-foreground/80 text-sm">Your top 3 action items for maximum impact</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* High Priority Task */}
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur min-h-[80px] flex items-center">
                  <div className="flex items-center space-x-3 w-full">
                    <div className="w-10 h-10 bg-destructive rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white mb-1">Urgent Task</p>
                      <p className="text-sm text-primary-foreground/80 truncate">
                        {overdueTask ? overdueTask.title : 
                         highPriorityTasks[0] ? highPriorityTasks[0].title :
                         'No urgent tasks'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Hot Lead */}
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur min-h-[80px] flex items-center">
                  <div className="flex items-center space-x-3 w-full">
                    <div className="w-10 h-10 bg-warning rounded-full flex items-center justify-center flex-shrink-0">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white mb-1">Hot Lead</p>
                      <p className="text-sm text-primary-foreground/80 truncate">
                        {recentLeads?.find((lead: any) => lead.score >= 90) 
                          ? `${recentLeads.find((lead: any) => lead.score >= 90)?.firstName} ${recentLeads.find((lead: any) => lead.score >= 90)?.lastName}` 
                          : 'No hot leads today'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Deal Progress */}
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur min-h-[80px] flex items-center">
                  <div className="flex items-center space-x-3 w-full">
                    <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white mb-1">Deal Progress</p>
                      <p className="text-sm text-primary-foreground/80 truncate">
                        {recentDeals?.filter((deal: any) => deal.status === 'under_contract').length || 0} deals closing soon
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics Grid - Optimized Desktop Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-3xl font-bold text-foreground">
                      ${parseInt((metrics as any)?.totalRevenue || '0').toLocaleString()}
                    </p>
                    <div className="flex items-center mt-2">
                      <ArrowUpRight className="w-4 h-4 text-success mr-1" />
                      <span className="text-sm text-success">+23.5%</span>
                      <span className="text-xs text-muted-foreground ml-2">vs last month</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Leads</p>
                    <p className="text-3xl font-bold text-foreground">
                      {(metrics as any)?.totalLeads || 0}
                    </p>
                    <div className="flex items-center mt-2">
                      <ArrowUpRight className="w-4 h-4 text-primary mr-1" />
                      <span className="text-sm text-primary">+12.3%</span>
                      <span className="text-xs text-muted-foreground ml-2">this week</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Properties Listed</p>
                    <p className="text-3xl font-bold text-foreground">
                      {(metrics as any)?.activeProperties || 0}
                    </p>
                    <div className="flex items-center mt-2">
                      <ArrowDownRight className="w-4 h-4 text-destructive mr-1" />
                      <span className="text-sm text-destructive">-5.2%</span>
                      <span className="text-xs text-muted-foreground ml-2">this month</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                    <Building className="w-6 h-6 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                    <p className="text-3xl font-bold text-foreground">24.5%</p>
                    <div className="flex items-center mt-2">
                      <ArrowUpRight className="w-4 h-4 text-success mr-1" />
                      <span className="text-sm text-success">+8.1%</span>
                      <span className="text-xs text-muted-foreground ml-2">improvement</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Priority TODOs - Redesigned */}
          <Card className="bg-gradient-to-br from-card via-card to-card border-0 shadow-2xl ring-1 ring-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-destructive to-warning rounded-xl flex items-center justify-center shadow-lg">
                    <AlertTriangle className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-foreground flex items-center">
                      Priority Actions
                      <Badge className="ml-3 bg-destructive text-foreground border-0 animate-pulse">
                        3 urgent
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-muted-foreground mt-1">
                      High-impact tasks requiring immediate attention
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border text-muted-foreground hover:bg-secondary"
                  onClick={() => navigate('/tasks')}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* High Priority Lead Follow-up */}
              <div className="group relative overflow-hidden bg-gradient-to-r from-destructive/10 to-destructive/5 rounded-xl border border-destructive/30 hover:border-destructive/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-destructive/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      <div className="w-3 h-3 bg-destructive rounded-full mt-1.5 animate-pulse shadow-lg shadow-destructive/50 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col space-y-2 mb-3">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <h4 className="font-semibold text-foreground">Follow up with Emily Davis</h4>
                            <Badge className="bg-destructive text-foreground text-xs border-0 flex-shrink-0">Score: 92</Badge>
                            <Badge className="bg-orange-500 text-foreground text-xs border-0 flex-shrink-0">Hot Lead</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Highest scoring lead from website inquiry • Last contact: 2 days ago
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground flex-wrap gap-2">
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
                    <div className="flex items-start gap-2 flex-shrink-0 mt-1">
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/25 transition-all duration-200 whitespace-nowrap"
                        onClick={() => handlePriorityAction('call_high_score_lead')}
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border text-muted-foreground hover:bg-secondary p-2"
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
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mt-1.5 animate-pulse shadow-lg shadow-orange-500/50 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col space-y-2 mb-3">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <h4 className="font-semibold text-foreground">Close Sunrise Apartments Deal</h4>
                            <Badge className="bg-orange-500 text-foreground text-xs border-0 flex-shrink-0">$450K</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Contract expires in 3 days • Final walkthrough pending
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground flex-wrap gap-2">
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
                    <div className="flex items-start gap-2 flex-shrink-0 mt-1">
                      <Button
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700 text-foreground shadow-lg hover:shadow-orange-500/25 transition-all duration-200 whitespace-nowrap"
                        onClick={() => handlePriorityAction('schedule_walkthrough')}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border text-muted-foreground hover:bg-secondary p-2"
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
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5 animate-pulse shadow-lg shadow-blue-500/50 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col space-y-2 mb-3">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <h4 className="font-semibold text-foreground">Update Maple Street Photos</h4>
                            <Badge className="bg-blue-500 text-foreground text-xs border-0 flex-shrink-0">Photos</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Property photos are 60+ days old • New staging completed
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground flex-wrap gap-2">
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
                    <div className="flex items-start gap-2 flex-shrink-0 mt-1">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-foreground shadow-lg hover:shadow-blue-500/25 transition-all duration-200 whitespace-nowrap"
                        onClick={() => handlePriorityAction('update_photos')}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Update
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border text-muted-foreground hover:bg-secondary p-2"
                        onClick={() => navigate('/properties')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Action Summary */}
              <div className="mt-6 p-4 bg-card/50 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Complete these 3 actions to boost performance by an estimated <span className="text-emerald-400 font-semibold">15-20%</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-muted-foreground hover:bg-secondary"
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
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg text-foreground">Hot Leads</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary hover:text-primary/80 transition-colors"
                  onClick={() => navigate('/leads')}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentLeads?.slice(0, 3).map((lead: any) => (
                    <div key={lead.id} className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.firstName}`} />
                        <AvatarFallback className="bg-gradient-to-br from-primary-500 to-purple-600 text-foreground text-sm">
                          {getInitials(lead.firstName, lead.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {lead.firstName} {lead.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${lead.budget?.toLocaleString()} budget • {lead.status}
                        </p>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                          (lead.score || 0) >= 90 ? "bg-emerald-100 text-emerald-800" :
                          (lead.score || 0) >= 70 ? "bg-amber-100 text-amber-800" :
                          "bg-card text-muted-foreground dark:hover:bg-card"
                        }`}
                        onClick={() => navigate(`/leads/${lead.id}`)}
                      >
                        <Star className="w-3 h-3 mr-1" />
                        {isNaN(lead.score) || lead.score == null ? 0 : lead.score}
                      </Badge>
                    </div>
                  )) || (
                    <p className="text-muted-foreground text-center py-4">
                      No recent leads
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Urgent Tasks */}
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg text-foreground">Urgent Tasks</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary hover:text-primary/80 transition-colors"
                  onClick={() => navigate('/tasks')}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTasks?.filter((task: any) => task.priority === 'high').slice(0, 3).map((task: any) => (
                    <div key={task.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-card/50 transition-all duration-200 cursor-pointer group" onClick={() => navigate(`/tasks/${task.id}`)}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        task.type === 'call' ? 'bg-primary/10' :
                        task.type === 'meeting' ? 'bg-primary/10' :
                        task.type === 'document' ? 'bg-primary/10' :
                        'bg-primary/10'
                      }`}>
                        {task.type === 'call' && <Phone className="w-4 h-4 text-primary" />}
                        {task.type === 'meeting' && <Calendar className="w-4 h-4 text-primary" />}
                        {task.type === 'document' && <CheckSquare className="w-4 h-4 text-primary" />}
                        {!['call', 'meeting', 'document'].includes(task.type) && <Clock className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {task.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Due {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          <Badge 
                            variant="outline" 
                            className={`cursor-pointer transition-all duration-200 hover:scale-105 text-xs ${
                              task.priority === 'high' ? 'border-red-500 text-red-500 hover:bg-red-50 ' :
                              task.priority === 'medium' ? 'border-amber-500 text-amber-500 hover:bg-amber-50 ' :
                              'border-green-500 text-green-500 hover:bg-green-50 '
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/tasks/${task.id}`);
                            }}
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            {task.priority}
                          </Badge>
                          {task.leadId && (
                            <Badge
                              variant="secondary"
                              className="cursor-pointer transition-all duration-200 hover:scale-105 hover:bg-blue-100 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/leads/${task.leadId}`);
                              }}
                            >
                              <User className="w-3 h-3 mr-1" />
                              Lead
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant={task.status === 'completed' ? "secondary" : "default"}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (task.status !== 'completed') {
                              handleCompleteTask(task);
                            }
                          }}
                          disabled={completingTask === task.id || task.status === 'completed'}
                          className="h-8 text-xs transition-all duration-200 hover:scale-105 min-w-[80px]"
                        >
                          {completingTask === task.id ? (
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : task.status === 'completed' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            "Complete"
                          )}
                        </Button>
                      </div>
                    </div>
                  )) || (
                    <p className="text-muted-foreground text-center py-4">
                      No urgent tasks
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Deals */}
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg text-foreground">Active Deals</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary hover:text-primary/80 transition-colors"
                  onClick={() => navigate('/deals')}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentDeals?.slice(0, 3).map((deal: any) => (
                    <div key={deal.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-card/50 transition-all duration-200 cursor-pointer group" onClick={() => navigate(`/deals/${deal.id}`)}>
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          Deal #{deal.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${deal.dealValue?.toLocaleString()} • {deal.status === 'under_contract' ? 'Under Contract' : deal.status}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline" 
                          className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                            deal.status === 'under_contract' ? 'border-emerald-500 text-emerald-500 hover:bg-emerald-50 ' :
                            deal.status === 'offer' ? 'border-blue-500 text-blue-500 hover:bg-blue-50 ' :
                            deal.status === 'closed' ? 'border-green-500 text-green-500 hover:bg-green-50 ' :
                            'border-amber-500 text-amber-500 hover:bg-amber-50 '
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/deals/${deal.id}`);
                          }}
                        >
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {deal.status === 'under_contract' ? 'Contract' : deal.status}
                        </Badge>
                        {deal.leadId && (
                          <Badge
                            variant="secondary"
                            className="cursor-pointer transition-all duration-200 hover:scale-105 hover:bg-blue-100 "
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/leads/${deal.leadId}`);
                            }}
                          >
                            <User className="w-3 h-3 mr-1" />
                            Lead
                          </Badge>
                        )}
                        {deal.propertyId && (
                          <Badge
                            variant="secondary"
                            className="cursor-pointer transition-all duration-200 hover:scale-105 hover:bg-orange-100 "
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/properties/${deal.propertyId}`);
                            }}
                          >
                            <Building className="w-3 h-3 mr-1" />
                            Property
                          </Badge>
                        )}
                      </div>
                    </div>
                  )) || (
                    <p className="text-muted-foreground text-center py-4">
                      No active deals
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Quick Actions</CardTitle>
              <CardDescription>Common tasks to boost your productivity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 p-4 flex flex-col items-start justify-center text-left" 
                  onClick={() => navigate('/leads?action=add')}
                >
                  <span className="font-medium text-sm">Add New Lead</span>
                  <span className="text-xs text-muted-foreground mt-1">Capture potential client</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 p-4 flex flex-col items-start justify-center text-left" 
                  onClick={() => navigate('/properties?action=add')}
                >
                  <span className="font-medium text-sm">List Property</span>
                  <span className="text-xs text-muted-foreground mt-1">Add new listing</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 p-4 flex flex-col items-start justify-center text-left" 
                  onClick={() => navigate('/tasks?action=add')}
                >
                  <span className="font-medium text-sm">Schedule Task</span>
                  <span className="text-xs text-muted-foreground mt-1">Plan your activities</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 p-4 flex flex-col items-start justify-center text-left" 
                  onClick={() => navigate('/ai')}
                >
                  <span className="font-medium text-sm">AI Analysis</span>
                  <span className="text-xs text-muted-foreground mt-1">Get insights & recommendations</span>
                </Button>
              </div>
            </CardContent>
          </Card>
      </main>
      
      <MobileBottomTabs />

    </div>
  );
}