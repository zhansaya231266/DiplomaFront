import { useCallback, useEffect, useState } from "react";
import { notificationsApi, type NotificationItem } from "../api";

type UseNotificationsOptions = {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
  pollIntervalMs?: number;
};

export const useNotifications = ({
  limit = 6,
  offset = 0,
  unreadOnly = false,
  pollIntervalMs = 30000,
}: UseNotificationsOptions = {}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const items = await notificationsApi.list({
        limit,
        offset,
        unreadOnly,
      });
      setNotifications(items);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load notifications",
      );
    } finally {
      setIsLoading(false);
    }
  }, [limit, offset, unreadOnly]);

  useEffect(() => {
    void loadNotifications();

    const intervalId = window.setInterval(() => {
      void loadNotifications();
    }, pollIntervalMs);

    const handleFocus = () => {
      void loadNotifications();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [loadNotifications, pollIntervalMs]);

  const markAsRead = useCallback(async (id: string) => {
    setIsUpdating(true);
    setError(null);

    try {
      await notificationsApi.markAsRead(id);
      await loadNotifications();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to update notification",
      );
    } finally {
      setIsUpdating(false);
    }
  }, [loadNotifications]);

  const markAllAsRead = useCallback(async () => {
    setIsUpdating(true);
    setError(null);

    try {
      await notificationsApi.markAllAsRead();
      await loadNotifications();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to update notifications",
      );
    } finally {
      setIsUpdating(false);
    }
  }, [loadNotifications]);

  return {
    notifications,
    isLoading,
    isUpdating,
    error,
    reload: loadNotifications,
    markAsRead,
    markAllAsRead,
  };
};
