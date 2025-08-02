import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Notification } from '@shared/schema';

// Fetch notifications for current user
export function useNotifications(options?: { isRead?: boolean; limit?: number }) {
  return useQuery({
    queryKey: ['/api/notifications', options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.isRead !== undefined) {
        params.append('isRead', options.isRead.toString());
      }
      if (options?.limit) {
        params.append('limit', options.limit.toString());
      }
      
      const response = await fetch(`/api/notifications?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      return response.json() as Promise<Notification[]>;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
}

// Get unread notification count
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ['/api/notifications/unread-count'],
    queryFn: async () => {
      const response = await fetch('/api/notifications/unread-count');
      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }
      return response.json() as Promise<{ count: number }>;
    },
    refetchInterval: 15000, // Refetch every 15 seconds for badge updates
  });
}

// Mark notification as read
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate notifications and unread count queries
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });
}

// Mark all notifications as read
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH',
      });
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate notifications and unread count queries
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });
}

// Create notification (for system/admin use)
export function useCreateNotification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notification: {
      userId: string;
      type: string;
      title: string;
      message: string;
      actionUrl?: string;
      entityType?: string;
      entityId?: string;
      metadata?: any;
    }) => {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification),
      });
      if (!response.ok) {
        throw new Error('Failed to create notification');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate notifications and unread count queries
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });
}