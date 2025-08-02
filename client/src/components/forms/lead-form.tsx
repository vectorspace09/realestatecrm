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
import { X } from "lucide-react";
import { insertLeadSchema } from "@shared/schema";
import { z } from "zod";

const leadFormSchema = insertLeadSchema.extend({
  budget: z.string().optional(),
  budgetMax: z.string().optional(),
  preferredLocations: z.array(z.string()).optional(),
  propertyTypes: z.array(z.string()).optional(),
});

interface LeadFormProps {
  onSuccess?: () => void;
}

export default function LeadForm({ onSuccess }: LeadFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [locationInput, setLocationInput] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [typeInput, setTypeInput] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const form = useForm<z.infer<typeof leadFormSchema>>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      source: "website",
      status: "new",
      timeline: "",
      notes: "",
      budget: "",
      budgetMax: "",
      preferredLocations: [],
      propertyTypes: [],
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: async (data: z.infer<typeof leadFormSchema>) => {
      const leadData = {
        ...data,
        budget: data.budget ? parseFloat(data.budget) : null,
        budgetMax: data.budgetMax ? parseFloat(data.budgetMax) : null,
        preferredLocations: selectedLocations,
        propertyTypes: selectedTypes,
      };
      return await apiRequest("POST", "/api/leads", leadData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Success",
        description: "Lead created successfully",
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
        description: "Failed to create lead",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof leadFormSchema>) => {
    createLeadMutation.mutate(data);
  };

  const addLocation = () => {
    if (locationInput.trim() && !selectedLocations.includes(locationInput.trim())) {
      setSelectedLocations([...selectedLocations, locationInput.trim()]);
      setLocationInput("");
    }
  };

  const removeLocation = (location: string) => {
    setSelectedLocations(selectedLocations.filter(l => l !== location));
  };

  const addPropertyType = () => {
    if (typeInput.trim() && !selectedTypes.includes(typeInput.trim())) {
      setSelectedTypes([...selectedTypes, typeInput.trim()]);
      setTypeInput("");
    }
  };

  const removePropertyType = (type: string) => {
    setSelectedTypes(selectedTypes.filter(t => t !== type));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter email address" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lead Source</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lead source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="facebook">Facebook Ads</SelectItem>
                    <SelectItem value="google">Google Ads</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="walk_in">Walk-in</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timeline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timeline</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate (0-30 days)</SelectItem>
                    <SelectItem value="short_term">Short term (1-3 months)</SelectItem>
                    <SelectItem value="medium_term">Medium term (3-6 months)</SelectItem>
                    <SelectItem value="long_term">Long term (6+ months)</SelectItem>
                    <SelectItem value="just_looking">Just looking</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget (Min)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Minimum budget"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budgetMax"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget (Max)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Maximum budget"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Preferred Locations */}
        <div>
          <FormLabel>Preferred Locations</FormLabel>
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <Input
              placeholder="Add a location"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addLocation())}
              className="flex-1"
            />
            <Button 
              type="button" 
              onClick={addLocation} 
              variant="outline"
              className="w-full sm:w-auto"
            >
              Add Location
            </Button>
          </div>
          {selectedLocations.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedLocations.map((location) => (
                <Badge key={location} variant="secondary" className="flex items-center gap-1">
                  {location}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeLocation(location)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Property Types */}
        <div>
          <FormLabel>Property Types</FormLabel>
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <Select value={typeInput} onValueChange={setTypeInput}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
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
            <Button 
              type="button" 
              onClick={addPropertyType} 
              variant="outline"
              className="w-full sm:w-auto"
            >
              Add Type
            </Button>
          </div>
          {selectedTypes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTypes.map((type) => (
                <Badge key={type} variant="secondary" className="flex items-center gap-1">
                  {type}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removePropertyType(type)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional notes about the lead"
                  className="min-h-[100px]"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess?.()}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createLeadMutation.isPending}
            className="bg-primary-600 hover:bg-primary-700 w-full sm:w-auto order-1 sm:order-2"
          >
            {createLeadMutation.isPending ? "Creating..." : "Create Lead"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
