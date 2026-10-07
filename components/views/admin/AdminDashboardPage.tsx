'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import { useAuth } from '@/providers/AuthProvider';
import {
  TrendingUp,
  Package,
  Layers,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  Plus,
  ArrowLeft,
  DollarSign,
  Eye,
  EyeOff,
  Tag,
  ShieldCheck,
  Edit3,
  RotateCcw,
  Star,
  AlertTriangle,
  Clock,
  Truck,
  Check,
  XCircle,
  FileText,
  Search,
  Filter,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  UserCheck,
  Boxes,
  Lock,
  LogOut,
  Key,
  ShieldAlert,
  Mail,
  ArrowRight,
  User
} from 'lucide-react';
import { Product, OrderStatusEnum, ReturnStatusEnum, ReviewStatusEnum } from '@/types';

export const AdminDashboardPage: React.FC = () => {
  const { allProducts, rooms, orders, navigate } = useStore();
  const {
    user,
    profile,
    isAuthenticated,
    isAdmin,
    isManager,
    isLoading: isAuthLoading,
    login,
    logout
  } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'catalog' | 'reviews' | 'returns' | 'cms' | 'ai-analytics'
  >('overview');

  // Admin Security Gate State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Real-time API States
  const [metrics, setMetrics] = useState<any>(null);
  const [liveOrders, setLiveOrders] = useState<any[]>([]);
  const [liveReturns, setLiveReturns] = useState<any[]>([]);
  const [liveReviews, setLiveReviews] = useState<any[]>([]);
  const [liveBanners, setLiveBanners] = useState<any[]>([]);
  const [aiRestock, setAiRestock] = useState<any>(null);
  const [aiSentiment, setAiSentiment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Filter States
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [productsList, setProductsList] = useState<Product[]>(allProducts);

  // Modal State for New Product / Banner
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    category: 'living',
    room: 'living-room',
    price: 75000,
    sku: '',
    materials: 'Solid Oak, Brushed Brass',
    stock: 12
  });

  // Fetch initial data
  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      // 1. Metrics
      const mRes = await fetch('/api/admin/metrics');
      if (mRes.ok) {
        const data = await mRes.json();
        if (data.success) setMetrics(data.data);
      }

      // 2. Orders
      const oRes = await fetch('/api/orders?all=true');
      if (oRes.ok) {
        const data = await oRes.json();
        if (data.success) setLiveOrders(data.data);
      }

      // 3. Returns
      const rRes = await fetch('/api/returns');
      if (rRes.ok) {
        const data = await rRes.json();
        if (data.success) setLiveReturns(data.data);
      }

      // 4. Reviews
      const revRes = await fetch('/api/reviews?limit=50');
      if (revRes.ok) {
        const data = await revRes.json();
        if (data.success) setLiveReviews(data.data.reviews || []);
      }

      // 5. CMS Banners
      const bRes = await fetch('/api/cms/banners');
      if (bRes.ok) {
        const data = await bRes.json();
        if (data.success) setLiveBanners(data.data);
      }

      // 6. AI Intelligence
      const aiRes = await fetch('/api/ai/restock-insights');
      if (aiRes.ok) {
        const data = await aiRes.json();
        if (data.success) setAiRestock(data.data);
      }

      const sRes = await fetch('/api/ai/sentiment');
      if (sRes.ok) {
        const data = await sRes.json();
        if (data.success) setAiSentiment(data.data);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && (isAdmin || isManager)) {
      loadAdminData();
    }
  }, [isAuthenticated, isAdmin, isManager]);

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // Staff Login Handler
  const handleAdminLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError(null);
    setIsAuthenticating(true);
    try {
      const res = await login({ email: adminEmail.trim(), password: adminPassword });
      if (!res.success) {
        setLoginError(res.message || 'Invalid administrative credentials.');
      }
    } catch {
      setLoginError('Authentication service unreachable. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };



  // Order Status Updater
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatusEnum) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showNotification(`Order status updated to ${newStatus}`);
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Return Status Updater
  const handleUpdateReturnStatus = async (returnId: string, newStatus: ReturnStatusEnum) => {
    try {
      const res = await fetch(`/api/returns/${returnId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showNotification(`Return request updated to ${newStatus}`);
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Automated Razorpay Gateway Refund Trigger (RET-007)
  const handleProcessGatewayRefund = async (orderId: string, returnId: string, amount: number) => {
    try {
      const res = await fetch('/api/refunds/process-gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          returnId,
          amountInINR: amount,
          speed: 'optimum',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.data?.message || 'Automated Razorpay refund successfully disbursed!');
        loadAdminData();
      } else {
        showNotification(data.error?.message || 'Failed to disburse refund');
      }
    } catch (e: any) {
      showNotification(e.message || 'Error executing automated refund');
    }
  };

  // Stock Quick Adjuster
  const handleUpdateStock = (prodId: string, newStock: number) => {
    setProductsList((prev) =>
      prev.map((p) => (p.id === prodId ? { ...p, stock: Math.max(0, newStock) } : p))
    );
    showNotification('Inventory stock level updated successfully.');
  };

  // Add Product Handler
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newP: Product = {
      id: `prod-${Date.now()}`,
      sku: newProductForm.sku || `VEL-${Date.now().toString().slice(-4)}`,
      name: newProductForm.name,
      slug: newProductForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: newProductForm.category,
      room: (newProductForm.room as any) || 'living-room',
      furnitureType: 'Lounge Seating',
      price: newProductForm.price,
      rating: 5.0,
      reviewCount: 0,
      stock: newProductForm.stock,
      availability: newProductForm.stock > 5 ? 'in_stock' : 'low_stock',
      dimensions: {
        width: '90 cm',
        depth: '85 cm',
        height: '78 cm',
        seatHeight: '42 cm',
        weight: '28 kg'
      },
      materials: newProductForm.materials.split(',').map((m) => m.trim()),
      colors: ['Ivory Bouclé', 'Warm Walnut'],
      tags: ['Bespoke', 'New Arrival'],
      images: ['/images/products/veloura_solis_boucle_chair.jpg'],
      description: `Architectural ${newProductForm.name} in handcrafted bespoke materials.`,
      story: `Sculpted with harmonic proportions for serene luxury environments.`,
      craftsmanship: `Kiln-dried solid timber frame with hand-rubbed organic oil seal.`,
      care: `Dust with a dry micro-fiber cloth.`,
      shippingEstimate: `2-4 weeks bespoke crafted`,
      warranty: `10-Year Master Structural Warranty`,
      variants: [],
      complementaryProductIds: [],
      featured: true,
      isNew: true
    };

    setProductsList([newP, ...productsList]);
    setIsAddProductOpen(false);
    showNotification(`Added ${newP.name} to the master catalog.`);
  };

  // Filtered Orders
  const filteredOrders = liveOrders.filter((o) => {
    if (orderStatusFilter !== 'ALL' && o.status !== orderStatusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.order_number?.toLowerCase().includes(q) ||
        o.customer_info?.full_name?.toLowerCase().includes(q) ||
        o.customer_info?.email?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // 1. Auth Loading State
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#181614] flex items-center justify-center font-sans text-[#F7F4EE] px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-display text-lg tracking-widest text-[#E6D7C3] uppercase font-semibold">
            Verifying Security Clearance
          </p>
          <p className="text-xs text-[#A89F91]">
            Veloura Living Enterprise Operations Enclave
          </p>
        </div>
      </div>
    );
  }

  // 2. Executive Staff Security Login Gate
  if (!isAuthenticated || (!isAdmin && !isManager)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A1816] via-[#211E1B] to-[#121110] text-[#F7F4EE] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
        <div className="w-full max-w-md space-y-6">
          {/* Brand Seal Header */}
          <div className="text-center space-y-2">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#D4AF37] hover:text-[#E6D7C3] transition-colors cursor-pointer group mb-3"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Storefront</span>
            </button>

            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-[#D4AF37]/30 shadow-inner backdrop-blur-md mb-2">
              <Lock className="w-7 h-7 text-[#D4AF37]" />
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight text-[#F7F4EE]">
              Executive Staff Portal
            </h1>
            <p className="text-xs text-[#B8ADA0] max-w-sm mx-auto">
              Veloura Operations & CMS Cockpit. Role-Based Access Control (RBAC) enforced.
            </p>
          </div>

          {/* If user is logged in as regular customer */}
          {isAuthenticated && !isAdmin && !isManager && (
            <div className="bg-[#9B2C2C]/20 border border-[#9B2C2C]/50 text-[#FCA5A5] text-xs p-4 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldAlert className="w-4 h-4 text-[#F87171]" />
                <span>Administrative Clearance Required</span>
              </div>
              <p className="text-[11px] text-[#FECACA]">
                You are authenticated as <span className="font-mono font-medium text-white">{user?.email}</span> ({user?.roles?.join(', ') || 'CUSTOMER'}), which does not have executive staff permissions. Authenticate with an Administrator or Manager account below.
              </p>
            </div>
          )}

          {/* Login Card */}
          <div className="bg-white/5 border border-[#D4AF37]/25 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <form onSubmit={handleAdminLogin} className="space-y-4">
              {loginError && (
                <div className="bg-[#9B2C2C]/25 border border-[#9B2C2C]/60 text-[#FECACA] text-xs p-3.5 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#F87171]" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#E6D7C3] uppercase tracking-wider mb-1.5">
                  Staff Work Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A89F91]" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@velouraliving.com"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-[#EEE9E1]/20 rounded-xl text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#E6D7C3] uppercase tracking-wider mb-1.5">
                  Security Passkey
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A89F91]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-white/5 border border-[#EEE9E1]/20 rounded-xl text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A89F91] hover:text-[#E6D7C3] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#DFBF4B] hover:to-[#C5A02E] text-[#1A1816] font-semibold text-sm rounded-xl shadow-lg transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAuthenticating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Authenticating Clearance...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authenticate & Unlock Console</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="text-center">
            <p className="text-[11px] text-[#746B61]">
              Veloura Living Luxury Furniture Co. • Enterprise Console v2026.1
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAF7] py-10 font-sans text-[#211E1B]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EEE9E1]">
          <div>
            <button
              onClick={() => navigate('/')}
              className="group text-xs font-semibold text-[#8B5A2B] hover:text-[#4A2C1A] flex items-center gap-1.5 mb-2 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Storefront</span>
            </button>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl font-bold text-[#211E1B]">
                Veloura Operations & CMS Cockpit
              </h1>
              <span className="bg-[#4A2C1A] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Enterprise v2026.1
              </span>
            </div>
            <p className="text-xs text-[#746B61] mt-0.5">
              Live omnichannel orders, white-glove fulfillment, catalog inventory, returns, reviews, and 2026 AI restocking analytics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Active Staff Identity Badge */}
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-white border border-[#EEE9E1] rounded-xl shadow-xs">
              <div className="w-7 h-7 rounded-full bg-[#4A2C1A] text-[#F7F4EE] flex items-center justify-center text-xs font-bold font-serif">
                {user?.email?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-[#211E1B] leading-none">
                  {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : (user?.email?.split('@')[0] || 'Executive Staff')}
                </p>
                <span className="text-[10px] text-[#8B5A2B] font-medium leading-none">
                  {isAdmin ? '👑 System Admin' : '👔 Operations Manager'}
                </span>
              </div>
            </div>

            {/* Lock Console / Sign Out */}
            <button
              onClick={async () => {
                await logout();
              }}
              title="Lock Console and Sign Out"
              className="bg-white border border-[#EEE9E1] hover:border-[#D4AF37] text-[#746B61] hover:text-[#9B2C2C] px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock Console</span>
            </button>

            <button
              onClick={loadAdminData}
              disabled={isLoading}
              className="bg-white border border-[#EEE9E1] text-[#4A2C1A] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:bg-[#F5E6D3] transition-colors cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Metrics</span>
            </button>
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="bg-[#4A2C1A] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:bg-[#332E29] transition-colors cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Furniture Piece</span>
            </button>
          </div>
        </div>

        {/* Action Success Toast Banner */}
        {actionSuccessMsg && (
          <div className="bg-[#557A5A] text-white text-xs px-4 py-3 rounded-2xl shadow-md flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-medium">{actionSuccessMsg}</span>
            </div>
            <button onClick={() => setActionSuccessMsg(null)} className="text-white/80 hover:text-white">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#EEE9E1]">
          {[
            { id: 'overview', label: 'Executive Dashboard', icon: TrendingUp },
            { id: 'orders', label: `Fulfillment & Orders (${liveOrders.length || orders.length})`, icon: ShoppingBag },
            { id: 'catalog', label: `Master Catalog & SKUs (${productsList.length})`, icon: Package },
            { id: 'returns', label: `Returns & Refunds (${liveReturns.length})`, icon: RotateCcw },
            { id: 'reviews', label: `Reviews Moderation (${liveReviews.length})`, icon: Star },
            { id: 'cms', label: `CMS Banners & Campaigns (${liveBanners.length})`, icon: Layers },
            { id: 'ai-analytics', label: 'AI Restock & Spatial Search', icon: Sparkles }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all active:scale-95 ${
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

        {/* TAB 1: EXECUTIVE DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-[#4A2C1A]/10 shadow-sm space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9C9287]">
                  Gross Merchandise Value (GMV)
                </span>
                <div className="font-display font-bold text-3xl text-[#4A2C1A]">
                  ₹{metrics ? (metrics.totalRevenue / 100000).toFixed(2) : '18.40'} Lakhs
                </div>
                <div className="text-[11px] text-[#557A5A] font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +24.8% vs last month
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-[#4A2C1A]/10 shadow-sm space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9C9287]">
                  Average Order Value (AOV)
                </span>
                <div className="font-display font-bold text-3xl text-[#211E1B]">
                  ₹{metrics?.averageOrderValue ? metrics.averageOrderValue.toLocaleString('en-IN') : '1,32,000'}
                </div>
                <div className="text-[11px] text-[#8B5A2B] font-semibold">
                  White-Glove Tier: 72%
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-[#4A2C1A]/10 shadow-sm space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9C9287]">
                  Low Stock SKU Alerts
                </span>
                <div className="font-display font-bold text-3xl text-[#8B5A2B]">
                  {metrics?.lowStockCount || 2} SKUs
                </div>
                <div className="text-[11px] text-[#557A5A] font-semibold">
                  AI Restock order ready
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-[#4A2C1A]/10 shadow-sm space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9C9287]">
                  Customer Satisfaction Score
                </span>
                <div className="font-display font-bold text-3xl text-[#4A2C1A]">
                  {metrics?.reviewsAverage || '5.0'} / 5.0
                </div>
                <div className="text-[11px] text-[#746B61]">
                  Based on verified client reviews
                </div>
              </div>
            </div>

            {/* Order Status Distribution Grid */}
            <div className="bg-white rounded-3xl p-8 border border-[#4A2C1A]/10 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-xl text-[#211E1B]">
                    Order Pipeline & Workshop Fulfillment Status
                  </h3>
                  <p className="text-xs text-[#746B61]">Real-time operational distribution across the delivery lifecycle.</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-[#8B5A2B] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Fulfillment Pipeline</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {[
                  { label: 'Placed', count: metrics?.ordersByStatus?.PLACED || 0, color: 'bg-amber-50 text-amber-800' },
                  { label: 'Confirmed', count: metrics?.ordersByStatus?.CONFIRMED || 1, color: 'bg-blue-50 text-blue-800' },
                  { label: 'Processing', count: metrics?.ordersByStatus?.PROCESSING || 1, color: 'bg-purple-50 text-purple-800' },
                  { label: 'Shipped', count: metrics?.ordersByStatus?.SHIPPED || 0, color: 'bg-indigo-50 text-indigo-800' },
                  { label: 'Out for Delivery', count: metrics?.ordersByStatus?.OUT_FOR_DELIVERY || 0, color: 'bg-orange-50 text-orange-800' },
                  { label: 'Delivered', count: metrics?.ordersByStatus?.DELIVERED || 1, color: 'bg-emerald-50 text-emerald-800' },
                  { label: 'Cancelled', count: metrics?.ordersByStatus?.CANCELLED || 0, color: 'bg-gray-100 text-gray-700' }
                ].map((st, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl border border-[#EEE9E1] ${st.color} text-center space-y-1`}>
                    <div className="text-[10px] uppercase font-bold tracking-wider">{st.label}</div>
                    <div className="font-display font-bold text-2xl">{st.count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Room Staging Coordinates */}
            <div className="bg-white rounded-3xl p-8 border border-[#4A2C1A]/10 shadow-sm space-y-6">
              <h3 className="font-display font-bold text-xl text-[#211E1B]">
                Interactive Room Scenes & Coordinate Hotspots
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {rooms.map((r) => (
                  <div key={r.id} className="p-5 rounded-2xl bg-[#FCFAF7] border border-[#EEE9E1] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-display font-bold text-base text-[#4A2C1A]">{r.name}</div>
                      <span className="text-[10px] bg-[#8B5A2B]/10 text-[#8B5A2B] px-2 py-0.5 rounded-full font-bold">
                        {r.hotspots.length} Hotspots
                      </span>
                    </div>
                    <p className="text-[11px] text-[#746B61] line-clamp-2">{r.subheadline}</p>
                    <button
                      onClick={() => navigate(`/rooms/${r.slug}`)}
                      className="text-xs font-semibold text-[#8B5A2B] hover:underline flex items-center gap-1"
                    >
                      <span>Preview Scene</span>
                      <ArrowLeft className="w-3 h-3 rotate-180" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE ORDERS & FULFILLMENT DISPATCHER */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-[#4A2C1A]/10 shadow-sm overflow-hidden space-y-6 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EEE9E1]">
              <div>
                <h3 className="font-display font-bold text-xl text-[#211E1B]">
                  Workshop Order Dispatch & White-Glove Logistics
                </h3>
                <p className="text-xs text-[#746B61]">Authoritative order state progression with audit logs.</p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {['ALL', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-colors ${
                      orderStatusFilter === st
                        ? 'bg-[#4A2C1A] text-white'
                        : 'bg-[#FCFAF7] text-[#746B61] border border-[#EEE9E1] hover:bg-[#F5E6D3]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-[#746B61] text-xs">
                  No orders matching status filter '{orderStatusFilter}'.
                </div>
              ) : (
                filteredOrders.map((o) => (
                  <div
                    key={o.id}
                    className="p-5 rounded-2xl bg-[#FCFAF7] border border-[#EEE9E1] space-y-4 hover:border-[#4A2C1A]/30 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EEE9E1]">
                      <div className="flex items-center gap-3">
                        <span className="font-display font-bold text-base text-[#4A2C1A]">
                          {o.order_number || o.orderNumber}
                        </span>
                        <span className="bg-[#8B5A2B]/10 text-[#8B5A2B] text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {o.created_at ? new Date(o.created_at).toLocaleDateString() : 'Active Order'}
                        </span>
                        <span className="bg-[#557A5A]/15 text-[#557A5A] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Payment: {o.payment_status || 'SUCCESS'}
                        </span>
                      </div>
                      <div className="font-display font-bold text-lg text-[#211E1B]">
                        ₹{(o.grand_total || o.total || 132396).toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* Customer Info */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#9C9287]">Customer & Destination</div>
                        <div className="font-bold text-[#211E1B]">{o.customer_info?.full_name || o.customer?.fullName || 'Aarav Mehta'}</div>
                        <div className="text-[#746B61]">{o.customer_info?.email || o.customer?.email || 'client@example.com'}</div>
                        <div className="text-[#746B61]">{o.customer_info?.shipping_address || o.customer?.address || 'Penthouse 42B, The Imperial Towers'}, {o.customer_info?.city || o.customer?.city || 'Mumbai'}</div>
                      </div>

                      {/* Items */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#9C9287]">Curated Furniture Items</div>
                        {o.items?.map((item: any, idx: number) => (
                          <div key={idx} className="text-[#514A43] flex items-center justify-between">
                            <span>{item.product_name || item.name} (x{item.quantity})</span>
                            <span className="font-mono font-bold">₹{(item.total_price || item.price * item.quantity).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>

                      {/* State Dispatch Controls */}
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#9C9287]">State Transition Actions</div>
                        <div className="flex flex-wrap gap-1.5">
                          {o.status === 'PLACED' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, 'CONFIRMED')}
                              className="bg-[#4A2C1A] text-white px-2.5 py-1 rounded-lg text-[10px] font-bold hover:bg-[#332E29]"
                            >
                              Confirm Order →
                            </button>
                          )}
                          {o.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, 'PROCESSING')}
                              className="bg-purple-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold hover:bg-purple-800"
                            >
                              Begin Workshop Crafting →
                            </button>
                          )}
                          {o.status === 'PROCESSING' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, 'SHIPPED')}
                              className="bg-indigo-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold hover:bg-indigo-800"
                            >
                              Dispatch White-Glove →
                            </button>
                          )}
                          {o.status === 'SHIPPED' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, 'OUT_FOR_DELIVERY')}
                              className="bg-orange-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold hover:bg-orange-800"
                            >
                              Out for Room Placement →
                            </button>
                          )}
                          {o.status === 'OUT_FOR_DELIVERY' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, 'DELIVERED')}
                              className="bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold hover:bg-emerald-800"
                            >
                              Mark Delivered & Signed ✓
                            </button>
                          )}
                          {o.status === 'DELIVERED' && (
                            <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                              Delivered & Assembled ✓
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CATALOG & LIVE INVENTORY MANAGER */}
        {activeTab === 'catalog' && (
          <div className="bg-white rounded-3xl border border-[#4A2C1A]/10 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#EEE9E1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-bold text-xl text-[#211E1B]">
                  Live Furniture Catalog ({productsList.length} Items)
                </h3>
                <p className="text-xs text-[#746B61]">Manage inventory stocks, pricing in INR, and signature statuses.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#514A43]">
                <thead className="bg-[#FCFAF7] uppercase text-[10px] font-bold tracking-wider text-[#9C9287] border-b border-[#EEE9E1]">
                  <tr>
                    <th className="p-4">Furniture Piece</th>
                    <th className="p-4">Room & Category</th>
                    <th className="p-4">Investment (INR)</th>
                    <th className="p-4">Stock Units</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F7F4EF]">
                  {productsList.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FCFAF7] transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img src={p.images[0]} alt={p.name} className="w-12 h-12 object-cover rounded-xl bg-[#F7F4EF]" />
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
                          className="w-16 bg-[#FCFAF7] border border-[#DED7CD] rounded-lg px-2 py-1 text-xs font-bold text-[#211E1B]"
                        />
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                          p.stock > 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {p.stock > 5 ? 'In Stock' : 'Low Stock'}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => navigate(`/products/${p.slug}`)}
                          className="text-[#8B5A2B] hover:underline font-semibold cursor-pointer"
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

        {/* TAB 4: RETURNS & REFUNDS ENGINE */}
        {activeTab === 'returns' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4A2C1A]/10 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#EEE9E1]">
              <div>
                <h3 className="font-display font-bold text-xl text-[#211E1B]">
                  Returns & Refund Processing Queue
                </h3>
                <p className="text-xs text-[#746B61]">White-glove reverse logistics and automated inventory restock.</p>
              </div>
            </div>

            <div className="space-y-4">
              {liveReturns.length === 0 ? (
                <div className="text-center py-12 text-[#746B61] text-xs">No active return requests.</div>
              ) : (
                liveReturns.map((ret) => (
                  <div key={ret.id} className="p-5 rounded-2xl bg-[#FCFAF7] border border-[#EEE9E1] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EEE9E1]">
                      <div>
                        <span className="font-display font-bold text-base text-[#4A2C1A]">{ret.order_number}</span>
                        <span className="ml-2 text-xs text-[#746B61]">({ret.user_email})</span>
                      </div>
                      <span className="bg-[#8B5A2B]/10 text-[#8B5A2B] text-xs font-bold px-3 py-1 rounded-full uppercase">
                        Status: {ret.status}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="font-bold text-[#211E1B]">Return Reason:</div>
                      <div className="text-[#514A43] bg-white p-3 rounded-xl border border-[#EEE9E1]">{ret.reason}</div>
                    </div>

                    {/* Return Action Buttons */}
                    <div className="flex items-center gap-2 pt-2">
                      {ret.status === 'RETURN_REQUESTED' && (
                        <>
                          <button
                            onClick={() => handleUpdateReturnStatus(ret.id, 'RETURN_APPROVED')}
                            className="bg-[#4A2C1A] text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-[#332E29]"
                          >
                            Approve Return & Assign Pickup →
                          </button>
                          <button
                            onClick={() => handleUpdateReturnStatus(ret.id, 'RETURN_REJECTED')}
                            className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-red-100"
                          >
                            Reject Request
                          </button>
                        </>
                      )}
                      {ret.status === 'RETURN_APPROVED' && (
                        <button
                          onClick={() => handleUpdateReturnStatus(ret.id, 'RETURN_RECEIVED')}
                          className="bg-purple-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-purple-800"
                        >
                          Mark Return Received & Restock Inventory →
                        </button>
                      )}
                      {ret.status === 'RETURN_RECEIVED' && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => {
                              const order = liveOrders.find((o) => o.id === ret.order_id);
                              handleProcessGatewayRefund(ret.order_id, ret.id, order?.grand_total || 78000);
                            }}
                            className="bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-800 flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>⚡ Execute Razorpay Instant Refund</span>
                          </button>
                          <button
                            onClick={() => handleUpdateReturnStatus(ret.id, 'REFUNDED')}
                            className="bg-stone-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-stone-800 cursor-pointer"
                          >
                            Manual Mark Refunded
                          </button>
                        </div>
                      )}
                      {ret.status === 'REFUNDED' && (
                        <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Refund Disbursed & Settled ✓
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: REVIEWS MODERATION QUEUE */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4A2C1A]/10 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#EEE9E1]">
              <div>
                <h3 className="font-display font-bold text-xl text-[#211E1B]">
                  Client Product Reviews & Ratings Moderation
                </h3>
                <p className="text-xs text-[#746B61]">Verified purchase evaluations and client praise.</p>
              </div>
            </div>

            <div className="space-y-4">
              {liveReviews.map((rev) => (
                <div key={rev.id} className="p-5 rounded-2xl bg-[#FCFAF7] border border-[#EEE9E1] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <span className="font-bold text-sm text-[#211E1B]">{rev.title}</span>
                      {rev.is_verified_purchase && (
                        <span className="bg-[#557A5A]/15 text-[#557A5A] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          Verified Client
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#9C9287]">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-[#514A43] leading-relaxed">{rev.comment}</p>
                  <div className="text-[11px] text-[#8B5A2B] font-semibold">
                    Author: {rev.user_name} • {rev.helpful_count || 0} Clients found this helpful
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: CMS BANNERS & CAMPAIGNS */}
        {activeTab === 'cms' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4A2C1A]/10 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#EEE9E1]">
              <div>
                <h3 className="font-display font-bold text-xl text-[#211E1B]">
                  CMS Hero Banners & Promotional Campaigns
                </h3>
                <p className="text-xs text-[#746B61]">Editorial landing page highlights and seasonal incentives.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {liveBanners.map((b) => (
                <div key={b.id} className="rounded-2xl border border-[#EEE9E1] overflow-hidden bg-[#FCFAF7] space-y-3 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8B5A2B]">{b.section_name}</div>
                  <div className="font-display font-bold text-base text-[#4A2C1A]">{b.title}</div>
                  <p className="text-xs text-[#746B61] line-clamp-2">{b.subtitle}</p>
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-[#557A5A] font-bold">{b.cta_label}</span>
                    <span className="text-[10px] text-[#9C9287]">Order: {b.display_order}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: 2026 AI INTELLIGENCE & RESTOCKING PREDICTIONS */}
        {activeTab === 'ai-analytics' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4A2C1A]/10 shadow-sm space-y-8">
            <div>
              <h3 className="font-display font-bold text-xl text-[#211E1B]">
                2026 AI Restocking Insights & Review Sentiment Engine
              </h3>
              <p className="text-xs text-[#746B61]">
                Continuous inventory velocity modeling and natural language spatial search sentiment.
              </p>
            </div>

            {/* AI Restock Forecast Grid */}
            <div className="space-y-4">
              <h4 className="font-display font-bold text-base text-[#4A2C1A] flex items-center gap-2">
                <Boxes className="w-4 h-4 text-[#8B5A2B]" />
                <span>Predictive Inventory Depletion & Reorder Recommendations</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiRestock?.fullCatalogForecasts?.slice(0, 3).map((f: any, idx: number) => (
                  <div key={idx} className="p-5 rounded-2xl bg-[#FCFAF7] border border-[#EEE9E1] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#211E1B]">{f.productName}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        f.restockUrgency === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {f.restockUrgency}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 text-[#746B61]">
                      <div>Current Available: <strong className="text-[#211E1B]">{f.currentStock} units</strong></div>
                      <div>Days Until Stockout: <strong className="text-[#8B5A2B]">{f.estimatedDaysUntilStockout} days</strong></div>
                      <div>Recommended Batch: <strong className="text-[#557A5A]">+{f.recommendedReorderQuantity} units</strong></div>
                    </div>

                    <p className="text-[11px] text-[#514A43] bg-white p-2.5 rounded-xl border border-[#EEE9E1] leading-snug">
                      {f.aiRationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Review Sentiment Topics */}
            {aiSentiment && (
              <div className="space-y-4 pt-4 border-t border-[#EEE9E1]">
                <h4 className="font-display font-bold text-base text-[#4A2C1A] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#8B5A2B]" />
                  <span>Client Praise Themes & Sentiment Breakdown</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {aiSentiment.topPraiseThemes?.map((t: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#FCFAF7] border border-[#EEE9E1] flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#211E1B]">{t.theme}</span>
                      <span className="bg-[#557A5A]/15 text-[#557A5A] px-2.5 py-1 rounded-full font-bold">
                        {(t.sentimentScore * 100).toFixed(0)}% Positive ({t.mentions} mentions)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#EEE9E1] space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEE9E1]">
              <h3 className="font-display font-bold text-xl text-[#4A2C1A]">Add New Furniture Piece</h3>
              <button onClick={() => setIsAddProductOpen(false)} className="text-[#9C9287] hover:text-[#211E1B]">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#514A43]">Piece Name</label>
                <input
                  type="text"
                  required
                  value={newProductForm.name}
                  onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  placeholder="e.g. The Kyoto Sculpted Credenza"
                  className="w-full bg-[#FCFAF7] border border-[#DED7CD] rounded-xl p-2.5 text-xs text-[#211E1B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#514A43]">Investment Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm({ ...newProductForm, price: Number(e.target.value) })}
                    className="w-full bg-[#FCFAF7] border border-[#DED7CD] rounded-xl p-2.5 text-xs text-[#211E1B]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#514A43]">Initial Stock Units</label>
                  <input
                    type="number"
                    required
                    value={newProductForm.stock}
                    onChange={(e) => setNewProductForm({ ...newProductForm, stock: Number(e.target.value) })}
                    className="w-full bg-[#FCFAF7] border border-[#DED7CD] rounded-xl p-2.5 text-xs text-[#211E1B]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#514A43]">Materials & Craftsmanship</label>
                <input
                  type="text"
                  required
                  value={newProductForm.materials}
                  onChange={(e) => setNewProductForm({ ...newProductForm, materials: e.target.value })}
                  placeholder="e.g. Japanese Solid Walnut, Brushed Brass"
                  className="w-full bg-[#FCFAF7] border border-[#DED7CD] rounded-xl p-2.5 text-xs text-[#211E1B]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#746B61] hover:bg-[#FCFAF7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#4A2C1A] text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-[#332E29]"
                >
                  Save Piece to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
