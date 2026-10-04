'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface AuthLifestyleImageProps {
  className?: string;
}

export function AuthLifestyleImage({ className = '' }: AuthLifestyleImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className={`relative w-full h-full min-h-[320px] md:min-h-[560px] bg-[#EFE9DF] overflow-hidden ${className}`}>
      {/* Background Lifestyle Image */}
      <Image
        src="/images/veloura-auth-lifestyle.webp"
        alt="Veloura Living Warm Contemporary Living Space"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
        className={`object-cover object-center transition-all duration-700 ease-out ${
          imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
        }`}
        onLoad={() => setImageLoaded(true)}
      />

      {/* Subtle Warm Gradient Overlay for Editorial Depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#3B2418]/80 via-[#3B2418]/25 to-transparent pointer-events-none" />

      {/* Editorial Content Overlay at Bottom */}
      <div className="absolute bottom-0 inset-x-0 p-6 md:p-8 text-[#FBF8F3] z-10 flex flex-col justify-end">
        <div className="inline-flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E8D8C5]" />
          <span className="text-[10px] tracking-[0.25em] uppercase font-sans font-medium text-[#E8D8C5]">
            Architectural Sanctuary
          </span>
        </div>
        <h3 className="font-serif text-2xl md:text-3xl font-light leading-tight tracking-wide text-[#FBF8F3] mb-1">
          Handcrafted in Solid Walnut &amp; Warm Bouclé
        </h3>
        <p className="font-sans text-xs text-[#FBF8F3]/85 font-light tracking-wide max-w-sm">
          A calm residence where timeless proportions meet tactile bespoke joinery.
        </p>
      </div>

      {/* Top Left Brand Monogram Watermark */}
      <div className="absolute top-6 left-6 z-10 hidden md:block">
        <span className="text-[11px] font-serif tracking-[0.3em] uppercase text-[#FBF8F3]/90 font-medium bg-[#3B2418]/45 px-3 py-1 border border-[#FBF8F3]/20">
          The Veloura Collection
        </span>
      </div>
    </div>
  );
}
