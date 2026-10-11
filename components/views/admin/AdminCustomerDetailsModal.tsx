'use client';

import React from 'react';
import { X, User, MapPin, Mail, Phone, Calendar, ShoppingBag, CreditCard } from 'lucide-react';

interface CustomerRecord {
  id: string;
  email: string;
  status: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  avatarUrl?: string;
  ordersCount: number;
  totalSpent: number;
  addresses?: any[];
  recentOrders?: any[];
}

interface AdminCustomerDetailsModalProps {
  customer: CustomerRecord | null;
  onClose: () => void;
  onViewOrder?: (orderId: string) => void;
}

export const AdminCustomerDetailsModal: React.FC<AdminCustomerDetailsModalProps> = ({
  customer,
  onClose,
  onViewOrder,
}) => {
  if (!customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FAF7F2] rounded-2xl border border-[#E6DDD0] shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto font-sans text-[#2E1E12]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#EAE2D7] bg-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#523623] text-white flex items-center justify-center font-bold text-lg">
              {customer.fullName[0]?.toUpperCase() || 'C'}
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2E1E12]">
                {customer.fullName}
              </h3>
              <p className="text-xs text-[#796B5F] flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#2E7D32]" />
                Customer Account • {customer.status}
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

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Metrics summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#EAE2D7]">
              <span className="text-xs text-[#796B5F] font-medium block">Total Orders</span>
              <p className="text-xl font-bold font-serif text-[#2E1E12] mt-1">
                {customer.ordersCount}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#EAE2D7]">
              <span className="text-xs text-[#796B5F] font-medium block">Lifetime Spent</span>
              <p className="text-xl font-bold font-serif text-[#2E1E12] mt-1">
                ₹ {Number(customer.totalSpent || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white p-4 rounded-xl border border-[#EAE2D7] space-y-2.5 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-[#796B5F]">
              Contact Information
            </h4>
            <div className="flex items-center gap-2 text-[#523623]">
              <Mail className="w-4 h-4 text-[#8B5A2B]" />
              <span>{customer.email}</span>
            </div>
            <div className="flex items-center gap-2 text-[#523623]">
              <Phone className="w-4 h-4 text-[#8B5A2B]" />
              <span>{customer.phone || 'No phone provided'}</span>
            </div>
            <div className="flex items-center gap-2 text-[#523623]">
              <Calendar className="w-4 h-4 text-[#8B5A2B]" />
              <span>
                Member since{' '}
                {new Date(customer.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Addresses */}
          {customer.addresses && customer.addresses.length > 0 && (
            <div className="bg-white p-4 rounded-xl border border-[#EAE2D7] space-y-2.5 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-[#796B5F]">
                Saved Addresses
              </h4>
              <div className="space-y-2">
                {customer.addresses.map((addr: any, idx: number) => (
                  <div key={idx} className="p-3 bg-[#FAF7F2] rounded-lg border border-[#EAE2D7]">
                    <p className="font-semibold text-[#2E1E12]">{addr.full_name || customer.fullName}</p>
                    <p className="text-[#523623] mt-0.5">
                      {addr.address_line1}
                      {addr.address_line2 ? `, ${addr.address_line2}` : ''}
                      <br />
                      {addr.city}, {addr.state} - {addr.postal_code}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Orders */}
          {customer.recentOrders && customer.recentOrders.length > 0 && (
            <div className="bg-white p-4 rounded-xl border border-[#EAE2D7] space-y-2.5 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-[#796B5F]">
                Recent Order History
              </h4>
              <div className="divide-y divide-[#F0EAE1]">
                {customer.recentOrders.map((ord: any, idx: number) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#2E1E12]">#{ord.orderNumber}</p>
                      <p className="text-[11px] text-[#796B5F]">
                        {new Date(ord.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#2E1E12]">
                        ₹ {Number(ord.grandTotal).toLocaleString('en-IN')}
                      </p>
                      <span className="text-[10px] uppercase font-bold text-[#8B5A2B]">
                        {ord.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
