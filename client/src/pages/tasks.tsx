import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import ResponsiveHeader from "@/components/layout/responsive-header";
import MobileBottomTabs from "@/components/layout/mobile-bottom-tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useDragDrop } from "@/hooks/use-drag-drop";
import { 
  Plus, 
  Calendar,
  Clock,
  CheckSquare,
  Phone,
  Mail,
  FileText,
  MapPin,
  User,
  Building,
  DollarSign,
  AlertCircle,
  Filter,
  Edit3,
  Trash2
} from "lucide-react";

export default function Tasks() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "call",
    priority: "medium",
    status: "pending",
    dueDate: "",
    leadId: "",
    propertyId: "",
    dealId: ""
  });

  // Check URL params for actions
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'add') {
      setShowAddForm(true);
    }
  }, []);

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/tasks"],
    staleTime: 1 * 60 * 1000, // 1 minute - tasks change frequently
    gcTime: 3 * 60 * 1000, // 3 minutes
  }) as { data: any[]; isLoading: boolean };

  const { data: leads = [] } = useQuery({
    queryKey: ["/api/leads"],
    retry: false,
  }) as { data: any[] };

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    retry: false,
  }) as { data: any[] };

  const { data: deals = [] } = useQuery({
    queryKey: ["/api/deals"],
    retry: false,
  }) as { data: any[] };

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest(`/api/tasks/${id}`, {
        method: "PATCH",
        body: data
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update task: " + error.message,
        variant: "destructive",
      });
    },
  });

  const addTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const response = await apiRequest("/api/tasks", {
        method: "POST",
        body: taskData
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task added successfully",
      });
      setShowAddForm(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add task: " + error.message,
        variant: "destructive",
      });
    },
  });

  const { draggedItem, handleDragStart, handleDragOver, handleDrop } = useDragDrop({
    onDrop: (item, targetStatus) => {
      if (item.status !== targetStatus) {
        updateTaskMutation.mutate({
          id: item.id,
          data: { 
            status: targetStatus,
            completedAt: targetStatus === 'completed' ? new Date().toISOString() : null
          }
        });
      }
    }
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

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "call",
      priority: "medium",
      status: "pending",
      dueDate: "",
      leadId: "",
      propertyId: "",
      dealId: ""
    });
    setEditingTask(null);
  };

  const startEditTask = (task: any) => {
    setFormData({
      title: task.title,
      description: task.description || "",
      type: task.type,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
      leadId: task.leadId || "",
      propertyId: task.propertyId || "",
      dealId: task.dealId || ""
    });
    setEditingTask(task);
    setShowAddForm(true);
  };

  const addTaskWithStatus = (status: string) => {
    resetForm();
    setFormData(prev => ({ ...prev, status }));
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      leadId: formData.leadId && formData.leadId !== "none" ? formData.leadId : null,
      propertyId: formData.propertyId && formData.propertyId !== "none" ? formData.propertyId : null,
      dealId: formData.dealId && formData.dealId !== "none" ? formData.dealId : null,
      // Set completion time if creating a completed task
      completedAt: formData.status === 'completed' ? new Date().toISOString() : null,
    };

    if (editingTask) {
      updateTaskMutation.mutate({ id: (editingTask as any).id, data: submitData });
      setEditingTask(null);
      setShowAddForm(false);
      resetForm();
    } else {
      addTaskMutation.mutate(submitData);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: any } = {
      call: Phone,
      email: Mail,
      meeting: Calendar,
      document: FileText,
      visit: MapPin,
      research: CheckSquare
    };
    const Icon = icons[type] || CheckSquare;
    return <Icon className="w-4 h-4" />;
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      call: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      email: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      meeting: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
      document: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
      visit: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100",
      research: "bg-card text-muted-foreground dark:bg-card dark:text-muted-foreground"
    };
    return colors[type] || colors.call;
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
      medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
      low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
    };
    return colors[priority] || colors.medium;
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const filteredTasks = tasks?.filter(task => {
    const matchesType = filterType === "all" || task.type === filterType;
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
    return matchesType && matchesPriority;
  }) || [];

  const tasksByStatus = {
    pending: filteredTasks.filter(task => task.status === 'pending'),
    in_progress: filteredTasks.filter(task => task.status === 'in_progress'),
    completed: filteredTasks.filter(task => task.status === 'completed')
  };

  const getLinkedEntityName = (task: any) => {
    if (task.leadId && leads) {
      const lead = leads.find(l => l.id === task.leadId);
      return lead ? `${lead.firstName} ${lead.lastName}` : null;
    }
    if (task.propertyId && properties) {
      const property = properties.find(p => p.id === task.propertyId);
      return property ? property.title : null;
    }
    if (task.dealId && deals) {
      const deal = deals.find(d => d.id === task.dealId);
      return deal ? `Deal $${deal.dealValue?.toLocaleString()}` : null;
    }
    return null;
  };

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
      
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Task Management</h1>
              <p className="text-muted-foreground">Organize and track your daily activities</p>
            </div>
            <Button 
              className="bg-primary-600 hover:bg-primary-700 mt-4 lg:mt-0"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Task
            </Button>
          </div>

          {/* Filters */}
          <Card className="bg-card border-border mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">Filters:</span>
                  </div>
                  
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Task type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="call">Calls</SelectItem>
                      <SelectItem value="email">Emails</SelectItem>
                      <SelectItem value="meeting">Meetings</SelectItem>
                      <SelectItem value="document">Documents</SelectItem>
                      <SelectItem value="visit">Visits</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                    {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kanban Board */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pending Tasks */}
            <Card 
              className="bg-card border-border"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'pending')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-amber-500" />
                    Pending
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-amber-100 dark:hover:bg-amber-900/20"
                      onClick={() => addTaskWithStatus('pending')}
                      title="Add pending task"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                      {tasksByStatus.pending.length}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 min-h-[200px]">
                  {tasksByStatus.pending.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      className={`p-4 rounded-lg border cursor-move transition-all hover:shadow-md ${
                        draggedItem?.id === task.id ? 'opacity-50' : ''
                      } ${isOverdue(task.dueDate) ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-border dark:border-border bg-gray-50 dark:bg-card'}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-white text-sm leading-tight flex-1">
                          {task.title}
                        </h4>
                        <div className="flex items-center space-x-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-card dark:hover:bg-card"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditTask(task);
                            }}
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          {isOverdue(task.dueDate) && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge className={getTypeColor(task.type)}>
                          <span className="flex items-center space-x-1">
                            {getTypeIcon(task.type)}
                            <span className="capitalize">{task.type}</span>
                          </span>
                        </Badge>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      
                      {task.description && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      
                      {getLinkedEntityName(task) && (
                        <div className="flex items-center space-x-1 mb-2">
                          {task.leadId && <User className="w-3 h-3 text-muted-foreground" />}
                          {task.propertyId && <Building className="w-3 h-3 text-muted-foreground" />}
                          {task.dealId && <DollarSign className="w-3 h-3 text-muted-foreground" />}
                          <span className="text-xs text-muted-foreground">
                            {getLinkedEntityName(task)}
                          </span>
                        </div>
                      )}
                      
                      {task.dueDate && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className={`text-xs ${isOverdue(task.dueDate) ? 'text-red-600 dark:text-red-400 font-medium' : 'text-muted-foreground'}`}>
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {tasksByStatus.pending.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm">No pending tasks</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* In Progress Tasks */}
            <Card 
              className="bg-card border-border"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'in_progress')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-blue-500" />
                    In Progress
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                      onClick={() => addTaskWithStatus('in_progress')}
                      title="Add in progress task"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                      {tasksByStatus.in_progress.length}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 min-h-[200px]">
                  {tasksByStatus.in_progress.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      className={`p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 cursor-move transition-all hover:shadow-md ${
                        draggedItem?.id === task.id ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-white text-sm leading-tight flex-1">
                          {task.title}
                        </h4>
                        <div className="flex items-center space-x-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-card dark:hover:bg-card"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditTask(task);
                            }}
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge className={getTypeColor(task.type)}>
                          <span className="flex items-center space-x-1">
                            {getTypeIcon(task.type)}
                            <span className="capitalize">{task.type}</span>
                          </span>
                        </Badge>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      
                      {task.description && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      
                      {getLinkedEntityName(task) && (
                        <div className="flex items-center space-x-1 mb-2">
                          {task.leadId && <User className="w-3 h-3 text-muted-foreground" />}
                          {task.propertyId && <Building className="w-3 h-3 text-muted-foreground" />}
                          {task.dealId && <DollarSign className="w-3 h-3 text-muted-foreground" />}
                          <span className="text-xs text-muted-foreground">
                            {getLinkedEntityName(task)}
                          </span>
                        </div>
                      )}
                      
                      {task.dueDate && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {tasksByStatus.in_progress.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm">No tasks in progress</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Completed Tasks */}
            <Card 
              className="bg-card border-border"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'completed')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white flex items-center">
                    <CheckSquare className="w-5 h-5 mr-2 text-emerald-500" />
                    Completed
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-emerald-100 dark:hover:bg-emerald-900/20"
                      onClick={() => addTaskWithStatus('completed')}
                      title="Add completed task"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
                      {tasksByStatus.completed.length}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 min-h-[200px]">
                  {tasksByStatus.completed.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      className={`p-4 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 cursor-move transition-all hover:shadow-md ${
                        draggedItem?.id === task.id ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-white text-sm leading-tight flex-1">
                          {task.title}
                        </h4>
                        <div className="flex items-center space-x-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-card dark:hover:bg-card"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditTask(task);
                            }}
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <CheckSquare className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge className={getTypeColor(task.type)}>
                          <span className="flex items-center space-x-1">
                            {getTypeIcon(task.type)}
                            <span className="capitalize">{task.type}</span>
                          </span>
                        </Badge>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      
                      {task.description && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      
                      {getLinkedEntityName(task) && (
                        <div className="flex items-center space-x-1 mb-2">
                          {task.leadId && <User className="w-3 h-3 text-muted-foreground" />}
                          {task.propertyId && <Building className="w-3 h-3 text-muted-foreground" />}
                          {task.dealId && <DollarSign className="w-3 h-3 text-muted-foreground" />}
                          <span className="text-xs text-muted-foreground">
                            {getLinkedEntityName(task)}
                          </span>
                        </div>
                      )}
                      
                      {task.completedAt && (
                        <div className="flex items-center space-x-1">
                          <CheckSquare className="w-3 h-3 text-emerald-500" />
                          <span className="text-xs text-emerald-600 dark:text-emerald-400">
                            Completed {new Date(task.completedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {tasksByStatus.completed.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm">No completed tasks</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

      {/* Add Task Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
            <DialogDescription>
              {editingTask ? 'Update task details and assignments' : 'Create a new task and link it to leads, properties, or deals'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., Call John about Manhattan property"
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
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="type">Task Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
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
                  <SelectTrigger>
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
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="leadId">Link to Lead</Label>
                <Select value={formData.leadId} onValueChange={(value) => setFormData({ ...formData, leadId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a lead" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No lead</SelectItem>
                    {leads?.map((lead) => (
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No property</SelectItem>
                    {properties?.map((property) => (
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select a deal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No deal</SelectItem>
                    {deals?.map((deal) => (
                      <SelectItem key={deal.id} value={deal.id}>
                        Deal ${deal.dealValue?.toLocaleString()} ({deal.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={addTaskMutation.isPending || updateTaskMutation.isPending}
                className="bg-primary-600 hover:bg-primary-700"
              >
                {editingTask
                  ? (updateTaskMutation.isPending ? 'Updating...' : 'Update Task')
                  : (addTaskMutation.isPending ? 'Adding...' : 'Add Task')
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <MobileBottomTabs />
    </div>
  );
}