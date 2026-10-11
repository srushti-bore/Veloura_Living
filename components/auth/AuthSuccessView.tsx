'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';
import { gsap } from 'gsap';

interface AuthSuccessViewProps {
  userName?: string;
  onContinue?: () => void;
  isLoading?: boolean;
  logoSrc?: string;
  className?: string;
}

export const AuthSuccessView: React.FC<AuthSuccessViewProps> = ({
  userName = 'User',
  onContinue,
  isLoading = false,
  logoSrc = '/images/veloura-exact-logo@2x.png',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeOuterRef = useRef<HTMLDivElement>(null);
  const checkIconRef = useRef<SVGSVGElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // 1. Refined Double-Circle Badge Entrance with gentle spring
      if (badgeOuterRef.current) {
        gsap.fromTo(
          badgeOuterRef.current,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.4)' }
        );
      }

      // 2. Restrained Checkmark Reveal
      if (checkIconRef.current) {
        gsap.fromTo(
          checkIconRef.current,
          { scale: 0.6, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.35, delay: 0.15, ease: 'power2.out' }
        );
      }

      // 3. Editorial Typography Entrance
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.4, delay: 0.2, ease: 'power2.out' }
        );
      }

      if (subtextRef.current) {
        gsap.fromTo(
          subtextRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4, delay: 0.28, ease: 'power2.out' }
        );
      }

      // 4. Primary Continue Button Entrance
      if (buttonRef.current) {
        gsap.fromTo(
          buttonRef.current,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.45, delay: 0.36, ease: 'power2.out' }
        );
      }
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  const displayName = userName?.trim() ? userName.trim() : 'User';

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex flex-col justify-between items-center text-center py-2 sm:py-4 select-none ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* Official Veloura Living Prominent Brand Logo */}
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

      {/* Main Success Content Block matching reference image */}
      <div className="flex-1 flex flex-col items-center justify-center my-4 sm:my-6 w-full max-w-[320px]">
        {/* Double-Circle Badge: Outer Champagne Ring, Inner Walnut Brown Circle, White Checkmark */}
        <div
          ref={badgeOuterRef}
          className="w-22 h-22 sm:w-24 sm:h-24 rounded-full border-2 border-[#E4D7C8] bg-[#F7EFE4]/60 flex items-center justify-center mb-5 sm:mb-6 shadow-[0_4px_20px_rgba(78,46,24,0.06)]"
        >
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#55321B] flex items-center justify-center shadow-inner">
            <Check
              ref={checkIconRef as any}
              className="w-8 h-8 sm:w-9 sm:h-9 text-[#FFFFFF] stroke-[3]"
            />
          </div>
        </div>

        {/* Heading: Login Successful! */}
        <h2
          ref={headingRef}
          className="font-serif text-2xl sm:text-[28px] font-semibold text-[#1F140E] tracking-tight leading-snug"
        >
          Login Successful!
        </h2>

        {/* Supporting Message: Welcome back, [User Name] */}
        <div ref={subtextRef} className="mt-2.5 sm:mt-3 text-center space-y-0.5">
          <p className="font-sans text-sm sm:text-base text-[#5C4535] font-light leading-relaxed">
            Welcome back,
          </p>
          <p className="font-sans text-sm sm:text-base text-[#5C4535] font-normal leading-relaxed">
            {displayName}
          </p>
        </div>

        {/* Primary Action Button: Continue */}
        <div className="w-full mt-7 sm:mt-9">
          <button
            ref={buttonRef}
            type="button"
            onClick={onContinue}
            disabled={isLoading}
            className="w-full py-3.5 sm:py-4 px-6 bg-[#452611] hover:bg-[#341C0C] active:scale-[0.99] text-[#FAF7F2] font-medium text-sm sm:text-base rounded-xl transition-all duration-200 shadow-[0_4px_16px_rgba(69,38,17,0.2)] focus:outline-none focus:ring-2 focus:ring-[#8C6D58]/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-[#FAF7F2]"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <span>Continuing…</span>
              </span>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>

      <div className="h-4" />

      {/* Luxury 4-Point Diamond Sparkle Accent matching reference */}
      <div className="absolute bottom-3 right-3 text-[#E6DACD]/60 pointer-events-none select-none">
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z" />
        </svg>
      </div>
    </div>
  );
};
