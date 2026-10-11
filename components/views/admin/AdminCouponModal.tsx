'use client';

import React, { useState } from 'react';
import { X, Tag, Check } from 'lucide-react';

interface AdminCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCoupon: (coupon: {
    code: string;
    discount_type: 'PERCENTAGE' | 'FIXED';
    discount_value: number;
    min_order_value: number;
    usage_limit?: number;
  }) => Promise<void>;
}

export const AdminCouponModal: React.FC<AdminCouponModalProps> = ({
  isOpen,
  onClose,
  onSaveCoupon,
}) => {
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [minOrderValue, setMinOrderValue] = useState<number>(50000);
  const [usageLimit, setUsageLimit] = useState<number>(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsSubmitting(true);
    try {
      await onSaveCoupon({
        code: code.trim().toUpperCase(),
        discount_type: discountType,
        discount_value: Number(discountValue),
        min_order_value: Number(minOrderValue),
        usage_limit: usageLimit ? Number(usageLimit) : undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FAF7F2] rounded-2xl border border-[#E6DDD0] shadow-2xl max-w-md w-full font-sans text-[#2E1E12]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#EAE2D7] bg-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#523623] text-white flex items-center justify-center font-bold">
              <Tag className="w-5 h-5 text-[#E6DDD0]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2E1E12]">Create Promotion</h3>
              <p className="text-xs text-[#796B5F]">Configure discount rules and usage caps</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#F2ECE2] flex items-center justify-center text-[#796B5F] hover:text-[#2E1E12] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#523623]">Coupon Code</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. FESTIVE2026"
              className="w-full bg-white border border-[#E4DCD0] rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-[#2E1E12] uppercase focus:outline-none focus:border-[#8B5A2B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#523623]">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full bg-white border border-[#E4DCD0] rounded-xl px-3.5 py-2 text-xs text-[#2E1E12] focus:outline-none focus:border-[#8B5A2B]"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Flat Amount (₹)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#523623]">
                {discountType === 'PERCENTAGE' ? 'Discount %' : 'Discount ₹'}
              </label>
              <input
                type="number"
                required
                min="1"
                max={discountType === 'PERCENTAGE' ? 100 : 500000}
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full bg-white border border-[#E4DCD0] rounded-xl px-3.5 py-2 text-xs text-[#2E1E12] focus:outline-none focus:border-[#8B5A2B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#523623]">Min Order Value (₹)</label>
              <input
                type="number"
                min="0"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(Number(e.target.value))}
                className="w-full bg-white border border-[#E4DCD0] rounded-xl px-3.5 py-2 text-xs text-[#2E1E12] focus:outline-none focus:border-[#8B5A2B]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#523623]">Usage Limit (Total)</label>
              <input
                type="number"
                min="1"
                value={usageLimit}
                onChange={(e) => setUsageLimit(Number(e.target.value))}
                className="w-full bg-white border border-[#E4DCD0] rounded-xl px-3.5 py-2 text-xs text-[#2E1E12] focus:outline-none focus:border-[#8B5A2B]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#EAE2D7] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-[#E4DCD0] text-[#523623] hover:bg-[#F2ECE2] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#523623] text-white hover:bg-[#3D2515] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Create Coupon</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
