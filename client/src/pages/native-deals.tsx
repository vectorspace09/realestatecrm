import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useLocation } from "wouter";
import NativeHeader from "@/components/native/native-header";
import NativeBottomTabs from "@/components/native/native-bottom-tabs";
import NativeCard from "@/components/native/native-card";
import NativeSearchBar from "@/components/native/native-search-bar";
import NativeFloatingActionButton from "@/components/native/native-floating-action-button";
import NativeStatusBar from "@/components/native/native-status-bar";
import NativeProgressRing from "@/components/native/native-progress-ring";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  HandCoins,
  DollarSign,
  Calendar,
  User,
  Building,
  Plus,
  Filter,
  Eye,
  Target,
  TrendingUp
} from "lucide-react";

export default function NativeDeals() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ["/api/deals"],
    staleTime: 2 * 60 * 1000,
  }) as { data: any[]; isLoading: boolean };

  // Filter deals
  const filteredDeals = useMemo(() => {
    if (!deals) return [];
    
    return deals.filter((deal: any) => {
      const leadName = `${deal.lead?.firstName || ''} ${deal.lead?.lastName || ''}`;
      const propertyTitle = deal.property?.title || '';
      
      const matchesSearch = !searchTerm || 
        leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        propertyTitle.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || deal.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [deals, searchTerm, statusFilter]);

  // Calculate status counts and metrics
  const statusCounts = useMemo(() => {
    if (!deals) return [];
    
    const counts = deals.reduce((acc: any, deal: any) => {
      acc[deal.status] = (acc[deal.status] || 0) + 1;
      return acc;
    }, {});

    return [
      { label: "Active", count: counts.active || 0, color: "blue" as const },
      { label: "Under Contract", count: counts.under_contract || 0, color: "yellow" as const },
      { label: "Closed", count: counts.closed || 0, color: "green" as const },
      { label: "Lost", count: counts.lost || 0, color: "red" as const }
    ];
  }, [deals]);

  const totalValue = useMemo(() => {
    if (!deals) return 0;
    return deals
      .filter((deal: any) => deal.status === 'active' || deal.status === 'under_contract')
      .reduce((sum: number, deal: any) => sum + (deal.value || 0), 0);
  }, [deals]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "warning" | "success"; label: string; color: string }> = {
      active: { variant: "default" as const, label: "Active", color: "#3B82F6" },
      under_contract: { variant: "warning" as const, label: "Under Contract", color: "#F59E0B" },
      closed: { variant: "success" as const, label: "Closed", color: "#10B981" },
      lost: { variant: "default" as const, label: "Lost", color: "#6B7280" }
    };
    return statusMap[status] || statusMap.active;
  };

  const getDealProgress = (deal: any) => {
    const statusProgress: Record<string, number> = {
      active: 25,
      under_contract: 75,
      closed: 100,
      lost: 0
    };
    return statusProgress[deal.status] || 0;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase() || "D";
  };

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

  return (
    <div className="app-shell">
      <NativeHeader title="Deals" />
      
      <div className="app-content">
        <div className="space-y-4 p-4 pb-24">
          {/* Total Pipeline Value */}
          <NativeCard className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Total Pipeline Value</p>
                <p className="text-2xl font-bold">{formatPrice(totalValue)}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-emerald-200" />
                  <span className="text-sm text-emerald-200">+12.5% this month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </NativeCard>

          {/* Status Overview */}
          <NativeStatusBar items={statusCounts} />

          {/* Search and Filters */}
          <NativeCard>
            <div className="space-y-4">
              <NativeSearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search deals..."
                onClear={() => setSearchTerm("")}
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="under_contract">Under Contract</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Badge variant="secondary" className="text-xs">
                  {filteredDeals.length} deals
                </Badge>
              </div>
            </div>
          </NativeCard>

          {/* Deals List */}
          {dealsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredDeals.length === 0 ? (
            <NativeCard>
              <div className="text-center py-8">
                <HandCoins className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No deals found</p>
              </div>
            </NativeCard>
          ) : (
            <div className="space-y-3">
              {filteredDeals.map((deal) => {
                const statusBadge = getStatusBadge(deal.status);
                const progress = getDealProgress(deal);
                
                return (
                  <NativeCard 
                    key={deal.id}
                    withPressEffect
                    onClick={() => navigate(`/deals/${deal.id}`)}
                  >
                    <div className="space-y-4">
                      {/* Deal Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={deal.lead?.profileImageUrl} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                              {getInitials(deal.lead?.firstName, deal.lead?.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white text-base">
                              {deal.lead?.firstName} {deal.lead?.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {deal.property?.title}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={`text-xs px-2 py-1 ${
                                statusBadge.variant === 'success' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100' :
                                statusBadge.variant === 'warning' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100' :
                                'bg-card text-muted-foreground dark:bg-card dark:text-muted-foreground'
                              }`}>
                                {statusBadge.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <NativeProgressRing
                            progress={progress}
                            size={40}
                            strokeWidth={3}
                            color={statusBadge.color}
                          >
                            <span className="text-xs font-medium text-white">
                              {progress}%
                            </span>
                          </NativeProgressRing>
                          <button
                            className="p-2 hover:bg-card/50 rounded-lg transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/deals/${deal.id}`);
                            }}
                          >
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Deal Value */}
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-5 h-5 text-emerald-500" />
                        <span className="text-xl font-bold text-emerald-400">
                          {formatPrice(deal.value)}
                        </span>
                        {deal.commission && (
                          <span className="text-sm text-muted-foreground ml-2">
                            Commission: {formatPrice(deal.commission)}
                          </span>
                        )}
                      </div>
                      
                      {/* Deal Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {deal.expectedCloseDate && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground">Expected Close</p>
                              <p className="text-white">
                                {new Date(deal.expectedCloseDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground">Stage</p>
                            <p className="text-white capitalize">
                              {deal.status.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </NativeCard>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      <NativeFloatingActionButton
        onClick={() => navigate('/deals/new')}
        icon={<Plus className="w-6 h-6" />}
        label="Add Deal"
      />
      
      <NativeBottomTabs />
    </div>
  );
}