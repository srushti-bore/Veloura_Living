'use client';

import React, { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { ProductCard } from '@/components/products/ProductCard';
import {
  Package,
  Heart,
  User,
  MapPin,
  Clock,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Download,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { orders, wishlist, allProducts, navigate, addToCart } = useStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'ai-consultations'>('orders');

  const wishlistedProducts = allProducts.filter((p) => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-[#FCFAF7] py-10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4A2C1A]/10 shadow-soft-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#4A2C1A] text-[#F5E6D3] font-display font-bold text-2xl flex items-center justify-center shadow-md">
              AS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-2xl text-[#211E1B]">
                  Aarav Singhania
                </h1>
                <span className="bg-[#F5E6D3] text-[#4A2C1A] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#8B5A2B]/20">
                  Veloura Patron Member
                </span>
              </div>
              <p className="text-xs text-[#746B61] mt-0.5">
                aarav.singhania@veloura.live • Member since 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin')}
              className="btn-secondary-refined active:scale-95 text-[#4A2C1A] text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer"
            >
              Open Store Operations Portal →
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#EEE9E1] pb-2 overflow-x-auto">
          {[
            { id: 'orders', label: `Orders & White-Glove Tracking (${orders.length})`, icon: Package },
            { id: 'wishlist', label: `Saved Wishlist (${wishlistedProducts.length})`, icon: Heart },
            { id: 'addresses', label: 'Delivery Destinations', icon: MapPin },
            { id: 'ai-consultations', label: 'AI Spatial Consultations', icon: Sparkles }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer interactive-pill ${
                  isSelected
                    ? 'bg-[#4A2C1A] text-white shadow-sm'
                    : 'bg-white text-[#514A43] hover:bg-[#F5E6D3] hover:text-[#4A2C1A] border border-[#EEE9E1]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Orders & Real-Time Tracking Timeline */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4A2C1A]/10 shadow-soft-sm space-y-6 interactive-card hover:border-[#8B5A2B]/30"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EEE9E1]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B5A2B]">
                      Order Reference: {order.orderNumber}
                    </span>
                    <h3 className="font-display font-bold text-xl text-[#211E1B] mt-0.5">
                      Placed on {order.createdAt}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="bg-[#557A5A]/10 text-[#557A5A] text-xs font-bold px-3 py-1 rounded-full border border-[#557A5A]/20">
                      Status: {order.status}
                    </span>
                    <button
                      onClick={() => alert(`Downloading Official Tax Invoice for ${order.orderNumber}...`)}
                      className="btn-secondary-refined active:scale-95 text-[#4A2C1A] text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Invoice PDF</span>
                    </button>
                  </div>
                </div>

                {/* Items in this Order */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#FCFAF7] border border-[#EEE9E1] flex gap-3 items-center hover:border-[#8B5A2B]/30 transition-colors"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-xl bg-white flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0 text-xs">
                        <h4 className="font-display font-semibold text-sm text-[#211E1B] truncate">
                          {item.name}
                        </h4>
                        <div className="text-[#746B61] text-[11px] mt-0.5">
                          {item.selectedColor} • {item.selectedMaterial} (Qty: {item.quantity})
                        </div>
                        <div className="text-xs font-bold text-[#4A2C1A] mt-1">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tracking Progress Timeline */}
                <div className="pt-4 border-t border-[#EEE9E1]">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#746B61] flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#8B5A2B]" />
                      <span>White-Glove In-Home Delivery Status</span>
                    </h4>
                    <span className="text-xs text-[#557A5A] font-semibold">
                      Estimated In-Home Setup: {order.estimatedDeliveryDate}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {order.timeline.map((step, sIdx) => (
                      <div
                        key={sIdx}
                        className={`p-3.5 rounded-xl border text-xs space-y-1 relative transition-all ${
                          step.completed
                            ? 'bg-[#557A5A]/5 border-[#557A5A]/30 text-[#211E1B]'
                            : 'bg-[#FCFAF7] border-[#EEE9E1] text-[#9C9287]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold">
                          {step.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-[#557A5A]" />
                          ) : (
                            <Clock className="w-4 h-4 text-[#9C9287]" />
                          )}
                          <span>{step.status}</span>
                        </div>
                        <div className="text-[10px] text-[#746B61]">{step.description}</div>
                        <div className="text-[9px] text-[#9C9287] font-mono pt-1">{step.date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Wishlist */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6 animate-fadeIn">
            {wishlistedProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#EEE9E1] shadow-soft-sm space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#F5E6D3] text-[#8B5A2B] flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="font-display font-bold text-xl text-[#211E1B]">
                  Your considered pieces will live here.
                </h3>
                <p className="text-xs text-[#746B61]">
                  Save items while exploring rooms to build your space palette.
                </p>
                <button
                  onClick={() => navigate('/shop')}
                  className="btn-primary-shimmer active:scale-[0.98] text-white px-6 py-2.5 rounded-full text-xs font-semibold cursor-pointer shadow-md"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Delivery Destinations */}
        {activeTab === 'addresses' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 border-2 border-[#8B5A2B] shadow-soft-sm space-y-3 relative interactive-card">
              <span className="bg-[#8B5A2B] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Primary Residence
              </span>
              <h3 className="font-display font-bold text-lg text-[#211E1B]">
                Skyline Penthouse 34A
              </h3>
              <p className="text-xs text-[#746B61] leading-relaxed">
                Worli Sea Face, Tower B, 34th Floor<br />
                Mumbai, Maharashtra — 400018<br />
                Phone: +91 98201 54321
              </p>
              <div className="text-[11px] text-[#557A5A] font-semibold pt-2 border-t border-[#EEE9E1]">
                ✓ Serviceable with Freight Elevator Access
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: AI Consultations */}
        {activeTab === 'ai-consultations' && (
          <div className="bg-white rounded-3xl p-8 border border-[#4A2C1A]/10 shadow-soft-sm space-y-4 animate-fadeIn">
            <h3 className="font-display font-bold text-xl text-[#211E1B]">
              Saved Spatial Architecture Sessions
            </h3>
            <p className="text-xs text-[#746B61]">
              Review prior room recommendations, suggested material palettes, and dimension calculations generated by Veloura Spatial AI.
            </p>
            <div className="p-4 rounded-2xl bg-[#FCFAF7] border border-[#EEE9E1] text-xs space-y-2 hover:border-[#8B5A2B]/30 transition-colors">
              <div className="font-semibold text-[#4A2C1A]">Living Room Low-Sightline Analysis (24 Sep 2026)</div>
              <p className="text-[#746B61]">
                Recommended pairing the Serpentine Sectional with Kyoto Walnut Coffee Table to optimize natural window light bounce.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
