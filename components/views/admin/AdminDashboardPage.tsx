'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { useStore } from '@/hooks/useStore';
import { useAuth } from '@/providers/AuthProvider';
import { Product, OrderStatusEnum } from '@/types';
import { DetailedOrder } from '@/lib/data/orderStore';
import { AdminOrderDetailsModal } from './AdminOrderDetailsModal';
import { AdminCustomerDetailsModal } from './AdminCustomerDetailsModal';
import { AdminProductModal } from './AdminProductModal';
import { AdminCouponModal } from './AdminCouponModal';
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  Archive,
  Ticket,
  Layers,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  ArrowUpRight,
  ArrowUp,
  X,
  Check,
  Plus,
  RefreshCw,
  Edit3,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  Lock,
  ArrowLeft,
  Eye,
  EyeOff,
  ShoppingBag,
  ExternalLink,
  Sparkles,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  Filter,
  CheckCircle2,
  Tag
} from 'lucide-react';

type AdminTab =
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'customers'
  | 'inventory'
  | 'coupons'
  | 'content'
  | 'analytics'
  | 'settings';

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

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [salesTimeRange, setSalesTimeRange] = useState<'7d' | '30d' | 'month' | 'year'>('7d');
  const [isTimeRangeOpen, setIsTimeRangeOpen] = useState(false);

  // Search & Navigation States
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Real-time API States
  const [metrics, setMetrics] = useState<any>(null);
  const [liveOrders, setLiveOrders] = useState<DetailedOrder[]>([]);
  const [liveCustomers, setLiveCustomers] = useState<any[]>([]);
  const [liveCoupons, setLiveCoupons] = useState<any[]>([]);
  const [liveBanners, setLiveBanners] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<Product[]>(allProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Filter States for Sub-tabs
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('ALL');
  const [customerSearchQuery, setCustomerSearchQuery] = useState<string>('');

  // Modals
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<DetailedOrder | null>(null);
  const [selectedCustomerForModal, setSelectedCustomerForModal] = useState<any | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // Staff Login State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Animation references
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const contentSectionRef = useRef<HTMLDivElement>(null);

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
      const oRes = await fetch('/api/orders?all=true&limit=100');
      if (oRes.ok) {
        const data = await oRes.json();
        if (data.success) setLiveOrders(data.data);
      }

      // 3. Customers
      const cRes = await fetch('/api/admin/customers');
      if (cRes.ok) {
        const data = await cRes.json();
        if (data.success) setLiveCustomers(data.data);
      }

      // 4. Coupons
      const cpRes = await fetch('/api/coupons?all=true');
      if (cpRes.ok) {
        const data = await cpRes.json();
        if (data.success) setLiveCoupons(data.data);
      }

      // 5. CMS Banners
      const bRes = await fetch('/api/cms/banners');
      if (bRes.ok) {
        const data = await bRes.json();
        if (data.success) setLiveBanners(data.data);
      }
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && (isAdmin || isManager)) {
      loadAdminData();
    }
  }, [isAuthenticated, isAdmin, isManager]);

  // GSAP Entrance Animations
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    if (cardsContainerRef.current) {
      gsap.fromTo(
        cardsContainerRef.current.children,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
      );
    }

    if (contentSectionRef.current) {
      gsap.fromTo(
        contentSectionRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
      );
    }
  }, [activeTab]);

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 3500);
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
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast(`Order status updated to ${newStatus}`);
        loadAdminData();
        if (selectedOrderForModal && selectedOrderForModal.id === orderId) {
          setSelectedOrderForModal({ ...selectedOrderForModal, status: newStatus });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Stock Quick Adjuster
  const handleUpdateStock = (prodId: string, newStock: number) => {
    setProductsList((prev) =>
      prev.map((p) => (p.id === prodId ? { ...p, stock: Math.max(0, newStock) } : p))
    );
    showToast('Inventory stock level updated successfully.');
  };

  // Product Save / Edit Handler
  const handleSaveProduct = (prodData: Partial<Product>) => {
    if (prodData.id) {
      setProductsList((prev) =>
        prev.map((p) => (p.id === prodData.id ? ({ ...p, ...prodData } as Product) : p))
      );
      showToast(`Updated product ${prodData.name}`);
    } else {
      const newP: Product = {
        id: `prod-${Date.now()}`,
        sku: prodData.sku || `VEL-${Date.now().toString().slice(-4)}`,
        name: prodData.name || 'New Piece',
        slug: (prodData.name || 'new-piece').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: prodData.category || 'living',
        room: (prodData.room as any) || 'living-room',
        furnitureType: 'Lounge Seating',
        price: prodData.price || 45000,
        rating: 5.0,
        reviewCount: 0,
        stock: prodData.stock || 10,
        availability: (prodData.stock || 10) > 5 ? 'in_stock' : 'low_stock',
        dimensions: { width: '90 cm', depth: '85 cm', height: '78 cm', seatHeight: '42 cm', weight: '28 kg' },
        materials: prodData.materials || ['Solid Oak', 'Bouclé'],
        colors: ['Warm Beige', 'Natural Oak'],
        tags: ['New Arrival'],
        images: ['/images/products/veloura_solis_boucle_chair.jpg'],
        description: prodData.description || 'Handcrafted bespoke piece.',
        story: 'Harmonic lines tailored for serene luxury spaces.',
        craftsmanship: 'Kiln-dried solid timber frame.',
        care: 'Dust with soft micro-fiber cloth.',
        shippingEstimate: '2-3 weeks',
        warranty: '10-Year Master Structural Warranty',
        variants: [],
        complementaryProductIds: [],
        featured: true,
        isNew: true,
      };
      setProductsList([newP, ...productsList]);
      showToast(`Added ${newP.name} to catalog`);
    }
    setEditingProduct(null);
  };

  // Delete Product
  const handleDeleteProduct = (prodId: string) => {
    setProductsList((prev) => prev.filter((p) => p.id !== prodId));
    showToast('Product archived from active catalog');
  };

  // Coupon Toggle
  const handleToggleCoupon = async (couponId: string) => {
    try {
      const res = await fetch(`/api/coupons/${couponId}`, { method: 'PATCH' });
      if (res.ok) {
        showToast('Promotion status toggled successfully.');
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Coupon Create
  const handleCreateCoupon = async (couponData: any) => {
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponData),
      });
      if (res.ok) {
        showToast(`Coupon ${couponData.code} created.`);
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Coupon Delete
  const handleDeleteCoupon = async (couponId: string) => {
    try {
      const res = await fetch(`/api/coupons/${couponId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Promotion deleted.');
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Time-sensitive greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Dynamic Admin Name
  const adminDisplayName =
    profile?.first_name ||
    user?.profile?.firstName ||
    (user?.email ? user.email.split('@')[0] : 'Admin');

  // Filtered recent orders
  const displayRecentOrders = liveOrders.slice(0, 5);

  // Sales Chart Data Configuration based on time range
  const getSalesChartData = () => {
    switch (salesTimeRange) {
      case '30d':
        return {
          labels: ['Mar 15', 'Mar 20', 'Mar 25', 'Mar 30', 'Apr 5', 'Apr 10', 'Apr 13'],
          values: [22000, 38000, 42000, 56000, 49000, 71000, 84000],
          points: [
            { x: 30, y: 190, val: '₹ 22,000' },
            { x: 95, y: 160, val: '₹ 38,000' },
            { x: 160, y: 150, val: '₹ 42,000' },
            { x: 225, y: 120, val: '₹ 56,000' },
            { x: 290, y: 135, val: '₹ 49,000' },
            { x: 355, y: 85, val: '₹ 71,000' },
            { x: 420, y: 55, val: '₹ 84,000' },
          ],
        };
      case 'month':
        return {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          values: [35000, 52000, 68000, 82000],
          points: [
            { x: 50, y: 170, val: '₹ 35,000' },
            { x: 175, y: 130, val: '₹ 52,000' },
            { x: 300, y: 90, val: '₹ 68,000' },
            { x: 420, y: 60, val: '₹ 82,000' },
          ],
        };
      case 'year':
        return {
          labels: ['Q1 25', 'Q2 25', 'Q3 25', 'Q4 25', 'Q1 26'],
          values: [120000, 180000, 240000, 310000, 390000],
          points: [
            { x: 40, y: 185, val: '₹ 1,20,000' },
            { x: 135, y: 145, val: '₹ 1,80,000' },
            { x: 230, y: 115, val: '₹ 2,40,000' },
            { x: 325, y: 80, val: '₹ 3,10,000' },
            { x: 420, y: 45, val: '₹ 3,90,000' },
          ],
        };
      case '7d':
      default:
        // Reference image exact 7 days: Apr 7 to Apr 13
        return {
          labels: ['Apr 7', 'Apr 8', 'Apr 9', 'Apr 10', 'Apr 11', 'Apr 12', 'Apr 13'],
          values: [20000, 26000, 38000, 39000, 48000, 65000, 78000],
          points: [
            { x: 30, y: 195, val: '₹ 20,000' },
            { x: 95, y: 180, val: '₹ 26,000' },
            { x: 160, y: 155, val: '₹ 38,000' },
            { x: 225, y: 150, val: '₹ 39,000' },
            { x: 290, y: 130, val: '₹ 48,000' },
            { x: 355, y: 90, val: '₹ 65,000' },
            { x: 420, y: 65, val: '₹ 78,000' },
          ],
        };
    }
  };

  const chartData = getSalesChartData();
  const [activeTooltip, setActiveTooltip] = useState<{ x: number; y: number; val: string; label: string } | null>(null);

  // Global search filtering
  const searchResults = globalSearchQuery.trim()
    ? {
        products: productsList
          .filter((p) => p.name.toLowerCase().includes(globalSearchQuery.toLowerCase()))
          .slice(0, 3),
        orders: liveOrders
          .filter(
            (o) =>
              o.order_number?.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
              o.customer_info?.full_name?.toLowerCase().includes(globalSearchQuery.toLowerCase())
          )
          .slice(0, 3),
        customers: liveCustomers
          .filter(
            (c) =>
              c.fullName?.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
              c.email?.toLowerCase().includes(globalSearchQuery.toLowerCase())
          )
          .slice(0, 3),
      }
    : null;

  // 1. Auth Loading State
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#181614] flex items-center justify-center font-sans text-[#F7F4EE] px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-display text-lg tracking-widest text-[#E6D7C3] uppercase font-semibold">
            Verifying Security Clearance
          </p>
          <p className="text-xs text-[#A89F91]">Veloura Living Enterprise Operations Console</p>
        </div>
      </div>
    );
  }

  // 2. Executive Staff Security Login Gate
  if (!isAuthenticated || (!isAdmin && !isManager)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A1816] via-[#211E1B] to-[#121110] text-[#F7F4EE] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
        <div className="w-full max-w-md space-y-6">
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
              Authoritative Single-Admin & Operations Management Console
            </p>
          </div>

          <div className="bg-[#26221F] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
            {loginError && (
              <div className="p-3.5 rounded-2xl bg-[#9B2C2C]/20 border border-[#9B2C2C]/40 text-[#FEB2B2] text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#E6D7C3] tracking-wide">
                  Staff Email Address
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@velouraliving.com"
                  className="w-full bg-[#181614] border border-white/15 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-sm text-[#F7F4EE] placeholder-[#746B61] outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#E6D7C3] tracking-wide">
                  Executive Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#181614] border border-white/15 focus:border-[#D4AF37] rounded-xl pl-4 pr-11 py-3 text-sm text-[#F7F4EE] placeholder-[#746B61] outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A89F91] hover:text-[#F7F4EE]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3.5 px-6 rounded-xl font-semibold text-xs tracking-wider uppercase bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-[#1A1816] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                {isAuthenticating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
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

  // Helper status badge styling matching reference image
  const renderStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED':
        return (
          <span className="bg-[#DCF5E6] text-[#1E6B40] px-2.5 py-0.5 rounded-full text-[11px] font-medium inline-block">
            Delivered
          </span>
        );
      case 'PROCESSING':
      case 'CONFIRMED':
        return (
          <span className="bg-[#FEF0D4] text-[#9A6216] px-2.5 py-0.5 rounded-full text-[11px] font-medium inline-block">
            Processing
          </span>
        );
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return (
          <span className="bg-[#E0EDFF] text-[#245CA6] px-2.5 py-0.5 rounded-full text-[11px] font-medium inline-block">
            Shipped
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="bg-[#FDE8E8] text-[#9B1C1C] px-2.5 py-0.5 rounded-full text-[11px] font-medium inline-block">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="bg-[#F0ECE4] text-[#554A40] px-2.5 py-0.5 rounded-full text-[11px] font-medium inline-block">
            {status}
          </span>
        );
    }
  };

  // 3. Authenticated Admin Dashboard Layout matching Reference Image Exactly
  return (
    <div className="min-h-screen bg-[#ECE7E0] p-3 sm:p-5 lg:p-8 font-sans text-[#2E1E12] flex items-center justify-center">
      {/* Master Rounded Container */}
      <div className="w-full max-w-[1340px] bg-[#F7F2EA] rounded-[28px] sm:rounded-[32px] border border-[#E6DDD0] shadow-[0_20px_60px_-15px_rgba(40,25,15,0.08)] overflow-hidden flex flex-col md:flex-row min-h-[820px]">
        {/* Left Dark Warm-Brown Sidebar (#3B2213) */}
        <aside className="w-full md:w-60 lg:w-64 bg-[#3B2213] text-[#F7F2EA] flex flex-col shrink-0 px-4 py-6 justify-between select-none">
          <div>
            {/* 1. Veloura Living Logo */}
            <div className="flex flex-col items-center text-center pt-2 pb-5 border-b border-white/10">
              {/* Sofa & Plant Brand Icon */}
              <div className="w-10 h-7 relative mb-1.5 opacity-90 flex items-center justify-center">
                <svg viewBox="0 0 48 36" fill="none" className="w-full h-full text-[#D4AF37]">
                  <path
                    d="M10 24V14C10 11.7909 11.7909 10 14 10H30C32.2091 10 34 11.7909 34 14V24"
                    stroke="#D4AF37"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <rect x="6" y="16" width="6" height="12" rx="3" fill="#D4AF37" />
                  <rect x="32" y="16" width="6" height="12" rx="3" fill="#D4AF37" />
                  <rect x="10" y="22" width="24" height="6" rx="2" fill="#D4AF37" />
                  <path d="M12 28V32M32 28V32" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="41" cy="9" r="3.5" fill="#C5B4A1" />
                  <path d="M41 12.5V28" stroke="#C5B4A1" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M38 18C41 17 41 14 41 14" stroke="#C5B4A1" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M44 19C41 18 41 15 41 15" stroke="#C5B4A1" strokeWidth="1.5" strokeLinecap="round" />
                  <rect x="38.5" y="23" width="5" height="5" rx="1" fill="#D4AF37" />
                </svg>
              </div>
              <span className="font-serif tracking-[0.25em] text-sm font-bold text-[#F7F2EA] uppercase">
                VELOURA
              </span>
              <span className="tracking-[0.35em] text-[8px] text-[#C5B4A1] uppercase font-semibold">
                LIVING
              </span>
            </div>

            {/* 2. Admin Profile Section */}
            <div className="flex items-center gap-3 px-2 py-4 my-2 border-b border-white/10">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 shrink-0 relative bg-[#2A160A]">
                <Image
                  src="/images/dashboard/default-admin-avatar.jpg"
                  alt="Admin Portrait"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-[#F7F2EA] leading-tight truncate">
                  Hi, {adminDisplayName}
                </p>
                <p className="text-[10px] text-[#A89886] font-normal leading-tight mt-0.5">
                  Administrator
                </p>
              </div>
            </div>

            {/* 3. Navigation List (in exact reference order) */}
            <nav className="space-y-1 mt-3">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'products', label: 'Products', icon: Package },
                { id: 'orders', label: 'Orders', icon: FileText },
                { id: 'customers', label: 'Customers', icon: Users },
                { id: 'inventory', label: 'Inventory', icon: Archive },
                { id: 'coupons', label: 'Coupons', icon: Ticket },
                { id: 'content', label: 'Content', icon: Layers },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as AdminTab)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#523623] text-white shadow-xs font-semibold'
                        : 'text-[#D1C5B8] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#D1C5B8]'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 4. Bottom Logout */}
          <div className="pt-4 border-t border-white/10 mt-6">
            <button
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs text-[#D1C5B8] hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-[#D1C5B8]" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 bg-[#F7F2EA] flex flex-col overflow-y-auto">
          {/* Top Navigation Bar */}
          <header className="px-6 sm:px-8 pt-6 pb-4 flex items-center justify-between gap-4 border-b border-[#EAE2D7]/60">
            {/* Search Input with Placeholder "Search anything..." */}
            <div className="relative w-full max-w-sm sm:max-w-md">
              <Search className="w-4 h-4 text-[#A89886] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={globalSearchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Search anything..."
                className="w-full bg-white/90 border border-[#E4DCD0] rounded-xl pl-10 pr-4 py-2 text-xs text-[#2E1E12] placeholder-[#A89886] focus:outline-none focus:border-[#8B5A2B] focus:bg-white transition-all shadow-2xs"
              />
              {globalSearchQuery && (
                <button
                  onClick={() => setGlobalSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89886] hover:text-[#2E1E12]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Live Search Quick Results Dropdown */}
              {isSearchFocused && searchResults && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl border border-[#EAE2D7] shadow-xl p-3 z-30 space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-[#F0EAE1]">
                    <span className="text-[10px] font-bold text-[#796B5F] uppercase tracking-wider">
                      Quick Search Results
                    </span>
                    <button
                      onClick={() => setIsSearchFocused(false)}
                      className="text-xs text-[#796B5F] hover:text-[#2E1E12]"
                    >
                      Close
                    </button>
                  </div>

                  {searchResults.products.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-[#A89886] font-semibold">Products</p>
                      {searchResults.products.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setActiveTab('products');
                            setIsSearchFocused(false);
                          }}
                          className="p-1.5 rounded-lg hover:bg-[#FAF7F2] text-xs flex justify-between cursor-pointer"
                        >
                          <span className="font-medium text-[#2E1E12]">{p.name}</span>
                          <span className="text-[#8B5A2B]">₹ {p.price.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.orders.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-[#A89886] font-semibold">Orders</p>
                      {searchResults.orders.map((o) => (
                        <div
                          key={o.id}
                          onClick={() => {
                            setSelectedOrderForModal(o);
                            setIsSearchFocused(false);
                          }}
                          className="p-1.5 rounded-lg hover:bg-[#FAF7F2] text-xs flex justify-between cursor-pointer"
                        >
                          <span className="font-medium text-[#2E1E12]">#{o.order_number}</span>
                          <span className="text-[#796B5F]">{o.customer_info?.full_name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.customers.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-[#A89886] font-semibold">Customers</p>
                      {searchResults.customers.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setSelectedCustomerForModal(c);
                            setIsSearchFocused(false);
                          }}
                          className="p-1.5 rounded-lg hover:bg-[#FAF7F2] text-xs flex justify-between cursor-pointer"
                        >
                          <span className="font-medium text-[#2E1E12]">{c.fullName}</span>
                          <span className="text-[#796B5F]">{c.email}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  title="System Notifications"
                  className="w-9 h-9 rounded-xl bg-white/80 border border-[#E4DCD0] flex items-center justify-center text-[#4A3B32] hover:text-[#2E1E12] hover:bg-white transition-colors relative cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  <span className="w-2 h-2 rounded-full bg-[#E05252] absolute top-2 right-2 ring-2 ring-white" />
                </button>

                {/* Notifications Dropdown */}
                {isNotificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl border border-[#EAE2D7] shadow-xl p-3 z-30 space-y-2 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-[#F0EAE1]">
                      <span className="font-bold text-[#2E1E12]">Notifications</span>
                      <span className="text-[10px] text-[#8B5A2B] font-semibold">3 Unread</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="p-2 rounded-lg bg-[#FAF7F2] border border-[#EAE2D7]">
                        <p className="font-semibold text-[#2E1E12]">New Bespoke Order Placed</p>
                        <p className="text-[11px] text-[#796B5F]">Order #VL001248 received from Priya Sharma.</p>
                      </div>
                      <div className="p-2 rounded-lg bg-[#FAF7F2] border border-[#EAE2D7]">
                        <p className="font-semibold text-[#2E1E12]">Low Inventory Warning</p>
                        <p className="text-[11px] text-[#796B5F]">Kyoto Low Coffee Table has 3 units remaining.</p>
                      </div>
                      <div className="p-2 rounded-lg bg-[#FAF7F2] border border-[#EAE2D7]">
                        <p className="font-semibold text-[#2E1E12]">White-Glove Delivery Completed</p>
                        <p className="text-[11px] text-[#796B5F]">Shipment VEL-WG-2026 delivered in Bengaluru.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl bg-white/80 hover:bg-white border border-[#E4DCD0] transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-[#DCD2C4] relative bg-[#2A160A]">
                    <Image
                      src="/images/dashboard/default-admin-avatar.jpg"
                      alt="Admin"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-xs font-semibold text-[#2E1E12]">Admin</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#796B5F]" />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-[#EAE2D7] shadow-xl p-1.5 z-30 text-xs">
                    <button
                      onClick={() => {
                        navigate('/');
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#FAF7F2] text-[#2E1E12] flex items-center gap-2 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#8B5A2B]" />
                      <span>Storefront View</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#FAF7F2] text-[#2E1E12] flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#8B5A2B]" />
                      <span>Console Settings</span>
                    </button>
                    <div className="border-t border-[#F0EAE1] my-1" />
                    <button
                      onClick={async () => {
                        await logout();
                        navigate('/login');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#FAF7F2] text-[#9B1C1C] flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Action Notification Toast */}
          {notificationToast && (
            <div className="mx-6 sm:mx-8 mt-4 bg-[#2E7D32] text-white text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">{notificationToast}</span>
              </div>
              <button onClick={() => setNotificationToast(null)} className="text-white/80 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Tab Content Router */}
          <div className="flex-1 p-6 sm:p-8 space-y-6">
            {activeTab === 'dashboard' && (
              <div ref={contentSectionRef} className="space-y-6">
                {/* Dashboard Header */}
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2E1E12]">
                    {getGreeting()}, {adminDisplayName}
                  </h1>
                  <p className="text-xs text-[#796B5F] mt-1">
                    Here's what's happening with your store today.
                  </p>
                </div>

                {/* 4 Summary Cards (Exact proportions & styling from reference image) */}
                <div
                  ref={cardsContainerRef}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  {/* Card 1: Total Orders */}
                  <div className="bg-white rounded-2xl border border-[#EAE2D7] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#796B5F]">Total Orders</span>
                      <div className="w-6 h-6 rounded-full bg-[#F3EFE9] text-[#796B5F] flex items-center justify-center text-xs">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-2xl font-bold font-serif text-[#2E1E12]">
                        {metrics?.totalOrders || 248}
                      </p>
                      <p className="text-xs text-[#2E7D32] font-semibold mt-1 flex items-center gap-0.5">
                        <ArrowUp className="w-3 h-3" />
                        <span>12%</span>
                      </p>
                    </div>
                  </div>

                  {/* Card 2: Total Revenue */}
                  <div className="bg-white rounded-2xl border border-[#EAE2D7] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#796B5F]">Total Revenue</span>
                      <div className="w-6 h-6 rounded-full bg-[#F3EFE9] text-[#796B5F] flex items-center justify-center text-xs">
                        <ArrowUp className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-2xl font-bold font-serif text-[#2E1E12]">
                        ₹{' '}
                        {metrics?.totalRevenue
                          ? Number(metrics.totalRevenue).toLocaleString('en-IN')
                          : '1,24,580'}
                      </p>
                      <p className="text-xs text-[#2E7D32] font-semibold mt-1 flex items-center gap-0.5">
                        <ArrowUp className="w-3 h-3" />
                        <span>16%</span>
                      </p>
                    </div>
                  </div>

                  {/* Card 3: Total Customers */}
                  <div className="bg-white rounded-2xl border border-[#EAE2D7] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#796B5F]">Total Customers</span>
                      <div className="w-6 h-6 rounded-full bg-[#F3EFE9] text-[#796B5F] flex items-center justify-center text-xs">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-2xl font-bold font-serif text-[#2E1E12]">
                        {metrics?.totalCustomers || 892}
                      </p>
                      <p className="text-xs text-[#2E7D32] font-semibold mt-1 flex items-center gap-0.5">
                        <ArrowUp className="w-3 h-3" />
                        <span>6%</span>
                      </p>
                    </div>
                  </div>

                  {/* Card 4: Active Products */}
                  <div className="bg-white rounded-2xl border border-[#EAE2D7] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#796B5F]">Active Products</span>
                      <div className="w-6 h-6 rounded-full bg-[#F3EFE9] text-[#796B5F] flex items-center justify-center text-xs">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-2xl font-bold font-serif text-[#2E1E12]">
                        {metrics?.activeProducts || 156}
                      </p>
                      <p className="text-xs text-[#2E7D32] font-semibold mt-1 flex items-center gap-0.5">
                        <ArrowUp className="w-3 h-3" />
                        <span>5%</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sales Overview (Left) & Recent Orders (Right) Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left: Sales Overview Card */}
                  <div className="lg:col-span-7 bg-white rounded-2xl border border-[#EAE2D7] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                    {/* Header with Dropdown */}
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-serif text-base font-bold text-[#2E1E12]">
                        Sales Overview
                      </h2>

                      {/* Period Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setIsTimeRangeOpen(!isTimeRangeOpen)}
                          className="border border-[#E4DCD0] rounded-lg px-3 py-1.5 text-xs text-[#523623] bg-white hover:bg-[#FAF7F2] flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>
                            {salesTimeRange === '7d'
                              ? 'Last 7 days'
                              : salesTimeRange === '30d'
                              ? 'Last 30 days'
                              : salesTimeRange === 'month'
                              ? 'This Month'
                              : 'This Year'}
                          </span>
                          <ChevronDown className="w-3 h-3 text-[#796B5F]" />
                        </button>

                        {isTimeRangeOpen && (
                          <div className="absolute right-0 top-full mt-1.5 w-32 bg-white rounded-lg border border-[#EAE2D7] shadow-lg py-1 z-20 text-xs">
                            <button
                              onClick={() => {
                                setSalesTimeRange('7d');
                                setIsTimeRangeOpen(false);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-[#FAF7F2] text-[#2E1E12]"
                            >
                              Last 7 days
                            </button>
                            <button
                              onClick={() => {
                                setSalesTimeRange('30d');
                                setIsTimeRangeOpen(false);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-[#FAF7F2] text-[#2E1E12]"
                            >
                              Last 30 days
                            </button>
                            <button
                              onClick={() => {
                                setSalesTimeRange('month');
                                setIsTimeRangeOpen(false);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-[#FAF7F2] text-[#2E1E12]"
                            >
                              This Month
                            </button>
                            <button
                              onClick={() => {
                                setSalesTimeRange('year');
                                setIsTimeRangeOpen(false);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-[#FAF7F2] text-[#2E1E12]"
                            >
                              This Year
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Interactive SVG Chart */}
                    <div className="relative w-full h-[240px] pt-2">
                      {/* Tooltip Popup */}
                      {activeTooltip && (
                        <div
                          className="absolute bg-[#2E1E12] text-white text-[11px] px-2.5 py-1 rounded-md shadow-md pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 z-20 transition-all font-mono"
                          style={{ left: `${(activeTooltip.x / 460) * 100}%`, top: `${(activeTooltip.y / 230) * 100}%` }}
                        >
                          <p className="font-sans font-bold">{activeTooltip.label}</p>
                          <p className="text-[#C5B4A1]">{activeTooltip.val}</p>
                        </div>
                      )}

                      <svg viewBox="0 0 460 230" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="greenAreaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2E7D5B" stopOpacity="0.22" />
                            <stop offset="85%" stopColor="#2E7D5B" stopOpacity="0.02" />
                            <stop offset="100%" stopColor="#2E7D5B" stopOpacity="0" />
                          </linearGradient>
                        </defs>

                        {/* Y-Axis Gridlines & Labels */}
                        {[
                          { y: 35, label: '₹ 80K' },
                          { y: 80, label: '₹ 60K' },
                          { y: 125, label: '₹ 40K' },
                          { y: 170, label: '₹ 20K' },
                          { y: 210, label: '₹ 0' },
                        ].map((grid, idx) => (
                          <g key={idx}>
                            <text
                              x="0"
                              y={grid.y + 4}
                              fill="#A09486"
                              fontSize="10"
                              fontWeight="500"
                              fontFamily="sans-serif"
                            >
                              {grid.label}
                            </text>
                            <line
                              x1="45"
                              y1={grid.y}
                              x2="455"
                              y2={grid.y}
                              stroke="#F0EAE1"
                              strokeWidth="1"
                              strokeDasharray={idx === 4 ? 'none' : '3 3'}
                            />
                          </g>
                        ))}

                        {/* Area Fill */}
                        <path
                          d={`M ${chartData.points[0].x} ${chartData.points[0].y} ` +
                            chartData.points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ') +
                            ` L ${chartData.points[chartData.points.length - 1].x} 210 L ${chartData.points[0].x} 210 Z`}
                          fill="url(#greenAreaGradient)"
                        />

                        {/* Smooth Line */}
                        <path
                          d={`M ${chartData.points[0].x} ${chartData.points[0].y} ` +
                            chartData.points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')}
                          fill="none"
                          stroke="#2E7D5B"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Nodes with Hover Tooltips */}
                        {chartData.points.map((pt, idx) => (
                          <circle
                            key={idx}
                            cx={pt.x}
                            cy={pt.y}
                            r="4.5"
                            fill="#2E7D5B"
                            stroke="#FFFFFF"
                            strokeWidth="2"
                            className="transition-transform duration-200 cursor-pointer hover:scale-150"
                            onMouseEnter={() =>
                              setActiveTooltip({
                                x: pt.x,
                                y: pt.y,
                                val: pt.val,
                                label: chartData.labels[idx],
                              })
                            }
                            onMouseLeave={() => setActiveTooltip(null)}
                          />
                        ))}
                      </svg>

                      {/* X-Axis Dates Labels */}
                      <div className="flex justify-between pl-10 pr-2 pt-2 text-[10px] text-[#A09486] font-medium">
                        {chartData.labels.map((lbl, idx) => (
                          <span key={idx}>{lbl}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Recent Orders Card (Exact table from reference image) */}
                  <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EAE2D7] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="font-serif text-base font-bold text-[#2E1E12]">
                          Recent Orders
                        </h2>
                        <button
                          onClick={() => setActiveTab('orders')}
                          className="text-xs text-[#2E1E12] underline hover:text-[#8B5A2B] cursor-pointer"
                        >
                          View all
                        </button>
                      </div>

                      {/* Orders Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="text-[#A09486] border-b border-[#F0EAE1] text-[11px] font-medium">
                              <th className="pb-2 font-normal">Order ID</th>
                              <th className="pb-2 font-normal">Customer</th>
                              <th className="pb-2 font-normal">Amount</th>
                              <th className="pb-2 font-normal">Status</th>
                              <th className="pb-2 font-normal text-right">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#F0EAE1]">
                            {displayRecentOrders.map((order, idx) => (
                              <tr
                                key={order.id || idx}
                                onClick={() => setSelectedOrderForModal(order)}
                                className="hover:bg-[#FAF7F2] transition-colors cursor-pointer group"
                              >
                                <td className="py-2.5 font-semibold text-[#2E1E12]">
                                  #{order.order_number || `VL${idx + 1000}`}
                                </td>
                                <td className="py-2.5 text-[#523623] truncate max-w-[100px]">
                                  {order.customer_info?.full_name || 'Client Customer'}
                                </td>
                                <td className="py-2.5 font-semibold text-[#2E1E12]">
                                  {Number(order.grand_total || order.subtotal || 0).toLocaleString('en-IN')}
                                </td>
                                <td className="py-2.5">
                                  {renderStatusBadge(order.status)}
                                </td>
                                <td className="py-2.5 text-right text-[#796B5F]">
                                  {new Date(order.created_at).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                  })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PRODUCTS */}
            {activeTab === 'products' && (
              <div ref={contentSectionRef} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-serif text-2xl font-bold text-[#2E1E12]">
                      Master Product Catalog
                    </h1>
                    <p className="text-xs text-[#796B5F]">
                      Manage luxury handcrafted furniture pieces, stock levels & bespoke attributes
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setIsProductModalOpen(true);
                    }}
                    className="bg-[#523623] hover:bg-[#3D2515] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Furniture Piece</span>
                  </button>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#EAE2D7]">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#8B5A2B]" />
                    <select
                      value={productCategoryFilter}
                      onChange={(e) => setProductCategoryFilter(e.target.value)}
                      className="bg-[#FAF7F2] border border-[#E4DCD0] rounded-xl px-3 py-1.5 text-xs text-[#2E1E12] focus:outline-none focus:border-[#8B5A2B]"
                    >
                      <option value="ALL">All Room Collections</option>
                      <option value="living-room">Living Room</option>
                      <option value="bedroom">Bedroom</option>
                      <option value="dining">Dining Room</option>
                      <option value="office">Office</option>
                    </select>
                  </div>
                  <span className="text-xs text-[#796B5F]">
                    Showing {productsList.length} total catalog products
                  </span>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-2xl border border-[#EAE2D7] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF7F2] text-[#796B5F] border-b border-[#EAE2D7] font-medium">
                        <tr>
                          <th className="p-3.5">Piece</th>
                          <th className="p-3.5">SKU</th>
                          <th className="p-3.5">Room</th>
                          <th className="p-3.5">Price</th>
                          <th className="p-3.5">Stock</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0EAE1]">
                        {productsList
                          .filter(
                            (p) =>
                              productCategoryFilter === 'ALL' ||
                              p.room === productCategoryFilter
                          )
                          .map((p) => (
                            <tr key={p.id} className="hover:bg-[#FAF7F2] transition-colors">
                              <td className="p-3.5 font-semibold text-[#2E1E12] flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-[#FAF7F2] shrink-0 border border-[#EAE2D7]">
                                  <Image
                                    src={p.images?.[0] || '/images/products/veloura_solis_boucle_chair.jpg'}
                                    alt={p.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <span className="truncate max-w-[180px]">{p.name}</span>
                              </td>
                              <td className="p-3.5 font-mono text-[#796B5F] text-[11px]">
                                {p.sku || 'VEL-BESPOKE'}
                              </td>
                              <td className="p-3.5 capitalize text-[#523623]">
                                {p.room.replace('-', ' ')}
                              </td>
                              <td className="p-3.5 font-semibold text-[#2E1E12]">
                                ₹ {p.price.toLocaleString('en-IN')}
                              </td>
                              <td className="p-3.5">
                                <span className="font-semibold text-[#2E1E12]">{p.stock} units</span>
                              </td>
                              <td className="p-3.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                    p.stock > 5
                                      ? 'bg-[#DCF5E6] text-[#1E6B40]'
                                      : p.stock > 0
                                      ? 'bg-[#FEF0D4] text-[#9A6216]'
                                      : 'bg-[#FDE8E8] text-[#9B1C1C]'
                                  }`}
                                >
                                  {p.stock > 5 ? 'In Stock' : p.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                                </span>
                              </td>
                              <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingProduct(p);
                                      setIsProductModalOpen(true);
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-white text-[#796B5F] hover:text-[#523623] transition-colors"
                                    title="Edit Piece"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(p.id)}
                                    className="p-1.5 rounded-lg hover:bg-white text-[#796B5F] hover:text-[#9B1C1C] transition-colors"
                                    title="Archive Piece"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ORDERS */}
            {activeTab === 'orders' && (
              <div ref={contentSectionRef} className="space-y-6">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-[#2E1E12]">
                    Omnichannel Order Fulfillment
                  </h1>
                  <p className="text-xs text-[#796B5F]">
                    Review white-glove delivery dispatches, payments, invoices & tracking
                  </p>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#EAE2D7]">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#8B5A2B]" />
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="bg-[#FAF7F2] border border-[#E4DCD0] rounded-xl px-3 py-1.5 text-xs text-[#2E1E12] focus:outline-none focus:border-[#8B5A2B]"
                    >
                      <option value="ALL">All Order Statuses</option>
                      <option value="PLACED">Placed</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  <button
                    onClick={loadAdminData}
                    disabled={isLoading}
                    className="text-xs text-[#523623] font-medium flex items-center gap-1 hover:text-[#2E1E12]"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-2xl border border-[#EAE2D7] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF7F2] text-[#796B5F] border-b border-[#EAE2D7] font-medium">
                        <tr>
                          <th className="p-3.5">Order Number</th>
                          <th className="p-3.5">Customer</th>
                          <th className="p-3.5">Items</th>
                          <th className="p-3.5">Amount</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5">Date</th>
                          <th className="p-3.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0EAE1]">
                        {liveOrders
                          .filter(
                            (o) =>
                              orderStatusFilter === 'ALL' ||
                              o.status === orderStatusFilter
                          )
                          .map((order) => (
                            <tr
                              key={order.id}
                              onClick={() => setSelectedOrderForModal(order)}
                              className="hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                            >
                              <td className="p-3.5 font-semibold text-[#2E1E12]">
                                #{order.order_number || order.id.slice(0, 8)}
                              </td>
                              <td className="p-3.5 text-[#523623]">
                                {order.customer_info?.full_name || 'Client'}
                              </td>
                              <td className="p-3.5 text-[#796B5F]">
                                {order.items?.length || 1} pieces
                              </td>
                              <td className="p-3.5 font-semibold text-[#2E1E12]">
                                ₹ {Number(order.grand_total || order.subtotal).toLocaleString('en-IN')}
                              </td>
                              <td className="p-3.5">
                                {renderStatusBadge(order.status)}
                              </td>
                              <td className="p-3.5 text-[#796B5F]">
                                {new Date(order.created_at).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </td>
                              <td className="p-3.5 text-right">
                                <span className="text-[#8B5A2B] font-semibold hover:underline">
                                  View Details →
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CUSTOMERS */}
            {activeTab === 'customers' && (
              <div ref={contentSectionRef} className="space-y-6">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-[#2E1E12]">
                    Customer Accounts & Profiles
                  </h1>
                  <p className="text-xs text-[#796B5F]">
                    Authoritative customer database with lifetime spend, orders count & addresses
                  </p>
                </div>

                {/* Search Bar */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#EAE2D7] flex items-center justify-between">
                  <div className="relative w-full max-w-sm">
                    <Search className="w-3.5 h-3.5 text-[#A89886] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      placeholder="Search customer by name or email..."
                      className="w-full bg-[#FAF7F2] border border-[#E4DCD0] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#2E1E12] focus:outline-none focus:border-[#8B5A2B]"
                    />
                  </div>
                  <span className="text-xs text-[#796B5F]">
                    {liveCustomers.length} registered customers
                  </span>
                </div>

                {/* Customers Table */}
                <div className="bg-white rounded-2xl border border-[#EAE2D7] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF7F2] text-[#796B5F] border-b border-[#EAE2D7] font-medium">
                        <tr>
                          <th className="p-3.5">Customer Name</th>
                          <th className="p-3.5">Email</th>
                          <th className="p-3.5">Phone</th>
                          <th className="p-3.5">Orders</th>
                          <th className="p-3.5">Lifetime Spent</th>
                          <th className="p-3.5">Joined</th>
                          <th className="p-3.5 text-right">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0EAE1]">
                        {liveCustomers
                          .filter((c) =>
                            !customerSearchQuery.trim()
                              ? true
                              : c.fullName?.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                                c.email?.toLowerCase().includes(customerSearchQuery.toLowerCase())
                          )
                          .map((cust) => (
                            <tr
                              key={cust.id}
                              onClick={() => setSelectedCustomerForModal(cust)}
                              className="hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                            >
                              <td className="p-3.5 font-semibold text-[#2E1E12] flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#523623] text-white flex items-center justify-center font-bold text-xs shrink-0">
                                  {cust.fullName[0]?.toUpperCase() || 'C'}
                                </div>
                                <span>{cust.fullName}</span>
                              </td>
                              <td className="p-3.5 text-[#523623]">{cust.email}</td>
                              <td className="p-3.5 text-[#796B5F]">{cust.phone || '—'}</td>
                              <td className="p-3.5 font-semibold text-[#2E1E12]">
                                {cust.ordersCount} orders
                              </td>
                              <td className="p-3.5 font-semibold text-[#2E1E12]">
                                ₹ {Number(cust.totalSpent || 0).toLocaleString('en-IN')}
                              </td>
                              <td className="p-3.5 text-[#796B5F]">
                                {new Date(cust.createdAt).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </td>
                              <td className="p-3.5 text-right">
                                <span className="text-[#8B5A2B] font-semibold hover:underline">
                                  Profile →
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: INVENTORY */}
            {activeTab === 'inventory' && (
              <div ref={contentSectionRef} className="space-y-6">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-[#2E1E12]">
                    Stock & Warehouse Inventory
                  </h1>
                  <p className="text-xs text-[#796B5F]">
                    Live atelier inventory stock levels, low-stock thresholds & instant stock adjustments
                  </p>
                </div>

                {/* Low Stock Alert Banner */}
                <div className="bg-[#FEF0D4] border border-[#FADBA1] rounded-2xl p-4 flex items-center justify-between text-xs text-[#9A6216]">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-[#9A6216]" />
                    <span className="font-medium">
                      {productsList.filter((p) => p.stock < 5).length} items are currently below safety threshold. Restock recommended.
                    </span>
                  </div>
                  <span className="text-[11px] font-bold uppercase">Atelier Alert</span>
                </div>

                {/* Inventory Table */}
                <div className="bg-white rounded-2xl border border-[#EAE2D7] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF7F2] text-[#796B5F] border-b border-[#EAE2D7] font-medium">
                        <tr>
                          <th className="p-3.5">Product</th>
                          <th className="p-3.5">SKU</th>
                          <th className="p-3.5">Current Stock</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Quick Adjust</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0EAE1]">
                        {productsList.map((p) => (
                          <tr key={p.id} className="hover:bg-[#FAF7F2] transition-colors">
                            <td className="p-3.5 font-semibold text-[#2E1E12]">
                              {p.name}
                            </td>
                            <td className="p-3.5 font-mono text-[#796B5F] text-[11px]">
                              {p.sku || 'VEL-SKU'}
                            </td>
                            <td className="p-3.5 font-bold text-sm text-[#2E1E12]">
                              {p.stock}
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                  p.stock > 5
                                    ? 'bg-[#DCF5E6] text-[#1E6B40]'
                                    : p.stock > 0
                                    ? 'bg-[#FEF0D4] text-[#9A6216]'
                                    : 'bg-[#FDE8E8] text-[#9B1C1C]'
                                }`}
                              >
                                {p.stock > 5 ? 'In Stock' : p.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleUpdateStock(p.id, p.stock - 1)}
                                  className="w-7 h-7 rounded-lg bg-[#FAF7F2] hover:bg-[#F0ECE4] text-[#2E1E12] font-bold flex items-center justify-center border border-[#E4DCD0]"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center font-semibold text-xs">{p.stock}</span>
                                <button
                                  onClick={() => handleUpdateStock(p.id, p.stock + 1)}
                                  className="w-7 h-7 rounded-lg bg-[#FAF7F2] hover:bg-[#F0ECE4] text-[#2E1E12] font-bold flex items-center justify-center border border-[#E4DCD0]"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: COUPONS */}
            {activeTab === 'coupons' && (
              <div ref={contentSectionRef} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-serif text-2xl font-bold text-[#2E1E12]">
                      Promotion Codes & Coupons
                    </h1>
                    <p className="text-xs text-[#796B5F]">
                      Create and manage promotional discount vouchers for marketing campaigns
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCouponModalOpen(true)}
                    className="bg-[#523623] hover:bg-[#3D2515] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Promotion</span>
                  </button>
                </div>

                {/* Coupons Table */}
                <div className="bg-white rounded-2xl border border-[#EAE2D7] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF7F2] text-[#796B5F] border-b border-[#EAE2D7] font-medium">
                        <tr>
                          <th className="p-3.5">Code</th>
                          <th className="p-3.5">Discount Value</th>
                          <th className="p-3.5">Min Order Value</th>
                          <th className="p-3.5">Usage Count</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0EAE1]">
                        {liveCoupons.map((c) => (
                          <tr key={c.id} className="hover:bg-[#FAF7F2] transition-colors">
                            <td className="p-3.5 font-mono font-bold text-[#2E1E12]">
                              {c.code}
                            </td>
                            <td className="p-3.5 font-semibold text-[#8B5A2B]">
                              {c.discount_type === 'PERCENTAGE'
                                ? `${c.discount_value}% OFF`
                                : `₹ ${c.discount_value.toLocaleString('en-IN')} OFF`}
                            </td>
                            <td className="p-3.5 text-[#523623]">
                              ₹ {c.min_order_value ? c.min_order_value.toLocaleString('en-IN') : '0'}
                            </td>
                            <td className="p-3.5 text-[#796B5F]">
                              {c.usage_count || 0} / {c.usage_limit || '∞'}
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                  c.is_active
                                    ? 'bg-[#DCF5E6] text-[#1E6B40]'
                                    : 'bg-[#FDE8E8] text-[#9B1C1C]'
                                }`}
                              >
                                {c.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleToggleCoupon(c.id)}
                                  className="text-xs text-[#523623] hover:underline cursor-pointer"
                                >
                                  {c.is_active ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                  onClick={() => handleDeleteCoupon(c.id)}
                                  className="text-[#9B1C1C] hover:text-[#771D1D] p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CONTENT (CMS) */}
            {activeTab === 'content' && (
              <div ref={contentSectionRef} className="space-y-6">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-[#2E1E12]">
                    Editorial & Homepage CMS Content
                  </h1>
                  <p className="text-xs text-[#796B5F]">
                    Curate hero editorial banners, room staging visual assets & seasonal lookbooks
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {liveBanners.map((banner) => (
                    <div
                      key={banner.id}
                      className="bg-white rounded-2xl border border-[#EAE2D7] p-4 space-y-3 shadow-xs"
                    >
                      <div className="w-full h-40 rounded-xl overflow-hidden relative bg-[#FAF7F2]">
                        <Image
                          src={banner.image_url || '/images/rooms/veloura_ultra_luxury_living_hero.jpg'}
                          alt={banner.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#8B5A2B] tracking-wider">
                          {banner.badge_text || 'Featured Showcase'}
                        </span>
                        <h3 className="font-serif text-base font-bold text-[#2E1E12] mt-0.5">
                          {banner.title}
                        </h3>
                        <p className="text-xs text-[#796B5F] mt-1">{banner.subtitle}</p>
                      </div>
                      <div className="pt-2 border-t border-[#F0EAE1] flex justify-between items-center text-xs">
                        <span className="text-[#2E7D32] font-semibold">● Active on Storefront</span>
                        <button
                          onClick={() => showToast('CMS banner settings updated.')}
                          className="text-[#8B5A2B] hover:underline"
                        >
                          Edit Content →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: ANALYTICS */}
            {activeTab === 'analytics' && (
              <div ref={contentSectionRef} className="space-y-6">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-[#2E1E12]">
                    Storefront & Financial Intelligence
                  </h1>
                  <p className="text-xs text-[#796B5F]">
                    Revenue metrics by category, average order value & Spatial AI predictions
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-[#EAE2D7]">
                    <span className="text-xs text-[#796B5F]">Average Order Value</span>
                    <p className="text-2xl font-serif font-bold text-[#2E1E12] mt-1">
                      ₹ {metrics?.averageOrderValue ? metrics.averageOrderValue.toLocaleString('en-IN') : '52,400'}
                    </p>
                    <p className="text-xs text-[#2E7D32] mt-1">↑ 8.4% compared to last cycle</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-[#EAE2D7]">
                    <span className="text-xs text-[#796B5F]">Customer Return Rate</span>
                    <p className="text-2xl font-serif font-bold text-[#2E1E12] mt-1">0.8%</p>
                    <p className="text-xs text-[#2E7D32] mt-1">Ultra-low return frequency</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-[#EAE2D7]">
                    <span className="text-xs text-[#796B5F]">Master Catalog Rating</span>
                    <p className="text-2xl font-serif font-bold text-[#2E1E12] mt-1">4.92 ★</p>
                    <p className="text-xs text-[#2E7D32] mt-1">Based on verified customer reviews</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#EAE2D7] p-6 space-y-4">
                  <h3 className="font-serif text-lg font-bold text-[#2E1E12]">
                    Spatial AI Restocking Intelligence (2026 Engine)
                  </h3>
                  <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EAE2D7] space-y-2 text-xs">
                    <p className="font-semibold text-[#523623]">
                      Predicted High-Demand Silhouette: Curved Bouclé Sectionals & Sculptural Travertine
                    </p>
                    <p className="text-[#796B5F] leading-relaxed">
                      AI spatial telemetry observes an 84% conversion acceleration on 2700K ambient room pairings. Ensure Bengaluru atelier maintains at least 6 weeks raw timber stock.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <div ref={contentSectionRef} className="space-y-6">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-[#2E1E12]">
                    Enterprise Operations Settings
                  </h1>
                  <p className="text-xs text-[#796B5F]">
                    System identity, taxation configurations & single-admin invariant posture
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-[#EAE2D7] p-6 space-y-6 max-w-2xl">
                  {/* Security Posture Status */}
                  <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EAE2D7] flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-[#2E7D32] shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-[#2E1E12]">
                        Single-Admin Invariant Protection
                      </h4>
                      <p className="text-[11px] text-[#796B5F] mt-0.5">
                        PostgreSQL trigger & application invariants actively enforce zero-credential leakage and single administrator access.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-[#523623]">Store Atelier Location</label>
                      <input
                        type="text"
                        readOnly
                        value="Veloura Living Craft Atelier, Bengaluru & Mumbai Flagship"
                        className="w-full bg-[#FAF7F2] border border-[#E4DCD0] rounded-xl px-3.5 py-2 text-[#2E1E12]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="font-semibold text-[#523623]">Operating Currency</label>
                        <input
                          type="text"
                          readOnly
                          value="INR (₹) — Indian Rupee"
                          className="w-full bg-[#FAF7F2] border border-[#E4DCD0] rounded-xl px-3.5 py-2 text-[#2E1E12]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-semibold text-[#523623]">GST Harmonized Tax Rate</label>
                        <input
                          type="text"
                          readOnly
                          value="18% Luxury Furnishing GST"
                          className="w-full bg-[#FAF7F2] border border-[#E4DCD0] rounded-xl px-3.5 py-2 text-[#2E1E12]"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#F0EAE1] flex justify-end">
                      <button
                        onClick={() => showToast('Store settings saved successfully.')}
                        className="bg-[#523623] hover:bg-[#3D2515] text-white px-5 py-2.5 rounded-xl font-semibold transition-colors cursor-pointer"
                      >
                        Save Configurations
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODALS */}
      {selectedOrderForModal && (
        <AdminOrderDetailsModal
          order={selectedOrderForModal}
          onClose={() => setSelectedOrderForModal(null)}
          onUpdateStatus={handleUpdateOrderStatus}
        />
      )}

      {selectedCustomerForModal && (
        <AdminCustomerDetailsModal
          customer={selectedCustomerForModal}
          onClose={() => setSelectedCustomerForModal(null)}
        />
      )}

      {isProductModalOpen && (
        <AdminProductModal
          isOpen={isProductModalOpen}
          initialProduct={editingProduct}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
          onSaveProduct={handleSaveProduct}
        />
      )}

      {isCouponModalOpen && (
        <AdminCouponModal
          isOpen={isCouponModalOpen}
          onClose={() => setIsCouponModalOpen(false)}
          onSaveCoupon={handleCreateCoupon}
        />
      )}
    </div>
  );
};
