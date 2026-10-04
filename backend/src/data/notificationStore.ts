/**
 * 🏛️ Veloura Living — In-App Notification Store (Backend Standalone)
 * Manages customer notification center ledger, unread counts, and batch actions.
 */

import { DbNotification, NotificationChannelEnum, NotificationTypeEnum } from '../types/database';

let notificationsStore: DbNotification[] = [];
let isInitialized = false;

export function initNotificationStore() {
  if (isInitialized) return;
  isInitialized = true;

  const now = new Date();
  const minsAgo = (mins: number) => new Date(now.getTime() - mins * 60000).toISOString();
  const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 3600000).toISOString();

  // Seed initial luxury client notifications
  notificationsStore = [
    {
      id: 'notif_001',
      user_id: '33333333-3333-3333-3333-333333333303',
      owner_key: 'client@example.com',
      channel: 'IN_APP',
      type: 'ORDER_STATUS',
      title: 'Order Confirmed: VL-2026-8941',
      message: 'Your artisan order containing Serpentine Modular Sectional has entered carpentry scheduling at our Milan workshop.',
      action_url: '/account',
      data: { order_number: 'VL-2026-8941' },
      is_read: false,
      delivery_status: 'DELIVERED',
      created_at: minsAgo(15),
    },
    {
      id: 'notif_002',
      user_id: '33333333-3333-3333-3333-333333333303',
      owner_key: 'client@example.com',
      channel: 'IN_APP',
      type: 'VIP_CONCIERGE',
      title: 'Atelier Seasonal Preview: Solis Rust Velvet',
      message: 'Exclusive VIP access: The Solis Lounge Chair is now available in limited-edition Tuscan Rust Velvet.',
      action_url: '/product/solis-boucle-occasional-chair',
      data: { product_slug: 'solis-boucle-occasional-chair' },
      is_read: false,
      delivery_status: 'DELIVERED',
      created_at: hoursAgo(2),
    },
    {
      id: 'notif_003',
      user_id: '33333333-3333-3333-3333-333333333303',
      owner_key: 'client@example.com',
      channel: 'IN_APP',
      type: 'REFUND_PROCESSED',
      title: 'Instant Refund Credited: ₹78,000',
      message: 'Your Razorpay gateway refund (ARN: ARN_SIM_50556834) has been successfully dispatched to your original payment method.',
      action_url: '/account',
      data: { refund_id: 'rfnd_sim_a5wsib48l8', amount: 78000 },
      is_read: true,
      read_at: hoursAgo(12),
      delivery_status: 'DELIVERED',
      created_at: hoursAgo(24),
    },
    {
      id: 'notif_guest_001',
      owner_key: 'default_session',
      channel: 'IN_APP',
      type: 'VIP_CONCIERGE',
      title: 'Welcome to Veloura Living Atelier',
      message: 'Explore our 2026 architectural collection with complimentary White-Glove delivery on orders above ₹2,999.',
      action_url: '/shop',
      is_read: false,
      delivery_status: 'DELIVERED',
      created_at: minsAgo(5),
    },
    {
      id: 'notif_guest_002',
      owner_key: 'default_session',
      channel: 'IN_APP',
      type: 'ORDER_STATUS',
      title: 'AI Spatial Designer Consultation Active',
      message: 'Our Gemini AI Spatial Consultant is ready to generate tailored 3D room styling recommendations for your home.',
      action_url: '/shop',
      is_read: false,
      delivery_status: 'DELIVERED',
      created_at: hoursAgo(1),
    },
  ];
}

export interface GetNotificationOptions {
  limit?: number;
  unreadOnly?: boolean;
  type?: NotificationTypeEnum | string;
}

export function getNotifications(
  ownerKey: string,
  options: GetNotificationOptions = {}
): { notifications: DbNotification[]; total: number; unreadCount: number } {
  initNotificationStore();

  const normalizedKey = ownerKey || 'default_session';

  let list = notificationsStore.filter(
    (n) =>
      n.owner_key === normalizedKey ||
      n.user_id === normalizedKey ||
      n.owner_key === 'default_session'
  );

  const unreadCount = list.filter((n) => !n.is_read).length;

  if (options.unreadOnly) {
    list = list.filter((n) => !n.is_read);
  }

  if (options.type && options.type !== 'ALL') {
    list = list.filter((n) => n.type === options.type);
  }

  list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (options.limit && options.limit > 0) {
    list = list.slice(0, options.limit);
  }

  return {
    notifications: list,
    total: list.length,
    unreadCount,
  };
}

export function getUnreadCount(ownerKey: string): number {
  initNotificationStore();
  const normalizedKey = ownerKey || 'default_session';
  return notificationsStore.filter(
    (n) =>
      (n.owner_key === normalizedKey || n.user_id === normalizedKey || n.owner_key === 'default_session') &&
      !n.is_read
  ).length;
}

export function markNotificationAsRead(id: string, ownerKey?: string): DbNotification | undefined {
  initNotificationStore();
  const notification = notificationsStore.find((n) => n.id === id);
  if (!notification) return undefined;

  notification.is_read = true;
  notification.read_at = new Date().toISOString();
  return notification;
}

export function markAllNotificationsAsRead(ownerKey: string): number {
  initNotificationStore();
  const normalizedKey = ownerKey || 'default_session';
  let updatedCount = 0;
  const now = new Date().toISOString();

  notificationsStore.forEach((n) => {
    if (
      (n.owner_key === normalizedKey || n.user_id === normalizedKey || n.owner_key === 'default_session') &&
      !n.is_read
    ) {
      n.is_read = true;
      n.read_at = now;
      updatedCount++;
    }
  });

  return updatedCount;
}

export function deleteNotification(id: string, ownerKey?: string): boolean {
  initNotificationStore();
  const index = notificationsStore.findIndex((n) => n.id === id);
  if (index === -1) return false;
  notificationsStore.splice(index, 1);
  return true;
}

export function clearAllNotifications(ownerKey: string): number {
  initNotificationStore();
  const normalizedKey = ownerKey || 'default_session';
  const initialLength = notificationsStore.length;
  notificationsStore = notificationsStore.filter(
    (n) => n.owner_key !== normalizedKey && n.user_id !== normalizedKey && n.owner_key !== 'default_session'
  );
  return initialLength - notificationsStore.length;
}

export function createNotificationRecord(data: {
  userId?: string;
  ownerKey?: string;
  channel?: NotificationChannelEnum;
  type: NotificationTypeEnum | string;
  title: string;
  message: string;
  actionUrl?: string;
  data?: Record<string, any>;
}): DbNotification {
  initNotificationStore();

  const newRecord: DbNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    user_id: data.userId,
    owner_key: data.ownerKey || data.userId || 'default_session',
    channel: data.channel || 'IN_APP',
    type: data.type,
    title: data.title,
    message: data.message,
    action_url: data.actionUrl,
    data: data.data,
    is_read: false,
    delivery_status: 'DELIVERED',
    created_at: new Date().toISOString(),
  };

  notificationsStore.unshift(newRecord);
  return newRecord;
}
