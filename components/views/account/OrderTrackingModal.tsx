'use client';

import React, { useState } from 'react';
import { X, Package, Truck, CheckCircle2, Clock, Search, ShieldCheck } from 'lucide-react';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: any[];
  initialOrderId?: string;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  orders,
  initialOrderId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    initialOrderId || (orders.length > 0 ? orders[0].id : '')
  );

  if (!isOpen) return null;

  const currentOrder = orders.find(
    (o) =>
      o.id === selectedOrderId ||
      o.orderNumber?.toLowerCase() === (searchQuery.trim().toLowerCase().replace(/^#/, '') || selectedOrderId?.toLowerCase())
  ) || orders[0];

  const defaultTimeline = [
    { status: 'Order Placed', date: currentOrder?.createdAt || 'Recently', completed: true, desc: 'Bespoke order registered with the atelier.' },
    { status: 'Quality Inspection', date: 'In Progress', completed: currentOrder?.status !== 'PENDING', desc: 'Handcrafted timber and upholstery inspected.' },
    { status: 'Freight Dispatched', date: currentOrder?.estimatedDeliveryDate ? `Est. ${currentOrder.estimatedDeliveryDate}` : 'Pending', completed: ['SHIPPED', 'DELIVERED'].includes(currentOrder?.status), desc: 'Secured in climate-controlled white-glove transport.' },
    { status: 'Out for Delivery', date: 'Upcoming', completed: currentOrder?.status === 'DELIVERED', desc: 'White-glove team arriving with scheduled room placement.' },
    { status: 'Delivered & Assembled', date: currentOrder?.status === 'DELIVERED' ? 'Completed' : 'Pending', completed: currentOrder?.status === 'DELIVERED', desc: 'Packaging removed and 10-year timber warranty active.' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#21140D]/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#FAF7F2] rounded-3xl border border-[#E6DACD] shadow-2xl overflow-hidden p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EADBCC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EADBCC]/60 flex items-center justify-center text-[#55361F]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#2B1810]">
                Track White-Glove Delivery
              </h3>
              <p className="text-xs text-[#7D6B5D] font-sans font-light">
                Real-time freight telemetry & atelier delivery milestones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#7D6B5D] hover:text-[#2B1810] hover:bg-[#F2E8DC] rounded-full transition-colors cursor-pointer"
            aria-label="Close tracking dialogue"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Selector / Search */}
        <div className="my-5">
          {orders.length > 1 ? (
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <span className="text-xs text-[#7D6B5D] font-medium shrink-0">Select Order:</span>
              {orders.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setSelectedOrderId(o.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                    (selectedOrderId === o.id || (!selectedOrderId && o === currentOrder))
                      ? 'bg-[#3E2718] text-[#FAF7F2] border-[#3E2718] font-medium shadow-xs'
                      : 'bg-white text-[#5C4535] border-[#EADBCC] hover:bg-[#F5EFE6]'
                  }`}
                >
                  #{o.orderNumber || o.id?.slice(0, 8)}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-white rounded-xl border border-[#EADBCC] px-3 py-2 text-xs">
              <Search className="w-4 h-4 text-[#8C7A6B]" />
              <input
                type="text"
                placeholder="Enter Order ID (e.g. VL001248)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-[#2B1810] placeholder-[#8C7A6B]"
              />
            </div>
          )}
        </div>

        {/* Order Info Card */}
        {currentOrder ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EADBCC] flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-[#7D6B5D]">Order Number</span>
                <div className="font-serif font-bold text-lg text-[#2B1810]">
                  #{currentOrder.orderNumber || currentOrder.id?.slice(0, 8)}
                </div>
                {currentOrder.items && currentOrder.items.length > 0 && (
                  <p className="text-xs text-[#5C4535] mt-0.5">
                    {currentOrder.items[0].name}
                    {currentOrder.items.length > 1 && ` + ${currentOrder.items.length - 1} more items`}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="text-xs text-[#7D6B5D]">Total Amount</span>
                <div className="font-sans font-bold text-base text-[#3E2718]">
                  ₹{Number(currentOrder.total || 0).toLocaleString('en-IN')}
                </div>
                <span className="inline-block mt-1 bg-[#D8EADB] text-[#2D6A3F] px-2.5 py-0.5 rounded-md text-[11px] font-medium uppercase tracking-wider">
                  {currentOrder.status || 'Processing'}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EADBCC] space-y-4">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-[#7D6B5D]">
                White-Glove Progress Tracking
              </h4>
              <div className="space-y-4">
                {defaultTimeline.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 relative">
                    {idx < defaultTimeline.length - 1 && (
                      <div
                        className={`absolute left-[13px] top-[22px] w-[2px] h-[calc(100%+8px)] ${
                          step.completed ? 'bg-[#557A5A]' : 'bg-[#E5DACD]'
                        }`}
                      />
                    )}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                        step.completed
                          ? 'bg-[#EBF3ED] text-[#2D5A34] border border-[#557A5A]/30'
                          : 'bg-[#F7F2EA] text-[#A69788] border border-[#EADBCC]'
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2D5A34]" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold ${step.completed ? 'text-[#2B1810]' : 'text-[#8C7A6B]'}`}>
                          {step.status}
                        </span>
                        <span className="text-[11px] text-[#8C7A6B]">{step.date}</span>
                      </div>
                      <p className="text-[11px] text-[#7D6B5D] mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#557A5A] pt-2">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4" /> 10-Year Timber Warranty Registered
              </span>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#3E2718] hover:bg-[#2B1810] text-[#FAF7F2] rounded-xl font-medium transition-colors cursor-pointer"
              >
                Close Tracking
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 space-y-3">
            <Package className="w-12 h-12 text-[#8C7A6B] mx-auto opacity-50" />
            <h4 className="font-serif font-semibold text-lg text-[#2B1810]">No active order found</h4>
            <p className="text-xs text-[#7D6B5D] max-w-sm mx-auto">
              Please verify your order number or explore the curated catalog to place your first bespoke furniture commission.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-5 py-2.5 bg-[#3E2718] text-[#FAF7F2] rounded-xl text-xs font-medium cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
