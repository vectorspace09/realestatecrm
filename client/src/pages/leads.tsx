import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import DesktopHeader from "@/components/layout/desktop-header";
import MobileBottomTabs from "@/components/layout/mobile-bottom-tabs";
import AIChat from "@/components/layout/ai-chat";
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
  FileText
} from "lucide-react";

export default function Leads() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    source: "website",
    status: "new",
    budget: "",
    budgetMax: "",
    preferredLocations: "",
    propertyTypes: "",
    timeline: "3_months",
    notes: ""
  });

  // Check URL params for actions
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'add') {
      setShowAddForm(true);
    }
  }, []);

  const { data: leads, isLoading: leadsLoading } = useQuery({
    queryKey: ["/api/leads"],
    retry: false,
  });

  const addLeadMutation = useMutation({
    mutationFn: async (leadData: any) => {
      const response = await apiRequest("/api/leads", {
        method: "POST",
        body: leadData
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Success",
        description: "Lead added successfully",
      });
      setShowAddForm(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to add lead: " + error.message,
        variant: "destructive",
      });
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest(`/api/leads/${id}`, {
        method: "PATCH",
        body: data
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Success",
        description: "Lead updated successfully",
      });
      setEditingLead(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to update lead: " + error.message,
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

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      source: "website",
      status: "new",
      budget: "",
      budgetMax: "",
      preferredLocations: "",
      propertyTypes: "",
      timeline: "3_months",
      notes: ""
    });
  };

  const handleEdit = (lead: any) => {
    setEditingLead(lead);
    setFormData({
      firstName: lead.firstName || "",
      lastName: lead.lastName || "",
      email: lead.email || "",
      phone: lead.phone || "",
      source: lead.source || "website",
      status: lead.status || "new",
      budget: lead.budget?.toString() || "",
      budgetMax: lead.budgetMax?.toString() || "",
      preferredLocations: Array.isArray(lead.preferredLocations) 
        ? lead.preferredLocations.join(", ") 
        : lead.preferredLocations || "",
      propertyTypes: Array.isArray(lead.propertyTypes) 
        ? lead.propertyTypes.join(", ") 
        : lead.propertyTypes || "",
      timeline: lead.timeline || "3_months",
      notes: lead.notes || ""
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      budget: formData.budget ? parseInt(formData.budget) : null,
      budgetMax: formData.budgetMax ? parseInt(formData.budgetMax) : null,
      preferredLocations: formData.preferredLocations ? formData.preferredLocations.split(",").map(loc => loc.trim()) : [],
      propertyTypes: formData.propertyTypes ? formData.propertyTypes.split(",").map(type => type.trim()) : [],
    };

    if (editingLead) {
      updateLeadMutation.mutate({ id: editingLead.id, data: submitData });
    } else {
      addLeadMutation.mutate(submitData);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase() || "L";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100";
    if (score >= 70) return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100";
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      contacted: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
      qualified: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100",
      tour: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
      offer: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
      closed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      nurturing: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
    };
    return statusMap[status] || statusMap.new;
  };

  const filteredLeads = leads?.filter((lead: any) => {
    const matchesSearch = !searchTerm || 
      `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <DesktopHeader />
      
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leads Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage and track all your potential clients</p>
            </div>
            <Button 
              className="bg-primary-600 hover:bg-primary-700 mt-4 lg:mt-0"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Lead
            </Button>
          </div>

          {/* Filters and Search */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="w-4 h-4 text-gray-400" />
                    </div>
                    <Input
                      type="text"
                      placeholder="Search leads by name, email, or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-500" />
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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leads Table */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-white">All Leads</CardTitle>
              <CardDescription>Complete list of all leads in your pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              {leadsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No leads found</p>
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
                      {filteredLeads.map((lead) => (
                        <TableRow 
                          key={lead.id} 
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
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
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {lead.firstName} {lead.lastName}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {lead.source}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Mail className="w-3 h-3 text-gray-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">{lead.email}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Phone className="w-3 h-3 text-gray-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">{lead.phone}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-3 h-3 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {lead.budget ? `$${lead.budget.toLocaleString()}` : 'N/A'}
                              </span>
                              {lead.budgetMax && lead.budgetMax !== lead.budget && (
                                <span className="text-xs text-gray-500">
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
                            <span className="text-sm text-gray-600 dark:text-gray-400">
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
            </CardContent>
          </Card>
        </main>

      <MobileBottomTabs />
      
      {/* Add/Edit Lead Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
            <DialogDescription>
              {editingLead ? 'Update lead information and notes' : 'Enter the details for the new lead'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="source">Lead Source</Label>
                <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget">Budget (Min)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="500000"
                />
              </div>
              <div>
                <Label htmlFor="budgetMax">Budget (Max)</Label>
                <Input
                  id="budgetMax"
                  type="number"
                  value={formData.budgetMax}
                  onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                  placeholder="750000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="preferredLocations">Preferred Locations</Label>
              <Input
                id="preferredLocations"
                value={formData.preferredLocations}
                onChange={(e) => setFormData({ ...formData, preferredLocations: e.target.value })}
                placeholder="Manhattan, Brooklyn Heights, SoHo"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="propertyTypes">Property Types</Label>
                <Input
                  id="propertyTypes"
                  value={formData.propertyTypes}
                  onChange={(e) => setFormData({ ...formData, propertyTypes: e.target.value })}
                  placeholder="apartment, condo, townhouse"
                />
              </div>
              <div>
                <Label htmlFor="timeline">Timeline</Label>
                <Select value={formData.timeline} onValueChange={(value) => setFormData({ ...formData, timeline: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="1_month">1 Month</SelectItem>
                    <SelectItem value="2_months">2 Months</SelectItem>
                    <SelectItem value="3_months">3 Months</SelectItem>
                    <SelectItem value="6_months">6 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional information about the lead..."
                rows={4}
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false);
                  setEditingLead(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={addLeadMutation.isPending || updateLeadMutation.isPending}
                className="bg-primary-600 hover:bg-primary-700"
              >
                {(addLeadMutation.isPending || updateLeadMutation.isPending) ? 
                  'Saving...' : 
                  (editingLead ? 'Update Lead' : 'Add Lead')
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <MobileBottomTabs />
      <AIChat />
    </div>
  );
}