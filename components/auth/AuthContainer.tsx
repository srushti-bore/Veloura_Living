'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { gsap } from 'gsap';
import { LifestylePanel } from './LifestylePanel';

interface AuthContainerProps {
  children: React.ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
  className?: string;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({
  children,
  onClose,
  showCloseButton = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const formSideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    // Gentle entrance animation for the card container and form side
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 18, scale: 0.99 },
        { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'power2.out' }
      );

      if (formSideRef.current) {
        gsap.fromTo(
          formSideRef.current.children,
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.04,
            ease: 'power2.out',
            delay: 0.1,
          }
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
      className={`relative w-full max-w-[940px] bg-[#FAF7F2] rounded-3xl md:rounded-[32px] border border-[#E6DDD0] shadow-[0_25px_70px_-15px_rgba(42,26,18,0.18)] overflow-hidden transition-all duration-300 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Optional Top Close Button for Modal Context */}
      {showCloseButton && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-[#735E4E] hover:text-[#2B1D14] hover:bg-[#EFE9DF] rounded-full transition-colors cursor-pointer"
          aria-label="Close authentication dialogue"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Split-Screen Layout: Left Lifestyle Image (50%), Right Form Panel (50%) */}
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[580px] lg:min-h-[620px]">
        {/* Left Side: Lifestyle Experience Panel */}
        <div className="hidden md:block relative h-full">
          <LifestylePanel />
        </div>

        {/* Right Side: Authentication Form Surface */}
        <div
          ref={formSideRef}
          className="flex flex-col justify-between p-6 sm:p-9 md:p-10 lg:p-12 bg-[#FAF7F2] min-h-[520px]"
        >
          {children}
        </div>
      </div>
    </div>
  );
};
