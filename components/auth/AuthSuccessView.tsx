'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';
import { gsap } from 'gsap';

interface AuthSuccessViewProps {
  title?: string;
  message?: string;
  logoSrc?: string;
  className?: string;
}

export const AuthSuccessView: React.FC<AuthSuccessViewProps> = ({
  title = 'Login Successful!',
  message = 'Welcome back to Veloura Living. Preparing your personalized atelier…',
  logoSrc = '/images/veloura-exact-logo@2x.png',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      if (badgeRef.current) {
        gsap.fromTo(
          badgeRef.current,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.5)' }
        );
      }

      if (textRef.current) {
        gsap.fromTo(
          textRef.current.children,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, delay: 0.15, ease: 'power2.out' }
        );
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
      {/* Official Veloura Living Logo Asset */}
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

      {/* Success Badge & Typography */}
      <div className="flex-1 flex flex-col items-center justify-center my-6 sm:my-10">
        <div
          ref={badgeRef}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#EFF5ED] border border-[#4A7855]/30 flex items-center justify-center mb-6 shadow-[0_4px_16px_rgba(74,120,85,0.15)]"
        >
          <Check className="w-8 h-8 sm:w-10 sm:h-10 text-[#2E5A38] stroke-[2.5]" />
        </div>

        <div ref={textRef} className="space-y-2 max-w-xs">
          <h2 className="font-serif text-2xl sm:text-[28px] font-medium text-[#2B1D14] tracking-tight leading-snug">
            {title}
          </h2>
          <p className="font-sans text-sm text-[#5C4535] font-light leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <div className="h-6" />

      {/* Luxury Sparkle Detail */}
      <div className="hidden sm:block absolute bottom-2 right-2 text-[#D8C4AD]/50 pointer-events-none">
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z" />
        </svg>
      </div>
    </div>
  );
};
