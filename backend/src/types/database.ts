/**
 * 🏛️ Veloura Living — Complete PostgreSQL / Supabase Database Types
 * Generated & Standardized for Backend Service
 */

export type UserRoleEnum = 'CUSTOMER' | 'ADMIN' | 'MANAGER' | 'PRODUCT_MANAGER' | 'ORDER_MANAGER';
export type UserStatusEnum = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type OrderStatusEnum = 
  | 'PLACED' 
  | 'CONFIRMED' 
  | 'PROCESSING' 
  | 'SHIPPED' 
  | 'OUT_FOR_DELIVERY' 
  | 'DELIVERED' 
  | 'CANCELLED';

export type PaymentStatusEnum = 
  | 'INITIATED' 
  | 'PENDING' 
  | 'SUCCESS' 
  | 'FAILED' 
  | 'CANCELLED' 
  | 'REFUNDED' 
  | 'PARTIALLY_REFUNDED';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'SGD' | string;
export type PaymentMethodEnum = 'CARD' | 'UPI' | 'NET_BANKING' | 'WALLET' | 'COD' | 'EMI' | 'INTERNATIONAL_CARD';
export type RefundSpeedEnum = 'normal' | 'optimum';
export type ShipmentStatusEnum = 
  | 'PENDING' 
  | 'PICKED_UP' 
  | 'IN_TRANSIT' 
  | 'OUT_FOR_DELIVERY' 
  | 'DELIVERED' 
  | 'FAILED_ATTEMPT' 
  | 'RETURNED';

export type ReturnStatusEnum = 
  | 'RETURN_REQUESTED' 
  | 'RETURN_APPROVED' 
  | 'RETURN_REJECTED' 
  | 'RETURN_PICKUP' 
  | 'RETURN_RECEIVED' 
  | 'REFUND_INITIATED' 
  | 'REFUNDED';

export type InventoryMovementTypeEnum = 
  | 'PURCHASE' 
  | 'SALE' 
  | 'RESERVATION' 
  | 'CANCELLATION' 
  | 'RETURN' 
  | 'ADJUSTMENT' 
  | 'DAMAGED' 
  | 'TRANSFER';

export type DiscountTypeEnum = 'PERCENTAGE' | 'FIXED';
export type ReviewStatusEnum = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface DbUser {
  id: string;
  email: string;
  password_hash: string;
  status: UserStatusEnum;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbRole {
  id: string;
  name: UserRoleEnum;
  description?: string;
  created_at: string;
}

export interface DbPermission {
  id: string;
  slug: string;
  description?: string;
  created_at: string;
}

export interface DbProfile {
  user_id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  preferred_currency: string;
  interior_style_preference?: string;
  created_at: string;
  updated_at: string;
}

export interface DbAddress {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  landmark?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default_shipping: boolean;
  is_default_billing: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbCategory {
  id: string;
  parent_id?: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbBrand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
  country_of_origin: string;
  created_at: string;
  updated_at: string;
}

export interface DbProduct {
  id: string;
  category_id: string;
  brand_id?: string;
  name: string;
  slug: string;
  tagline?: string;
  short_description?: string;
  full_description?: string;
  base_price: number;
  compare_at_price?: number;
  is_featured: boolean;
  is_active: boolean;
  rating_avg: number;
  review_count: number;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface DbProductVariant {
  id: string;
  product_id: string;
  sku: string;
  variant_name: string;
  price: number;
  compare_at_price?: number;
  material?: string;
  finish?: string;
  color_name?: string;
  color_hex?: string;
  dimensions?: string;
  weight_kg?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbInventory {
  variant_id: string;
  available_quantity: number;
  reserved_quantity: number;
  sold_quantity: number;
  low_stock_threshold: number;
  warehouse_location: string;
  updated_at: string;
}

export interface DbInventoryMovement {
  id: string;
  variant_id: string;
  movement_type: InventoryMovementTypeEnum;
  quantity: number;
  reference_id?: string;
  note?: string;
  created_by?: string;
  created_at: string;
}

export interface DbCart {
  id: string;
  user_id?: string;
  session_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DbCartItem {
  id: string;
  cart_id: string;
  variant_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface DbOrder {
  id: string;
  order_number: string;
  user_id?: string;
  shipping_address_id?: string;
  billing_address_id?: string;
  status: OrderStatusEnum;
  payment_status: PaymentStatusEnum;
  payment_method?: PaymentMethodEnum;
  currency?: CurrencyCode;
  exchange_rate?: number;
  subtotal: number;
  discount_total: number;
  tax_total: number;
  shipping_total: number;
  cod_handling_fee?: number;
  cod_verified?: boolean;
  cod_otp?: string;
  grand_total: number;
  coupon_id?: string;
  customer_notes?: string;
  idempotency_key?: string;
  created_at: string;
  updated_at: string;
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  variant_id: string;
  product_name: string;
  sku: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  created_at: string;
}

export interface DbPayment {
  id: string;
  order_id: string;
  payment_method: PaymentMethodEnum;
  amount: number;
  currency: string;
  status: PaymentStatusEnum;
  created_at: string;
  updated_at: string;
}

export interface DbPaymentTransaction {
  id: string;
  payment_id: string;
  transaction_ref: string;
  gateway_name: string;
  gateway_order_id?: string;
  status: PaymentStatusEnum;
  raw_response?: Record<string, any>;
  created_at: string;
}

export interface DbShipment {
  id: string;
  order_id: string;
  tracking_number?: string;
  carrier: string;
  status: ShipmentStatusEnum;
  estimated_delivery?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DbReview {
  id: string;
  product_id: string;
  user_id: string;
  order_id?: string;
  user_name?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  helpful_count?: number;
  is_verified_purchase: boolean;
  status: ReviewStatusEnum;
  created_at: string;
  updated_at: string;
}

export interface DbReturn {
  id: string;
  order_id: string;
  order_number?: string;
  user_id: string;
  user_email?: string;
  items?: Array<{
    variant_id: string;
    product_name: string;
    sku: string;
    quantity: number;
    unit_price: number;
  }>;
  reason: string;
  condition?: string;
  images?: string[];
  status: ReturnStatusEnum;
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  tracking_number?: string;
  refund_id?: string;
}

export interface DbRefund {
  id: string;
  return_id?: string;
  order_id: string;
  payment_id: string;
  amount: number;
  currency: string;
  gateway_refund_id?: string;
  gateway_arn?: string;
  speed?: RefundSpeedEnum;
  failure_reason?: string;
  reason: string;
  status: PaymentStatusEnum;
  processed_at: string;
}

export interface DbCmsBanner {
  id: string;
  section_name: string;
  title: string;
  subtitle?: string;
  image_url: string;
  cta_label?: string;
  cta_link?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export type NotificationChannelEnum = 'EMAIL' | 'SMS' | 'WHATSAPP' | 'IN_APP';

export type NotificationTypeEnum =
  | 'ORDER_STATUS'
  | 'PAYMENT_CONFIRMATION'
  | 'REFUND_PROCESSED'
  | 'LOGISTICS_OUT_FOR_DELIVERY'
  | 'VIP_CONCIERGE'
  | 'SECURITY_ALERT'
  | 'PRICE_DROP';

export interface DbNotification {
  id: string;
  user_id?: string;
  owner_key?: string;
  channel?: NotificationChannelEnum;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  read_at?: string;
  action_url?: string;
  link_url?: string;
  data?: Record<string, any>;
  delivery_status?: 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED';
  created_at: string;
}

export interface DbCoupon {
  id: string;
  code: string;
  discount_type: DiscountTypeEnum;
  discount_value: number;
  min_order_value: number;
  max_discount_amount?: number;
  usage_limit?: number;
  usage_count: number;
  per_user_limit: number;
  starts_at: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface DbAuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}
