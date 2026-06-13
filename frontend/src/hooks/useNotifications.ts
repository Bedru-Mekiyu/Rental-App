import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationsAPI, Notification } from '@/services/apiService';
import { useAuthStore } from '@/store/authStore';
import { useWebSocket } from './useWebSocket';
import toast from 'react-hot-toast';

interface UseNotificationsOptions {
  useWebSocketConnection?: boolean;
  pollingInterval?: number;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { useWebSocketConnection = true, pollingInterval = 30000 } = options;
  const { isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const initialFetchDone = useRef(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationsAPI.list();
      const notifs = Array.isArray(data) ? data : [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => n.status === 'unread').length);
    } catch {
      // Silently fail for notifications
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback((message: { type: string; data?: any }) => {
    if (message.type === 'notification') {
      const newNotification: Notification = message.data;
      setNotifications((prev) => [newNotification, ...prev]);
      if (newNotification.status === 'unread') {
        setUnreadCount((prev) => prev + 1);
      }
    } else if (message.type === 'notification_read') {
      const { id } = message.data;
      setNotifications((prev) =>
        prev.map((n) => (n.id === id || n._id === id ? { ...n, status: 'read' as const } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } else if (message.type === 'notification_deleted') {
      const { id } = message.data;
      setNotifications((prev) => {
        const notification = prev.find((n) => n.id === id || n._id === id);
        if (notification?.status === 'unread') {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n.id !== id && n._id !== id);
      });
    }
  }, []);

  // WebSocket connection (only if enabled)
  const { isConnected } = useWebSocket(
    useWebSocketConnection && isAuthenticated
      ? {
          onMessage: handleWebSocketMessage,
          onConnect: () => {
            console.log('[Notifications] WebSocket connected');
          },
          onDisconnect: () => {
            console.log('[Notifications] WebSocket disconnected');
          },
        }
      : {}
  );

  const markAsRead = async (id: string) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id || n._id === id ? { ...n, status: 'read' as const } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'read' as const })));
      setUnreadCount(0);
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationsAPI.delete(id);
      const notification = notifications.find((n) => n.id === id || n._id === id);
      if (notification?.status === 'unread') {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setNotifications((prev) => prev.filter((n) => n.id !== id && n._id !== id));
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    if (notification.status === 'unread') {
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  // Initial fetch and polling fallback
  useEffect(() => {
    // Initial fetch
    if (!initialFetchDone.current) {
      fetchNotifications();
      initialFetchDone.current = true;
    }

    // Only poll if WebSocket is not connected
    if (!isConnected && pollingInterval > 0) {
      const interval = setInterval(fetchNotifications, pollingInterval);
      return () => clearInterval(interval);
    }
  }, [isConnected, fetchNotifications, pollingInterval]);

  return {
    notifications,
    unreadCount,
    loading,
    isWebSocketConnected: isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    refresh: fetchNotifications,
  };
}
