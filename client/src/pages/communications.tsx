import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ResponsiveHeader from "@/components/layout/responsive-header";
import MobileBottomTabs from "@/components/layout/mobile-bottom-tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { MessageSquare, Mail, Phone, MessageCircle, Calendar, Clock, Send, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { format } from "date-fns";

export default function Communications() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<string>("");
  
  const emailForm = useForm({
    defaultValues: {
      leadId: "",
      subject: "",
      content: "",
      generateWithAI: false
    }
  });

  // Fetch communications data
  const { data: communications = [], isLoading: communicationsLoading } = useQuery({
    queryKey: ['/api/communications'],
    enabled: isAuthenticated
  });

  // Fetch communication stats
  const { data: stats = { totalEmails: 0, totalCalls: 0, totalSms: 0, totalMessages: 0, responseRate: 0 }, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/communications/stats'],
    enabled: isAuthenticated
  });

  // Fetch leads for dropdown
  const { data: leads = [] } = useQuery({
    queryKey: ['/api/leads'],
    enabled: isAuthenticated
  });

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/communications/send-email', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      toast({
        title: "Email sent successfully",
        description: "Your email has been sent and logged.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/communications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/communications/stats'] });
      setIsEmailDialogOpen(false);
      emailForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send email",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  // Quick action mutations
  const logCallMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/communications/log-call', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      toast({ title: "Call logged successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/communications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/communications/stats'] });
    }
  });

  const scheduleAppointmentMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/communications/schedule-appointment', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      toast({ title: "Appointment scheduled successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/communications'] });
    }
  });

  const handleSendEmail = (data: any) => {
    sendEmailMutation.mutate(data);
  };

  const handleQuickCall = async (leadId: string) => {
    logCallMutation.mutate({
      leadId,
      duration: "5 minutes",
      outcome: "positive",
      notes: "Quick follow-up call completed"
    });
  };

  const handleQuickAppointment = async (leadId: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);
    
    scheduleAppointmentMutation.mutate({
      leadId,
      appointmentDate: tomorrow.toISOString(),
      notes: "Property consultation appointment"
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'call': return <Phone className="w-4 h-4" />;
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'whatsapp': return <MessageCircle className="w-4 h-4" />;
      case 'meeting': return <Calendar className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'call': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100';
      case 'sms': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      case 'whatsapp': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'meeting': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
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

      <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Communications Center</h1>
              <p className="text-muted-foreground">Manage all client communications from one place</p>
            </div>
            <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary-600 hover:bg-primary-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-white">Send Email</DialogTitle>
                </DialogHeader>
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(handleSendEmail)} className="space-y-4">
                    <FormField
                      control={emailForm.control}
                      name="leadId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Select Lead</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="bg-background border-border text-white">
                                <SelectValue placeholder="Choose a lead" />
                              </SelectTrigger>
                              <SelectContent className="bg-background border-border">
                                {(leads as any[])?.map((lead: any) => (
                                  <SelectItem key={lead.id} value={lead.id}>
                                    {lead.firstName} {lead.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={emailForm.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Subject</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-background border-border text-white" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={emailForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Message</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={6} className="bg-background border-border text-white" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 text-sm text-white">
                        <input
                          type="checkbox"
                          checked={emailForm.watch('generateWithAI')}
                          onChange={(e) => emailForm.setValue('generateWithAI', e.target.checked)}
                          className="rounded"
                        />
                        <span>Generate with AI</span>
                      </label>
                      <Button 
                        type="submit" 
                        disabled={sendEmailMutation.isPending}
                        className="bg-primary-600 hover:bg-primary-700"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {sendEmailMutation.isPending ? 'Sending...' : 'Send Email'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Communication Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                    <p className="text-3xl font-bold text-white">
                      {statsLoading ? '...' : (stats as any)?.totalMessages}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Emails Sent</p>
                    <p className="text-3xl font-bold text-white">
                      {statsLoading ? '...' : (stats as any)?.totalEmails}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Calls Made</p>
                    <p className="text-3xl font-bold text-white">
                      {statsLoading ? '...' : (stats as any)?.totalCalls}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                    <p className="text-3xl font-bold text-white">
                      {statsLoading ? '...' : `${(stats as any)?.responseRate}%`}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Communications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg text-white">Recent Messages</CardTitle>
                <CardDescription>Latest communications with clients</CardDescription>
              </CardHeader>
              <CardContent>
                {communicationsLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading communications...</p>
                  </div>
                ) : (communications as any[])?.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No communications yet</p>
                    <p className="text-sm text-muted-foreground">Start by sending an email to your leads</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {(communications as any[])?.slice(0, 10).map((comm: any) => {
                      // Find the lead for this communication
                      const lead = (leads as any[])?.find((l: any) => l.id === comm.leadId);
                      const leadName = lead ? `${lead.firstName} ${lead.lastName}` : 'Unknown Lead';
                      
                      return (
                        <div key={comm.id} className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            comm.type === 'email' ? 'bg-blue-100 dark:bg-blue-900' :
                            comm.type === 'call' ? 'bg-emerald-100 dark:bg-emerald-900' :
                            comm.type === 'sms' ? 'bg-purple-100 dark:bg-purple-900' :
                            comm.type === 'whatsapp' ? 'bg-green-100 dark:bg-green-900' :
                            comm.type === 'meeting' ? 'bg-amber-100 dark:bg-amber-900' :
                            'bg-gray-100 dark:bg-gray-900'
                          }`}>
                            {getTypeIcon(comm.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-white truncate">{leadName}</p>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(comm.createdAt), 'MMM d, h:mm a')}
                              </span>
                            </div>
                            {comm.subject && (
                              <p className="text-sm font-medium text-white truncate">{comm.subject}</p>
                            )}
                            <p className="text-sm text-muted-foreground truncate">
                              {comm.content.substring(0, 100)}{comm.content.length > 100 ? '...' : ''}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <Badge className={getTypeColor(comm.type)}>
                                {comm.type.charAt(0).toUpperCase() + comm.type.slice(1)}
                              </Badge>
                              <div className="flex items-center space-x-1">
                                {comm.direction === 'inbound' && (
                                  <Badge variant="outline" className="text-xs">Received</Badge>
                                )}
                                {comm.status === 'scheduled' && (
                                  <Badge variant="outline" className="text-xs">Scheduled</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
                <CardDescription>Fast communication with your leads</CardDescription>
              </CardHeader>
              <CardContent>
                {(leads as any[])?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No leads available</p>
                    <p className="text-sm text-muted-foreground">Add some leads first to start communicating</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {(leads as any[])?.slice(0, 5).map((lead: any) => (
                      <div key={lead.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-white">{lead.firstName} {lead.lastName}</p>
                          <p className="text-sm text-muted-foreground">{lead.email}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {lead.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuickCall(lead.id)}
                            disabled={logCallMutation.isPending}
                            className="h-8 w-8 p-0"
                            title="Quick call"
                          >
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              emailForm.setValue('leadId', lead.id);
                              setIsEmailDialogOpen(true);
                            }}
                            className="h-8 w-8 p-0"
                            title="Send email"
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuickAppointment(lead.id)}
                            disabled={scheduleAppointmentMutation.isPending}
                            className="h-8 w-8 p-0"
                            title="Schedule appointment"
                          >
                            <Calendar className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Communication Templates */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-white">Message Templates</CardTitle>
              <CardDescription>Pre-built templates for common communications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-border dark:border-border rounded-lg">
                  <h4 className="font-medium text-white mb-2">New Lead Welcome</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Thank you for your interest in our real estate services...
                  </p>
                  <Button variant="outline" size="sm">Use Template</Button>
                </div>

                <div className="p-4 border border-border dark:border-border rounded-lg">
                  <h4 className="font-medium text-white mb-2">Property Match Found</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    I've found some properties that match your criteria...
                  </p>
                  <Button variant="outline" size="sm">Use Template</Button>
                </div>

                <div className="p-4 border border-border dark:border-border rounded-lg">
                  <h4 className="font-medium text-white mb-2">Showing Confirmation</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    This confirms your property showing appointment...
                  </p>
                  <Button variant="outline" size="sm">Use Template</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

      <MobileBottomTabs />
    </div>
  );
}