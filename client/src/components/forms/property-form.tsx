import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { ObjectUploader } from "@/components/ObjectUploader";
import { X, Upload, Image } from "lucide-react";
import { insertPropertySchema, type Property } from "@shared/schema";
import { z } from "zod";
import type { UploadResult } from "@uppy/core";

const propertyFormSchema = insertPropertySchema.extend({
  price: z.string().min(1, "Price is required"),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  squareFeet: z.string().optional(),
  lotSize: z.string().optional(),
  yearBuilt: z.string().optional(),
  commission: z.string().optional(),
  features: z.array(z.string()).optional(),
});

interface PropertyFormProps {
  onSuccess?: () => void;
  property?: Property;
}

export default function PropertyForm({ onSuccess, property }: PropertyFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [featureInput, setFeatureInput] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(property?.features || []);
  const [uploadedImages, setUploadedImages] = useState<string[]>(property?.images || []);

  const form = useForm<z.infer<typeof propertyFormSchema>>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: property?.title || "",
      address: property?.address || "",
      city: property?.city || "",
      state: property?.state || "",
      zipCode: property?.zipCode ?? "",
      propertyType: property?.propertyType || "apartment",
      status: property?.status || "available",
      price: property?.price?.toString() || "",
      bedrooms: property?.bedrooms?.toString() || "",
      bathrooms: property?.bathrooms?.toString() || "",
      squareFeet: property?.squareFeet?.toString() || "",
      lotSize: property?.lotSize?.toString() || "",
      yearBuilt: property?.yearBuilt?.toString() || "",
      description: property?.description ?? "",
      features: property?.features || [],
      virtualTourUrl: property?.virtualTourUrl || "",
      ownerContact: property?.ownerContact || "",
      commission: property?.commission?.toString() || "",
    },
  });

  const savePropertyMutation = useMutation({
    mutationFn: async (data: z.infer<typeof propertyFormSchema>) => {
      const propertyData = {
        ...data,
        price: parseFloat(data.price),
        bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
        bathrooms: data.bathrooms ? parseFloat(data.bathrooms) : null,
        squareFeet: data.squareFeet ? parseInt(data.squareFeet) : null,
        lotSize: data.lotSize ? parseFloat(data.lotSize) : null,
        yearBuilt: data.yearBuilt ? parseInt(data.yearBuilt) : null,
        commission: data.commission ? parseFloat(data.commission) : null,
        features: selectedFeatures,
        images: uploadedImages,
      };
      
      if (property) {
        // Update existing property
        await apiRequest(`/api/properties/${property.id}`, { method: "PUT", body: propertyData });
      } else {
        // Create new property
        await apiRequest("/api/properties", { method: "POST", body: propertyData });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Success",
        description: property ? "Property updated successfully" : "Property created successfully",
      });
      onSuccess?.();
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
        description: property ? "Failed to update property" : "Failed to create property",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof propertyFormSchema>) => {
    savePropertyMutation.mutate(data);
  };

  const addFeature = () => {
    if (featureInput.trim() && !selectedFeatures.includes(featureInput.trim())) {
      setSelectedFeatures([...selectedFeatures, featureInput.trim()]);
      setFeatureInput("");
    }
  };

  const removeFeature = (feature: string) => {
    setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Title *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter property title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City *</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State *</FormLabel>
                  <FormControl>
                    <Input placeholder="State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zip Code</FormLabel>
                  <FormControl>
                    <Input placeholder="ZIP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="propertyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="land">Land/Plot</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter price"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Property Specifications */}
        <div className="grid grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="bedrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bedrooms</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Beds"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bathrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bathrooms</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="Baths"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="squareFeet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Square Feet</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Sq ft"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="yearBuilt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year Built</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Year"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the property"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Features */}
        <div>
          <FormLabel>Features & Amenities</FormLabel>
          <div className="flex space-x-2 mt-2">
            <Input
              placeholder="Add a feature"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
            />
            <Button type="button" onClick={addFeature} variant="outline">
              Add
            </Button>
          </div>
          {selectedFeatures.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedFeatures.map((feature) => (
                <Badge key={feature} variant="secondary" className="flex items-center gap-1">
                  {feature}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeFeature(feature)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="virtualTourUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Virtual Tour URL</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://example.com/tour"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="commission"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Commission (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="3.0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="ownerContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Owner Contact Information</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Owner contact details"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image Upload Section */}
        <div className="space-y-4">
          <FormLabel className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Property Images
          </FormLabel>
          <div className="flex flex-col gap-4">
            <ObjectUploader
              maxNumberOfFiles={5}
              maxFileSize={10485760}
              onGetUploadParameters={async () => {
                try {
                  const response = await apiRequest("/api/objects/upload", { method: "POST" });
                  if (!response.uploadURL) {
                    throw new Error("No upload URL returned from server");
                  }
                  return {
                    method: "PUT" as const,
                    url: response.uploadURL,
                  };
                } catch (error) {
                  console.error("Error getting upload parameters:", error);
                  if (isUnauthorizedError(error)) {
                    toast({
                      title: "Authentication Required",
                      description: "Please log in to upload images.",
                      variant: "destructive",
                    });
                    setTimeout(() => {
                      window.location.href = "/api/login";
                    }, 1000);
                  } else {
                    toast({
                      title: "Upload Error",
                      description: "Failed to get upload URL. Please check your connection and try again.",
                      variant: "destructive",
                    });
                  }
                  throw error;
                }
              }}
              onComplete={async (result) => {
                const uploadedUrls = (result.successful || [])
                  .map(file => file.uploadURL)
                  .filter((url): url is string => Boolean(url));
                
                // Set ACL policy for each uploaded image
                try {
                  for (const imageURL of uploadedUrls) {
                    await apiRequest("/api/property-images", {
                      method: "PUT",
                      body: { imageURL }
                    });
                  }
                  
                  setUploadedImages(prev => [...prev, ...uploadedUrls]);
                  toast({
                    title: "Success",
                    description: `${result.successful?.length || 0} image(s) uploaded successfully`,
                  });
                } catch (error) {
                  console.error("Error setting image permissions:", error);
                  if (isUnauthorizedError(error)) {
                    toast({
                      title: "Authentication Required",
                      description: "Please log in to complete the upload process.",
                      variant: "destructive",
                    });
                    setTimeout(() => {
                      window.location.href = "/api/login";
                    }, 1000);
                  } else {
                    toast({
                      title: "Upload Error",
                      description: "Images uploaded but failed to set permissions. Please try again.",
                      variant: "destructive",
                    });
                  }
                }
              }}
              buttonClassName="w-full"
            >
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Property Images
              </div>
            </ObjectUploader>
            
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {uploadedImages.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Property image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        setUploadedImages(prev => prev.filter((_, i) => i !== index));
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess?.()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={savePropertyMutation.isPending}
            className="bg-primary-600 hover:bg-primary-700"
          >
            {savePropertyMutation.isPending 
              ? (property ? "Updating..." : "Creating...") 
              : (property ? "Update Property" : "Create Property")
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}
