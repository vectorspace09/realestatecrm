import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import NativeHeader from "@/components/native/native-header";
import NativeBottomTabs from "@/components/native/native-bottom-tabs";
import NativeCard from "@/components/native/native-card";
import NativeListItem from "@/components/native/native-list-item";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatusBadgeSelector, { LEAD_STATUS_OPTIONS } from "@/components/ui/status-badge-selector";
import LoadingSpinner from "@/components/ui/loading-spinner";
import PullToRefresh from "@/components/ui/pull-to-refresh";
import { StaggeredList } from "@/components/ui/mobile-animations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Plus, 
  Filter,
  Star,
  Mail,
  Phone,
  DollarSign,
  MapPin,
  Eye,
  Users
} from "lucide-react";

export default function NativeLeads() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const { isMobile, isTablet } = useMobile();
  const [location, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const leadsPerPage = 20;

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

  const queryClient = useQueryClient();

  const { data: leads = [], isLoading: leadsLoading, error, refetch } = useQuery({
    queryKey: ["/api/leads"],
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  }) as { data: any[]; isLoading: boolean; error: any; refetch: () => void };

  const handleRefresh = async () => {
    await refetch();
  };

  // Status update mutation for leads
  const updateLeadStatusMutation = useMutation({
    mutationFn: async ({ leadId, newStatus }: { leadId: string; newStatus: string }) => {
      return apiRequest(`/api/leads/${leadId}/status`, {
        method: "PATCH",
        body: { status: newStatus }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Lead Updated",
        description: "Lead status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update lead status",
        variant: "destructive",
      });
    },
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase() || "L";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { variant: "success" as const, label: "Hot" };
    if (score >= 70) return { variant: "warning" as const, label: "Warm" };
    return { variant: "default" as const, label: "Cold" };
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "success" | "warning", label: string }> = {
      new: { variant: "default" as const, label: "New" },
      contacted: { variant: "default" as const, label: "Contacted" },
      qualified: { variant: "success" as const, label: "Qualified" },
      tour: { variant: "warning" as const, label: "Tour" },
      offer: { variant: "warning" as const, label: "Offer" },
      closed: { variant: "success" as const, label: "Closed" },
      nurturing: { variant: "default" as const, label: "Nurturing" }
    };
    return statusMap[status] || statusMap.new;
  };

  // Memoize filtered leads for performance
  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    
    return (leads as any[]).filter((lead: any) => {
      const matchesSearch = !searchTerm || 
        `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm);
      
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, statusFilter]);

  // Paginate for better performance
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);
  const startIndex = (currentPage - 1) * leadsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + leadsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

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
    <div className="min-h-screen bg-gray-50 dark:bg-card flex flex-col">
      <NativeHeader 
        title="Leads" 
        rightButton={
          <button 
            className="p-2 rounded-lg bg-primary-600 hover:bg-primary-700 transition-colors duration-200 active:scale-95"
            onClick={() => navigate('/leads/new')}
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        }
      />
      
      <div className="flex-1 overflow-hidden">
        <PullToRefresh onRefresh={handleRefresh}>
          <div className="space-y-4 p-4 pb-24">
          {/* Search and Filter */}
          <NativeCard>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="native-input pl-10"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="tour">Tour</SelectItem>
                      <SelectItem value="offer">Offer</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="nurturing">Nurturing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Badge variant="secondary" className="text-xs">
                  {filteredLeads.length} leads
                </Badge>
              </div>
            </div>
          </NativeCard>

          {/* Leads List */}
          {leadsLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <LoadingSpinner size="lg" />
              <p className="text-muted-foreground dark:text-muted-foreground mt-3 text-sm">Loading leads...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <NativeCard>
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No leads found</p>
                <Button 
                  className="native-button-primary"
                  onClick={() => navigate('/leads/new')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Lead
                </Button>
              </div>
            </NativeCard>
          ) : (
            <StaggeredList staggerDelay={50} className="space-y-3">
              {paginatedLeads.map((lead: any) => {
                const scoreBadge = getScoreBadge(lead.score);
                const statusBadge = getStatusBadge(lead.status);
                
                return (
                  <NativeCard 
                    key={lead.id}
                    withPressEffect
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    className="hover:border-primary-200 dark:hover:border-primary-700 transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                            {getInitials(lead.firstName, lead.lastName)}
                          </div>
                          {lead.score >= 90 && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                              <Star className="w-2 h-2 text-white fill-current" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-muted-foreground dark:text-white text-base truncate">
                            {lead.firstName} {lead.lastName}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1 flex-wrap gap-1">
                            <StatusBadgeSelector
                              currentStatus={lead.status}
                              options={LEAD_STATUS_OPTIONS}
                              onStatusChange={(newStatus) => {
                                updateLeadStatusMutation.mutate({
                                  leadId: lead.id,
                                  newStatus
                                });
                              }}
                              size="sm"
                            />
                            <Badge className={`text-xs px-2 py-1 font-medium ${
                              scoreBadge.variant === 'success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' :
                              scoreBadge.variant === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
                              'bg-card text-muted-foreground dark:bg-card dark:text-muted-foreground'
                            }`}>
                              <Star className="w-3 h-3 mr-1" />
                              {lead.score != null && !isNaN(Number(lead.score)) 
                                ? Math.round(Number(lead.score)) 
                                : 0
                              }
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <button
                        className="p-2 rounded-lg text-muted-foreground hover:text-muted-foreground dark:hover:text-muted-foreground hover:bg-card dark:hover:bg-card transition-all duration-200 active:scale-95"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/leads/${lead.id}`);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1 flex-1 min-w-0">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                        {lead.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3 flex-shrink-0" />
                            <span className="text-xs">{lead.phone}</span>
                          </div>
                        )}
                      </div>
                      
                      {lead.budget && (
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <DollarSign className="w-3 h-3" />
                          <span>
                            ${lead.budget?.toLocaleString()}
                            {lead.budgetMax && lead.budgetMax !== lead.budget && ` - $${lead.budgetMax.toLocaleString()}`}
                          </span>
                        </div>
                      )}
                      
                      {lead.preferredLocations && lead.preferredLocations.length > 0 && (
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {Array.isArray(lead.preferredLocations) 
                              ? lead.preferredLocations.slice(0, 2).join(", ")
                              : lead.preferredLocations
                            }
                            {Array.isArray(lead.preferredLocations) && lead.preferredLocations.length > 2 && 
                              ` +${lead.preferredLocations.length - 2} more`
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  </NativeCard>
                );
              })}
            </StaggeredList>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <NativeCard>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="text-blue-400"
                >
                  Previous
                </Button>
                
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                
                <Button
                  variant="ghost"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="text-blue-400"
                >
                  Next
                </Button>
              </div>
            </NativeCard>
          )}
        </div>
        </PullToRefresh>
      </div>
      
      <NativeBottomTabs />
    </div>
  );
}