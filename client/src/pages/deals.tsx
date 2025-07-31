import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import AIChat from "@/components/layout/ai-chat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, DollarSign, Calendar, TrendingUp, FileText, User, Home, Plus, ArrowRight, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDealSchema } from "@shared/schema";
import { z } from "zod";
import { useDragDrop } from "@/hooks/use-drag-drop";
import { apiRequest } from "@/lib/queryClient";
import type { Deal, Lead, Property } from "@shared/schema";

const DEAL_STAGES = [
  { id: "offer", label: "Offer", progress: 20, color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100", borderColor: "border-blue-200 dark:border-blue-800" },
  { id: "inspection", label: "Inspection", progress: 40, color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100", borderColor: "border-orange-200 dark:border-orange-800" },
  { id: "legal", label: "Legal Review", progress: 60, color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100", borderColor: "border-purple-200 dark:border-purple-800" },
  { id: "payment", label: "Payment", progress: 80, color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100", borderColor: "border-amber-200 dark:border-amber-800" },
  { id: "handover", label: "Handover", progress: 100, color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100", borderColor: "border-emerald-200 dark:border-emerald-800" },
];

function getDealStageInfo(status: string) {
  return DEAL_STAGES.find(stage => stage.id === status) || DEAL_STAGES[0];
}

type DealFormData = z.infer<typeof insertDealSchema>;

export default function Deals() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: deals = [], isLoading: dealsLoading, error } = useQuery({
    queryKey: ["/api/deals"],
    retry: false,
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["/api/leads"],
    retry: false,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    retry: false,
  });

  // Deal creation mutation
  const createDealMutation = useMutation({
    mutationFn: async (data: DealFormData) => {
      return apiRequest("/api/deals", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Deal created successfully!",
      });
    },
    onError: (error) => {
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
        description: "Failed to create deal. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Deal status update mutation
  const updateDealStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest(`/api/deals/${id}/status`, {
        method: "PATCH",
        body: { status },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      toast({
        title: "Success",
        description: "Deal status updated successfully!",
      });
    },
    onError: (error) => {
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
        description: "Failed to update deal status. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Drag and drop functionality
  const { handleDragStart, handleDragOver, handleDrop } = useDragDrop({
    onDrop: (deal: Deal, targetStatus: string) => {
      if (deal.status !== targetStatus) {
        updateDealStatusMutation.mutate({ id: deal.id, status: targetStatus });
      }
    },
  });

  const form = useForm<DealFormData>({
    resolver: zodResolver(insertDealSchema.omit({ id: true, createdAt: true, updatedAt: true })),
    defaultValues: {
      status: "offer",
      dealValue: 0,
      offerAmount: 0,
      commission: 0,
    },
  });

  const handleCreateDeal = (data: DealFormData) => {
    createDealMutation.mutate(data);
  };

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

  // Handle unauthorized errors
  useEffect(() => {
    if (error && isUnauthorizedError(error)) {
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
  }, [error, toast]);

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>;
  }

  const activeDealsByStage = DEAL_STAGES.reduce((acc, stage) => {
    acc[stage.id] = deals.filter((deal: Deal) => deal.status === stage.id);
    return acc;
  }, {} as Record<string, Deal[]>);

  const totalDealValue = deals.reduce((sum: number, deal: Deal) => sum + Number(deal.dealValue || 0), 0);
  const averageDealValue = deals.length > 0 ? totalDealValue / deals.length : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Deals & Transactions</h1>
              <p className="text-gray-600 dark:text-gray-400">Track your active deals and commission pipeline</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary-600 hover:bg-primary-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Deal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Deal</DialogTitle>
                  <DialogDescription>
                    Create a new deal by linking a lead with a property.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleCreateDeal)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="leadId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lead *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a lead" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {leads.map((lead: Lead) => (
                                  <SelectItem key={lead.id} value={lead.id}>
                                    {lead.firstName} {lead.lastName} - ${lead.budget?.toLocaleString()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="propertyId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a property" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {properties.map((property: Property) => (
                                  <SelectItem key={property.id} value={property.id}>
                                    {property.title} - ${Number(property.price).toLocaleString()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="dealValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Deal Value *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter deal value"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="offerAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Offer Amount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Initial offer amount"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="commission"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Commission Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Expected commission"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Additional notes about this deal..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createDealMutation.isPending}
                        className="bg-primary-600 hover:bg-primary-700"
                      >
                        {createDealMutation.isPending ? "Creating..." : "Create Deal"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Deal Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Deals</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{deals.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pipeline Value</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      ${totalDealValue.toLocaleString()}
                    </p>
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
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Deal Size</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      ${averageDealValue.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Est. Commission</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      ${Math.round(totalDealValue * 0.03).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Deal Pipeline by Stage */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {DEAL_STAGES.map((stage) => (
              <Card key={stage.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-gray-900 dark:text-white">{stage.label}</CardTitle>
                    <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {activeDealsByStage[stage.id]?.length || 0}
                    </Badge>
                  </div>
                  <Progress value={stage.progress} className="h-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeDealsByStage[stage.id]?.length > 0 ? (
                    activeDealsByStage[stage.id].map((deal: Deal) => (
                      <div key={deal.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              Deal #{deal.id.slice(-6)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              ${Number(deal.dealValue).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            Lead ID: {deal.leadId.slice(-6)}
                          </div>
                          <div className="flex items-center">
                            <Home className="w-4 h-4 mr-2" />
                            Property ID: {deal.propertyId.slice(-6)}
                          </div>
                          {deal.expectedCloseDate && (
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              Close: {new Date(deal.expectedCloseDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        
                        <Separator className="my-3" />
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Created: {new Date(deal.createdAt).toLocaleDateString()}
                          </span>
                          <Button size="sm" variant="outline" className="text-xs">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">No deals in this stage</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Deals Table */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-white">Recent Deals</CardTitle>
              <CardDescription>Latest deal activity and updates</CardDescription>
            </CardHeader>
            <CardContent>
              {deals.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Deal ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Value</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Expected Close</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deals.slice(0, 10).map((deal: Deal) => {
                        const stageInfo = getDealStageInfo(deal.status);
                        return (
                          <tr key={deal.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="py-3 px-4 text-gray-900 dark:text-white">#{deal.id.slice(-8)}</td>
                            <td className="py-3 px-4 text-gray-900 dark:text-white">${Number(deal.dealValue).toLocaleString()}</td>
                            <td className="py-3 px-4">
                              <Badge variant="secondary" className="capitalize">
                                {deal.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                              {deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : "TBD"}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <Progress value={stageInfo.progress} className="h-2 flex-1" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">{stageInfo.progress}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No deals yet</h3>
                  <p className="text-gray-500 dark:text-gray-400">Start by creating your first deal from a qualified lead</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
      
      <AIChat />
    </div>
  );
}
