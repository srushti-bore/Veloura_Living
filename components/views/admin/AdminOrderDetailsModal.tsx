'use client';

import React, { useState } from 'react';
import { OrderStatusEnum } from '@/types';
import { DetailedOrder } from '@/lib/data/orderStore';
import {
  X,
  Package,
  MapPin,
  CreditCard,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface AdminOrderDetailsModalProps {
  order: DetailedOrder | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatusEnum) => Promise<void>;
}

export const AdminOrderDetailsModal: React.FC<AdminOrderDetailsModalProps> = ({
  order,
  onClose,
  onUpdateStatus,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatusEnum>(
    order?.status || 'PROCESSING'
  );
  const [isUpdating, setIsUpdating] = useState(false);

  if (!order) return null;

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStatus === order.status) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(order.id, selectedStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-[#DCF5E6] text-[#1E6B40]';
      case 'PROCESSING':
        return 'bg-[#FEF0D4] text-[#9A6216]';
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return 'bg-[#E0EDFF] text-[#245CA6]';
      case 'CANCELLED':
        return 'bg-[#FDE8E8] text-[#9B1C1C]';
      default:
        return 'bg-[#F0ECE4] text-[#554A40]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FAF7F2] rounded-2xl border border-[#E6DDD0] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto font-sans text-[#2E1E12]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#EAE2D7] bg-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#523623] text-white flex items-center justify-center font-bold">
              <Package className="w-5 h-5 text-[#E6DDD0]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2E1E12]">
                Order #{order.order_number || order.id.slice(0, 8)}
              </h3>
              <p className="text-xs text-[#796B5F]">
                Placed on{' '}
                {new Date(order.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#F2ECE2] flex items-center justify-center text-[#796B5F] hover:text-[#2E1E12] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status & Update Action */}
          <div className="bg-white p-4 rounded-xl border border-[#EAE2D7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-[#796B5F] block mb-1 font-medium">
                Current Fulfillment Status
              </span>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusBadge(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>

            <form onSubmit={handleStatusChange} className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as OrderStatusEnum)}
                className="bg-[#FAF7F2] border border-[#E4DCD0] rounded-xl px-3 py-2 text-xs font-medium text-[#2E1E12] focus:outline-none focus:border-[#8B5A2B]"
              >
                <option value="PLACED">Placed</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <button
                type="submit"
                disabled={isUpdating || selectedStatus === order.status}
                className="bg-[#523623] hover:bg-[#3D2515] disabled:opacity-50 text-white text-xs px-4 py-2 rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isUpdating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>Update</span>
              </button>
            </form>
          </div>

          {/* Customer & Address Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#EAE2D7] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#796B5F]">
                <MapPin className="w-3.5 h-3.5" />
                <span>Delivery Address</span>
              </div>
              <p className="text-sm font-semibold text-[#2E1E12]">
                {order.customer_info?.full_name || 'Client Customer'}
              </p>
              <p className="text-xs text-[#523623] leading-relaxed">
                {order.customer_info?.shipping_address || 'Atelier Residence'}
                <br />
                {order.customer_info?.city}, {order.customer_info?.state} -{' '}
                {order.customer_info?.postal_code}
              </p>
              <p className="text-xs text-[#796B5F]">
                📞 {order.customer_info?.phone || '—'}
                <br />
                ✉️ {order.customer_info?.email || '—'}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#EAE2D7] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#796B5F]">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Payment & Logistics</span>
              </div>
              <p className="text-xs text-[#523623]">
                <span className="text-[#796B5F]">Payment Method:</span>{' '}
                <span className="font-semibold">{order.payment?.payment_method || 'Razorpay UPI'}</span>
              </p>
              <p className="text-xs text-[#523623]">
                <span className="text-[#796B5F]">Payment Status:</span>{' '}
                <span className="font-semibold text-[#1E6B40]">
                  {order.payment_status || 'SUCCESS'}
                </span>
              </p>
              <p className="text-xs text-[#523623]">
                <span className="text-[#796B5F]">Tracking ID:</span>{' '}
                <span className="font-mono text-[#8B5A2B]">
                  {order.shipment?.tracking_number || `VL-EXP-${order.order_number || 'TRK'}`}
                </span>
              </p>
              <p className="text-xs text-[#523623]">
                <span className="text-[#796B5F]">Carrier:</span>{' '}
                <span>Veloura White-Glove Logistics</span>
              </p>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white p-4 rounded-xl border border-[#EAE2D7] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#796B5F]">
              Ordered Items ({order.items?.length || 0})
            </h4>
            <div className="divide-y divide-[#F0EAE1]">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-[#2E1E12]">{item.product_name}</p>
                    <p className="text-[11px] text-[#796B5F]">
                      SKU: {item.sku || 'VEL-BESPOKE'} • Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#2E1E12]">
                      ₹ {Number(item.total_price || item.unit_price || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="pt-3 border-t border-[#EAE2D7] space-y-1 text-xs">
              <div className="flex justify-between text-[#796B5F]">
                <span>Subtotal</span>
                <span>₹ {Number(order.subtotal || order.grand_total).toLocaleString('en-IN')}</span>
              </div>
              {order.discount_total ? (
                <div className="flex justify-between text-[#2E7D32]">
                  <span>Promotional Discount</span>
                  <span>- ₹ {Number(order.discount_total).toLocaleString('en-IN')}</span>
                </div>
              ) : null}
              <div className="flex justify-between font-bold text-sm text-[#2E1E12] pt-2 border-t border-[#F0EAE1]">
                <span>Total Amount Paid</span>
                <span>₹ {Number(order.grand_total).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#EAE2D7] bg-white rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#FAF7F2] border border-[#E4DCD0] text-[#523623] hover:bg-[#F2ECE2] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
