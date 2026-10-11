'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';

interface LifestylePanelProps {
  className?: string;
  imageSrc?: string;
  heading?: string[];
}

export const LifestylePanel: React.FC<LifestylePanelProps> = ({
  className = '',
  imageSrc = '/images/veloura-auth-lifestyle.webp',
  heading = ['Beautiful', 'Spaces.', 'Better Living.'],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!imageWrapperRef.current) return;

    // Respect reduced-motion preferences
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    // Slow, smooth, continuous zoom-in and zoom-out effect (scale 1.0 to 1.06)
    const zoomTween = gsap.to(imageWrapperRef.current, {
      scale: 1.06,
      duration: 10,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      force3D: true,
      transformOrigin: '50% 50%',
    });

    return () => {
      zoomTween.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[420px] md:min-h-[580px] lg:min-h-[640px] bg-[#E8E1D5] overflow-hidden select-none ${className}`}
    >
      {/* 
        Image Canvas with GSAP Continuous Slow Cinematic Zoom
        Clipped firmly within rounded container via overflow-hidden
      */}
      <div
        ref={imageWrapperRef}
        className="absolute inset-0 w-full h-full will-change-transform"
      >
        <Image
          src={imageSrc}
          alt="Veloura Living Warm Architectural Sanctuary"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`object-cover object-center transition-opacity duration-1000 ease-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
        />
      </div>

      {/* Gentle ambient gradient for editorial legibility without muting warm sunshine */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#241710]/45 via-transparent to-[#241710]/40 pointer-events-none" />

      {/* Editorial Heading Overlay matching reference design */}
      <div className="relative z-10 p-7 sm:p-9 md:p-10 lg:p-12 flex flex-col justify-start h-full">
        <h2 className="font-serif italic text-3xl sm:text-4xl lg:text-[44px] font-normal leading-[1.14] text-[#FAF7F2] tracking-normal drop-shadow-[0_2px_14px_rgba(30,18,10,0.35)]">
          {heading.map((line, idx) => (
            <React.Fragment key={idx}>
              <span>{line}</span>
              {idx < heading.length - 1 && <br />}
            </React.Fragment>
          ))}
        </h2>
      </div>
    </div>
  );
};
