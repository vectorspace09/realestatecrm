
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';

interface TaskFormProps {
  onSuccess?: () => void;
  initialData?: any;
}

export default function TaskForm({ onSuccess, initialData }: TaskFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    type: initialData?.type || "call",
    priority: initialData?.priority || "medium",
    status: initialData?.status || "pending",
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : "",
    leadId: initialData?.leadId || "",
    propertyId: initialData?.propertyId || "",
    dealId: initialData?.dealId || ""
  });

  const { data: leads } = useQuery({
    queryKey: ["/api/leads"],
    retry: false,
  });

  const { data: properties } = useQuery({
    queryKey: ["/api/properties"],
    retry: false,
  });

  const { data: deals } = useQuery({
    queryKey: ["/api/deals"],
    retry: false,
  });

  const addTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      return await apiRequest("/api/tasks", {
        method: "POST",
        body: taskData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task added successfully",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add task: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      leadId: formData.leadId && formData.leadId !== "none" ? formData.leadId : null,
      propertyId: formData.propertyId && formData.propertyId !== "none" ? formData.propertyId : null,
      dealId: formData.dealId && formData.dealId !== "none" ? formData.dealId : null,
      completedAt: formData.status === 'completed' ? new Date().toISOString() : null,
    };

    addTaskMutation.mutate(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
      <div>
        <Label htmlFor="title">Task Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          placeholder="e.g., Call John about Manhattan property"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Additional details about the task..."
          rows={3}
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="type">Task Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="call">Call</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="document">Document</SelectItem>
              <SelectItem value="visit">Visit</SelectItem>
              <SelectItem value="research">Research</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="leadId">Link to Lead</Label>
          <Select value={formData.leadId} onValueChange={(value) => setFormData({ ...formData, leadId: value })}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a lead" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No lead</SelectItem>
              {(leads as any[])?.map((lead: any) => (
                <SelectItem key={lead.id} value={lead.id}>
                  {lead.firstName} {lead.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="propertyId">Link to Property</Label>
          <Select value={formData.propertyId} onValueChange={(value) => setFormData({ ...formData, propertyId: value })}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No property</SelectItem>
              {(properties as any[])?.map((property: any) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="dealId">Link to Deal</Label>
          <Select value={formData.dealId} onValueChange={(value) => setFormData({ ...formData, dealId: value })}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a deal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No deal</SelectItem>
              {(deals as any[])?.map((deal: any) => (
                <SelectItem key={deal.id} value={deal.id}>
                  Deal ${deal.dealValue?.toLocaleString()} ({deal.status})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="submit" 
          disabled={addTaskMutation.isPending}
          className="bg-primary-600 hover:bg-primary-700 min-w-[100px]"
        >
          {addTaskMutation.isPending ? 'Adding...' : 'Add Task'}
        </Button>
      </div>
    </form>
  );
}
