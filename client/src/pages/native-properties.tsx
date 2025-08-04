import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import NativeHeader from "@/components/native/native-header";
import NativeBottomTabs from "@/components/native/native-bottom-tabs";
import NativeCard from "@/components/native/native-card";
import NativeSearchBar from "@/components/native/native-search-bar";
import NativeFloatingActionButton from "@/components/native/native-floating-action-button";
import NativeStatusBar from "@/components/native/native-status-bar";
import { Badge } from "@/components/ui/badge";
import StatusBadgeSelector, { PROPERTY_STATUS_OPTIONS } from "@/components/ui/status-badge-selector";
import LoadingSpinner from "@/components/ui/loading-spinner";
import PullToRefresh from "@/components/ui/pull-to-refresh";
import { StaggeredList } from "@/components/ui/mobile-animations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Square,
  Plus,
  Filter,
  Eye
} from "lucide-react";

export default function NativeProperties() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
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

  const queryClient = useQueryClient();

  const { data: properties = [], isLoading: propertiesLoading, refetch } = useQuery({
    queryKey: ["/api/properties"],
    staleTime: 5 * 60 * 1000,
  }) as { data: any[]; isLoading: boolean; refetch: () => void };

  const handleRefresh = async () => {
    await refetch();
  };

  // Status update mutation for properties
  const updatePropertyStatusMutation = useMutation({
    mutationFn: async ({ propertyId, newStatus }: { propertyId: string; newStatus: string }) => {
      return apiRequest(`/api/properties/${propertyId}`, {
        method: "PATCH",
        body: { status: newStatus }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Property Updated",
        description: "Property status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update property status",
        variant: "destructive",
      });
    },
  });

  // Filter properties
  const filteredProperties = useMemo(() => {
    if (!properties) return [];
    
    return (properties as any[]).filter((property: any) => {
      const matchesSearch = !searchTerm || 
        property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === "all" || property.type === typeFilter;
      const matchesStatus = statusFilter === "all" || property.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [properties, searchTerm, typeFilter, statusFilter]);

  // Calculate status counts
  const statusCounts = useMemo(() => {
    if (!properties) return [];
    
    const counts = (properties as any[]).reduce((acc: any, property: any) => {
      acc[property.status] = (acc[property.status] || 0) + 1;
      return acc;
    }, {});

    return [
      { label: "Available", count: counts.available || 0, color: "green" as const },
      { label: "Under Contract", count: counts.under_contract || 0, color: "yellow" as const },
      { label: "Sold", count: counts.sold || 0, color: "blue" as const },
      { label: "Off Market", count: counts.off_market || 0, color: "gray" as const }
    ];
  }, [properties]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "success" | "warning", label: string }> = {
      available: { variant: "success" as const, label: "Available" },
      under_contract: { variant: "warning" as const, label: "Under Contract" },
      sold: { variant: "default" as const, label: "Sold" },
      off_market: { variant: "default" as const, label: "Off Market" }
    };
    return statusMap[status] || statusMap.available;
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
    <div className="min-h-screen bg-gray-50 dark:bg-card flex flex-col">
      <NativeHeader 
        title="Properties"
        rightButton={
          <button 
            className="p-2 rounded-lg bg-primary-600 hover:bg-primary-700 transition-colors duration-200 active:scale-95"
            onClick={() => navigate('/properties/new')}
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        }
      />
      
      <div className="flex-1 overflow-hidden">
        <PullToRefresh onRefresh={handleRefresh}>
          <div className="space-y-4 p-4 pb-24">
          {/* Status Overview */}
          <NativeStatusBar items={statusCounts} />

          {/* Search and Filters */}
          <NativeCard>
            <div className="space-y-4">
              <NativeSearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search properties..."
                onClear={() => setSearchTerm("")}
              />
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-32 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="under_contract">Under Contract</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="off_market">Off Market</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </NativeCard>

          {/* Properties List */}
          {propertiesLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <LoadingSpinner size="lg" />
              <p className="text-muted-foreground dark:text-muted-foreground mt-3 text-sm">Loading properties...</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <NativeCard>
              <div className="text-center py-8">
                <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No properties found</p>
              </div>
            </NativeCard>
          ) : (
            <StaggeredList staggerDelay={50} className="space-y-3">
              {filteredProperties.map((property: any) => {
                const statusBadge = getStatusBadge(property.status);
                
                return (
                  <NativeCard 
                    key={property.id}
                    withPressEffect
                    onClick={() => navigate(`/properties/${property.id}`)}
                    className="hover:border-primary-200 dark:hover:border-primary-700 transition-colors duration-200"
                  >
                    <div className="space-y-4">
                      {/* Property Image */}
                      {property.images && property.images.length > 0 && (
                        <div className="relative w-full h-48 bg-card dark:bg-card rounded-xl overflow-hidden">
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute top-3 right-3">
                            <StatusBadgeSelector
                              currentStatus={property.status}
                              options={PROPERTY_STATUS_OPTIONS}
                              onStatusChange={(newStatus) => {
                                updatePropertyStatusMutation.mutate({
                                  propertyId: property.id,
                                  newStatus
                                });
                              }}
                              size="sm"
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Property Info */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-muted-foreground dark:text-white text-lg leading-tight">
                              {property.title}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              {!property.images?.length && (
                                <StatusBadgeSelector
                                  currentStatus={property.status}
                                  options={PROPERTY_STATUS_OPTIONS}
                                  onStatusChange={(newStatus) => {
                                    updatePropertyStatusMutation.mutate({
                                      propertyId: property.id,
                                      newStatus
                                    });
                                  }}
                                  size="sm"
                                />
                              )}
                              <span className="text-xs text-muted-foreground dark:text-muted-foreground capitalize bg-card dark:bg-card px-2 py-1 rounded-full">
                                {property.type}
                              </span>
                            </div>
                          </div>
                          <button
                            className="p-2 rounded-lg text-muted-foreground hover:text-muted-foreground dark:hover:text-muted-foreground hover:bg-card dark:hover:bg-card transition-all duration-200 active:scale-95"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/properties/${property.id}`);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Price */}
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-5 h-5 text-emerald-500" />
                          <span className="text-xl font-bold text-emerald-400">
                            {formatPrice(property.price)}
                          </span>
                        </div>
                        
                        {/* Property Details */}
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          {property.bedrooms && (
                            <div className="flex items-center space-x-1">
                              <Bed className="w-4 h-4" />
                              <span>{property.bedrooms} bed</span>
                            </div>
                          )}
                          {property.bathrooms && (
                            <div className="flex items-center space-x-1">
                              <Bath className="w-4 h-4" />
                              <span>{property.bathrooms} bath</span>
                            </div>
                          )}
                          {property.squareFootage && (
                            <div className="flex items-center space-x-1">
                              <Square className="w-4 h-4" />
                              <span>{property.squareFootage.toLocaleString()} sqft</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Location */}
                        {property.address && (
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{property.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </NativeCard>
                );
              })}
            </StaggeredList>
          )}
        </div>
        </PullToRefresh>
      </div>
      
      <NativeBottomTabs />
    </div>
  );
}