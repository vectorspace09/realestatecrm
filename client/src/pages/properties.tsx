import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMobile } from "@/hooks/use-mobile";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import ResponsiveHeader from "@/components/layout/responsive-header";
import MobileBottomTabs from "@/components/layout/mobile-bottom-tabs";

import KanbanBoard from "@/components/kanban/kanban-board";
import PropertyForm from "@/components/forms/property-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search } from "lucide-react";
import type { Property } from "@shared/schema";

const PROPERTY_STATUSES = [
  { id: "available", label: "Available", color: "emerald" },
  { id: "pending", label: "Under Contract", color: "amber" },
  { id: "sold", label: "Sold", color: "green" },
  { id: "withdrawn", label: "Off Market", color: "gray" },
];

export default function Properties() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);

  const { data: properties = [], isLoading: propertiesLoading, error } = useQuery({
    queryKey: ["/api/properties", { search, propertyType: typeFilter }],
    staleTime: 3 * 60 * 1000, // 3 minutes - properties change less frequently
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const updatePropertyStatusMutation = useMutation({
    mutationFn: async ({ propertyId, status }: { propertyId: string; status: string }) => {
      await apiRequest(`/api/properties/${propertyId}/status`, "PATCH", { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Success",
        description: "Property status updated successfully",
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
        description: "Failed to update property status",
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
    return <div className="min-h-screen bg-card flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>;
  }

  const handlePropertyMove = (propertyId: string, newStatus: string) => {
    updatePropertyStatusMutation.mutate({ propertyId, status: newStatus });
  };

  const groupedProperties = PROPERTY_STATUSES.reduce((acc, status) => {
    acc[status.id] = (properties as Property[]).filter((property: Property) => property.status === status.id);
    return acc;
  }, {} as Record<string, Property[]>);

  return (
    <div className="min-h-screen bg-card flex flex-col">
      <ResponsiveHeader />
      
      <main className="flex-1 overflow-hidden p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Property Management</h1>
                <p className="text-muted-foreground">Manage property listings and match with leads</p>
              </div>
              <Dialog open={isAddPropertyOpen} onOpenChange={setIsAddPropertyOpen}>
                <DialogTrigger asChild>
                  <Button className="mt-4 sm:mt-0 bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Property
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Property</DialogTitle>
                  </DialogHeader>
                  <PropertyForm onSuccess={() => setIsAddPropertyOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search properties..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-white dark:bg-card border-border dark:border-border"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48 bg-white dark:bg-card border-border dark:border-border">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Kanban Board */}
          <div className="flex-1 overflow-hidden">
            <KanbanBoard
              columns={PROPERTY_STATUSES}
              items={groupedProperties}
              onItemMove={handlePropertyMove}
              isLoading={propertiesLoading}
              itemType="property"
            />
          </div>
        </main>
      
      <MobileBottomTabs />

    </div>
  );
}
