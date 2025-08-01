import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, Phone, Home, Bot, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Activity } from "@shared/schema";

interface ActivityFeedProps {
  activities: Activity[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "lead_created":
        return UserPlus;
      case "call_scheduled":
        return Phone;
      case "property_created":
        return Home;
      case "ai_suggestion":
        return Bot;
      default:
        return AlertTriangle;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "lead_created":
        return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400";
      case "call_scheduled":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400";
      case "property_created":
        return "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400";
      case "ai_suggestion":
        return "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400";
      default:
        return "bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-400";
    }
  };

  // Mock activities if none provided
  const displayActivities = activities.length > 0 ? activities : [
    {
      id: "1",
      type: "lead_created",
      title: "New lead added",
      description: "Sarah Johnson added from website",
      createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    },
    {
      id: "2",
      type: "call_scheduled",
      title: "Call scheduled",
      description: "Mike Chen for tomorrow at 2 PM",
      createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    },
    {
      id: "3",
      type: "property_created",
      title: "Property listed",
      description: "Ocean View Condo marked as sold",
      createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    },
    {
      id: "4",
      type: "ai_suggestion",
      title: "AI suggestion",
      description: "3 property matches found for Lisa Williams",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: "5",
      type: "follow_up_overdue",
      title: "Follow-up overdue",
      description: "Robert Davis follow-up is overdue",
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    },
  ];

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-white">Recent Activity</CardTitle>
            <CardDescription>Latest updates and notifications</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-80 overflow-y-auto">
          {displayActivities.slice(0, 10).map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);
            
            return (
              <div
                key={activity.id || index}
                className="flex items-start space-x-3 p-4 hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className={colorClass}>
                    <Icon className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        {displayActivities.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No recent activity</h3>
            <p className="text-gray-400">Activity will appear here as you use the system</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
