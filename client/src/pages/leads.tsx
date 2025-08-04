import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Calendar,
  Star,
  TrendingUp,
  User,
  MessageSquare,
  FileText,
  LayoutGrid,
  Table2
} from "lucide-react";
import LeadForm from "@/components/forms/lead-form";
import Pagination from "@/components/ui/pagination";
import KanbanBoard from "@/components/kanban/kanban-board";

export default function Leads() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const { isMobile, isTablet } = useMobile();
  const [location, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const leadsPerPage = isMobile ? 10 : 20;


  // Check URL params for actions and search
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'add') {
      setShowAddForm(true);
    }
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, []);

  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ["/api/leads"],
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });



  // Lead status update mutation for Kanban
  const updateLeadStatusMutation = useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: string }) => {
      const response = await apiRequest(`/api/leads/${leadId}`, {
        method: "PATCH",
        body: { status }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Success",
        description: "Lead status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to update lead status: " + error.message,
        variant: "destructive",
      });
    },
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



  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase() || "L";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100";
    if (score >= 70) return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100";
    return "bg-card text-muted-foreground dark:bg-card dark:text-muted-foreground";
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      contacted: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
      qualified: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100",
      tour: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
      offer: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
      closed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      nurturing: "bg-card text-muted-foreground dark:bg-card dark:text-muted-foreground"
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.new;
  };

  // Memoize filtered leads for performance
  const filteredLeads = useMemo(() => {
    if (!leads || !Array.isArray(leads)) return [];
    
    return leads.filter((lead: any) => {
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

  // Define lead status columns for Kanban
  const LEAD_STATUSES = [
    { id: "new", label: "New Leads", color: "blue" },
    { id: "contacted", label: "Contacted", color: "purple" },
    { id: "qualified", label: "Qualified", color: "emerald" },
    { id: "tour", label: "Tour Scheduled", color: "amber" },
    { id: "offer", label: "Offer Made", color: "orange" },
    { id: "closed", label: "Closed", color: "green" },
  ];

  // Group leads by status for Kanban
  const groupedLeads = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    LEAD_STATUSES.forEach(status => {
      grouped[status.id] = filteredLeads.filter((lead: any) => lead.status === status.id);
    });
    return grouped;
  }, [filteredLeads]);

  // Handle lead status change from Kanban
  const handleLeadMove = (leadId: string, targetStatus: string) => {
    updateLeadStatusMutation.mutate({ leadId, status: targetStatus });
  };

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-card flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-card flex flex-col">
      <ResponsiveHeader />
      
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">
          {/* Header - Mobile Optimized */}
          <div className="flex flex-col space-y-4 mb-6">
            <div className="text-center sm:text-left">
              <h1 className="mobile-title text-white">Leads Management</h1>
              <p className="mobile-subtitle text-muted-foreground">Manage and track all your potential clients</p>
            </div>
            <Button 
              className="mobile-button bg-primary-600 hover:bg-primary-700 w-full sm:w-auto sm:self-start"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Lead
            </Button>
          </div>

          {/* Filters and Search */}
          <Card className="bg-card border-border mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <Input
                      type="text"
                      placeholder="Search leads by name, email, or phone..."
                      value={searchTerm}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSearchTerm(value);
                        // Reset to first page when searching
                        setCurrentPage(1);
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="tour">Tour Scheduled</SelectItem>
                        <SelectItem value="offer">Offer Made</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="nurturing">Nurturing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                    {filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'}
                  </Badge>
                  
                  {/* View Toggle */}
                  <div className="flex bg-card rounded-lg p-1">
                    <Button
                      variant={viewMode === "table" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                      className="flex-1 text-xs"
                    >
                      <Table2 className="w-4 h-4 mr-1" />
                      Table
                    </Button>
                    <Button
                      variant={viewMode === "kanban" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("kanban")}
                      className="flex-1 text-xs"
                    >
                      <LayoutGrid className="w-4 h-4 mr-1" />
                      Pipeline
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conditional Content Based on View Mode */}
          {viewMode === "kanban" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Leads Pipeline</h2>
                  <p className="text-sm text-muted-foreground">Drag and drop leads to change their status</p>
                </div>
              </div>
              
              <div className="overflow-x-auto pb-4" style={{ minHeight: '600px' }}>
                <div style={{ minWidth: '1200px' }}>
                  <KanbanBoard
                    columns={LEAD_STATUSES}
                    items={groupedLeads}
                    onItemMove={handleLeadMove}
                    isLoading={leadsLoading}
                    itemType="lead"
                  />
                </div>
              </div>
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg text-white">All Leads</CardTitle>
                <CardDescription>Complete list of all leads in your pipeline</CardDescription>
              </CardHeader>
              <CardContent>
              {leadsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No leads found</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setShowAddForm(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Lead
                  </Button>
                </div>
              ) : (
                <>
                  {/* Mobile view - Cards */}
                  {isMobile || isTablet ? (
                    <div className="space-y-3">
                      {paginatedLeads.map((lead) => (
                        <Card 
                          key={lead.id} 
                          className="bg-card border-border cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                          onClick={() => navigate(`/leads/${lead.id}`)}
                        >
                          <CardContent className="mobile-card">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <Avatar className="w-12 h-12 flex-shrink-0">
                                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.firstName}`} />
                                  <AvatarFallback className="bg-gradient-to-br from-primary-500 to-purple-600 text-white text-sm">
                                    {getInitials(lead.firstName, lead.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-white text-base truncate">
                                    {lead.firstName} {lead.lastName}
                                  </h3>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge className={`${getStatusBadge(lead.status)} text-xs px-2 py-1`}>
                                      {lead.status?.charAt(0).toUpperCase() + lead.status?.slice(1)}
                                    </Badge>
                                    <Badge className={`${getScoreBadge(lead.score)} text-xs px-2 py-1`}>
                                      <Star className="w-3 h-3 mr-1" />
                                      {lead.score}/100
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-2 h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/leads/${lead.id}`);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
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
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    /* Desktop view - Table */
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Lead</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Budget</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Timeline</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                      {paginatedLeads.map((lead) => (
                        <TableRow 
                          key={lead.id} 
                          className="hover:bg-card cursor-pointer transition-colors"
                          onClick={() => navigate(`/leads/${lead.id}`)}
                        >
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.firstName}`} />
                                <AvatarFallback className="bg-gradient-to-br from-primary-500 to-purple-600 text-white">
                                  {getInitials(lead.firstName, lead.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-white">
                                  {lead.firstName} {lead.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {lead.source}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Mail className="w-3 h-3 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{lead.email}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Phone className="w-3 h-3 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{lead.phone}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-3 h-3 text-muted-foreground" />
                              <span className="text-sm font-medium text-white">
                                {lead.budget ? `$${lead.budget.toLocaleString()}` : 'N/A'}
                              </span>
                              {lead.budgetMax && lead.budgetMax !== lead.budget && (
                                <span className="text-xs text-muted-foreground">
                                  - ${lead.budgetMax.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(lead.status)}>
                              {lead.status?.charAt(0).toUpperCase() + lead.status?.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Badge className={getScoreBadge(lead.score)}>
                                {lead.score || 0}
                              </Badge>
                              {lead.score >= 90 && <Star className="w-4 h-4 text-amber-500" />}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {lead.timeline?.replace('_', ' ') || 'Not specified'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(lead);
                                }}
                                className="h-8 w-8 p-0"
                                title="Edit Lead"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/leads/${lead.id}`);
                                }}
                                className="h-8 w-8 p-0"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing {startIndex + 1}-{Math.min(startIndex + leadsPerPage, filteredLeads.length)} of {filteredLeads.length} leads
                    </p>
                    <Pagination 
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                </div>
              )}
              </CardContent>
            </Card>
          )}
        </main>
      
      {/* Add/Edit Lead Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Enter the details for the new lead
            </DialogDescription>
          </DialogHeader>
          
          <LeadForm onSuccess={() => setShowAddForm(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Mobile Floating Action Button */}
      {isMobile && (
        <Button
          className="lg:hidden fixed bottom-20 right-4 w-14 h-14 rounded-full bg-primary-600 hover:bg-primary-700 shadow-lg z-40 p-0"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="w-6 h-6 text-white" />
        </Button>
      )}
      
      <MobileBottomTabs />
    </div>
  );
}