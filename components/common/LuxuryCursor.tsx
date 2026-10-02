'use client';

import React, { useEffect, useState } from 'react';

export const LuxuryCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [targetPos, setTargetPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    // Only enable on desktop pointer devices with motion enabled
    if (
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setTargetPos({ x: e.clientX, y: e.clientY });
      setIsVisible(true);

      // Check target element for custom data-cursor attributes or hoverable buttons
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactiveEl = target.closest(
          'button, a, input, select, textarea, [data-cursor], .hotspot-pulse-anim, .product-card-item'
        );
        if (interactiveEl) {
          setIsHovered(true);
          const label = interactiveEl.getAttribute('data-cursor');
          setHoverLabel(label || null);
        } else {
          setIsHovered(false);
          setHoverLabel(null);
        }
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Smooth trailing spring interpolation for the follower ring
  useEffect(() => {
    let animFrame: number;
    const follow = () => {
      setPos((prev) => ({
        x: prev.x + (targetPos.x - prev.x) * 0.22,
        y: prev.y + (targetPos.y - prev.y) * 0.22,
      }));
      animFrame = requestAnimationFrame(follow);
    };
    animFrame = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(animFrame);
  }, [targetPos]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden hidden md:block">
      {/* Precision Core Dot */}
      <div
        className="fixed w-1.5 h-1.5 bg-[#8B5A2B] rounded-full -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200"
        style={{
          left: `${targetPos.x}px`,
          top: `${targetPos.y}px`,
          opacity: isHovered ? 0 : 0.85,
        }}
      />

      {/* Outer Spring Follower Ring with Blur & Scaling */}
      <div
        className={`fixed rounded-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-300 ease-out border ${
          isClicking
            ? 'scale-75 bg-[#8B5A2B]/30 border-[#8B5A2B]'
            : isHovered
            ? 'w-12 h-12 bg-[#8B5A2B]/12 border-[#8B5A2B]/40 shadow-sm backdrop-blur-[1px]'
            : 'w-7 h-7 bg-transparent border-[#8B5A2B]/35'
        }`}
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
        }}
      >
        {hoverLabel && (
          <span className="text-[8px] font-bold tracking-widest text-[#4A2C1A] uppercase animate-fadeIn select-none">
            {hoverLabel}
          </span>
        )}
      </div>
    </div>
  );
};
