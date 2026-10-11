'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';

interface OtpProcessingViewProps {
  heading?: string;
  message?: string;
  logoSrc?: string;
  className?: string;
}

export const OtpProcessingView: React.FC<OtpProcessingViewProps> = ({
  heading = 'Verifying…',
  message = 'Please wait while we confirm your identity.',
  logoSrc = '/images/veloura-exact-logo@2x.png',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const spinnerRef = useRef<SVGSVGElement>(null);
  const textGroupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      // 1. Subtle fade and gentle vertical entrance
      if (textGroupRef.current) {
        gsap.fromTo(
          textGroupRef.current.children,
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
          }
        );
      }

      // 2. Refined continuous rotation of the circular loader
      if (spinnerRef.current && !prefersReducedMotion) {
        gsap.to(spinnerRef.current, {
          rotation: 360,
          duration: 1.3,
          repeat: -1,
          ease: 'linear',
          transformOrigin: '50% 50%',
        });
      }
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex flex-col justify-between items-center text-center py-4 select-none ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* Official Veloura Living Handcrafted Armchair Logo Asset matching Reference */}
      <div className="relative w-[180px] h-[120px] sm:w-[210px] sm:h-[140px] mb-2 sm:mb-4 transition-transform duration-300 hover:scale-[1.02]">
        <Image
          src={logoSrc}
          alt="Veloura Living Logo"
          fill
          priority
          sizes="(max-width: 640px) 180px, 210px"
          className="object-contain object-center"
        />
      </div>

      {/* Centered Processing Indicator & Editorial Typography matching Reference */}
      <div
        ref={textGroupRef}
        className="flex-1 flex flex-col items-center justify-center my-6 sm:my-10"
      >
        {/* Refined Circular Loading Indicator */}
        <div className="relative w-20 h-20 sm:w-22 sm:h-22 flex items-center justify-center mb-6 sm:mb-8">
          <svg
            ref={spinnerRef}
            className="w-full h-full drop-shadow-[0_2px_8px_rgba(141,101,74,0.12)]"
            viewBox="0 0 84 84"
            fill="none"
            aria-hidden="true"
          >
            {/* Subtle background track for refined tactile contrast */}
            <circle
              cx="42"
              cy="42"
              r="34"
              stroke="#E8DDD0"
              strokeWidth="7"
              strokeOpacity="0.45"
            />
            {/* Primary warm mocha arc matching Reference Image */}
            <circle
              cx="42"
              cy="42"
              r="34"
              stroke="#8D654A"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray="160 55"
              strokeDashoffset="25"
            />
          </svg>
        </div>

        {/* Heading: "Verifying…" */}
        <h2 className="font-serif text-2xl sm:text-[28px] font-medium text-[#2B1D14] tracking-tight leading-snug">
          {heading}
        </h2>

        {/* Message: "Please wait while we confirm your identity." */}
        <p className="font-sans text-sm sm:text-base text-[#5C4535] mt-2 sm:mt-2.5 font-light leading-relaxed max-w-xs text-center">
          {message}
        </p>
      </div>

      {/* Spacer to balance top logo */}
      <div className="h-6" />

      {/* Subtle 4-Point Luxury Star/Sparkle Asset matching bottom right of reference card */}
      <div className="hidden sm:block absolute bottom-2 right-2 text-[#D8C4AD]/50 pointer-events-none">
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z" />
        </svg>
      </div>
    </div>
  );
};
