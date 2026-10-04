'use client';

import React from 'react';

interface AuthTabsProps {
  activeTab: 'signin' | 'signup' | 'forgot';
  onTabChange: (tab: 'signin' | 'signup') => void;
}

export function AuthTabs({ activeTab, onTabChange }: AuthTabsProps) {
  return (
    <div className="flex border-b border-[#D8C4AD] mb-6">
      <button
        type="button"
        onClick={() => onTabChange('signin')}
        className={`pb-3 text-xs uppercase tracking-[0.2em] font-sans font-medium transition-all relative cursor-pointer ${
          activeTab === 'signin' || activeTab === 'forgot'
            ? 'text-[#4A2C1A] font-semibold'
            : 'text-[#735E4E]/70 hover:text-[#4A2C1A]'
        }`}
      >
        Sign In
        {(activeTab === 'signin' || activeTab === 'forgot') && (
          <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#7A4E2D]" />
        )}
      </button>

      <div className="w-8" />

      <button
        type="button"
        onClick={() => onTabChange('signup')}
        className={`pb-3 text-xs uppercase tracking-[0.2em] font-sans font-medium transition-all relative cursor-pointer ${
          activeTab === 'signup'
            ? 'text-[#4A2C1A] font-semibold'
            : 'text-[#735E4E]/70 hover:text-[#4A2C1A]'
        }`}
      >
        Create Account
        {activeTab === 'signup' && (
          <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#7A4E2D]" />
        )}
      </button>
    </div>
  );
}
