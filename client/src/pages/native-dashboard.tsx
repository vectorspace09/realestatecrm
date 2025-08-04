import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useLocation } from "wouter";
import NativeHeader from "@/components/native/native-header";
import NativeBottomTabs from "@/components/native/native-bottom-tabs";
import NativeCard from "@/components/native/native-card";
import NativeListItem from "@/components/native/native-list-item";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, 
  Star, 
  TrendingUp, 
  AlertCircle, 
  DollarSign,
  Users,
  Building,
  HandCoins,
  Plus,
  ArrowRight,
  Target,
  CheckSquare,
  MessageSquare,
  Settings,
  Puzzle,
  ChevronRight,
  Phone,
  Mail,
  Clock,
  Calendar,
  Home,
  UserPlus,
  FileText,
  Bot,
  Briefcase
} from "lucide-react";

export default function NativeDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { isMobile, isTablet } = useMobile();
  const [location, navigate] = useLocation();

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

  const { data: metrics } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    staleTime: 5 * 60 * 1000,
  });

  const { data: recentLeads } = useQuery({
    queryKey: ["/api/leads"],
    staleTime: 2 * 60 * 1000,
  });

  const { data: recentDeals } = useQuery({
    queryKey: ["/api/deals"],
    staleTime: 2 * 60 * 1000,
  });

  const { data: recentTasks } = useQuery({
    queryKey: ["/api/tasks"],
    staleTime: 1 * 60 * 1000,
  });

  const { data: insights } = useQuery({
    queryKey: ["/api/ai/insights"],
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="app-shell">
        <div className="app-content flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate priority insights
  const pendingTasks = recentTasks?.filter(task => task.status === 'pending') || [];
  const highPriorityTasks = pendingTasks.filter(task => task.priority === 'high');
  const overdueTask = pendingTasks.find(task => new Date(task.dueDate) < new Date());
  const hotLead = recentLeads?.find(lead => lead.score >= 90);
  const closingDeals = recentDeals?.filter(deal => deal.status === 'under_contract').length || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-card flex flex-col">
      <NativeHeader 
        title={`Hi, ${(user as any)?.firstName || 'Agent'}!`} 
        rightButton={
          <button 
            className="p-2 rounded-lg bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700 transition-all duration-200 active:scale-95"
            onClick={() => navigate('/ai')}
          >
            <Bot className="w-5 h-5 text-white" />
          </button>
        }
      />
      
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 p-4 pb-24">
          {/* Quick Actions Carousel */}
          <div>
            <h2 className="text-lg font-semibold text-muted-foreground dark:text-white mb-4 px-1">Quick Actions</h2>
            <div className="flex overflow-x-auto space-x-3 pb-2 px-1 scrollbar-hide">
              {[
                { icon: UserPlus, label: "Add Lead", action: () => navigate('/leads/new'), color: "from-blue-500 to-blue-600" },
                { icon: Building, label: "Add Property", action: () => navigate('/properties/new'), color: "from-emerald-500 to-emerald-600" },
                { icon: CheckSquare, label: "Add Task", action: () => navigate('/tasks/new'), color: "from-purple-500 to-purple-600" },
                { icon: HandCoins, label: "New Deal", action: () => navigate('/deals/new'), color: "from-amber-500 to-amber-600" },
                { icon: Bot, label: "AI Chat", action: () => navigate('/ai'), color: "from-pink-500 to-pink-600" },
                { icon: Puzzle, label: "Integrations", action: () => navigate('/integrations'), color: "from-indigo-500 to-indigo-600" },
                { icon: Settings, label: "Settings", action: () => navigate('/settings'), color: "from-gray-500 to-gray-600" },
              ].map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`flex-shrink-0 flex flex-col items-center p-4 rounded-2xl bg-gradient-to-br ${action.color} text-white shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-w-[90px]`}
                >
                  <action.icon className="w-6 h-6 mb-2" />
                  <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Today's Focus - Swipeable Cards */}
          <div>
            <h2 className="text-lg font-semibold text-muted-foreground dark:text-white mb-4 px-1">Today's Focus</h2>
            <div className="flex overflow-x-auto space-x-4 pb-2 px-1 scrollbar-hide">
              <NativeCard className="flex-shrink-0 w-64 bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-semibold">Hot Leads</span>
                    </div>
                    <p className="text-2xl font-bold">{recentLeads?.filter(lead => lead.score >= 90).length || 0}</p>
                    <p className="text-red-100 text-sm">Need immediate attention</p>
                  </div>
                  <button 
                    onClick={() => navigate('/leads')}
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </NativeCard>

              <NativeCard className="flex-shrink-0 w-64 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Calendar className="w-5 h-5" />
                      <span className="font-semibold">Visits Today</span>
                    </div>
                    <p className="text-2xl font-bold">{recentTasks?.filter(task => 
                      task.type === 'showing' && 
                      new Date(task.dueDate).toDateString() === new Date().toDateString()
                    ).length || 0}</p>
                    <p className="text-blue-100 text-sm">Property showings</p>
                  </div>
                  <button 
                    onClick={() => navigate('/tasks')}
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </NativeCard>

              <NativeCard className="flex-shrink-0 w-64 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <HandCoins className="w-5 h-5" />
                      <span className="font-semibold">Offers Pending</span>
                    </div>
                    <p className="text-2xl font-bold">{recentDeals?.filter(deal => deal.status === 'under_contract').length || 0}</p>
                    <p className="text-emerald-100 text-sm">Awaiting response</p>
                  </div>
                  <button 
                    onClick={() => navigate('/deals')}
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </NativeCard>
            </div>
          </div>

          {/* Hot Leads List */}
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-lg font-semibold text-muted-foreground dark:text-white">Hot Leads</h2>
              <button 
                onClick={() => navigate('/leads')}
                className="text-primary-600 dark:text-primary-400 text-sm font-medium flex items-center space-x-1"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              {recentLeads?.filter(lead => lead.score >= 80).slice(0, 3).map((lead) => (
                <NativeCard key={lead.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {lead.firstName?.[0]}{lead.lastName?.[0]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-muted-foreground dark:text-white">
                            {lead.firstName} {lead.lastName}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground dark:text-muted-foreground">{lead.email}</span>
                            <Badge 
                              variant={lead.score >= 90 ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              {lead.score}% Match
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground dark:text-muted-foreground mb-3">
                        Budget: ${lead.budget?.toLocaleString() || 'Not specified'} • 
                        Looking for: {lead.propertyType || 'Any property'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => window.open(`tel:${lead.phone}`, '_self')}
                      className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call</span>
                    </button>
                    <button 
                      onClick={() => window.open(`mailto:${lead.email}`, '_self')}
                      className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Email</span>
                    </button>
                    <button 
                      onClick={() => navigate(`/leads/${lead.id}`)}
                      className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-card hover:bg-card text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </div>
                </NativeCard>
              ))}
              
              {(!recentLeads || recentLeads.filter(lead => lead.score >= 80).length === 0) && (
                <NativeCard className="p-6 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground dark:text-muted-foreground mb-2">No hot leads yet</p>
                  <p className="text-sm text-muted-foreground">Add leads to see high-priority prospects here</p>
                </NativeCard>
              )}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-lg font-semibold text-muted-foreground dark:text-white">Today's Tasks</h2>
              <button 
                onClick={() => navigate('/tasks')}
                className="text-primary-600 dark:text-primary-400 text-sm font-medium flex items-center space-x-1"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              {recentTasks?.filter(task => 
                new Date(task.dueDate).toDateString() === new Date().toDateString()
              ).slice(0, 4).map((task) => (
                <NativeCard key={task.id} className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      task.priority === 'high' ? 'bg-red-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-muted-foreground dark:text-white mb-1">{task.title}</h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground dark:text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(task.dueDate).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}</span>
                        {task.type && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{task.type.replace('_', ' ')}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          // Mark task as complete
                          console.log('Complete task:', task.id);
                        }}
                        className="p-2 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg transition-colors"
                      >
                        <CheckSquare className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        className="p-2 text-muted-foreground dark:text-muted-foreground hover:bg-card dark:hover:bg-card rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </NativeCard>
              ))}
              
              {(!recentTasks || recentTasks.filter(task => 
                new Date(task.dueDate).toDateString() === new Date().toDateString()
              ).length === 0) && (
                <NativeCard className="p-6 text-center">
                  <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground dark:text-muted-foreground mb-2">No tasks for today</p>
                  <p className="text-sm text-muted-foreground">You're all caught up!</p>
                </NativeCard>
              )}
            </div>
          </div>

          {/* AI Suggestions Panel */}
          {insights?.insights && insights.insights.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-lg font-semibold text-muted-foreground dark:text-white">AI Suggestions</h2>
                <button 
                  onClick={() => navigate('/ai')}
                  className="text-primary-600 dark:text-primary-400 text-sm font-medium flex items-center space-x-1"
                >
                  <span>AI Chat</span>
                  <Bot className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                {insights.insights.slice(0, 3).map((insight, index) => (
                  <NativeCard key={index} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground leading-relaxed mb-3">
                          {insight}
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                          {index === 0 && (
                            <>
                              <button 
                                onClick={() => navigate('/leads')}
                                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-full font-medium transition-colors"
                              >
                                View Leads
                              </button>
                              <button 
                                onClick={() => navigate('/ai')}
                                className="px-3 py-1.5 bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-card text-blue-600 dark:text-blue-400 text-xs rounded-full font-medium border border-blue-200 dark:border-blue-800 transition-colors"
                              >
                                Ask AI
                              </button>
                            </>
                          )}
                          {index === 1 && (
                            <>
                              <button 
                                onClick={() => navigate('/properties')}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded-full font-medium transition-colors"
                              >
                                View Properties
                              </button>
                              <button 
                                onClick={() => navigate('/ai')}
                                className="px-3 py-1.5 bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-card text-emerald-600 dark:text-emerald-400 text-xs rounded-full font-medium border border-emerald-200 dark:border-emerald-800 transition-colors"
                              >
                                Get Help
                              </button>
                            </>
                          )}
                          {index === 2 && (
                            <>
                              <button 
                                onClick={() => navigate('/deals')}
                                className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded-full font-medium transition-colors"
                              >
                                View Deals
                              </button>
                              <button 
                                onClick={() => navigate('/ai')}
                                className="px-3 py-1.5 bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-card text-purple-600 dark:text-purple-400 text-xs rounded-full font-medium border border-purple-200 dark:border-purple-800 transition-colors"
                              >
                                Learn More
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </NativeCard>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <NativeBottomTabs />
    </div>
  );
}