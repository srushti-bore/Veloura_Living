'use client';

import React, { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { useAuth } from '@/providers/AuthProvider';
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
  ArrowRight,
  Plus,
  Trash2,
  Lock,
  LogOut,
  Key
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { wishlist, allProducts, navigate } = useStore();
  const {
    user,
    profile,
    addresses,
    isAuthenticated,
    isAdmin,
    isManager,
    openAuthModal,
    logout,
    addAddress,
    removeAddress
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'ai-consultations'>('orders');
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      setIsLoadingOrders(true);
      fetch('/api/orders')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setUserOrders(data.data);
          } else {
            setUserOrders([]);
          }
        })
        .catch(() => setUserOrders([]))
        .finally(() => setIsLoadingOrders(false));
    } else {
      setUserOrders([]);
    }
  }, [isAuthenticated]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddressLine1, setNewAddressLine1] = useState('');
  const [newAddressLine2, setNewAddressLine2] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPostalCode, setNewPostalCode] = useState('');

  const wishlistedProducts = allProducts.filter((p) => wishlist.includes(p.id));

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newPhone || !newAddressLine1 || !newCity || !newState || !newPostalCode) {
      return;
    }
    await addAddress({
      fullName: newFullName,
      phone: newPhone,
      addressLine1: newAddressLine1,
      addressLine2: newAddressLine2,
      city: newCity,
      state: newState,
      postalCode: newPostalCode,
      country: 'India',
      isDefaultShipping: addresses.length === 0,
    });
    setIsAddingAddress(false);
    setNewFullName('');
    setNewPhone('');
    setNewAddressLine1('');
    setNewAddressLine2('');
    setNewCity('');
    setNewState('');
    setNewPostalCode('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FCFAF7] py-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-[#4A2C1A]/10 shadow-soft-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#F5E6D3] text-[#4A2C1A] flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-[#211E1B] font-bold">
              Concierge Access Required
            </h1>
            <p className="text-xs text-[#746B61] mt-2 leading-relaxed">
              Sign in to manage your white-glove orders, saved spatial palettes, architectural delivery addresses, and patron benefits.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => openAuthModal('signin')}
              className="w-full py-3 bg-[#2A1A12] hover:bg-[#4A2C1A] text-[#FAF7F2] rounded-xl text-xs font-semibold tracking-wider uppercase transition-all shadow-md active:scale-95"
            >
              Sign In to Your Account
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              className="w-full py-3 bg-[#F4E8D7] hover:bg-[#EADBC8] text-[#4A2C1A] rounded-xl text-xs font-semibold tracking-wider uppercase transition-all"
            >
              Create New Concierge Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  const initials = profile?.first_name 
    ? `${profile.first_name[0]}${profile.last_name ? profile.last_name[0] : ''}`.toUpperCase()
    : user?.email.substring(0, 2).toUpperCase();

  const fullName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : user?.email.split('@')[0];

  return (
    <div className="min-h-screen bg-[#FCFAF7] py-10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4A2C1A]/10 shadow-soft-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#4A2C1A] text-[#F5E6D3] font-serif font-bold text-2xl flex items-center justify-center shadow-md">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif font-bold text-2xl text-[#211E1B]">
                  {fullName}
                </h1>
                {user?.roles.map((r) => (
                  <span
                    key={r}
                    className="bg-[#F5E6D3] text-[#4A2C1A] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#8B5A2B]/20"
                  >
                    {r === 'ADMIN' ? '👑 Admin Patron' : r === 'MANAGER' ? '🛎️ Operations Floor' : 'Veloura Patron Member'}
                  </span>
                ))}
              </div>
              <p className="text-xs text-[#746B61] mt-0.5">
                {user?.email} • Verified Account
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(isAdmin || isManager) && (
              <button
                onClick={() => navigate('/admin')}
                className="btn-secondary-refined active:scale-95 text-[#4A2C1A] text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Store Operations Portal →
              </button>
            )}
            <button
              onClick={() => logout()}
              className="p-2.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#EEE9E1] pb-1 overflow-x-auto">
          {[
            { id: 'orders', label: 'White-Glove Orders', count: userOrders.length, icon: Package },
            { id: 'wishlist', label: 'Space Palette', count: wishlist.length, icon: Heart },
            { id: 'addresses', label: 'Delivery Destinations', count: addresses.length, icon: MapPin },
            { id: 'ai-consultations', label: 'AI Spatial Archives', count: 2, icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider rounded-t-xl transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#8B5A2B] text-[#4A2C1A] bg-white shadow-soft-sm'
                    : 'border-transparent text-[#746B61] hover:text-[#211E1B]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      activeTab === tab.id ? 'bg-[#4A2C1A] text-white' : 'bg-[#EEE9E1] text-[#746B61]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            {isLoadingOrders ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#EEE9E1] shadow-soft-sm">
                <span className="inline-block w-6 h-6 border-2 border-[#4A2C1A]/20 border-t-[#4A2C1A] rounded-full animate-spin mb-3" />
                <p className="text-xs text-[#746B61] font-sans font-light">Loading your private order vault...</p>
              </div>
            ) : userOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#EEE9E1] shadow-soft-sm space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#F5E6D3] text-[#8B5A2B] flex items-center justify-center mx-auto">
                  <Package className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="font-serif font-bold text-xl text-[#211E1B]">
                  No white-glove orders placed yet.
                </h3>
                <p className="text-xs text-[#746B61]">
                  Your bespoke orders and delivery tracking will appear here once placed.
                </p>
                <button
                  onClick={() => navigate('/shop')}
                  className="btn-primary-shimmer active:scale-[0.98] text-white px-6 py-2.5 rounded-full text-xs font-semibold cursor-pointer shadow-md"
                >
                  Discover The Collection
                </button>
              </div>
            ) : (
              userOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4A2C1A]/10 shadow-soft-sm space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EEE9E1]">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-serif font-bold text-lg text-[#211E1B]">
                          Order #{order.orderNumber}
                        </span>
                        <span className="bg-[#EBF3ED] text-[#2D5A34] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#746B61] mt-1">
                        Placed on {order.createdAt} • Estimated White-Glove Delivery: {order.estimatedDeliveryDate}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="font-serif font-bold text-xl text-[#4A2C1A]">
                        ₹{Number(order.total || 0).toLocaleString('en-IN')}
                      </div>
                      <span className="text-[11px] text-[#557A5A] font-semibold flex items-center sm:justify-end gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> 10-Year Timber Warranty Active
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {order.items.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-3 rounded-2xl bg-[#FCFAF7] border border-[#EEE9E1]"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 border border-[#EEE9E1]">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif font-bold text-sm text-[#211E1B] truncate">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-[#746B61]">
                            Finish: {item.selectedColor} • Spec: {item.selectedMaterial}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs font-semibold text-[#4A2C1A]">
                              ₹{Number(item.price || 0).toLocaleString('en-IN')} × {item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Timeline Track */}
                  {order.timeline && order.timeline.length > 0 && (
                    <div className="pt-4 border-t border-[#EEE9E1]">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[#746B61] mb-4">
                        White-Glove Progress Tracking ({order.trackingNumber})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        {order.timeline.map((step: any, sIdx: number) => (
                          <div
                            key={sIdx}
                            className={`p-3 rounded-xl border text-xs space-y-1 ${
                              step.completed
                                ? 'bg-[#FCFAF7] border-[#8B5A2B]/30 text-[#211E1B]'
                                : 'bg-white border-[#EEE9E1] text-[#9C9287]'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 font-bold">
                              {step.completed ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#557A5A]" />
                              ) : (
                                <Clock className="w-3.5 h-3.5 text-[#9C9287]" />
                              )}
                              <span>{step.status}</span>
                            </div>
                            <p className="text-[10px] text-[#746B61]">{step.date}</p>
                            <p className="text-[11px]">{step.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
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
                <h3 className="font-serif font-bold text-xl text-[#211E1B]">
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
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-xl text-[#211E1B]">
                Registered Delivery Destinations ({addresses.length})
              </h3>
              <button
                onClick={() => setIsAddingAddress(!isAddingAddress)}
                className="py-2 px-4 bg-[#2A1A12] text-[#FAF7F2] rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-[#4A2C1A] transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Destination</span>
              </button>
            </div>

            {isAddingAddress && (
              <form onSubmit={handleCreateAddress} className="bg-white rounded-3xl p-6 border border-[#8B5A2B]/30 shadow-soft-sm space-y-4">
                <h4 className="font-serif font-bold text-base text-[#211E1B]">New Delivery Destination</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-charcoal/80 mb-1 font-medium">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      placeholder="Aarav Mehta"
                      className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#DED7CD] rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-charcoal/80 mb-1 font-medium">Phone</label>
                    <input
                      type="tel"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+91 98200 00000"
                      className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#DED7CD] rounded-lg text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-charcoal/80 mb-1 font-medium">Address Line 1</label>
                    <input
                      type="text"
                      required
                      value={newAddressLine1}
                      onChange={(e) => setNewAddressLine1(e.target.value)}
                      placeholder="Penthouse 42B, The Imperial Towers"
                      className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#DED7CD] rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-charcoal/80 mb-1 font-medium">City</label>
                    <input
                      type="text"
                      required
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="Mumbai"
                      className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#DED7CD] rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-charcoal/80 mb-1 font-medium">State</label>
                    <input
                      type="text"
                      required
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      placeholder="Maharashtra"
                      className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#DED7CD] rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-charcoal/80 mb-1 font-medium">Postal Code (PIN)</label>
                    <input
                      type="text"
                      required
                      value={newPostalCode}
                      onChange={(e) => setNewPostalCode(e.target.value)}
                      placeholder="400034"
                      className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#DED7CD] rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="py-2.5 px-5 bg-[#4A2C1A] text-white rounded-lg text-xs font-semibold hover:bg-[#2A1A12] transition-colors"
                  >
                    Save Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="py-2.5 px-5 border border-walnut/20 text-espresso rounded-lg text-xs hover:bg-cream/40 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {addresses.map((addr) => (
                <div key={addr.id} className="bg-white rounded-3xl p-6 border-2 border-[#8B5A2B] shadow-soft-sm space-y-3 relative interactive-card">
                  <div className="flex items-center justify-between">
                    <span className="bg-[#8B5A2B] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                      {addr.is_default_shipping ? 'Primary Residence' : 'Secondary Residence'}
                    </span>
                    <button
                      onClick={() => removeAddress(addr.id)}
                      className="text-red-500 hover:text-red-700 p-1 transition-colors"
                      title="Remove address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[#211E1B]">
                    {addr.full_name}
                  </h3>
                  <p className="text-xs text-[#746B61] leading-relaxed">
                    {addr.address_line1} {addr.address_line2 ? `, ${addr.address_line2}` : ''}<br />
                    {addr.city}, {addr.state} — {addr.postal_code}<br />
                    Phone: {addr.phone}
                  </p>
                  <div className="text-[11px] text-[#557A5A] font-semibold pt-2 border-t border-[#EEE9E1]">
                    ✓ White-Glove Freight Serviceable
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: AI Consultations */}
        {activeTab === 'ai-consultations' && (
          <div className="bg-white rounded-3xl p-8 border border-[#4A2C1A]/10 shadow-soft-sm space-y-4 animate-fadeIn">
            <h3 className="font-serif font-bold text-xl text-[#211E1B]">
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
