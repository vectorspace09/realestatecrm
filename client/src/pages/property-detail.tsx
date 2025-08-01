import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DesktopHeader from "@/components/layout/desktop-header";
import MobileBottomTabs from "@/components/layout/mobile-bottom-tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  Share,
  Heart,
  Phone,
  Mail,
  Star,
  Home,
  Car
} from "lucide-react";

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const { isMobile } = useMobile();
  const [location, navigate] = useLocation();

  const { data: property, isLoading: propertyLoading } = useQuery({
    queryKey: ["/api/properties", id],
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Type guard for property
  const typedProperty = property as any;

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      available: { label: "Available", class: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100" },
      pending: { label: "Under Contract", class: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100" },
      sold: { label: "Sold", class: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
      withdrawn: { label: "Off Market", class: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100" }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.available;
  };

  const getPropertyImage = (type: string) => {
    const imageMap = {
      house: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
      apartment: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      condo: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      townhouse: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=800&q=80",
      land: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80"
    };
    return imageMap[type as keyof typeof imageMap] || imageMap.house;
  };

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>;
  }

  if (propertyLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <DesktopHeader />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </main>
        <MobileBottomTabs />
      </div>
    );
  }

  if (!typedProperty) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <DesktopHeader />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="text-center py-12">
            <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Property not found</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate("/properties")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Properties
            </Button>
          </div>
        </main>
        <MobileBottomTabs />
      </div>
    );
  }

  const statusBadge = getStatusBadge(typedProperty.status);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <DesktopHeader />
      
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/90 backdrop-blur-sm border-b border-gray-700 p-4 lg:p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/properties")}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {isMobile ? "" : "Back to Properties"}
              </Button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-white truncate">
                  {typedProperty.title}
                </h1>
                <p className="text-gray-400 text-sm">{typedProperty.address}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className={statusBadge.class}>
                {statusBadge.label}
              </Badge>
              {!isMobile && (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-6 space-y-6">
          {/* Property Image */}
          <Card className="bg-gray-800 border-gray-700 overflow-hidden">
            <div 
              className="h-64 lg:h-96 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${getPropertyImage(typedProperty.type)})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  {formatPrice(typedProperty.price)}
                </div>
                <div className="flex items-center space-x-4 text-white">
                  {typedProperty.bedrooms && (
                    <div className="flex items-center space-x-1">
                      <Bed className="w-5 h-5" />
                      <span>{typedProperty.bedrooms} bed</span>
                    </div>
                  )}
                  {typedProperty.bathrooms && (
                    <div className="flex items-center space-x-1">
                      <Bath className="w-5 h-5" />
                      <span>{typedProperty.bathrooms} bath</span>
                    </div>
                  )}
                  {typedProperty.squareFeet && (
                    <div className="flex items-center space-x-1">
                      <Square className="w-5 h-5" />
                      <span>{typedProperty.squareFeet.toLocaleString()} sqft</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Property Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Property Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Property Type</p>
                      <p className="text-white capitalize">{typedProperty.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      <Badge className={statusBadge.class}>
                        {statusBadge.label}
                      </Badge>
                    </div>
                    {typedProperty.yearBuilt && (
                      <div>
                        <p className="text-sm text-gray-400">Year Built</p>
                        <p className="text-white">{typedProperty.yearBuilt}</p>
                      </div>
                    )}
                    {typedProperty.lotSize && (
                      <div>
                        <p className="text-sm text-gray-400">Lot Size</p>
                        <p className="text-white">{typedProperty.lotSize.toLocaleString()} sqft</p>
                      </div>
                    )}
                  </div>
                  
                  {typedProperty.description && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Description</p>
                      <p className="text-white">{typedProperty.description}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{typedProperty.address}</span>
                  </div>
                </CardContent>
              </Card>

              {typedProperty.features && typedProperty.features.length > 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Features & Amenities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {typedProperty.features.map((feature: any, index: number) => (
                        <div key={index} className="flex items-center space-x-2 text-gray-300">
                          <Star className="w-4 h-4 text-amber-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Contact & Actions */}
            <div className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Contact Agent</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=agent`} />
                      <AvatarFallback className="bg-gradient-to-br from-primary-500 to-purple-600 text-white">
                        JD
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">John Doe</p>
                      <p className="text-sm text-gray-400">Real Estate Agent</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button className="w-full bg-primary-600 hover:bg-primary-700">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Agent
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Mail className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="w-4 h-4 mr-2" />
                    Schedule Tour
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="w-4 h-4 mr-2" />
                    Save to Favorites
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Car className="w-4 h-4 mr-2" />
                    Get Directions
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <MobileBottomTabs />
    </div>
  );
}