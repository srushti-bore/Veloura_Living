'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sparkles,
  Search,
  Heart,
  ShoppingBag,
  User,
  Bell,
  ChevronDown,
  Menu,
  X,
  Briefcase,
  ShieldCheck,
  Tag,
  Box,
  Layers,
  Eye,
  ArrowRight,
  Sofa,
  Bed,
  UtensilsCrossed,
  BriefcaseBusiness,
  LayoutGrid,
  Download,
  SlidersHorizontal,
  LogOut,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { useStore } from '@/providers/AppProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useNotifications } from '@/providers/NotificationProvider';
import { usePWA } from '@/providers/PWAProvider';
import { CurrencySelector } from '@/components/common/CurrencySelector';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  // Global App State Hooks
  const {
    cartCount,
    setIsCartOpen,
    wishlist,
    setIsAIOpen,
    searchQuery,
    setSearchQuery
  } = useStore();

  const {
    user,
    isAuthenticated,
    isAdmin,
    isManager,
    openAuthModal,
    logout
  } = useAuth();

  const { unreadCount, toggleDrawer: toggleNotifications } = useNotifications();
  const { isInstallable, promptInstall } = usePWA();

  // Local Header UI State
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'rooms' | 'studio' | null>(null);
  const [mobileExpandedSection, setMobileExpandedSection] = useState<'rooms' | 'studio' | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll detection for sticky header transformation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsAccountMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Click outside to close account menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dropdown hover helpers with debounce
  const handleMouseEnter = (menu: 'rooms' | 'studio') => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const isRoomsActive = pathname.startsWith('/rooms');
  const isStudioActive = pathname.startsWith('/studio') || pathname.startsWith('/configurator');
  const isCheckout = pathname?.startsWith('/checkout');

  return (
    <header className="w-full z-40 sticky top-0 transition-all duration-300 font-sans">
      {/* ========================================================================= */}
      {/* 1. TOP UTILITY / ANNOUNCEMENT BAR                                         */}
      {/* ========================================================================= */}
      {!isCheckout && (
        <div className="bg-[#150E0A] text-[#D8B486]/85 border-b border-[#3D271D]/40 text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 transition-colors">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Left: Warranty / Guarantee Badge */}
            <div className="flex items-center gap-2 text-[#E8D8C5]/90">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D8B486] shrink-0" />
              <span className="hidden sm:inline font-medium tracking-wide">
                10-Year Generational Warranty & White-Glove Installation
              </span>
              <span className="sm:hidden font-medium">10-Yr Warranty & In-Home Assembly</span>
            </div>

            {/* Center: Privilege Code Promo (Desktop) */}
            <div className="hidden lg:flex items-center gap-2 text-[#D8B486]">
              <Tag className="w-3 h-3 text-[#D8B486] shrink-0" />
              <span className="tracking-wider">
                Complimentary Assembly on All Orders | Code: <strong className="text-[#FAF7F2] font-semibold">LUXE10</strong>
              </span>
            </div>

            {/* Right: Currency Selector, Install App & Trade Portal */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              {/* Currency Selector */}
              <CurrencySelector minimal={true} />

              {/* PWA Install Button */}
              {isInstallable && (
                <button
                  type="button"
                  onClick={promptInstall}
                  className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#D8B486]/15 hover:bg-[#D8B486]/25 border border-[#D8B486]/30 text-[#D8B486] text-[10px] tracking-wider uppercase font-medium transition-all"
                  title="Install Veloura Living App"
                >
                  <Download className="w-3 h-3" />
                  <span>Install App</span>
                </button>
              )}

              {/* Trade Portal Link (Moved to Utility Bar per Specification) */}
              <Link
                href="/trade"
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold transition-all ${
                  pathname.startsWith('/trade')
                    ? 'bg-[#D8B486] text-[#1C140E]'
                    : 'text-[#D8B486] hover:text-[#FAF7F2] hover:bg-[#2A1A12]/60 border border-[#8B5A2B]/30'
                }`}
              >
                <Briefcase className="w-3 h-3 text-current" />
                <span>Trade Portal</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MAIN NAVIGATION HEADER                                                 */}
      {/* ========================================================================= */}
      <div
        className={`w-full transition-all duration-300 ${
          isCheckout
            ? 'bg-[#F4ECE1] border-b border-[#D9CBC0]/60 py-4'
            : isScrolled
            ? 'bg-[#150E0A]/95 backdrop-blur-md shadow-2xl border-b border-[#3D271D]/50 py-3'
            : 'bg-[#1C140E]/90 backdrop-blur-sm border-b border-[#3D271D]/30 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* ----------------------------------------------------------------- */}
            {/* LEFT: VELOURA BRAND LOGO                                         */}
            {/* ----------------------------------------------------------------- */}
            <div className="flex items-center gap-3">
              {/* Mobile Hamburger Toggle */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-2 -ml-2 focus:outline-none transition-colors ${
                  isCheckout ? 'text-[#2B1810]' : 'text-[#E8D8C5] hover:text-[#D8B486]'
                }`}
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <Link href="/" className="group flex flex-col focus:outline-none">
                <span
                  className={`font-serif text-xl sm:text-2xl lg:text-2xl tracking-[0.2em] font-light transition-colors ${
                    isCheckout
                      ? 'text-[#2B1810] group-hover:text-[#3B2314]'
                      : 'text-[#FAF7F2] group-hover:text-[#D8B486]'
                  }`}
                >
                  VELOURA
                </span>
                <span
                  className={`text-[9px] uppercase tracking-[0.3em] -mt-1 font-sans font-light ${
                    isCheckout ? 'text-[#7A6B60]' : 'text-[#D8B486]/80'
                  }`}
                >
                  LIVING
                </span>
              </Link>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* CENTER: PRIMARY NAVIGATION (Desktop)                              */}
            {/* ----------------------------------------------------------------- */}
            <nav
              className={`hidden lg:flex items-center gap-1 xl:gap-3 ${
                isCheckout
                  ? 'text-[13px] font-sans text-[#2B1810]'
                  : 'text-[12px] uppercase tracking-[0.18em] font-medium text-[#E8D8C5]'
              }`}
            >
              {/* 1. HOME */}
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-md transition-all duration-200 ${
                  pathname === '/'
                    ? isCheckout
                      ? 'text-[#2B1810] font-semibold bg-[#EFE7DD]'
                      : 'text-[#D8B486] font-semibold bg-[#2A1A12]/40'
                    : isCheckout
                    ? 'hover:text-[#2B1810] hover:bg-[#EFE7DD]'
                    : 'hover:text-[#FAF7F2] hover:bg-[#2A1A12]/30'
                }`}
              >
                Home
              </Link>

              {/* 2. ROOMS (Dropdown) */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter('rooms')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'rooms' ? null : 'rooms')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all duration-200 ${
                    isRoomsActive || activeDropdown === 'rooms'
                      ? isCheckout
                        ? 'text-[#2B1810] font-semibold bg-[#EFE7DD]'
                        : 'text-[#D8B486] font-semibold bg-[#2A1A12]/40'
                      : isCheckout
                      ? 'hover:text-[#2B1810] hover:bg-[#EFE7DD]'
                      : 'hover:text-[#FAF7F2] hover:bg-[#2A1A12]/30'
                  }`}
                  aria-expanded={activeDropdown === 'rooms'}
                >
                  <span>Rooms</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeDropdown === 'rooms'
                        ? isCheckout ? 'rotate-180 text-[#2B1810]' : 'rotate-180 text-[#D8B486]'
                        : isCheckout ? 'text-[#7A6B60]' : 'text-[#B9AA99]'
                    }`}
                  />
                </button>

                {/* Rooms Dropdown Menu */}
                {activeDropdown === 'rooms' && (
                  <div className="absolute top-full left-0 mt-2 w-72 rounded-xl bg-[#1C140E]/98 border border-[#3D271D] shadow-2xl backdrop-blur-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2 border-b border-[#3D271D]/40 mb-1">
                      <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8B486] font-semibold">
                        Curated Spaces
                      </span>
                    </div>

                    <Link
                      href="/rooms"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#FAF7F2] hover:bg-[#2A1A12] hover:text-[#D8B486] transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-md bg-[#2A1A12] border border-[#3D271D] flex items-center justify-center text-[#D8B486] group-hover:border-[#D8B486]/40 transition-colors">
                        <LayoutGrid className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold normal-case tracking-normal">All Living Spaces</div>
                        <div className="text-[11px] text-[#B9AA99] normal-case tracking-normal font-normal">
                          Explore all curated room collections
                        </div>
                      </div>
                    </Link>

                    <Link
                      href="/rooms/living-room"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#FAF7F2] hover:bg-[#2A1A12] hover:text-[#D8B486] transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-md bg-[#2A1A12] border border-[#3D271D] flex items-center justify-center text-[#D8B486] group-hover:border-[#D8B486]/40 transition-colors">
                        <Sofa className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold normal-case tracking-normal">Living Room</div>
                        <div className="text-[11px] text-[#B9AA99] normal-case tracking-normal font-normal">
                          Sculptural seating & modular lounge
                        </div>
                      </div>
                    </Link>

                    <Link
                      href="/rooms/bedroom"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#FAF7F2] hover:bg-[#2A1A12] hover:text-[#D8B486] transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-md bg-[#2A1A12] border border-[#3D271D] flex items-center justify-center text-[#D8B486] group-hover:border-[#D8B486]/40 transition-colors">
                        <Bed className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold normal-case tracking-normal">Bedroom Sanctuary</div>
                        <div className="text-[11px] text-[#B9AA99] normal-case tracking-normal font-normal">
                          Platform beds & quiet linen textures
                        </div>
                      </div>
                    </Link>

                    <Link
                      href="/rooms/dining-room"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#FAF7F2] hover:bg-[#2A1A12] hover:text-[#D8B486] transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-md bg-[#2A1A12] border border-[#3D271D] flex items-center justify-center text-[#D8B486] group-hover:border-[#D8B486]/40 transition-colors">
                        <UtensilsCrossed className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold normal-case tracking-normal">Dining & Gathering</div>
                        <div className="text-[11px] text-[#B9AA99] normal-case tracking-normal font-normal">
                          Solid timber tables & dining chairs
                        </div>
                      </div>
                    </Link>

                    <Link
                      href="/rooms/home-office"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#FAF7F2] hover:bg-[#2A1A12] hover:text-[#D8B486] transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-md bg-[#2A1A12] border border-[#3D271D] flex items-center justify-center text-[#D8B486] group-hover:border-[#D8B486]/40 transition-colors">
                        <BriefcaseBusiness className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold normal-case tracking-normal">Home Office & Study</div>
                        <div className="text-[11px] text-[#B9AA99] normal-case tracking-normal font-normal">
                          Architectural desks & executive seating
                        </div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* 3. SHOP */}
              <Link
                href="/shop"
                className={`px-3 py-1.5 rounded-md transition-all duration-200 ${
                  pathname.startsWith('/shop') || pathname.startsWith('/products')
                    ? isCheckout
                      ? 'text-[#2B1810] font-semibold bg-[#EFE7DD]'
                      : 'text-[#D8B486] font-semibold bg-[#2A1A12]/40'
                    : isCheckout
                    ? 'hover:text-[#2B1810] hover:bg-[#EFE7DD]'
                    : 'hover:text-[#FAF7F2] hover:bg-[#2A1A12]/30'
                }`}
              >
                Shop
              </Link>

              {/* 4. STUDIO (Consolidated Dropdown: 2D + 3D + AR) - Hidden on Checkout */}
              {!isCheckout && (
                <div
                  className="relative"
                  onMouseEnter={() => handleMouseEnter('studio')}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(activeDropdown === 'studio' ? null : 'studio')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all duration-200 ${
                      isStudioActive || activeDropdown === 'studio'
                        ? 'text-[#D8B486] font-semibold bg-[#2A1A12]/40'
                        : 'hover:text-[#FAF7F2] hover:bg-[#2A1A12]/30'
                    }`}
                    aria-expanded={activeDropdown === 'studio'}
                  >
                    <span>Studio</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        activeDropdown === 'studio' ? 'rotate-180 text-[#D8B486]' : 'text-[#B9AA99]'
                      }`}
                    />
                  </button>

                  {/* Studio Dropdown Menu */}
                  {activeDropdown === 'studio' && (
                    <div className="absolute top-full left-0 mt-2 w-80 rounded-xl bg-[#1C140E]/98 border border-[#3D271D] shadow-2xl backdrop-blur-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-3 py-2 border-b border-[#3D271D]/40 mb-1">
                        <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8B486] font-semibold">
                          Spatial Design Suite
                        </span>
                      </div>

                      {/* 2D Room Planner */}
                      <Link
                        href="/studio"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#FAF7F2] hover:bg-[#2A1A12] hover:text-[#D8B486] transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-md bg-[#2A1A12] border border-[#3D271D] flex items-center justify-center text-[#D8B486] group-hover:border-[#D8B486]/40 transition-colors">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold normal-case tracking-normal">2D Room Planner</div>
                          <div className="text-[11px] text-[#B9AA99] normal-case tracking-normal font-normal">
                            Plan and arrange floor plan & layouts
                          </div>
                        </div>
                      </Link>

                      {/* Interactive 3D Studio */}
                      <Link
                        href="/configurator"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#FAF7F2] hover:bg-[#2A1A12] hover:text-[#D8B486] transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-md bg-[#2A1A12] border border-[#3D271D] flex items-center justify-center text-[#D8B486] group-hover:border-[#D8B486]/40 transition-colors">
                          <Box className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold normal-case tracking-normal">Interactive 3D Studio</div>
                          <div className="text-[11px] text-[#B9AA99] normal-case tracking-normal font-normal">
                            Visualize & customize pieces in 3D
                          </div>
                        </div>
                      </Link>

                      {/* AR Spatial Preview */}
                      <Link
                        href="/configurator"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#FAF7F2] hover:bg-[#2A1A12] hover:text-[#D8B486] transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-md bg-[#2A1A12] border border-[#3D271D] flex items-center justify-center text-[#D8B486] group-hover:border-[#D8B486]/40 transition-colors">
                          <Eye className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold normal-case tracking-normal flex items-center gap-1.5">
                            <span>AR Spatial Preview</span>
                            <span className="text-[9px] px-1.5 py-0.2 bg-[#D8B486]/20 text-[#D8B486] rounded-full uppercase tracking-wider font-semibold">
                              Live AR
                            </span>
                          </div>
                          <div className="text-[11px] text-[#B9AA99] normal-case tracking-normal font-normal">
                            Preview true-to-scale pieces in your room
                          </div>
                        </div>
                      </Link>

                      {/* Bottom Action Footer */}
                      <div className="mt-1 pt-2 border-t border-[#3D271D]/40 px-3">
                        <Link
                          href="/studio"
                          className="flex items-center justify-between text-xs text-[#D8B486] hover:text-[#FAF7F2] transition-colors py-1 normal-case font-medium"
                        >
                          <span>Explore Studio Suite</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 5. COLLECTIONS */}
              <Link
                href="/collections"
                className={`px-3 py-1.5 rounded-md transition-all duration-200 ${
                  pathname.startsWith('/collections')
                    ? isCheckout
                      ? 'text-[#2B1810] font-semibold bg-[#EFE7DD]'
                      : 'text-[#D8B486] font-semibold bg-[#2A1A12]/40'
                    : isCheckout
                    ? 'hover:text-[#2B1810] hover:bg-[#EFE7DD]'
                    : 'hover:text-[#FAF7F2] hover:bg-[#2A1A12]/30'
                }`}
              >
                Collections
              </Link>

              {/* 6. JOURNAL */}
              <Link
                href="/journal"
                className={`px-3 py-1.5 rounded-md transition-all duration-200 ${
                  pathname.startsWith('/journal')
                    ? isCheckout
                      ? 'text-[#2B1810] font-semibold bg-[#EFE7DD]'
                      : 'text-[#D8B486] font-semibold bg-[#2A1A12]/40'
                    : isCheckout
                    ? 'hover:text-[#2B1810] hover:bg-[#EFE7DD]'
                    : 'hover:text-[#FAF7F2] hover:bg-[#2A1A12]/30'
                }`}
              >
                Journal
              </Link>
            </nav>

            {/* ----------------------------------------------------------------- */}
            {/* RIGHT: CUSTOMER ACTIONS                                           */}
            {/* ----------------------------------------------------------------- */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Search Toggle / Input */}
              <div className="relative">
                {isSearchOpen ? (
                  <form
                    onSubmit={handleSearchSubmit}
                    className="flex items-center bg-[#2A1A12] border border-[#8B5A2B]/40 rounded-full px-2.5 py-1 text-xs shadow-inner animate-in fade-in zoom-in-95 duration-150"
                  >
                    <Search className="w-3.5 h-3.5 text-[#D8B486] mr-1.5 shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search furniture, styles, timber..."
                      className="bg-transparent text-xs text-[#FAF7F2] placeholder-[#B9AA99]/60 focus:outline-none w-36 sm:w-48 md:w-56"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setIsSearchOpen(false)}
                      className="text-[#B9AA99] hover:text-[#FAF7F2] p-0.5 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(true);
                      setTimeout(() => searchInputRef.current?.focus(), 50);
                    }}
                    className={`p-2 rounded-full transition-colors ${
                      isCheckout ? 'text-[#2B1810] hover:bg-[#EFE7DD]' : 'text-[#E8D8C5] hover:text-[#D8B486] hover:bg-[#2A1A12]/40'
                    }`}
                    aria-label="Search Catalog"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Wishlist Link */}
              <Link
                href="/account?tab=wishlist"
                className={`relative p-2 rounded-full transition-colors ${
                  isCheckout ? 'text-[#2B1810] hover:bg-[#EFE7DD]' : 'text-[#E8D8C5] hover:text-[#D8B486] hover:bg-[#2A1A12]/40'
                }`}
                aria-label="View Wishlist"
              >
                <Heart className="w-4 h-4" />
                {wishlist.length > 0 && (
                  <span className="absolute 0 top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#D8B486] text-[#1C140E] text-[10px] font-bold flex items-center justify-center shadow">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* User Account / Auth Dropdown */}
              <div className="relative" ref={accountMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    if (isAuthenticated) {
                      setIsAccountMenuOpen(!isAccountMenuOpen);
                    } else {
                      openAuthModal('signin');
                    }
                  }}
                  className={`p-2 rounded-full transition-colors flex items-center gap-1 ${
                    isCheckout ? 'text-[#2B1810] hover:bg-[#EFE7DD]' : 'text-[#E8D8C5] hover:text-[#D8B486] hover:bg-[#2A1A12]/40'
                  }`}
                  aria-label="Account Settings"
                >
                  <User className="w-4 h-4" />
                </button>

                {/* Account Menu Popover */}
                {isAccountMenuOpen && isAuthenticated && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-[#1C140E]/98 border border-[#3D271D] shadow-2xl backdrop-blur-xl p-2 z-50 animate-in fade-in duration-150 text-xs">
                    <div className="px-3 py-2 border-b border-[#3D271D]/40 mb-1">
                      <div className="font-medium text-[#FAF7F2] truncate">{user?.email}</div>
                      <div className="text-[10px] text-[#D8B486] capitalize font-serif tracking-wider">
                        {user?.roles?.[0] || 'Valued Collector'}
                      </div>
                    </div>

                    <Link
                      href="/account"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#FAF7F2] hover:bg-[#2A1A12] hover:text-[#D8B486] transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-[#D8B486]" />
                      <span>My Profile &amp; Spaces</span>
                    </Link>

                    <Link
                      href="/account?tab=orders"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#FAF7F2] hover:bg-[#2A1A12] hover:text-[#D8B486] transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5 text-[#D8B486]" />
                      <span>Orders &amp; Logistics</span>
                    </Link>

                    {/* Admin Console Access for Staff/Admins */}
                    {(isAdmin || isManager) && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#D8B486] bg-[#2A1A12]/60 hover:bg-[#2A1A12] font-medium transition-colors border border-[#8B5A2B]/20 my-1"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-[#D8B486]" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <div className="pt-1 border-t border-[#3D271D]/40 mt-1">
                      <button
                        type="button"
                        onClick={async () => {
                          await logout();
                          setIsAccountMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#FAF7F2]/70 hover:bg-[#2A1A12] hover:text-red-300 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Shopping Cart Button */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className={`p-2 rounded-full transition-colors flex items-center gap-1 ${
                  isCheckout ? 'text-[#2B1810] hover:bg-[#EFE7DD]' : 'text-[#E8D8C5] hover:text-[#D8B486] hover:bg-[#2A1A12]/40'
                }`}
                aria-label={`Cart with ${cartCount} items`}
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.2 min-w-[18px] text-center ${
                    isCheckout ? 'bg-[#3B2314] text-[#F5EFE6]' : 'bg-[#D8B486] text-[#1C140E]'
                  }`}>
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MOBILE & TABLET NAVIGATION DRAWER                                      */}
      {/* ========================================================================= */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[88px] sm:top-[96px] bg-[#150E0A]/98 backdrop-blur-2xl z-50 border-t border-[#3D271D]/60 overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-6 py-6 space-y-6 max-w-lg mx-auto">
            {/* Primary Mobile Navigation Links */}
            <div className="space-y-1 text-sm tracking-wider uppercase font-medium">
              {/* Home */}
              <Link
                href="/"
                className={`block py-3 px-4 rounded-xl transition-colors ${
                  pathname === '/' ? 'bg-[#2A1A12] text-[#D8B486] font-semibold' : 'text-[#FAF7F2] hover:bg-[#2A1A12]/50'
                }`}
              >
                Home
              </Link>

              {/* Rooms Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobileExpandedSection(mobileExpandedSection === 'rooms' ? null : 'rooms')}
                  className="w-full flex items-center justify-between py-3 px-4 rounded-xl text-[#FAF7F2] hover:bg-[#2A1A12]/50 transition-colors"
                >
                  <span className={isRoomsActive ? 'text-[#D8B486] font-semibold' : ''}>Rooms</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      mobileExpandedSection === 'rooms' ? 'rotate-180 text-[#D8B486]' : 'text-[#B9AA99]'
                    }`}
                  />
                </button>

                {mobileExpandedSection === 'rooms' && (
                  <div className="pl-6 pr-2 py-2 space-y-2 border-l border-[#8B5A2B]/20 ml-4 my-1">
                    <Link
                      href="/rooms"
                      className="block py-2 text-xs text-[#FAF7F2] hover:text-[#D8B486] normal-case"
                    >
                      All Living Spaces
                    </Link>
                    <Link
                      href="/rooms/living-room"
                      className="block py-2 text-xs text-[#FAF7F2] hover:text-[#D8B486] normal-case"
                    >
                      Living Room
                    </Link>
                    <Link
                      href="/rooms/bedroom"
                      className="block py-2 text-xs text-[#FAF7F2] hover:text-[#D8B486] normal-case"
                    >
                      Bedroom Sanctuary
                    </Link>
                    <Link
                      href="/rooms/dining-room"
                      className="block py-2 text-xs text-[#FAF7F2] hover:text-[#D8B486] normal-case"
                    >
                      Dining & Gathering
                    </Link>
                    <Link
                      href="/rooms/home-office"
                      className="block py-2 text-xs text-[#FAF7F2] hover:text-[#D8B486] normal-case"
                    >
                      Home Office & Study
                    </Link>
                  </div>
                )}
              </div>

              {/* Shop */}
              <Link
                href="/shop"
                className={`block py-3 px-4 rounded-xl transition-colors ${
                  pathname.startsWith('/shop') ? 'bg-[#2A1A12] text-[#D8B486] font-semibold' : 'text-[#FAF7F2] hover:bg-[#2A1A12]/50'
                }`}
              >
                Shop
              </Link>

              {/* Studio Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobileExpandedSection(mobileExpandedSection === 'studio' ? null : 'studio')}
                  className="w-full flex items-center justify-between py-3 px-4 rounded-xl text-[#FAF7F2] hover:bg-[#2A1A12]/50 transition-colors"
                >
                  <span className={isStudioActive ? 'text-[#D8B486] font-semibold' : ''}>Studio</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      mobileExpandedSection === 'studio' ? 'rotate-180 text-[#D8B486]' : 'text-[#B9AA99]'
                    }`}
                  />
                </button>

                {mobileExpandedSection === 'studio' && (
                  <div className="pl-6 pr-2 py-2 space-y-2 border-l border-[#8B5A2B]/20 ml-4 my-1">
                    <Link
                      href="/studio"
                      className="block py-2 text-xs text-[#FAF7F2] hover:text-[#D8B486] normal-case"
                    >
                      2D Room Planner
                    </Link>
                    <Link
                      href="/configurator"
                      className="block py-2 text-xs text-[#FAF7F2] hover:text-[#D8B486] normal-case"
                    >
                      Interactive 3D Studio
                    </Link>
                    <Link
                      href="/configurator"
                      className="block py-2 text-xs text-[#FAF7F2] hover:text-[#D8B486] normal-case flex items-center justify-between"
                    >
                      <span>AR Spatial Preview</span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-[#D8B486]/20 text-[#D8B486] rounded-full uppercase tracking-wider font-semibold">
                        AR
                      </span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Collections */}
              <Link
                href="/collections"
                className={`block py-3 px-4 rounded-xl transition-colors ${
                  pathname.startsWith('/collections') ? 'bg-[#2A1A12] text-[#D8B486] font-semibold' : 'text-[#FAF7F2] hover:bg-[#2A1A12]/50'
                }`}
              >
                Collections
              </Link>

              {/* Journal */}
              <Link
                href="/journal"
                className={`block py-3 px-4 rounded-xl transition-colors ${
                  pathname.startsWith('/journal') ? 'bg-[#2A1A12] text-[#D8B486] font-semibold' : 'text-[#FAF7F2] hover:bg-[#2A1A12]/50'
                }`}
              >
                Journal
              </Link>
            </div>

            {/* AI Consultant Banner */}
            <div className="p-4 rounded-2xl bg-[#2A1A12]/80 border border-[#8B5A2B]/30 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-[#FAF7F2] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D8B486]" />
                  <span>AI Spatial Consultant</span>
                </div>
                <div className="text-[11px] text-[#B9AA99]">
                  Get instant styling & dimension advice
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsAIOpen(true);
                }}
                className="px-3 py-1.5 rounded-full bg-[#D8B486] text-[#1C140E] text-xs font-semibold shadow"
              >
                Consult
              </button>
            </div>

            {/* Secondary Actions & Trade Portal */}
            <div className="pt-4 border-t border-[#3D271D]/50 space-y-3">
              <Link
                href="/trade"
                className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-[#2A1A12]/40 text-[#D8B486] text-xs uppercase tracking-wider font-medium hover:bg-[#2A1A12]"
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#D8B486]" />
                  <span>Trade & Designer Portal</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#D8B486]" />
              </Link>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/account?tab=wishlist"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#2A1A12]/40 text-[#FAF7F2] text-xs hover:bg-[#2A1A12]"
                >
                  <Heart className="w-4 h-4 text-[#D8B486]" />
                  <span>Wishlist ({wishlist.length})</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (isAuthenticated) {
                      router.push('/account');
                    } else {
                      openAuthModal('signin');
                    }
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#2A1A12]/40 text-[#FAF7F2] text-xs hover:bg-[#2A1A12]"
                >
                  <User className="w-4 h-4 text-[#D8B486]" />
                  <span>{isAuthenticated ? 'Account' : 'Sign In'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
