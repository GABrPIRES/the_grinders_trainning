"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchWithAuth } from "@/lib/api";

export interface AppNotification {
  id: string;
  type: string;
  payload: Record<string, any>;
  read_at: string | null;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const data: AppNotification[] = await fetchWithAuth("notifications");
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read_at).length);
    } catch {
      // silencioso — não interrompe a UX se falhar
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 60_000);
    return () => clearInterval(interval);
  }, [fetch]);

  const markRead = useCallback(async (id: string) => {
    try {
      await fetchWithAuth(`notifications/${id}/read`, { method: "POST" });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* silencioso */ }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await fetchWithAuth("notifications/read_all", { method: "POST" });
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch { /* silencioso */ }
  }, []);

  return { notifications, unreadCount, loading, markRead, markAllRead, refresh: fetch };
}
