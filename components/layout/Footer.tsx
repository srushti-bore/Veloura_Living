'use client';

import React from 'react';
import { useStore } from '@/hooks/useStore';
import { ShieldCheck, Truck, RefreshCw, Sparkles, MapPin, Mail, ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigate, rooms } = useStore();

  return (
    <footer className="bg-[#211E1B] text-[#EEE9E1] pt-16 pb-12 border-t border-[#4A2C1A]/20">
      {/* Brand Value Pillars */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 border-b border-[#332E29]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="group flex items-start gap-4 p-3.5 -m-3.5 rounded-2xl transition-colors duration-300 hover:bg-[#2A2622]">
            <div className="p-3 rounded-xl bg-[#332E29] text-[#8B5A2B] group-hover:scale-110 group-hover:text-[#C49A6C] transition-all duration-300 flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-white text-base group-hover:text-[#F5E6D3] transition-colors">
                White-Glove In-Home Care
              </h4>
              <p className="text-xs text-[#9C9287] mt-1 leading-relaxed">
                Expert two-person delivery team unpacks, positions, and clears all recyclable packaging.
              </p>
            </div>
          </div>

          <div className="group flex items-start gap-4 p-3.5 -m-3.5 rounded-2xl transition-colors duration-300 hover:bg-[#2A2622]">
            <div className="p-3 rounded-xl bg-[#332E29] text-[#8B5A2B] group-hover:scale-110 group-hover:text-[#C49A6C] transition-all duration-300 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-white text-base group-hover:text-[#F5E6D3] transition-colors">
                10-Year Generational Build
              </h4>
              <p className="text-xs text-[#9C9287] mt-1 leading-relaxed">
                Solid kiln-dried hardwoods, mortise joinery, and heavy-duty structural lifetime guarantee.
              </p>
            </div>
          </div>

          <div className="group flex items-start gap-4 p-3.5 -m-3.5 rounded-2xl transition-colors duration-300 hover:bg-[#2A2622]">
            <div className="p-3 rounded-xl bg-[#332E29] text-[#8B5A2B] group-hover:scale-110 group-hover:text-[#C49A6C] transition-all duration-300 flex-shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-white text-base group-hover:text-[#F5E6D3] transition-colors">
                30-Day In-Space Trial
              </h4>
              <p className="text-xs text-[#9C9287] mt-1 leading-relaxed">
                Experience the piece in your own daylight and evening atmosphere with hassle-free returns.
              </p>
            </div>
          </div>

          <div className="group flex items-start gap-4 p-3.5 -m-3.5 rounded-2xl transition-colors duration-300 hover:bg-[#2A2622]">
            <div className="p-3 rounded-xl bg-[#332E29] text-[#8B5A2B] group-hover:scale-110 group-hover:text-[#C49A6C] transition-all duration-300 flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-white text-base group-hover:text-[#F5E6D3] transition-colors">
                Spatial Intelligence
              </h4>
              <p className="text-xs text-[#9C9287] mt-1 leading-relaxed">
                AI-assisted spatial proportion and palette curation designed specifically for modern architecture.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold tracking-tight text-[#F5E6D3]">
                VELOURA LIVING
              </span>
            </div>
            <p className="text-sm text-[#9C9287] leading-relaxed max-w-sm">
              Veloura Living is a modern Furniture Intelligence platform curating timeless furniture for architectural spaces. Thoughtfully designed and handcrafted from generational hardwoods and rich textural linens.
            </p>

            <div className="pt-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#8B5A2B] mb-2">
                Experience Galleries
              </div>
              <p className="text-xs text-[#9C9287] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#8B5A2B] flex-shrink-0" />
                Mumbai (Worli) • Bengaluru (Indiranagar) • Delhi (Mehrauli) • Pune (Koregaon Park)
              </p>
            </div>
          </div>

          {/* Room Spaces */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-widest text-[#8B5A2B]">
              Living Spaces
            </h5>
            <ul className="space-y-2 text-sm text-[#C6BDB1]">
              {rooms.map((room) => (
                <li key={room.id}>
                  <button
                    onClick={() => navigate(`/rooms/${room.slug}`)}
                    className="hover:text-white hover:translate-x-1 transition-all duration-200 cursor-pointer inline-flex items-center"
                  >
                    {room.name}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => navigate('/shop')}
                  className="hover:text-[#F5E6D3] hover:translate-x-1 transition-all duration-200 text-xs text-[#8B5A2B] font-semibold cursor-pointer inline-flex items-center gap-1"
                >
                  View All Collections →
                </button>
              </li>
            </ul>
          </div>

          {/* Editorial & Company */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-widest text-[#8B5A2B]">
              Editorial & Craft
            </h5>
            <ul className="space-y-2 text-sm text-[#C6BDB1]">
              <li>
                <button
                  onClick={() => navigate('/journal')}
                  className="hover:text-white hover:translate-x-1 transition-all duration-200 cursor-pointer inline-flex items-center"
                >
                  Veloura Journal
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/collections')}
                  className="hover:text-white hover:translate-x-1 transition-all duration-200 cursor-pointer inline-flex items-center"
                >
                  Material Stories
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/about')}
                  className="hover:text-white hover:translate-x-1 transition-all duration-200 cursor-pointer inline-flex items-center"
                >
                  Our Philosophy
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/contact')}
                  className="hover:text-white hover:translate-x-1 transition-all duration-200 cursor-pointer inline-flex items-center"
                >
                  Architect Trade Program
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/admin')}
                  className="text-xs text-[#8B5A2B] hover:text-[#F5E6D3] hover:underline cursor-pointer"
                >
                  Admin Management
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter / Curation Dispatch */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-widest text-[#8B5A2B]">
              The Considered Home
            </h5>
            <p className="text-xs text-[#9C9287] leading-relaxed">
              Receive seasonal lookbooks, spatial styling essays, and early access to numbered hardwood editions.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for joining Veloura Considered Home.'); }} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your personal email..."
                  required
                  className="w-full bg-[#332E29] border border-[#514A43] rounded-lg px-3.5 py-2 text-xs text-white placeholder-[#9C9287] focus:outline-none focus:border-[#8B5A2B] focus:ring-1 focus:ring-[#8B5A2B] transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bg-[#8B5A2B] text-white p-1 rounded hover:bg-[#A47A45] active:scale-90 transition-all cursor-pointer"
                  title="Subscribe"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Subfooter */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-[#332E29] flex flex-col sm:flex-row items-center justify-between text-xs text-[#746B61] gap-4">
        <div>
          © 2026 Veloura Living Inc. Handcrafted with pride. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/privacy')} className="hover:text-[#C6BDB1] transition-colors cursor-pointer">Privacy Policy</button>
          <button onClick={() => navigate('/terms')} className="hover:text-[#C6BDB1] transition-colors cursor-pointer">Terms of Service</button>
          <button onClick={() => navigate('/shipping')} className="hover:text-[#C6BDB1] transition-colors cursor-pointer">White-Glove Care</button>
        </div>
      </div>
    </footer>
  );
};
