'use client';

import React from 'react';
import Image from 'next/image';

interface AuthHeaderProps {
  title?: string;
  subtitle?: string;
  logoSrc?: string;
  className?: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title = 'Sign in to your account',
  subtitle,
  logoSrc = '/images/veloura-exact-logo@2x.png',
  className = '',
}) => {
  return (
    <div className={`w-full flex flex-col items-center text-center ${className}`}>
      {/* Official Veloura Living Handcrafted Armchair Logo Asset matching Reference Image */}
      <div className="relative w-[180px] h-[120px] sm:w-[210px] sm:h-[140px] mb-3 sm:mb-4 transition-transform duration-300 hover:scale-[1.02]">
        <Image
          src={logoSrc}
          alt="Veloura Living Logo"
          fill
          priority
          sizes="(max-width: 640px) 180px, 210px"
          className="object-contain object-center"
        />
      </div>

      {/* Main View Heading */}
      <h1 className="w-full text-left font-serif text-2xl sm:text-[28px] font-medium text-[#2B1D14] tracking-tight leading-snug">
        {title}
      </h1>

      {subtitle && (
        <p className="w-full text-left font-sans text-xs text-[#735E4E] mt-1 font-light leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};
