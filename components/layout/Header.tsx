'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import {
  ShoppingBag,
  Heart,
  Search,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  User,
  ShieldCheck,
  Compass
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentPath,
    navigate,
    cartCount,
    wishlist,
    setIsCartOpen,
    setIsAIOpen,
    rooms,
    setFilters
  } = useStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRoomsDropdownOpen, setIsRoomsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState('');
  const [cartAnimate, setCartAnimate] = useState(false);
  const [wishlistAnimate, setWishlistAnimate] = useState(false);

  useEffect(() => {
    if (cartCount > 0) {
      setCartAnimate(true);
      const timer = setTimeout(() => setCartAnimate(false), 400);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  useEffect(() => {
    if (wishlist.length > 0) {
      setWishlistAnimate(true);
      const timer = setTimeout(() => setWishlistAnimate(false), 400);
      return () => clearTimeout(timer);
    }
  }, [wishlist.length]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInputValue.trim()) {
      navigate('/shop');
      setIsSearchOpen(false);
    }
  };

  const handleRoomSelect = (slug: string) => {
    navigate(`/rooms/${slug}`);
    setIsRoomsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Privilege / Announcement Bar */}
      <div className="bg-[#4A2C1A] text-[#F5E6D3] text-[11px] sm:text-xs font-medium py-2 px-4 text-center tracking-wider transition-all">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <span className="hidden md:inline-flex items-center gap-1.5 opacity-80">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8B5A2B]" />
            10-Year Generational Warranty & White-Glove Installation
          </span>
          <span className="mx-auto md:mx-0 font-medium tracking-wide">
            Complimentary In-Home Assembly on Orders Above ₹25,000 | Code: <strong className="text-white underline decoration-[#8B5A2B] decoration-2">VELOURA10</strong>
          </span>
          <button
            onClick={() => navigate('/admin')}
            className="hidden lg:inline-flex items-center gap-1 text-[11px] text-[#EADBC8] hover:text-white transition-colors underline decoration-dotted cursor-pointer"
          >
            Store Operations / Admin
          </button>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-350 ease-out ${
          isScrolled
            ? 'header-glass-scrolled py-3 shadow-soft-sm'
            : 'header-top-state py-5'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 text-[#211E1B] hover:text-[#8B5A2B] transition-colors active:scale-95 cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 text-[#211E1B] hover:text-[#8B5A2B] active:scale-95 cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
            >
              <img
                src="/logo.png"
                alt="Veloura Living Logo"
                className="h-8 sm:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-102"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#4A2C1A] block leading-none">
                  VELOURA
                </span>
                <span className="text-[9px] tracking-[0.28em] text-[#8B5A2B] uppercase font-semibold block mt-0.5">
                  LIVING
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-8">
            <button
              onClick={() => navigate('/')}
              className={`nav-link-indicator text-xs uppercase tracking-[0.1em] font-semibold transition-colors cursor-pointer py-1 ${
                currentPath === '/' ? 'text-[#8B5A2B] font-bold active' : 'text-[#514A43] hover:text-[#211E1B]'
              }`}
            >
              Home
            </button>

            {/* Rooms Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsRoomsDropdownOpen(true)}
              onMouseLeave={() => setIsRoomsDropdownOpen(false)}
            >
              <button
                onClick={() => navigate('/rooms')}
                className={`nav-link-indicator flex items-center gap-1 text-xs uppercase tracking-[0.1em] font-semibold transition-colors cursor-pointer py-1 ${
                  currentPath.startsWith('/rooms') ? 'text-[#8B5A2B] font-bold active' : 'text-[#514A43] hover:text-[#211E1B]'
                }`}
              >
                Rooms
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isRoomsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isRoomsDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-80 bg-white rounded-xl shadow-soft-xl border border-[#4A2C1A]/10 py-3 mt-2 animate-fadeIn z-50">
                  <div className="px-4 py-1.5 border-b border-[#EEE9E1] mb-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9C9287]">
                      Explore By Space
                    </span>
                  </div>
                  {rooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => handleRoomSelect(room.slug)}
                      className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-[#F7F4EF] transition-colors group cursor-pointer"
                    >
                      <div>
                        <div className="text-sm font-medium text-[#211E1B] group-hover:text-[#8B5A2B] transition-colors">
                          {room.name}
                        </div>
                        <div className="text-xs text-[#9C9287] truncate max-w-[200px]">
                          {room.headline}
                        </div>
                      </div>
                      <span className="text-xs text-[#8B5A2B] opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                        Explore →
                      </span>
                    </button>
                  ))}
                  <div className="mt-2 pt-2 px-4 border-t border-[#EEE9E1]">
                    <button
                      onClick={() => {
                        navigate('/rooms');
                        setIsRoomsDropdownOpen(false);
                      }}
                      className="w-full py-1.5 text-center text-xs font-semibold text-[#8B5A2B] hover:underline cursor-pointer"
                    >
                      View All 4 Living Spaces →
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setFilters((prev: any) => ({ ...prev, room: 'all' }));
                navigate('/shop');
              }}
              className={`nav-link-indicator text-xs uppercase tracking-[0.1em] font-semibold transition-colors cursor-pointer py-1 ${
                currentPath === '/shop' ? 'text-[#8B5A2B] font-bold active' : 'text-[#514A43] hover:text-[#211E1B]'
              }`}
            >
              Shop
            </button>

            <button
              onClick={() => navigate('/studio')}
              className={`nav-link-indicator flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] font-semibold transition-colors cursor-pointer py-1 ${
                currentPath === '/studio' ? 'text-[#8B5A2B] font-bold active' : 'text-[#514A43] hover:text-[#211E1B]'
              }`}
            >
              <Compass className="w-3 h-3 text-[#8B5A2B]" />
              <span>Studio 2D</span>
              <span className="text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-[#8B5A2B]/15 text-[#8B5A2B] rounded-full">
                Interactive
              </span>
            </button>

            <button
              onClick={() => navigate('/collections')}
              className={`nav-link-indicator text-xs uppercase tracking-[0.1em] font-semibold transition-colors cursor-pointer py-1 ${
                currentPath === '/collections' ? 'text-[#8B5A2B] font-bold active' : 'text-[#514A43] hover:text-[#211E1B]'
              }`}
            >
              Collections
            </button>

            <button
              onClick={() => navigate('/journal')}
              className={`nav-link-indicator text-xs uppercase tracking-[0.1em] font-semibold transition-colors cursor-pointer py-1 ${
                currentPath.startsWith('/journal') ? 'text-[#8B5A2B] font-bold active' : 'text-[#514A43] hover:text-[#211E1B]'
              }`}
            >
              Journal
            </button>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* AI Assistant Button */}
            <button
              onClick={() => setIsAIOpen(true)}
              className="flex items-center gap-1.5 bg-[#F5E6D3] text-[#4A2C1A] hover:bg-[#EADBC8] px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shadow-sm group border border-[#8B5A2B]/20 active:scale-95 cursor-pointer"
              title="Veloura AI Space Consultant"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8B5A2B] group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">AI Consultant</span>
            </button>

            {/* Desktop Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="hidden lg:flex p-2 text-[#514A43] hover:text-[#211E1B] rounded-full hover:bg-[#F7F4EF] transition-colors cursor-pointer active:scale-95"
              aria-label="Search Catalog"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Wishlist */}
            <button
              onClick={() => navigate('/account')}
              className="relative p-2 text-[#514A43] hover:text-[#211E1B] rounded-full hover:bg-[#F7F4EF] transition-colors cursor-pointer active:scale-95"
              aria-label="Wishlist"
              data-cursor="WISHLIST"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {wishlist.length > 0 && (
                <span
                  className={`absolute top-1 right-1 w-4 h-4 bg-[#8B5A2B] text-white text-[10px] font-bold rounded-full flex items-center justify-center ${
                    wishlistAnimate ? 'animate-badge-pop' : ''
                  }`}
                >
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Account / Orders */}
            <button
              onClick={() => navigate('/account')}
              className="hidden sm:flex p-2 text-[#514A43] hover:text-[#211E1B] rounded-full hover:bg-[#F7F4EF] transition-colors cursor-pointer active:scale-95"
              aria-label="User Account"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="btn-primary-shimmer relative flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all shadow-sm cursor-pointer"
              aria-label="Shopping Cart"
              data-cursor="CART"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline font-semibold">Cart</span>
              {cartCount > 0 && (
                <span
                  className={`ml-1 bg-[#8B5A2B] text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full ${
                    cartAnimate ? 'animate-badge-pop' : ''
                  }`}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Search Bar */}
        {isSearchOpen && (
          <div className="border-t border-[#EEE9E1] bg-white px-4 py-3 animate-fadeIn">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="w-5 h-5 text-[#9C9287] absolute left-3.5" />
                <input
                  type="text"
                  value={searchInputValue}
                  onChange={(e) => setSearchInputValue(e.target.value)}
                  placeholder="Search furniture, rooms, wood finishes, bouclé, or natural materials..."
                  className="w-full pl-11 pr-24 py-2.5 text-sm bg-[#FCFAF7] border border-[#DED7CD] rounded-full focus:outline-none focus:border-[#8B5A2B] text-[#211E1B]"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-2 bg-[#4A2C1A] text-white text-xs px-4 py-1.5 rounded-full hover:bg-[#8B5A2B] transition-colors cursor-pointer"
                >
                  Search
                </button>
              </form>
              <div className="flex items-center gap-2 mt-2 text-xs text-[#9C9287]">
                <span className="font-medium">Popular:</span>
                {['Walnut Dining', 'Boucle Sectional', 'Platform Bed', 'Ergonomic Leather Desk Chair'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchInputValue(tag);
                      navigate('/shop');
                      setIsSearchOpen(false);
                    }}
                    className="hover:text-[#8B5A2B] underline decoration-dotted cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-[102px] bg-black/40 backdrop-blur-sm z-50">
            <div className="bg-[#FCFAF7] w-4/5 max-w-sm h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#EEE9E1]">
                  <span className="font-display font-bold text-lg text-[#4A2C1A]">Menu</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="cursor-pointer">
                    <X className="w-5 h-5 text-[#9C9287]" />
                  </button>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      navigate('/');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 text-base font-medium text-[#211E1B] hover:text-[#8B5A2B] cursor-pointer"
                  >
                    Home
                  </button>

                  <div className="py-2">
                    <div className="text-xs font-bold text-[#8B5A2B] uppercase tracking-wider mb-2">
                      Four Living Spaces
                    </div>
                    <div className="pl-3 space-y-2 border-l-2 border-[#8B5A2B]/30">
                      {rooms.map((room) => (
                        <button
                          key={room.id}
                          onClick={() => handleRoomSelect(room.slug)}
                          className="w-full text-left py-1 text-sm text-[#514A43] hover:text-[#211E1B] flex items-center justify-between cursor-pointer"
                        >
                          <span>{room.name}</span>
                          <span className="text-[11px] text-[#9C9287]">({room.productCount} pieces)</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      navigate('/shop');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 text-base font-medium text-[#211E1B] hover:text-[#8B5A2B] cursor-pointer"
                  >
                    Shop All Products
                  </button>

                  <button
                    onClick={() => {
                      navigate('/studio');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 text-base font-medium text-[#8B5A2B] hover:text-[#4A2C1A] flex items-center gap-2 cursor-pointer"
                  >
                    <Compass className="w-4 h-4 text-[#8B5A2B]" />
                    <span>Spatial Studio & Swatch Lab</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate('/collections');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 text-base font-medium text-[#211E1B] hover:text-[#8B5A2B] cursor-pointer"
                  >
                    Curated Collections
                  </button>

                  <button
                    onClick={() => {
                      navigate('/journal');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 text-base font-medium text-[#211E1B] hover:text-[#8B5A2B] cursor-pointer"
                  >
                    Editorial Journal
                  </button>

                  <button
                    onClick={() => {
                      navigate('/account');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 text-base font-medium text-[#211E1B] hover:text-[#8B5A2B] cursor-pointer"
                  >
                    Account & Orders
                  </button>
                </div>
              </div>

              {/* Bottom Mobile Action */}
              <div className="pt-6 border-t border-[#EEE9E1] space-y-3">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsAIOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-[#F5E6D3] text-[#4A2C1A] py-3 rounded-xl font-semibold text-sm border border-[#8B5A2B]/20 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#8B5A2B]" />
                  Open AI Space Consultant
                </button>
                <button
                  onClick={() => {
                    navigate('/admin');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-center text-xs text-[#9C9287] hover:underline cursor-pointer"
                >
                  Admin & Store Management Portal →
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
