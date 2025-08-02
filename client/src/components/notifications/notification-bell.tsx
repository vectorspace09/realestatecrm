import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { useNotifications, useUnreadNotificationCount, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from "@/hooks/useNotifications";
import type { Notification } from "@shared/schema";

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className = "" }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Fetch notifications and unread count using React Query
  const { data: notifications = [], isLoading } = useNotifications({ limit: 10 });
  const { data: unreadData } = useUnreadNotificationCount();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  
  const unreadCount = unreadData?.count || 0;

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsReadMutation.mutateAsync(notification.id);
    }
    
    // Navigate to action URL if provided
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsReadMutation.mutateAsync();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'lead_added':
        return '👤';
      case 'deal_closed':
        return '💰';
      case 'follow_up':
        return '⏰';
      case 'task_due':
        return '📋';
      case 'property_viewed':
        return '🏠';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'lead_added':
        return 'bg-blue-500';
      case 'deal_closed':
        return 'bg-green-500';
      case 'follow_up':
        return 'bg-amber-500';
      case 'task_due':
        return 'bg-red-500';
      case 'property_viewed':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200 active:scale-95 ${className}`}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold animate-pulse"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-80 bg-gray-800 border-gray-700" 
        align="end"
        sideOffset={5}
      >
        <DropdownMenuLabel className="flex items-center justify-between text-white font-semibold">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs text-primary-400 hover:text-primary-300 p-0 h-auto"
              disabled={markAllAsReadMutation.isPending}
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-gray-700" />
        
        <ScrollArea className="max-h-64">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">
              <div className="animate-spin w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-sm">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`
                    cursor-pointer p-4 flex-col items-start space-y-2 hover:bg-gray-700 transition-colors
                    ${!notification.isRead ? 'bg-gray-700/50' : ''}
                  `}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3 w-full">
                    <div className="flex-shrink-0 flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getNotificationColor(notification.type)}`} />
                      <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-medium truncate ${
                          notification.isRead ? 'text-gray-300' : 'text-white'
                        }`}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {formatDistanceToNow(new Date(notification.createdAt || new Date()), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem className="text-primary-400 hover:text-primary-300 hover:bg-gray-700 justify-center cursor-pointer">
              View All Notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}