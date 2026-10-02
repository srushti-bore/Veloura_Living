'use client';

import React, { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import {
  BarChart3,
  Package,
  Layers,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  Plus,
  ArrowLeft,
  DollarSign,
  Eye,
  TrendingUp,
  Tag,
  ShieldCheck,
  Edit3
} from 'lucide-react';
import { Product } from '@/types';

export const AdminDashboardPage: React.FC = () => {
  const { allProducts, rooms, orders, navigate } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'rooms' | 'orders' | 'ai-analytics'>('overview');

  const [productsList, setProductsList] = useState<Product[]>(allProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0) + 2640000;

  const topQueries = [
    { query: 'Warm beige sofa for small living room', hits: 540, conversion: '8.4%' },
    { query: 'Solid walnut dining table 8 seater', hits: 412, conversion: '11.2%' },
    { query: 'Low profile platform bed in linen', hits: 395, conversion: '9.1%' },
    { query: 'Ergonomic leather chair for study', hits: 280, conversion: '7.8%' }
  ];

  const handleUpdateStock = (prodId: string, newStock: number) => {
    setProductsList((prev) =>
      prev.map((p) => (p.id === prodId ? { ...p, stock: newStock } : p))
    );
  };

  return (
    <div className="min-h-screen bg-[#FCFAF7] py-10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EEE9E1]">
          <div>
            <button
              onClick={() => navigate('/')}
              className="group text-xs font-semibold text-[#8B5A2B] hover:text-[#4A2C1A] flex items-center gap-1.5 mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 interactive-arrow" />
              <span>Back to Storefront</span>
            </button>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-3xl font-bold text-[#211E1B]">
                Veloura Store Operations & CMS
              </h1>
              <span className="bg-[#4A2C1A] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                Admin Console
              </span>
            </div>
            <p className="text-xs text-[#746B61] mt-0.5">
              Live catalog inventory, interactive room staging coordinates, and spatial AI analytics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => alert('New product creation modal ready.')}
              className="btn-primary-shimmer text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Furniture Piece</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#EEE9E1]">
          {[
            { id: 'overview', label: 'Executive Metrics', icon: TrendingUp },
            { id: 'products', label: `Catalog & Inventory (${productsList.length})`, icon: Package },
            { id: 'rooms', label: `Room Staging & Hotspots (4 Spaces)`, icon: Layers },
            { id: 'orders', label: `Order Fulfillment (${orders.length})`, icon: ShoppingBag },
            { id: 'ai-analytics', label: 'AI Spatial Search Insights', icon: Sparkles }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`interactive-pill flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-[#4A2C1A] text-white shadow-sm'
                    : 'bg-white text-[#514A43] hover:bg-[#F5E6D3] border border-[#EEE9E1]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Executive Metrics */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-[#4A2C1A]/10 shadow-soft-sm space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9C9287]">
                  Total Store Revenue (MTD)
                </span>
                <div className="font-display font-bold text-3xl text-[#4A2C1A]">
                  ₹{(totalRevenue / 100000).toFixed(1)} Lakhs
                </div>
                <div className="text-[11px] text-[#557A5A] font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +18.4% vs last month
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-[#4A2C1A]/10 shadow-soft-sm space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9C9287]">
                  Interactive Room Views
                </span>
                <div className="font-display font-bold text-3xl text-[#211E1B]">
                  14,820
                </div>
                <div className="text-[11px] text-[#8B5A2B] font-semibold">
                  Living Room: 42% share
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-[#4A2C1A]/10 shadow-soft-sm space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9C9287]">
                  Catalog Conversion
                </span>
                <div className="font-display font-bold text-3xl text-[#211E1B]">
                  3.85%
                </div>
                <div className="text-[11px] text-[#557A5A] font-semibold">
                  Complete Suite Bundles: +44% AOV
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-[#4A2C1A]/10 shadow-soft-sm space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9C9287]">
                  AI Spatial Consultations
                </span>
                <div className="font-display font-bold text-3xl text-[#8B5A2B]">
                  2,490
                </div>
                <div className="text-[11px] text-[#746B61]">
                  89% prompt satisfaction
                </div>
              </div>
            </div>

            {/* Quick Room Performance Breakdown */}
            <div className="bg-white rounded-3xl p-8 border border-[#4A2C1A]/10 shadow-soft-sm space-y-6">
              <h3 className="font-display font-bold text-xl text-[#211E1B]">
                Living Space Discovery Engagement
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {rooms.map((r) => (
                  <div key={r.id} className="p-4 rounded-2xl bg-[#FCFAF7] border border-[#EEE9E1] space-y-2">
                    <div className="font-display font-bold text-base text-[#4A2C1A]">{r.name}</div>
                    <div className="text-xs text-[#746B61]">{r.hotspots.length} Clickable Hotspots</div>
                    <div className="text-xs font-bold text-[#557A5A]">Top: {r.hotspots[0]?.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Catalog & Stock Inventory Manager */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-3xl border border-[#4A2C1A]/10 shadow-soft-sm overflow-hidden">
            <div className="p-6 border-b border-[#EEE9E1] flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-xl text-[#211E1B]">
                  Live Furniture Catalog ({productsList.length} Pieces)
                </h3>
                <p className="text-xs text-[#746B61]">Manage real-time stock levels, pricing, and signature statuses.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#514A43]">
                <thead className="bg-[#FCFAF7] uppercase text-[10px] font-bold tracking-wider text-[#9C9287] border-b border-[#EEE9E1]">
                  <tr>
                    <th className="p-4">Piece</th>
                    <th className="p-4">Room & Category</th>
                    <th className="p-4">Investment (INR)</th>
                    <th className="p-4">Stock Units</th>
                    <th className="p-4">Availability</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F7F4EF]">
                  {productsList.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FCFAF7] transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img src={p.images[0]} alt={p.name} className="w-12 h-12 object-cover rounded-lg bg-[#F7F4EF]" />
                        <div>
                          <span className="font-bold text-[#211E1B] block">{p.name}</span>
                          <span className="text-[10px] text-[#9C9287] font-mono">{p.sku}</span>
                        </div>
                      </td>
                      <td className="p-4 capitalize">
                        <span className="font-medium text-[#4A2C1A]">{p.room.replace('-', ' ')}</span>
                        <span className="block text-[11px] text-[#9C9287]">{p.category}</span>
                      </td>
                      <td className="p-4 font-bold text-[#211E1B]">
                        ₹{(p.salePrice || p.price).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          value={p.stock}
                          onChange={(e) => handleUpdateStock(p.id, Number(e.target.value))}
                          className="w-16 bg-[#FCFAF7] border border-[#DED7CD] rounded px-2 py-1 text-xs font-bold text-[#211E1B]"
                        />
                      </td>
                      <td className="p-4">
                        <span className="bg-[#557A5A]/10 text-[#557A5A] px-2 py-0.5 rounded font-semibold text-[10px]">
                          {p.availability}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => navigate(`/products/${p.slug}`)}
                          className="text-[#8B5A2B] hover:underline font-semibold"
                        >
                          View PDP →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Room Staging & Hotspot Coordinator */}
        {activeTab === 'rooms' && (
          <div className="space-y-6">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4A2C1A]/10 shadow-soft-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#EEE9E1]">
                  <div>
                    <h3 className="font-display font-bold text-xl text-[#4A2C1A]">{room.name}</h3>
                    <p className="text-xs text-[#746B61]">{room.subheadline}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/rooms/${room.slug}`)}
                    className="text-xs font-semibold text-[#8B5A2B] hover:underline"
                  >
                    Open Live Scene →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {room.hotspots.map((h) => (
                    <div key={h.id} className="p-4 rounded-xl bg-[#FCFAF7] border border-[#EEE9E1] text-xs space-y-1">
                      <div className="font-bold text-[#211E1B]">{h.name}</div>
                      <div className="text-[11px] text-[#8B5A2B]">Coordinates: {h.xPercent}% X, {h.yPercent}% Y</div>
                      <div className="text-[11px] text-[#746B61]">{h.highlightDescription}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Order Fulfillment */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4A2C1A]/10 shadow-soft-sm space-y-4">
            <h3 className="font-display font-bold text-xl text-[#211E1B]">Active Workshop Allocations</h3>
            {orders.map((o) => (
              <div key={o.id} className="p-4 rounded-2xl bg-[#FCFAF7] border border-[#EEE9E1] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div>
                  <div className="font-bold text-sm text-[#4A2C1A]">{o.orderNumber} • {o.customer.fullName}</div>
                  <div className="text-[#746B61]">{o.customer.address}, {o.customer.city}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-[#211E1B]">₹{o.total.toLocaleString('en-IN')}</span>
                  <span className="bg-[#557A5A] text-white px-3 py-1 rounded-full font-semibold text-[10px]">
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 5: AI Spatial Search Insights */}
        {activeTab === 'ai-analytics' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4A2C1A]/10 shadow-soft-sm space-y-6">
            <div>
              <h3 className="font-display font-bold text-xl text-[#211E1B]">
                High-Intent AI Search Analytics
              </h3>
              <p className="text-xs text-[#746B61]">
                Natural language queries typed by homeowners and architects searching for specific spaces and finishes.
              </p>
            </div>

            <div className="divide-y divide-[#EEE9E1]">
              {topQueries.map((t, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#8B5A2B]" />
                    <span className="font-semibold text-[#211E1B]">"{t.query}"</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-[#746B61]">{t.hits} queries</span>
                    <span className="text-[#557A5A] font-bold">{t.conversion} conversion</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
