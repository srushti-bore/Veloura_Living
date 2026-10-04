/**
 * 🏛️ Veloura Living — Notification Engine Types
 * Multi-Channel: Email, WhatsApp, SMS, and In-App Drawer
 */

export type NotificationChannel = 'EMAIL' | 'SMS' | 'WHATSAPP' | 'IN_APP';

export type NotificationType =
  | 'ORDER_STATUS'
  | 'PAYMENT_CONFIRMATION'
  | 'REFUND_PROCESSED'
  | 'LOGISTICS_OUT_FOR_DELIVERY'
  | 'VIP_CONCIERGE'
  | 'SECURITY_ALERT'
  | 'PRICE_DROP';

export type DeliveryStatus = 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED';

export interface DbNotification {
  id: string;
  user_id?: string;
  owner_key?: string; // sessionId or userId for in-app retrieval
  channel: NotificationChannel;
  type: NotificationType;
  title: string;
  message: string;
  action_url?: string;
  data?: Record<string, any>;
  is_read: boolean;
  read_at?: string;
  delivery_status: DeliveryStatus;
  created_at: string;
}

export interface NotificationPayload {
  recipientEmail?: string;
  recipientPhone?: string;
  userId?: string;
  ownerKey?: string;
  channels: NotificationChannel[];
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  data?: Record<string, any>;
}

export interface NotificationDispatchResult {
  notificationId: string;
  channelResults: {
    channel: NotificationChannel;
    success: boolean;
    deliveryId?: string;
    details?: string;
  }[];
}
