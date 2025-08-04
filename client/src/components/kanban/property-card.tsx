import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bed, Bath, Maximize, MapPin, Eye, Edit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { Property } from "@shared/schema";
import PropertyForm from "@/components/forms/property-form";
import { useState } from "react";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    if (numPrice >= 1000000) {
      return `$${(numPrice / 1000000).toFixed(1)}M`;
    }
    return `$${(numPrice / 1000).toFixed(0)}K`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      case "sold":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "withdrawn":
        return "bg-card text-muted-foreground dark:bg-card dark:text-muted-foreground";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "available":
        return "NEW";
      case "pending":
        return "PENDING";
      case "sold":
        return "SOLD";
      case "withdrawn":
        return "WITHDRAWN";
      default:
        return status.toUpperCase();
    }
  };

  // Mock image based on property type
  const getPropertyImage = (propertyType: string) => {
    const imageMap: Record<string, string> = {
      apartment: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=200&fit=crop",
      house: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=200&fit=crop",
      condo: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=200&fit=crop",
      villa: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=200&fit=crop",
      townhouse: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=200&fit=crop",
    };
    return imageMap[propertyType] || imageMap.apartment;
  };

  return (
    <div className={cn(
      "bg-gray-50 dark:bg-card rounded-lg border border-border dark:border-border hover:shadow-md transition-all",
      property.status === "sold" && "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
      property.status === "withdrawn" && "opacity-75"
    )}>
      {/* Property Image */}
      <div 
        className="h-40 bg-cover bg-center rounded-t-lg"
        style={{ backgroundImage: `url(${getPropertyImage(property.propertyType)})` }}
      />
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-white truncate flex-1">
            {property.title}
          </h4>
          <Badge className={cn("text-xs font-medium ml-2", getStatusColor(property.status))}>
            {getStatusLabel(property.status)}
          </Badge>
        </div>
        
        <p className={cn(
          "text-2xl font-bold mb-2",
          property.status === "sold" ? "text-green-600" : "text-primary-600"
        )}>
          {formatPrice(property.price || 0)}
        </p>
        
        <div className="space-y-1 text-sm text-muted-foreground mb-3">
          <div className="flex items-center">
            <Bed className="w-4 h-4 mr-2" />
            {property.bedrooms || 0} bed • {property.bathrooms || 0} bath
            {property.squareFeet && ` • ${property.squareFeet.toLocaleString()} sqft`}
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            {property.address || "No address"}
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-border dark:border-border">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              5 Matches
            </Badge>
            <Badge variant="secondary" className="text-xs">
              2 Tours
            </Badge>
          </div>
          <div className="flex space-x-1">
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1 h-auto">
                  <Edit className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Property</DialogTitle>
                </DialogHeader>
                <PropertyForm 
                  property={property} 
                  onSuccess={() => setIsEditOpen(false)} 
                />
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="sm" className="p-1 h-auto">
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {property.status === "sold" && (
          <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                Commission: $24K
              </span>
              <span className="text-xs text-muted-foreground">
                Closed {property.updatedAt ? formatDistanceToNow(new Date(property.updatedAt), { addSuffix: true }) : "recently"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
