'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useStore } from '@/hooks/useStore';
import { useAuth } from '@/providers/AuthProvider';
import { useNotifications } from '@/providers/NotificationProvider';
import { ProductCard } from '@/components/products/ProductCard';
import { OrderTrackingModal } from './OrderTrackingModal';
import { ConciergeSupportModal } from './ConciergeSupportModal';
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  MapPin,
  User,
  Star,
  Settings,
  LogOut,
  Bell,
  ShoppingCart,
  ChevronDown,
  Search,
  Tag,
  Package,
  Plus,
  Trash2,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  LayoutGrid,
  Headphones,
  Check,
  Edit3,
  ExternalLink,
  ChevronRight,
  FileText,
} from 'lucide-react';

type DashboardTab =
  | 'dashboard'
  | 'orders'
  | 'wishlist'
  | 'addresses'
  | 'profile'
  | 'reviews'
  | 'settings';

export const AccountPage: React.FC = () => {
  const { wishlist, cart, setIsCartOpen, allProducts, navigate } = useStore();
  const {
    user,
    profile,
    addresses,
    isAuthenticated,
    isAdmin,
    openAuthModal,
    logout,
    addAddress,
    removeAddress,
    updateProfile,
  } = useAuth();

  const { unreadCount, openDrawer: openNotificationDrawer } = useNotifications();

  // Navigation state
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [selectedOrderIdForTracking, setSelectedOrderIdForTracking] = useState<string>('');

  // Orders State
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Hero carousel state
  const [heroSlide, setHeroSlide] = useState(0);

  // Search state inside hero
  const [heroSearchQuery, setHeroSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Profile Edit State
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStyle, setEditStyle] = useState('Warm Minimalist');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Addresses State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddressLine1, setNewAddressLine1] = useState('');
  const [newAddressLine2, setNewAddressLine2] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPostalCode, setNewPostalCode] = useState('');

  // Password reset request status
  const [passwordResetSent, setPasswordResetSent] = useState(false);

  // GSAP Container Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const statsGridRef = useRef<HTMLDivElement>(null);
  const recentOrdersRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);

  // Fetch real authenticated orders
  useEffect(() => {
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

  // Synchronize profile fields when loaded
  useEffect(() => {
    if (profile) {
      setEditFirstName(profile.first_name || '');
      setEditLastName(profile.last_name || '');
      setEditPhone(profile.phone || '');
    } else if (user) {
      setEditFirstName(user.profile?.firstName || '');
      setEditLastName(user.profile?.lastName || '');
    }
  }, [profile, user]);

  // Dynamic Customer Name Resolution
  const customerFirstName =
    profile?.first_name ||
    user?.profile?.firstName ||
    (user?.email ? user.email.split('@')[0] : '') ||
    'there';

  const customerDisplayName =
    profile?.first_name
      ? `${profile.first_name}${profile.last_name ? ' ' + profile.last_name : ''}`
      : user?.profile?.firstName
      ? `${user.profile.firstName}${user.profile.lastName ? ' ' + user.profile.lastName : ''}`
      : user?.email ? user.email.split('@')[0] : 'Customer';

  const customerAvatar =
    profile?.avatar_url ||
    user?.profile?.avatarUrl ||
    '/images/dashboard/default-customer-avatar.jpg';

  // Calculate total spent from actual orders
  const totalSpent = userOrders.reduce((sum, order) => {
    const orderTotal = Number(order.total || 0);
    return sum + (isNaN(orderTotal) ? 0 : orderTotal);
  }, 0);

  const wishlistedProducts = allProducts.filter((p) => wishlist.includes(p.id));

  // GSAP Entrance Animations
  useEffect(() => {
    if (!containerRef.current || activeTab !== 'dashboard') return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      if (statsGridRef.current) {
        gsap.fromTo(
          statsGridRef.current.children,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: 'power2.out' }
        );
      }

      if (recentOrdersRef.current && quickActionsRef.current) {
        gsap.fromTo(
          [recentOrdersRef.current, quickActionsRef.current],
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, delay: 0.15, ease: 'power2.out' }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [activeTab]);

  // Handle Search Input inside Hero Banner
  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroSearchQuery.trim()) return;
    navigate(`/catalog?q=${encodeURIComponent(heroSearchQuery.trim())}`);
  };

  const handleHeroSearchChange = (val: string) => {
    setHeroSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const q = val.toLowerCase().trim();
    const matched = allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.room?.toLowerCase().includes(q)
    ).slice(0, 4);
    setSearchResults(matched);
  };

  // Handle Profile Update
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccessMsg(null);

    const success = await updateProfile({
      first_name: editFirstName,
      last_name: editLastName,
      phone: editPhone,
    });

    setIsSavingProfile(false);
    if (success) {
      setProfileSuccessMsg('Profile updated successfully.');
      setTimeout(() => setProfileSuccessMsg(null), 3000);
    }
  };

  // Handle Address Submission
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

  // Handle Password Reset Request
  const handleRequestPasswordReset = async () => {
    if (!user?.email) return;
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      setPasswordResetSent(true);
      setTimeout(() => setPasswordResetSent(false), 5000);
    } catch {
      // ignore
    }
  };

  // Unauthenticated fallback view
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F7F2EA] flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="max-w-md w-full bg-[#FAF7F2] rounded-3xl p-8 border border-[#E5DACD] shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#EADBCC] text-[#3B2213] flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-[#2B1810] font-bold">
              Concierge Access Required
            </h1>
            <p className="text-xs text-[#7D6B5D] mt-2 leading-relaxed">
              Sign in to access your bespoke dashboard, white-glove orders, saved palettes, and architectural delivery addresses.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <button
              onClick={() => openAuthModal('signin')}
              className="w-full py-3.5 bg-[#3B2213] hover:bg-[#2B1810] text-[#FAF7F2] rounded-xl text-xs font-semibold tracking-wider uppercase transition-all shadow-md cursor-pointer active:scale-98"
            >
              Sign In to Your Account
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              className="w-full py-3 bg-[#EADBCC] hover:bg-[#DFCFC0] text-[#3B2213] rounded-xl text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer"
            >
              Create New Concierge Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Hero Carousel slides content
  const heroSlides = [
    {
      titleLine1: 'Your Dream Space',
      titleLine2: 'Awaits',
      subtitle: 'Discover furniture that feels like home.',
      image: '/images/dashboard/customer-dashboard-hero.jpg',
    },
    {
      titleLine1: 'Curated Architectural',
      titleLine2: 'Living',
      subtitle: 'Handcrafted solid oak & bouclé contours tailored for comfort.',
      image: '/images/rooms/veloura_luxury_living_room_hero.jpg',
    },
    {
      titleLine1: 'Spaces Made for',
      titleLine2: 'Connection',
      subtitle: 'Sculptural tables & ambient brass illumination for timeless living.',
      image: '/images/rooms/veloura_cinematic_hero_living.jpg',
    },
  ];

  const currentHero = heroSlides[heroSlide] || heroSlides[0];

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#F7F2EA] py-4 sm:py-6 md:py-8 lg:py-10 px-2 sm:px-4 md:px-6 lg:px-8 font-sans select-text"
    >
      {/* Outer Rounded Container matching the Reference Image */}
      <div className="w-full max-w-[1440px] mx-auto bg-[#F7F2EA] rounded-[24px] sm:rounded-[32px] md:rounded-[36px] overflow-hidden border border-[#E6DDD0] shadow-[0_20px_60px_-15px_rgba(42,26,18,0.12)] flex flex-col lg:flex-row min-h-[780px] lg:min-h-[820px]">
        
        {/* ========================================================= */}
        {/* LEFT SIDEBAR — DARK WARM BROWN (#3B2213)                   */}
        {/* ========================================================= */}
        <aside className="w-full lg:w-[260px] xl:w-[280px] shrink-0 bg-[#3B2213] text-[#FAF7F2] p-6 sm:p-7 flex flex-col justify-between select-none">
          <div>
            {/* 1. Official Veloura Living Logo at Top */}
            <div className="mb-7 sm:mb-8 text-center flex flex-col items-center">
              <Link href="/" className="inline-block transition-transform duration-300 hover:scale-[1.02]">
                <div className="relative w-[150px] h-[75px] sm:w-[165px] sm:h-[82px]">
                  <Image
                    src="/images/veloura-exact-logo@2x.png"
                    alt="Veloura Living"
                    fill
                    priority
                    sizes="(max-width: 640px) 150px, 165px"
                    className="object-contain object-center brightness-0 invert opacity-95"
                  />
                </div>
              </Link>
            </div>

            {/* 2. Customer Profile Section: Avatar, Dynamic Name & Role */}
            <div
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-3.5 mb-7 sm:mb-8 p-2 rounded-2xl hover:bg-[#482D1B]/50 transition-colors cursor-pointer group"
              title="Click to view & edit profile"
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shrink-0 shadow-sm group-hover:border-white/40 transition-colors">
                <Image
                  src={customerAvatar}
                  alt={customerDisplayName}
                  fill
                  sizes="48px"
                  className="object-cover object-top"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-sans font-semibold text-base text-[#FAF7F2] truncate tracking-tight">
                  Hi, {customerFirstName}
                </div>
                <div className="font-sans text-xs text-[#BFAFA0] font-light mt-0.5">
                  Customer
                </div>
              </div>
            </div>

            {/* 3. Sidebar Navigation in Exact Order */}
            <nav className="space-y-1.5" aria-label="Customer dashboard navigation">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'orders', label: 'My Orders', icon: ShoppingBag },
                { id: 'wishlist', label: 'Wishlist', icon: Heart },
                { id: 'addresses', label: 'Addresses', icon: MapPin },
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'reviews', label: 'Reviews', icon: Star },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as DashboardTab);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-[#533520] text-[#FAF7F2] shadow-xs'
                        : 'text-[#D5C7B8] hover:text-[#FAF7F2] hover:bg-[#482D1B]/60'
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#FAF7F2]' : 'text-[#D5C7B8]'}`} />
                    <span>{item.label}</span>
                    {item.id === 'orders' && userOrders.length > 0 && (
                      <span className="ml-auto text-[11px] bg-[#482D1B] text-[#EADBCC] px-2 py-0.5 rounded-full font-medium">
                        {userOrders.length}
                      </span>
                    )}
                    {item.id === 'wishlist' && wishlist.length > 0 && (
                      <span className="ml-auto text-[11px] bg-[#482D1B] text-[#EADBCC] px-2 py-0.5 rounded-full font-medium">
                        {wishlist.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 4. Logout Link at Bottom */}
          <div className="pt-6 border-t border-white/10 mt-6">
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#D5C7B8] hover:text-[#FAF7F2] hover:bg-[#482D1B] transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* RIGHT MAIN SURFACE (#FAF7F2)                              */}
        {/* ========================================================= */}
        <main className="flex-1 bg-[#FAF7F2] p-5 sm:p-7 md:p-8 lg:p-9 flex flex-col justify-between space-y-6 lg:space-y-7 overflow-x-hidden">
          
          {/* Top Utility Header Bar */}
          <header className="flex items-center justify-between gap-4 pb-1">
            {/* Breadcrumb / Title on Mobile/Tablet */}
            <div className="lg:hidden font-serif font-semibold text-lg text-[#2B1810]">
              {activeTab === 'dashboard'
                ? 'Customer Dashboard'
                : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </div>

            {/* Top-Right Navigation Icons & Profile */}
            <div className="ml-auto flex items-center gap-3 sm:gap-4 md:gap-5 text-[#5C4535] relative">
              {/* Notification Icon */}
              <button
                onClick={openNotificationDrawer}
                className="relative p-2.5 text-[#5C4535] hover:text-[#2B1810] hover:bg-[#F2E8DC] rounded-full transition-colors cursor-pointer"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#A9794F] ring-2 ring-[#FAF7F2]" />
                )}
              </button>

              {/* Wishlist Icon */}
              <button
                onClick={() => setActiveTab('wishlist')}
                className="relative p-2.5 text-[#5C4535] hover:text-[#2B1810] hover:bg-[#F2E8DC] rounded-full transition-colors cursor-pointer"
                title="Wishlist"
                aria-label="View saved pieces"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 text-[10px] bg-[#3B2213] text-white w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Cart Icon */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 text-[#5C4535] hover:text-[#2B1810] hover:bg-[#F2E8DC] rounded-full transition-colors cursor-pointer"
                title="Shopping Cart"
                aria-label="View cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 text-[10px] bg-[#3B2213] text-white w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>

              {/* Profile Avatar & Greeting with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className="flex items-center gap-2.5 py-1 px-2 hover:bg-[#F2E8DC] rounded-full transition-colors cursor-pointer"
                  aria-expanded={accountDropdownOpen}
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#D5C7B8] shrink-0">
                    <Image
                      src={customerAvatar}
                      alt={customerDisplayName}
                      fill
                      sizes="32px"
                      className="object-cover object-top"
                    />
                  </div>
                  <span className="text-sm font-medium text-[#2B1810] hidden sm:inline">
                    Hi, {customerFirstName}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[#7A6757] transition-transform ${accountDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Account Dropdown Menu */}
                {accountDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#EADBCC] py-2 z-30 animate-fadeIn"
                    onMouseLeave={() => setAccountDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-[#F0E6D8] text-xs">
                      <div className="font-semibold text-[#2B1810] truncate">{customerDisplayName}</div>
                      <div className="text-[#8C7A6B] truncate">{user?.email}</div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setAccountDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#4A382C] hover:bg-[#F9F5F0] flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-[#8C7A6B]" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('orders');
                        setAccountDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#4A382C] hover:bg-[#F9F5F0] flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#8C7A6B]" />
                      <span>My Orders</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsSupportModalOpen(true);
                        setAccountDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#4A382C] hover:bg-[#F9F5F0] flex items-center gap-2"
                    >
                      <Headphones className="w-4 h-4 text-[#8C7A6B]" />
                      <span>Concierge Help</span>
                    </button>
                    <div className="border-t border-[#F0E6D8] my-1" />
                    <button
                      onClick={() => {
                        setAccountDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* ========================================================= */}
          {/* TAB 1: EXACT REFERENCE DASHBOARD VIEW                     */}
          {/* ========================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 lg:space-y-7 animate-fadeIn">
              
              {/* 1. Large Warm Living-Room Hero Banner */}
              <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm p-7 sm:p-9 md:p-11 min-h-[260px] sm:min-h-[290px] md:min-h-[310px] flex flex-col justify-between">
                {/* Background Image */}
                <Image
                  src={currentHero.image}
                  alt="Veloura Dream Space"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 1160px"
                  className="object-cover object-center transition-all duration-700"
                />

                {/* Ambient Contrast Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#21140D]/75 via-[#21140D]/40 to-transparent pointer-events-none" />

                {/* Editorial Heading & Subtitle */}
                <div className="relative z-10 max-w-xl">
                  <h1 className="font-serif text-3xl sm:text-4xl md:text-[42px] font-medium text-white leading-[1.12] drop-shadow-sm">
                    {currentHero.titleLine1} <br />
                    {currentHero.titleLine2}
                  </h1>
                  <p className="font-sans text-xs sm:text-sm md:text-base text-[#F5EFE6] font-light mt-2 drop-shadow-xs">
                    {currentHero.subtitle}
                  </p>
                </div>

                {/* Product Search Bar */}
                <div className="relative z-20 mt-6 sm:mt-8">
                  <form
                    onSubmit={handleHeroSearch}
                    className="w-full max-w-[620px] bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.16)] p-1.5 sm:p-2 flex items-center gap-2 border border-white/80"
                  >
                    <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#8C7A6B] ml-2 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search for products, categories..."
                      value={heroSearchQuery}
                      onChange={(e) => handleHeroSearchChange(e.target.value)}
                      className="flex-1 bg-transparent text-xs sm:text-sm text-[#2B1810] placeholder-[#8C7A6B] outline-none font-sans"
                    />
                    <button
                      type="submit"
                      className="p-2 sm:p-2.5 text-[#355B75] hover:text-[#21140D] hover:bg-[#F5EFE6] rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Search catalog"
                    >
                      <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </form>

                  {/* Search Autocomplete / Quick Results Dropdown */}
                  {isSearching && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 mt-2 w-full max-w-[620px] bg-white rounded-2xl shadow-2xl border border-[#EADBCC] p-3 z-30 space-y-1">
                      <div className="text-[11px] font-semibold text-[#8C7A6B] uppercase tracking-wider px-2 py-1">
                        Matching Pieces
                      </div>
                      {searchResults.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setIsSearching(false);
                            navigate(`/products/${item.slug}`);
                          }}
                          className="flex items-center gap-3 p-2 hover:bg-[#FAF7F2] rounded-xl cursor-pointer transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-[#F7F2EA] shrink-0">
                            <Image src={item.images?.[0] || '/images/products/sofa.jpg'} alt={item.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-[#2B1810] truncate">{item.name}</div>
                            <div className="text-[11px] text-[#8C7A6B]">{item.category} • ₹{Number(item.price).toLocaleString('en-IN')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Carousel Navigation Dots */}
                <div className="relative z-10 flex items-center justify-center gap-2 pt-4">
                  {heroSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setHeroSlide(idx)}
                      className={`transition-all duration-300 cursor-pointer ${
                        heroSlide === idx
                          ? 'w-6 h-1.5 bg-white rounded-full'
                          : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80 rounded-full'
                      }`}
                      aria-label={`Switch to hero slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </section>

              {/* 2. Four Statistic Cards */}
              <section
                ref={statsGridRef}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
                aria-label="Customer statistics"
              >
                {/* Stat 1: Total Orders */}
                <div
                  onClick={() => setActiveTab('orders')}
                  className="bg-[#FAF6F0] rounded-2xl p-4 sm:p-5 border border-[#EADBCC] flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#F4ECE1] border border-[#EADBCC] flex items-center justify-center shrink-0 group-hover:bg-[#EADBCC] transition-colors">
                    <Tag className="w-5 h-5 text-[#6D4C30]" />
                  </div>
                  <div>
                    <span className="text-xs text-[#7D6B5D] font-normal block leading-tight">
                      Total Orders
                    </span>
                    <span className="text-2xl sm:text-[28px] font-bold text-[#2B1810] leading-none mt-1 block">
                      {userOrders.length}
                    </span>
                  </div>
                </div>

                {/* Stat 2: Total Spent */}
                <div className="bg-[#FAF6F0] rounded-2xl p-4 sm:p-5 border border-[#EADBCC] flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="w-12 h-12 rounded-full bg-[#F4ECE1] border border-[#EADBCC] flex items-center justify-center shrink-0 font-serif text-lg font-bold text-[#6D4C30]">
                    ₹
                  </div>
                  <div>
                    <span className="text-xs text-[#7D6B5D] font-normal block leading-tight">
                      Total Spent
                    </span>
                    <span className="text-2xl sm:text-[28px] font-bold text-[#2B1810] leading-none mt-1 block">
                      ₹ {totalSpent.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Stat 3: Wishlist */}
                <div
                  onClick={() => setActiveTab('wishlist')}
                  className="bg-[#FAF6F0] rounded-2xl p-4 sm:p-5 border border-[#EADBCC] flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#F4ECE1] border border-[#EADBCC] flex items-center justify-center shrink-0 group-hover:bg-[#EADBCC] transition-colors">
                    <Heart className="w-5 h-5 text-[#6D4C30]" />
                  </div>
                  <div>
                    <span className="text-xs text-[#7D6B5D] font-normal block leading-tight">
                      Wishlist
                    </span>
                    <span className="text-2xl sm:text-[28px] font-bold text-[#2B1810] leading-none mt-1 block">
                      {wishlist.length}
                    </span>
                  </div>
                </div>

                {/* Stat 4: Active Products */}
                <div
                  onClick={() => navigate('/catalog')}
                  className="bg-[#FAF6F0] rounded-2xl p-4 sm:p-5 border border-[#EADBCC] flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer group"
                  title="View active catalog"
                >
                  <div className="w-12 h-12 rounded-full bg-[#F4ECE1] border border-[#EADBCC] flex items-center justify-center shrink-0 group-hover:bg-[#EADBCC] transition-colors">
                    <Package className="w-5 h-5 text-[#6D4C30]" />
                  </div>
                  <div>
                    <span className="text-xs text-[#7D6B5D] font-normal block leading-tight">
                      Active Products
                    </span>
                    <span className="text-2xl sm:text-[28px] font-bold text-[#2B1810] leading-none mt-1 block">
                      {allProducts.length}
                    </span>
                  </div>
                </div>
              </section>

              {/* 3. Bottom Grid: Recent Orders (Left) & Quick Actions (Right) */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
                
                {/* Recent Orders Section (~66% width) */}
                <div
                  ref={recentOrdersRef}
                  className="lg:col-span-8 bg-[#FAF6F0] rounded-2xl p-5 sm:p-6 border border-[#EADBCC] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-[#EADBCC]/80">
                      <h2 className="font-sans font-semibold text-base sm:text-lg text-[#2B1810]">
                        Recent Orders
                      </h2>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-xs sm:text-sm font-medium text-[#7D6B5D] hover:text-[#2B1810] transition-colors cursor-pointer flex items-center gap-1 group"
                      >
                        <span>View all</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>

                    {/* Table View */}
                    {isLoadingOrders ? (
                      <div className="py-12 text-center text-xs text-[#7D6B5D]">
                        <span className="inline-block w-5 h-5 border-2 border-[#55361F]/30 border-t-[#55361F] rounded-full animate-spin mb-2" />
                        <p>Loading recent orders…</p>
                      </div>
                    ) : userOrders.length === 0 ? (
                      <div className="py-10 text-center space-y-3">
                        <Package className="w-10 h-10 text-[#8C7A6B]/50 mx-auto" />
                        <p className="text-xs sm:text-sm text-[#7D6B5D]">
                          No recent orders placed yet. Curate your first bespoke space.
                        </p>
                        <button
                          onClick={() => navigate('/catalog')}
                          className="px-5 py-2.5 bg-[#3B2213] text-[#FAF7F2] rounded-xl text-xs font-medium cursor-pointer shadow-sm hover:bg-[#2B1810] transition-colors"
                        >
                          Explore Collection
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm">
                          <thead>
                            <tr className="text-[#8C7A6B] border-b border-[#EADBCC]/80 text-[11px] sm:text-xs font-medium">
                              <th className="py-3 font-medium">Order ID</th>
                              <th className="py-3 font-medium">Product</th>
                              <th className="py-3 font-medium">Amount</th>
                              <th className="py-3 font-medium">Status</th>
                              <th className="py-3 font-medium">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#EADBCC]/50">
                            {userOrders.slice(0, 4).map((order) => {
                              const orderIdDisplay = `#${order.orderNumber || order.id?.slice(0, 8)}`;
                              const productName = order.items?.[0]?.name || 'Veloura Piece';
                              const formattedAmount = `₹ ${Number(order.total || 0).toLocaleString('en-IN')}`;
                              const status = order.status || 'Delivered';

                              let badgeClass = 'bg-[#D8EADB] text-[#2D6A3F]';
                              if (status === 'PROCESSING' || status === 'PENDING') {
                                badgeClass = 'bg-[#FBEBD2] text-[#A66A1E]';
                              } else if (status === 'SHIPPED') {
                                badgeClass = 'bg-[#DDE9F8] text-[#295BAC]';
                              } else if (status === 'CANCELLED') {
                                badgeClass = 'bg-[#FDE8E8] text-[#9B1C1C]';
                              }

                              return (
                                <tr
                                  key={order.id}
                                  onClick={() => {
                                    setSelectedOrderIdForTracking(order.id);
                                    setIsTrackingModalOpen(true);
                                  }}
                                  className="hover:bg-white/60 transition-colors cursor-pointer group"
                                  title="Click to track order"
                                >
                                  <td className="py-3.5 font-semibold text-[#2B1810] group-hover:underline">
                                    {orderIdDisplay}
                                  </td>
                                  <td className="py-3.5 text-[#4A382C] font-normal truncate max-w-[150px]">
                                    {productName}
                                  </td>
                                  <td className="py-3.5 font-medium text-[#2B1810]">
                                    {formattedAmount}
                                  </td>
                                  <td className="py-3.5">
                                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium inline-block capitalize ${badgeClass}`}>
                                      {status.toLowerCase()}
                                    </span>
                                  </td>
                                  <td className="py-3.5 text-[#7D6B5D] text-[11px] sm:text-xs">
                                    {order.createdAt || '12 Apr 2025'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions Section (~34% width) */}
                <div
                  ref={quickActionsRef}
                  className="lg:col-span-4 bg-[#FAF6F0] rounded-2xl p-5 sm:p-6 border border-[#EADBCC] flex flex-col justify-between space-y-3.5"
                >
                  <h2 className="font-sans font-semibold text-base sm:text-lg text-[#2B1810] pb-2 border-b border-[#EADBCC]/80">
                    Quick Actions
                  </h2>

                  {/* 1. Track Order */}
                  <button
                    onClick={() => {
                      if (userOrders.length > 0) {
                        setSelectedOrderIdForTracking(userOrders[0].id);
                      }
                      setIsTrackingModalOpen(true);
                    }}
                    className="w-full p-3.5 bg-white rounded-xl border border-[#EADBCC] hover:bg-[#F5EFE6] hover:border-[#8C6D58] transition-all flex items-center gap-3.5 cursor-pointer text-left group shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#FAF6F0] border border-[#EADBCC] flex items-center justify-center text-[#6D4C30] shrink-0 group-hover:scale-105 transition-transform">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-[#2B1810] group-hover:text-[#55361F] transition-colors">
                      Track Order
                    </span>
                  </button>

                  {/* 2. Explore Collection */}
                  <button
                    onClick={() => navigate('/catalog')}
                    className="w-full p-3.5 bg-white rounded-xl border border-[#EADBCC] hover:bg-[#F5EFE6] hover:border-[#8C6D58] transition-all flex items-center gap-3.5 cursor-pointer text-left group shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#FAF6F0] border border-[#EADBCC] flex items-center justify-center text-[#6D4C30] shrink-0 group-hover:scale-105 transition-transform">
                      <LayoutGrid className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-[#2B1810] group-hover:text-[#55361F] transition-colors">
                      Explore Collection
                    </span>
                  </button>

                  {/* 3. Contact Support */}
                  <button
                    onClick={() => setIsSupportModalOpen(true)}
                    className="w-full p-3.5 bg-white rounded-xl border border-[#EADBCC] hover:bg-[#F5EFE6] hover:border-[#8C6D58] transition-all flex items-center gap-3.5 cursor-pointer text-left group shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#FAF6F0] border border-[#EADBCC] flex items-center justify-center text-[#6D4C30] shrink-0 group-hover:scale-105 transition-transform">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-[#2B1810] group-hover:text-[#55361F] transition-colors">
                      Contact Support
                    </span>
                  </button>

                  {/* 4. Manage Wishlist */}
                  <button
                    onClick={() => setActiveTab('wishlist')}
                    className="w-full p-3.5 bg-white rounded-xl border border-[#EADBCC] hover:bg-[#F5EFE6] hover:border-[#8C6D58] transition-all flex items-center gap-3.5 cursor-pointer text-left group shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#FAF6F0] border border-[#EADBCC] flex items-center justify-center text-[#6D4C30] shrink-0 group-hover:scale-105 transition-transform">
                      <Heart className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-[#2B1810] group-hover:text-[#55361F] transition-colors">
                      Manage Wishlist
                    </span>
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: MY ORDERS VIEW                                     */}
          {/* ========================================================= */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-[#EADBCC]">
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-[#2B1810]">
                    My White-Glove Orders ({userOrders.length})
                  </h2>
                  <p className="text-xs text-[#7D6B5D] mt-0.5">
                    Track freight telemetry, review architectural items, and access timber warranties.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="text-xs font-semibold text-[#55361F] hover:underline"
                >
                  ← Back to Dashboard
                </button>
              </div>

              {isLoadingOrders ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-[#EADBCC]">
                  <span className="inline-block w-6 h-6 border-2 border-[#55361F]/30 border-t-[#55361F] rounded-full animate-spin mb-3" />
                  <p className="text-xs text-[#7D6B5D]">Retrieving your private order vault…</p>
                </div>
              ) : userOrders.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-[#EADBCC] space-y-4">
                  <Package className="w-12 h-12 text-[#8C7A6B]/50 mx-auto" />
                  <h3 className="font-serif font-bold text-xl text-[#2B1810]">No orders placed yet</h3>
                  <p className="text-xs text-[#7D6B5D] max-w-sm mx-auto">
                    When you order bespoke furniture pieces, their live progress and delivery updates will appear here.
                  </p>
                  <button
                    onClick={() => navigate('/catalog')}
                    className="px-6 py-2.5 bg-[#3B2213] text-[#FAF7F2] rounded-xl text-xs font-semibold cursor-pointer shadow-md"
                  >
                    Discover The Collection
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {userOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EADBCC] space-y-5 shadow-2xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#F0E6D8]">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-serif font-bold text-lg text-[#2B1810]">
                              Order #{order.orderNumber || order.id?.slice(0, 8)}
                            </span>
                            <span className="bg-[#D8EADB] text-[#2D6A3F] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                              {order.status || 'Active'}
                            </span>
                          </div>
                          <p className="text-xs text-[#7D6B5D] mt-1">
                            Placed on {order.createdAt} • White-Glove Serviceable
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-serif font-bold text-xl text-[#3B2213]">
                            ₹{Number(order.total || 0).toLocaleString('en-IN')}
                          </div>
                          <button
                            onClick={() => {
                              setSelectedOrderIdForTracking(order.id);
                              setIsTrackingModalOpen(true);
                            }}
                            className="text-xs text-[#55361F] font-semibold hover:underline mt-1 inline-flex items-center gap-1"
                          >
                            <span>Track Freight</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {order.items?.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 rounded-2xl bg-[#FCFAF7] border border-[#F0E6D8]"
                          >
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-white shrink-0 relative border border-[#EADBCC]">
                              <Image
                                src={item.image || '/images/products/sofa.jpg'}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-serif font-bold text-xs text-[#2B1810] truncate">
                                {item.name}
                              </h4>
                              <p className="text-[11px] text-[#7D6B5D]">
                                Qty: {item.quantity} • ₹{Number(item.price || 0).toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: WISHLIST VIEW                                      */}
          {/* ========================================================= */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-[#EADBCC]">
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-[#2B1810]">
                    Saved Pieces & Space Palette ({wishlist.length})
                  </h2>
                  <p className="text-xs text-[#7D6B5D] mt-0.5">
                    Your considered architectural pieces saved for spatial curation.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="text-xs font-semibold text-[#55361F] hover:underline"
                >
                  ← Back to Dashboard
                </button>
              </div>

              {wishlistedProducts.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-[#EADBCC] space-y-4">
                  <Heart className="w-12 h-12 text-[#8C7A6B]/50 mx-auto" />
                  <h3 className="font-serif font-bold text-xl text-[#2B1810]">Your wishlist is currently empty</h3>
                  <p className="text-xs text-[#7D6B5D] max-w-sm mx-auto">
                    Save pieces while exploring rooms to build your tailored interior spatial palette.
                  </p>
                  <button
                    onClick={() => navigate('/catalog')}
                    className="px-6 py-2.5 bg-[#3B2213] text-[#FAF7F2] rounded-xl text-xs font-semibold cursor-pointer shadow-md"
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

          {/* ========================================================= */}
          {/* TAB 4: ADDRESSES VIEW                                     */}
          {/* ========================================================= */}
          {activeTab === 'addresses' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-[#EADBCC]">
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-[#2B1810]">
                    Delivery Destinations ({addresses.length})
                  </h2>
                  <p className="text-xs text-[#7D6B5D] mt-0.5">
                    Manage white-glove delivery destinations and primary residences.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsAddingAddress(!isAddingAddress)}
                    className="py-2 px-4 bg-[#3B2213] text-[#FAF7F2] rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-[#2B1810] transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Destination</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="text-xs font-semibold text-[#55361F] hover:underline"
                  >
                    ← Back to Dashboard
                  </button>
                </div>
              </div>

              {isAddingAddress && (
                <form
                  onSubmit={handleCreateAddress}
                  className="bg-white rounded-3xl p-6 border border-[#8C6D58]/40 shadow-sm space-y-4"
                >
                  <h4 className="font-serif font-bold text-base text-[#2B1810]">New Delivery Destination</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#7D6B5D] mb-1 font-medium">Full Name</label>
                      <input
                        type="text"
                        required
                        value={newFullName}
                        onChange={(e) => setNewFullName(e.target.value)}
                        placeholder="Priya Sharma"
                        className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#EADBCC] rounded-xl text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#7D6B5D] mb-1 font-medium">Phone</label>
                      <input
                        type="tel"
                        required
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="+91 98200 00000"
                        className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#EADBCC] rounded-xl text-xs outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] uppercase tracking-wider text-[#7D6B5D] mb-1 font-medium">Address Line 1</label>
                      <input
                        type="text"
                        required
                        value={newAddressLine1}
                        onChange={(e) => setNewAddressLine1(e.target.value)}
                        placeholder="Penthouse 42B, The Imperial Towers"
                        className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#EADBCC] rounded-xl text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#7D6B5D] mb-1 font-medium">City</label>
                      <input
                        type="text"
                        required
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        placeholder="Mumbai"
                        className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#EADBCC] rounded-xl text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#7D6B5D] mb-1 font-medium">Postal Code (PIN)</label>
                      <input
                        type="text"
                        required
                        value={newPostalCode}
                        onChange={(e) => setNewPostalCode(e.target.value)}
                        placeholder="400034"
                        className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#EADBCC] rounded-xl text-xs outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="py-2.5 px-5 bg-[#3B2213] text-white rounded-xl text-xs font-semibold hover:bg-[#2B1810] transition-colors"
                    >
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(false)}
                      className="py-2.5 px-5 border border-[#EADBCC] text-[#5C4535] rounded-xl text-xs hover:bg-[#F5EFE6] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {addresses.map((addr) => (
                  <div key={addr.id} className="bg-white rounded-3xl p-6 border border-[#EADBCC] shadow-2xs space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="bg-[#EADBCC] text-[#3B2213] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                        {addr.is_default_shipping ? 'Primary Residence' : 'Secondary Residence'}
                      </span>
                      <button
                        onClick={() => removeAddress(addr.id)}
                        className="text-red-500 hover:text-red-700 p-1 transition-colors cursor-pointer"
                        title="Remove address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="font-serif font-bold text-lg text-[#2B1810]">
                      {addr.full_name}
                    </h3>
                    <p className="text-xs text-[#7D6B5D] leading-relaxed">
                      {addr.address_line1} {addr.address_line2 ? `, ${addr.address_line2}` : ''}<br />
                      {addr.city}, {addr.state} — {addr.postal_code}<br />
                      Phone: {addr.phone}
                    </p>
                    <div className="text-[11px] text-[#2D6A3F] font-semibold pt-2 border-t border-[#F0E6D8] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Freight Serviceable
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: PROFILE VIEW                                       */}
          {/* ========================================================= */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fadeIn max-w-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-[#EADBCC]">
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-[#2B1810]">
                    Personal Concierge Profile
                  </h2>
                  <p className="text-xs text-[#7D6B5D] mt-0.5">
                    Update your registered customer identity and contact preferences.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="text-xs font-semibold text-[#55361F] hover:underline"
                >
                  ← Back to Dashboard
                </button>
              </div>

              {profileSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleProfileSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCC] space-y-5 shadow-2xs">
                <div className="flex items-center gap-4 pb-4 border-b border-[#F0E6D8]">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#EADBCC]">
                    <Image src={customerAvatar} alt={customerDisplayName} fill className="object-cover object-top" />
                  </div>
                  <div>
                    <div className="font-serif font-bold text-lg text-[#2B1810]">{customerDisplayName}</div>
                    <div className="text-xs text-[#7D6B5D]">{user?.email} • Verified Customer</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#7D6B5D] font-medium mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#EADBCC] rounded-xl text-xs outline-none font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#7D6B5D] font-medium mb-1">Last Name</label>
                    <input
                      type="text"
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#EADBCC] rounded-xl text-xs outline-none font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#7D6B5D] font-medium mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+91 98200 00000"
                      className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#EADBCC] rounded-xl text-xs outline-none font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#7D6B5D] font-medium mb-1">Interior Style Preference</label>
                    <select
                      value={editStyle}
                      onChange={(e) => setEditStyle(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#EADBCC] rounded-xl text-xs outline-none font-sans text-[#2B1810]"
                    >
                      <option value="Warm Minimalist">Warm Minimalist</option>
                      <option value="Organic Modern">Organic Modern</option>
                      <option value="Mid-Century Architectural">Mid-Century Architectural</option>
                      <option value="Contemporary Atelier">Contemporary Atelier</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-[#7D6B5D]">
                    Changes reflect immediately across the dashboard greetings.
                  </span>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-6 py-2.5 bg-[#3B2213] hover:bg-[#2B1810] text-[#FAF7F2] rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-sm disabled:opacity-75"
                  >
                    {isSavingProfile ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: REVIEWS VIEW                                       */}
          {/* ========================================================= */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-[#EADBCC]">
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-[#2B1810]">
                    My Curated Reviews & Feedback
                  </h2>
                  <p className="text-xs text-[#7D6B5D] mt-0.5">
                    Share craftsmanship reviews for pieces commissioned for your residence.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="text-xs font-semibold text-[#55361F] hover:underline"
                >
                  ← Back to Dashboard
                </button>
              </div>

              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCC] space-y-4 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="flex text-amber-400">
                    {'★'.repeat(5)}
                  </div>
                  <span className="text-xs font-semibold text-[#2B1810]">Aurelia Solid Oak Dining Table</span>
                  <span className="text-[11px] text-[#7D6B5D]">• Verified White-Glove Commission</span>
                </div>
                <p className="text-xs text-[#5C4535] leading-relaxed">
                  “The grain on the solid American Oak is magnificent in afternoon daylight. Delivery was punctual, unpackaged with extreme care, and assembled seamlessly in our dining pavilion.”
                </p>
                <div className="text-[11px] text-[#8C7A6B]">Reviewed on 12 April 2025 by {customerDisplayName}</div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 7: SETTINGS VIEW                                      */}
          {/* ========================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fadeIn max-w-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-[#EADBCC]">
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-[#2B1810]">
                    Account Security & Settings
                  </h2>
                  <p className="text-xs text-[#7D6B5D] mt-0.5">
                    Manage session credentials, notifications, and customer privacy.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="text-xs font-semibold text-[#55361F] hover:underline"
                >
                  ← Back to Dashboard
                </button>
              </div>

              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCC] space-y-6 shadow-2xs">
                {/* Password Section */}
                <div className="space-y-3 pb-6 border-b border-[#F0E6D8]">
                  <h3 className="font-serif font-bold text-lg text-[#2B1810]">Password & Security</h3>
                  <p className="text-xs text-[#7D6B5D]">
                    We enforce mandatory OTP verification on login and registration to ensure the highest standard of patron security.
                  </p>
                  {passwordResetSent ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
                      ✓ Security verification link sent to {user?.email}. Check your inbox.
                    </div>
                  ) : (
                    <button
                      onClick={handleRequestPasswordReset}
                      className="px-4 py-2.5 bg-[#FAF7F2] border border-[#EADBCC] text-[#2B1810] rounded-xl text-xs font-semibold hover:bg-[#F2E8DC] transition-colors cursor-pointer"
                    >
                      Request Password Reset Email
                    </button>
                  )}
                </div>

                {/* Notifications Preference */}
                <div className="space-y-3 pb-6 border-b border-[#F0E6D8]">
                  <h3 className="font-serif font-bold text-lg text-[#2B1810]">Concierge Communications</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 text-xs text-[#4A382C] cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-[#3B2213]" />
                      <span>Email updates on delivery milestones and freight tracking</span>
                    </label>
                    <label className="flex items-center gap-3 text-xs text-[#4A382C] cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-[#3B2213]" />
                      <span>Invitations to private showroom previews and seasonal collections</span>
                    </label>
                  </div>
                </div>

                {/* Session Sign Out */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-[#7D6B5D]">
                    Active Session: {user?.email}
                  </span>
                  <button
                    onClick={() => logout()}
                    className="px-4 py-2 border border-red-200 text-red-700 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Sign Out All Devices
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ========================================================= */}
      {/* INTERACTIVE MODALS                                        */}
      {/* ========================================================= */}

      {/* 1. White-Glove Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        orders={userOrders}
        initialOrderId={selectedOrderIdForTracking}
      />

      {/* 2. Concierge Support Modal */}
      <ConciergeSupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        customerName={customerFirstName}
      />
    </div>
  );
};
