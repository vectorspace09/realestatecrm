import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useRoute } from "wouter";
import ResponsiveHeader from "@/components/layout/responsive-header";
import MobileBottomTabs from "@/components/layout/mobile-bottom-tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  Calendar, 
  MessageSquare, 
  Plus, 
  Bot, 
  Clock, 
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Send,
  FileText,
  Target,
  TrendingUp,
  Star
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import type { Lead, Activity, Task } from "@shared/schema";

const actionSchema = z.object({
  type: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  dueDate: z.string().optional(),
});

const messageSchema = z.object({
  type: z.enum(["email", "sms", "call"]),
  subject: z.string().optional(),
  content: z.string().min(1, "Message content is required"),
});

type ActionFormData = z.infer<typeof actionSchema>;
type MessageFormData = z.infer<typeof messageSchema>;

export default function LeadDetail() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [, params] = useRoute("/leads/:id");
  const leadId = params?.id;
  
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [isGeneratingNextAction, setIsGeneratingNextAction] = useState(false);

  const { data: lead, isLoading: leadLoading, error } = useQuery({
    queryKey: [`/api/leads/${leadId}`],
    retry: false,
    enabled: !!leadId,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["/api/activities", { leadId }],
    retry: false,
    enabled: !!leadId,
  }) as { data: Activity[] };

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks", { leadId }],
    retry: false,
    enabled: !!leadId,
  }) as { data: Task[] };

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

  // Generate AI recommendations when lead data changes
  useEffect(() => {
    if (lead && !isGeneratingRecommendations) {
      generateAIRecommendations();
    }
  }, [lead]);

  const generateAIRecommendations = async () => {
    if (!lead) return;
    
    setIsGeneratingRecommendations(true);
    try {
      const response = await apiRequest("/api/ai/lead-recommendations", {
        method: "POST",
        body: { 
          lead,
          recentActivities: (activities || []).slice(0, 5),
          pendingTasks: (tasks || []).filter((t: Task) => t.status === 'pending')
        },
      });
      const data = await response.json();
      setAiRecommendations(data.recommendations || []);
    } catch (error) {
      console.error("Error generating AI recommendations:", error);
    } finally {
      setIsGeneratingRecommendations(false);
    }
  };

  const generateNextAction = async () => {
    if (!lead) return;
    
    setIsGeneratingNextAction(true);
    try {
      // Generate intelligent next action based on lead data and history
      const leadData = lead as any;
      const recentActivities = (activities || []).slice(0, 5);
      const pendingTasks = (tasks || []).filter((t: Task) => t.status === 'pending');
      
      const response = await apiRequest("/api/ai/generate-next-action", {
        method: "POST",
        body: { 
          lead: leadData,
          recentActivities,
          pendingTasks,
          currentScore: leadData?.score || 0,
          status: leadData?.status || 'new'
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API response error:", response.status, errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log("AI Next Action Response:", data);
      
      if (data.nextAction) {
        // Auto-fill the action form with AI-generated recommendation
        actionForm.setValue('type', data.nextAction.type || 'note');
        actionForm.setValue('title', data.nextAction.title || '');
        actionForm.setValue('description', data.nextAction.description || '');
        actionForm.setValue('dueDate', data.nextAction.dueDate || '');
        
        // Show success message and open action dialog
        toast({
          title: "Next Action Generated",
          description: "AI has suggested the optimal next step for this lead.",
        });
        setIsActionDialogOpen(true);
      }
    } catch (error) {
      console.error("Error generating next action:", error);
      toast({
        title: "Error",
        description: `Failed to generate next action: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingNextAction(false);
    }
  };

  const generateAIMessage = async (messageType: string) => {
    if (!lead) return;
    
    setIsGeneratingMessage(true);
    try {
      const response = await apiRequest("/api/ai/generate-message", {
        method: "POST",
        body: { 
          lead,
          messageType,
          recentActivities: (activities || []).slice(0, 3)
        },
      });
      const data = await response.json();
      setGeneratedMessage(data.message || "");
    } catch (error) {
      console.error("Error generating AI message:", error);
      toast({
        title: "Error",
        description: "Failed to generate message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  // Action creation mutation
  const createActionMutation = useMutation({
    mutationFn: async (data: ActionFormData) => {
      return apiRequest("/api/activities", {
        method: "POST",
        body: {
          type: data.type,
          title: data.title,
          description: data.description,
          leadId,
          metadata: data.dueDate ? { dueDate: data.dueDate } : null,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      setIsActionDialogOpen(false);
      toast({
        title: "Success",
        description: "Action recorded successfully!",
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
        description: "Failed to record action. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Message sending mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: MessageFormData) => {
      // Record the message as an activity
      await apiRequest("/api/activities", {
        method: "POST",
        body: JSON.stringify({
          type: "message_sent",
          title: `${data.type.toUpperCase()} sent`,
          description: `${data.subject ? `Subject: ${data.subject}\n` : ""}${data.content}`,
          leadId,
          metadata: { messageType: data.type, subject: data.subject },
        }),
      });
      
      // TODO: Integrate with actual email/SMS service
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      setIsMessageDialogOpen(false);
      toast({
        title: "Success",
        description: "Message sent and recorded successfully!",
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
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const actionForm = useForm<ActionFormData>({
    resolver: zodResolver(actionSchema),
    defaultValues: {
      type: "note",
      title: "",
      description: "",
    },
  });

  const messageForm = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      type: "email",
      content: "",
    },
  });

  const handleCreateAction = (data: ActionFormData) => {
    createActionMutation.mutate(data);
  };

  const handleSendMessage = (data: MessageFormData) => {
    sendMessageMutation.mutate(data);
  };

  if (isLoading || !isAuthenticated || leadLoading) {
    return <div className="min-h-screen bg-card flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading lead details...</p>
      </div>
    </div>;
  }

  if (!lead) {
    return <div className="min-h-screen bg-card flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-white mb-2">Lead Not Found</h1>
        <p className="text-muted-foreground mb-4">The lead you're looking for doesn't exist.</p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    </div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-primary-100 text-primary-800 border-primary-200";
      case "contacted": return "bg-warning/20 text-warning border-warning/30";
      case "qualified": return "bg-purple-100 text-purple-800 border-purple-200";
      case "proposal": return "bg-orange-100 text-orange-800 border-orange-200";
      case "negotiation": return "bg-amber-100 text-amber-800 border-amber-200";
      case "won": return "bg-success/20 text-success border-success/30";
      case "closed": return "bg-success/20 text-success border-success/30";
      case "lost": return "bg-destructive/20 text-destructive border-destructive/30";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const getScoreColor = (score: number | null | undefined) => {
    const normalizedScore = score || 0;
    if (normalizedScore >= 90) return "text-success";
    if (normalizedScore >= 70) return "text-warning";
    if (normalizedScore >= 50) return "text-orange-500";
    return "text-destructive";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ResponsiveHeader />
      
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6 space-y-6">
          {/* Lead Header - Professional Design */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {(lead as any)?.firstName?.charAt(0) || 'L'}{(lead as any)?.lastName?.charAt(0) || 'D'}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {(lead as any)?.firstName && (lead as any)?.lastName 
                      ? `${(lead as any)?.firstName} ${(lead as any)?.lastName}`
                      : (lead as any)?.firstName || (lead as any)?.lastName || 'Unknown Lead'
                    }
                  </h1>
                  <div className="flex items-center space-x-4">
                    <Badge className={getStatusColor((lead as any)?.status)}>
                      {(lead as any)?.status 
                        ? (lead as any)?.status?.charAt(0).toUpperCase() + (lead as any)?.status?.slice(1)
                        : 'New'
                      }
                    </Badge>
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-warning" />
                      <span className={`font-semibold text-lg ${getScoreColor((lead as any)?.score)}`}>
                        {(lead as any)?.score != null && !isNaN(Number((lead as any)?.score)) 
                          ? Math.round(Number((lead as any)?.score)) 
                          : 0
                        }/100
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-6 lg:mt-0">
                <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary-600 text-primary-foreground border-0 shadow-lg">
                      <Plus className="w-4 h-4 mr-2" />
                      Record Action
                    </Button>
                  </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record New Action</DialogTitle>
                    <DialogDescription>
                      Log an action taken with this lead
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...actionForm}>
                    <form onSubmit={actionForm.handleSubmit(handleCreateAction)} className="space-y-4">
                      <FormField
                        control={actionForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Action Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select action type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="call">Phone Call</SelectItem>
                                <SelectItem value="meeting">Meeting</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="note">Note</SelectItem>
                                <SelectItem value="property_visit">Property Visit</SelectItem>
                                <SelectItem value="follow_up">Follow-up</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={actionForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Brief description of action" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={actionForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Details</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Detailed notes about this action..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsActionDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createActionMutation.isPending}
                        >
                          {createActionMutation.isPending ? "Recording..." : "Record Action"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

                <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-border bg-secondary hover:bg-secondary/80 text-secondary-foreground">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Send Message</DialogTitle>
                    <DialogDescription>
                      Send an email, SMS, or record a call with this lead
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...messageForm}>
                    <form onSubmit={messageForm.handleSubmit(handleSendMessage)} className="space-y-4">
                      <FormField
                        control={messageForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message Type</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                setGeneratedMessage("");
                              }} 
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select message type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="sms">SMS</SelectItem>
                                <SelectItem value="call">Phone Call</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {messageForm.watch("type") === "email" && (
                        <FormField
                          control={messageForm.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <FormControl>
                                <Input placeholder="Email subject" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      <FormField
                        control={messageForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {messageForm.watch("type") === "call" ? "Call Notes" : "Message Content"}
                            </FormLabel>
                            <div className="space-y-2">
                              <div className="flex space-x-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => generateAIMessage(messageForm.watch("type"))}
                                  disabled={isGeneratingMessage}
                                >
                                  <Bot className="w-4 h-4 mr-2" />
                                  {isGeneratingMessage ? "Generating..." : "AI Generate"}
                                </Button>
                                {generatedMessage && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      field.onChange(generatedMessage);
                                    }}
                                  >
                                    Use Generated
                                  </Button>
                                )}
                              </div>
                              <FormControl>
                                <Textarea
                                  placeholder={
                                    messageForm.watch("type") === "call" 
                                      ? "Notes from the call..." 
                                      : "Type your message..."
                                  }
                                  rows={6}
                                  {...field}
                                />
                              </FormControl>
                              {generatedMessage && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                                    AI Generated Message:
                                  </p>
                                  <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                                    {generatedMessage}
                                  </p>
                                </div>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsMessageDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={sendMessageMutation.isPending}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          </div>

          {/* Lead Details and Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lead Information */}
            <div className="lg:col-span-1 space-y-6">
              {/* Contact Information */}
              <Card className="bg-card border border-border shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-card-foreground">
                    <User className="w-5 h-5 mr-2 text-primary" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-card-foreground">{(lead as any)?.email || 'No email'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-card-foreground">{(lead as any)?.phone || 'No phone'}</span>
                  </div>
                  {(lead as any)?.location && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-card-foreground">{(lead as any)?.location}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Lead Details */}
              <Card className="bg-card border border-border shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-card-foreground">
                    <Target className="w-5 h-5 mr-2 text-primary" />
                    Lead Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Budget</span>
                    <span className="font-medium text-card-foreground">${(lead as any)?.budget?.toLocaleString() || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Property Types</span>
                    <div className="flex flex-wrap gap-1">
                      {(lead as any)?.propertyTypes?.map((type: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs border-primary/30 text-primary">
                          {type}
                        </Badge>
                      )) || <span className="text-card-foreground text-sm">None specified</span>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Timeline</span>
                    <span className="font-medium text-card-foreground">{(lead as any)?.timeline || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Source</span>
                    <span className="font-medium text-card-foreground">{(lead as any)?.source || 'Unknown'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* AI Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bot className="w-5 h-5 mr-2" />
                    AI Recommendations
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto"
                      onClick={generateAIRecommendations}
                      disabled={isGeneratingRecommendations}
                    >
                      {isGeneratingRecommendations ? "Updating..." : "Refresh"}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isGeneratingRecommendations ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-card dark:bg-card rounded mb-2"></div>
                          <div className="h-3 bg-card dark:bg-card rounded w-3/4"></div>
                        </div>
                      ))}
                    </div>
                  ) : aiRecommendations.length > 0 ? (
                    <div className="space-y-3">
                      {aiRecommendations.map((recommendation, index) => (
                        <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-start space-x-2">
                            <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-blue-900 dark:text-blue-100">{recommendation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No recommendations available. Check back after more interactions.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Timeline and Activities */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="timeline" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                </TabsList>
                
                <TabsContent value="timeline">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center">
                            <Clock className="w-5 h-5 mr-2" />
                            Activity Timeline
                          </CardTitle>
                          <CardDescription>
                            Complete history of interactions with this lead
                          </CardDescription>
                        </div>
                        <Button
                          onClick={generateNextAction}
                          disabled={isGeneratingNextAction}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                        >
                          <Bot className="w-4 h-4 mr-2" />
                          {isGeneratingNextAction ? "Generating..." : "Generate Next Action"}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {activities.length > 0 ? (
                        <div className="space-y-6">
                          {activities.map((activity: Activity) => (
                            <div key={activity.id} className="flex space-x-4">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                                  {activity.type === "call" && <Phone className="w-4 h-4 text-primary-600 dark:text-primary-400" />}
                                  {activity.type === "email" && <Mail className="w-4 h-4 text-primary-600 dark:text-primary-400" />}
                                  {activity.type === "meeting" && <Calendar className="w-4 h-4 text-primary-600 dark:text-primary-400" />}
                                  {activity.type === "note" && <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400" />}
                                  {activity.type === "message_sent" && <MessageSquare className="w-4 h-4 text-primary-600 dark:text-primary-400" />}
                                  {!["call", "email", "meeting", "note", "message_sent"].includes(activity.type) && (
                                    <CheckCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                  )}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-medium text-white">
                                    {activity.title}
                                  </h4>
                                  <time className="text-xs text-muted-foreground">
                                    {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : 'N/A'} {activity.createdAt ? new Date(activity.createdAt).toLocaleTimeString() : ''}
                                  </time>
                                </div>
                                {activity.description && (
                                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                                    {activity.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-white mb-2">No Activities Yet</h3>
                          <p className="text-muted-foreground mb-4">
                            Start by recording an action or sending a message to this lead.
                          </p>
                          <Button onClick={() => setIsActionDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Record First Action
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="tasks">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Related Tasks
                      </CardTitle>
                      <CardDescription>
                        Tasks and follow-ups for this lead
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {(tasks as Task[]).length > 0 ? (
                        <div className="space-y-4">
                          {(tasks as Task[]).map((task: Task) => (
                            <div key={task.id} className="flex items-start space-x-3 p-3 border border-border rounded-lg">
                              <div className={`w-4 h-4 rounded-full mt-1 ${
                                task.status === "completed" ? "bg-green-500" : 
                                task.priority === "high" ? "bg-red-500" :
                                task.priority === "medium" ? "bg-yellow-500" : "bg-card"
                              }`} />
                              <div className="flex-1">
                                <h4 className="font-medium text-white">{task.title}</h4>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                )}
                                <div className="flex items-center space-x-3 mt-2 text-xs text-muted-foreground">
                                  <span>Priority: {task.priority}</span>
                                  <span>Status: {task.status}</span>
                                  {task.dueDate && (
                                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-white mb-2">No Tasks</h3>
                          <p className="text-muted-foreground">
                            No tasks have been created for this lead yet.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {(lead as any)?.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground dark:text-muted-foreground whitespace-pre-wrap">{(lead as any)?.notes}</p>
              </CardContent>
            </Card>
          )}
        </main>
      
      <MobileBottomTabs />
    </div>
  );
}