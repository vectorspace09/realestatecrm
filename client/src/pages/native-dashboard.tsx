import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useLocation } from "wouter";
import NativeHeader from "@/components/native/native-header";
import NativeBottomTabs from "@/components/native/native-bottom-tabs";
import AIChat from "@/components/layout/ai-chat";
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
  Target
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
            <p className="text-gray-400">Loading...</p>
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
    <div className="app-shell">
      <NativeHeader 
        title={`Hi, ${(user as any)?.firstName || 'Agent'}!`} 
        rightButton={
          <button className="native-nav-button">
            <Target className="w-5 h-5 text-gray-400" />
          </button>
        }
      />
      
      <div className="app-content">
        <div className="space-y-6 p-4 pb-24">
          {/* AI Priority Dashboard Card */}
          <NativeCard className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold">AI Priority Dashboard</h2>
                <p className="text-blue-100 text-sm">Your top action items today</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            
            <div className="space-y-3">
              {/* Urgent Task */}
              <div className="flex items-center p-3 bg-white/10 rounded-xl backdrop-blur">
                <div className="w-8 h-8 bg-red-400 rounded-full flex items-center justify-center mr-3">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Urgent Task</p>
                  <p className="text-xs text-blue-100">
                    {overdueTask ? `${overdueTask.title.substring(0, 25)}...` : 
                     highPriorityTasks[0] ? `${highPriorityTasks[0].title.substring(0, 25)}...` :
                     'No urgent tasks'}
                  </p>
                </div>
              </div>
              
              {/* Hot Lead */}
              <div className="flex items-center p-3 bg-white/10 rounded-xl backdrop-blur">
                <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center mr-3">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Hot Lead</p>
                  <p className="text-xs text-blue-100">
                    {hotLead ? `${hotLead.firstName} ${hotLead.lastName}` : 'No hot leads today'}
                  </p>
                </div>
              </div>
              
              {/* Deal Progress */}
              <div className="flex items-center p-3 bg-white/10 rounded-xl backdrop-blur">
                <div className="w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center mr-3">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Deals Closing</p>
                  <p className="text-xs text-blue-100">{closingDeals} deals in progress</p>
                </div>
              </div>
            </div>
          </NativeCard>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <NativeCard>
              <div className="text-center">
                <DollarSign className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  ${parseInt(metrics?.totalRevenue || '0').toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">Total Revenue</p>
                <div className="flex items-center justify-center mt-1">
                  <span className="text-xs text-emerald-500">+23.5%</span>
                </div>
              </div>
            </NativeCard>
            
            <NativeCard>
              <div className="text-center">
                <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  {metrics?.totalLeads || 0}
                </p>
                <p className="text-xs text-gray-400">Active Leads</p>
                <div className="flex items-center justify-center mt-1">
                  <span className="text-xs text-blue-500">+12.3%</span>
                </div>
              </div>
            </NativeCard>
            
            <NativeCard>
              <div className="text-center">
                <Building className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  {metrics?.activeProperties || 0}
                </p>
                <p className="text-xs text-gray-400">Properties</p>
                <div className="flex items-center justify-center mt-1">
                  <span className="text-xs text-purple-500">+5.7%</span>
                </div>
              </div>
            </NativeCard>
            
            <NativeCard>
              <div className="text-center">
                <HandCoins className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  {metrics?.activeDeals || 0}
                </p>
                <p className="text-xs text-gray-400">Active Deals</p>
                <div className="flex items-center justify-center mt-1">
                  <span className="text-xs text-amber-500">+8.9%</span>
                </div>
              </div>
            </NativeCard>
          </div>

          {/* Quick Actions */}
          <NativeCard>
            <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                className="native-button-secondary justify-start"
                onClick={() => navigate('/leads')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
              <Button 
                className="native-button-secondary justify-start"
                onClick={() => navigate('/properties')}
              >
                <Building className="w-4 h-4 mr-2" />
                Add Property
              </Button>
              <Button 
                className="native-button-secondary justify-start"
                onClick={() => navigate('/deals')}
              >
                <HandCoins className="w-4 h-4 mr-2" />
                New Deal
              </Button>
              <Button 
                className="native-button-secondary justify-start"
                onClick={() => navigate('/tasks')}
              >
                <Target className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
          </NativeCard>

          {/* Recent Activity */}
          <NativeCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Recent Activity</h3>
              <Button variant="ghost" size="sm" className="text-blue-400">
                View All
              </Button>
            </div>
            
            <div className="space-y-0">
              {recentLeads?.slice(0, 3).map((lead) => (
                <NativeListItem
                  key={lead.id}
                  title={`${lead.firstName} ${lead.lastName}`}
                  subtitle={`New lead • Score: ${lead.score}/100`}
                  avatar={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.firstName}`}
                  avatarFallback={`${lead.firstName?.charAt(0)}${lead.lastName?.charAt(0)}`}
                  badge={{
                    text: lead.status?.charAt(0).toUpperCase() + lead.status?.slice(1),
                    variant: lead.score >= 90 ? "success" : lead.score >= 70 ? "warning" : "default"
                  }}
                  onClick={() => navigate(`/leads/${lead.id}`)}
                />
              ))}
            </div>
          </NativeCard>

          {/* AI Insights */}
          {insights?.insights && insights.insights.length > 0 && (
            <NativeCard>
              <div className="flex items-center mb-4">
                <Zap className="w-5 h-5 text-blue-400 mr-2" />
                <h3 className="font-semibold text-white">AI Insights</h3>
              </div>
              
              <div className="space-y-3">
                {insights.insights.slice(0, 3).map((insight, index) => (
                  <div key={index} className="flex items-start p-3 bg-gray-800/50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-xs text-blue-400 font-medium">{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-300 flex-1">{insight}</p>
                  </div>
                ))}
              </div>
            </NativeCard>
          )}
        </div>
      </div>
      
      <NativeBottomTabs />
      <AIChat />
    </div>
  );
}