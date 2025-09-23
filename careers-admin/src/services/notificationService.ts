import { api } from '../utils/api';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
}

const notificationService = {
  /**
   * Get all notifications for the current user
   */
  getNotifications: async (limit = 50, skip = 0): Promise<NotificationsResponse> => {
    return api.get<NotificationsResponse>(`/notifications?limit=${limit}&skip=${skip}`);
  },

  /**
   * Get unread notifications count
   */
  getUnreadCount: async (): Promise<{ count: number }> => {
    return api.get<{ count: number }>('/notifications/unread-count');
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (id: string): Promise<Notification> => {
    return api.post<Notification>(`/notifications/${id}/read`);
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<{ success: boolean }> => {
    return api.post<{ success: boolean }>('/notifications/mark-all-read');
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (id: string): Promise<{ success: boolean }> => {
    return api.delete<{ success: boolean }>(`/notifications/${id}`);
  },

  /**
   * Delete all notifications
   */
  deleteAllNotifications: async (): Promise<{ success: boolean }> => {
    return api.delete<{ success: boolean }>('/notifications');
  }
};

export default notificationService;
