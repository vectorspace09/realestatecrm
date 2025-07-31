import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import AIChat from "@/components/layout/ai-chat";
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
  Bot
} from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [location, navigate] = useLocation();
  const [completingTask, setCompletingTask] = useState<string | null>(null);

  const { data: metrics } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    retry: false,
  });

  const { data: insights } = useQuery({
    queryKey: ["/api/ai/insights"],
    retry: false,
  });

  const { data: recentTasks } = useQuery({
    queryKey: ["/api/tasks", { limit: 5 }],
    retry: false,
  });

  const { data: recentLeads } = useQuery({
    queryKey: ["/api/leads", { limit: 3 }],
    retry: false,
  });

  const { data: recentDeals } = useQuery({
    queryKey: ["/api/deals", { limit: 3 }],
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
        case 'review_stale_leads':
          navigate('/leads?filter=stale');
          break;
        case 'adjust_pricing':
          navigate('/properties?action=adjust_pricing');
          break;
        case 'schedule_showings':
          navigate('/leads?filter=tour');
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
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>;
  }

  const pendingTasks = recentTasks?.filter(task => task.status === 'pending') || [];
  const highPriorityTasks = pendingTasks.filter(task => task.priority === 'high');
  const overdueTask = pendingTasks.find(task => new Date(task.dueDate) < new Date());

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {/* Welcome Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.firstName || 'Agent'}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Here's what's happening with your real estate business today.
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
                <Zap className="w-3 h-3 mr-1" />
                AI Insights Ready
              </Badge>
              <Button className="bg-primary-600 hover:bg-primary-700">
                <Target className="w-4 h-4 mr-2" />
                View Goals
              </Button>
            </div>
          </div>

          {/* AI-Powered Priority Insights */}
          <Card className="bg-gradient-to-r from-primary-500 to-purple-600 border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">AI Priority Dashboard</h2>
                  <p className="text-primary-100">Your top 3 action items for maximum impact</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
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

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Leads</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
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

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Properties Listed</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
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

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">24.5%</p>
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

          {/* AI Priority TODOs - Action Required */}
          <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900 dark:to-orange-900 border-red-200 dark:border-red-700">
            <CardHeader>
              <CardTitle className="flex items-center text-red-800 dark:text-red-200">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Action Required - Priority TODOs
              </CardTitle>
              <CardDescription className="text-red-600 dark:text-red-300">
                These require your immediate attention to optimize performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-red-500">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Follow up with Emily Davis (Score: 92)</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Highest scoring lead - call within 24 hours</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => handlePriorityAction('call_high_score_lead')}
                  >
                    Call Now
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-orange-500">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Review 3 stale leads (No contact in 7+ days)</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Michael Brown, Sarah Johnson, David Lee need attention</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-orange-500 text-orange-600"
                    onClick={() => handlePriorityAction('review_stale_leads')}
                  >
                    Review
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-yellow-500">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Price Downtown Condo ($850k) competitively</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Market analysis suggests 10% price reduction</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-yellow-500 text-yellow-600"
                    onClick={() => handlePriorityAction('adjust_pricing')}
                  >
                    Adjust
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Schedule 2 property showings this week</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Lisa Wilson & James Miller awaiting appointments</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-blue-500 text-blue-600"
                    onClick={() => handlePriorityAction('schedule_showings')}
                  >
                    Schedule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Leads */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg text-gray-900 dark:text-white">Hot Leads</CardTitle>
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
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {lead.firstName} {lead.lastName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
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
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No recent leads
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Urgent Tasks */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg text-gray-900 dark:text-white">Urgent Tasks</CardTitle>
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
                        {!['call', 'meeting', 'document'].includes(task.type) && <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {task.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
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
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No urgent tasks
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pipeline Progress */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Pipeline Progress</CardTitle>
                <CardDescription>This month's deal progression</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Qualified Leads</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {recentLeads?.filter(lead => lead.status === 'qualified').length || 0}
                      </span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Deals</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {recentDeals?.filter(deal => deal.status === 'under_contract').length || 0}
                      </span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Closing Soon</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {recentDeals?.filter(deal => 
                          deal.expectedCloseDate && 
                          new Date(deal.expectedCloseDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        ).length || 0}
                      </span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Monthly Goal</span>
                      <span className="text-sm font-bold text-primary-600">68%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-white">Quick Actions</CardTitle>
              <CardDescription>Common tasks to boost your productivity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="justify-start h-auto p-4" onClick={() => window.location.href = '/leads?action=add'}>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Add New Lead</span>
                    <span className="text-xs text-gray-500 mt-1">Capture potential client</span>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4" onClick={() => window.location.href = '/properties?action=add'}>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">List Property</span>
                    <span className="text-xs text-gray-500 mt-1">Add new listing</span>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4" onClick={() => window.location.href = '/tasks?action=add'}>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Schedule Task</span>
                    <span className="text-xs text-gray-500 mt-1">Plan your activities</span>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4" onClick={() => window.location.href = '/ai'}>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">AI Analysis</span>
                    <span className="text-xs text-gray-500 mt-1">Get insights & recommendations</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
      
      <AIChat />
    </div>
  );
}