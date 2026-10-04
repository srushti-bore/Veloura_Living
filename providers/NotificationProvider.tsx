'use client';

/**
 * 🏛️ Veloura Living — Notification Provider & Context
 * Powers real-time notification badge, in-app drawer, and toast alerts.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DbNotification } from '@/types/notification';

interface NotificationContextType {
  notifications: DbNotification[];
  unreadCount: number;
  isOpen: boolean;
  activeToast: DbNotification | null;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  dismissToast: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<DbNotification | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const data = json.data || {};
        const items: DbNotification[] = data.notifications || [];
        setNotifications(items);
        setUnreadCount(data.unreadCount || items.filter((n) => !n.is_read).length);
      }
    } catch (e) {
      console.warn('Failed to fetch notifications:', e);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling check every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);
  const toggleDrawer = () => setIsOpen((prev) => !prev);

  const markAsRead = async (id: string) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (e) {
      console.error('Failed to mark notification as read:', e);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);

      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
    } catch (e) {
      console.error('Failed to mark all notifications as read:', e);
    }
  };

  const clearAll = async () => {
    try {
      setNotifications([]);
      setUnreadCount(0);
      await fetch('/api/notifications', { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to clear notifications:', e);
    }
  };

  const dismissToast = () => setActiveToast(null);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isOpen,
        activeToast,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        markAsRead,
        markAllAsRead,
        clearAll,
        refreshNotifications: fetchNotifications,
        dismissToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
