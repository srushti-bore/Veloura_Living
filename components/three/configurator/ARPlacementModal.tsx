'use client';

import React, { useState, useRef } from 'react';
import { X, Smartphone, Sparkles, Copy, Check, ExternalLink } from 'lucide-react';
import { ConfigurableFurniturePiece } from '@/types/configurator';
import { ARBridgeService } from '@/lib/services/arBridgeService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  piece: ConfigurableFurniturePiece;
  partMaterials: Record<string, string>;
}

export const ARPlacementModal: React.FC<Props> = ({
  isOpen,
  onClose,
  piece,
  partMaterials,
}) => {
  const [copied, setCopied] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 250, y: 200, isHovered: false });
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const query = ARBridgeService.serializeConfigToQuery(partMaterials);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://veloura-living.vercel.app';
  const arPayload = ARBridgeService.generateARPayload(piece, query, origin);
  const directLink = `${origin}/configurator?piece=${piece.id}&${query}&ar=1`;

  const handleCopy = () => {
    navigator.clipboard.writeText(directLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      isHovered: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setMousePos((prev) => ({ ...prev, isHovered: true }))}
        onMouseLeave={() => setMousePos((prev) => ({ ...prev, isHovered: false }))}
        className="relative w-full max-w-lg bg-gradient-to-b from-[#251A13] via-[#1B120D] to-[#120D0A] border border-[#8B5A2B]/45 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] text-[#FAF7F2] overflow-hidden group"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dynamic Interactive Cursor-Following Warm Spotlight Glow */}
        <div
          className="pointer-events-none absolute -inset-px rounded-3xl transition-opacity duration-300 z-0"
          style={{
            opacity: mousePos.isHovered ? 1 : 0.45,
            background: `radial-gradient(420px circle at ${mousePos.x}px ${mousePos.y}px, rgba(216, 180, 134, 0.22), rgba(139, 90, 43, 0.08) 40%, transparent 75%)`,
          }}
        />

        {/* Ambient Warm Bronze & Walnut Corner Glows */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#8B5A2B]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#5C3822]/25 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-stone-400 hover:text-[#D8B486] rounded-full hover:bg-white/5 transition-colors z-10 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="relative z-10 flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-[#3B2418] text-[#D8B486] border border-[#8B5A2B]/40 shadow-inner">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#D8B486] font-semibold">
              Spatial Room Projection
            </span>
            <h3 className="font-serif text-2xl font-medium tracking-tight text-[#FAF7F2]">
              View in Your Room (AR)
            </h3>
          </div>
        </div>

        <p className="relative z-10 text-sm text-stone-300 mb-6 leading-relaxed">
          Project this personalized <span className="text-[#D8B486] font-medium">{piece.name}</span> in true 1:1 architectural scale directly onto your floor using Apple QuickLook or Android WebXR.
        </p>

        {/* QR Code Container in Warm Luxury Parchment & Walnut Finish */}
        <div className="relative z-10 flex flex-col items-center justify-center p-6 rounded-2xl bg-[#140E0A]/90 border border-[#8B5A2B]/30 mb-6 shadow-inner">
          {/* Warm Parchment Luxury Card Frame */}
          <div className="p-3.5 bg-gradient-to-br from-[#F2E5D5] via-[#E8D8C5] to-[#DDC9B2] rounded-2xl shadow-[0_8px_25px_-5px_rgba(139,90,43,0.35)] mb-3.5 border border-[#C49A6C]/70">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={arPayload.fallbackQrUrl}
              alt="Scan to preview furniture in AR"
              className="w-44 h-44 object-contain rounded-xl mix-blend-multiply opacity-95"
            />
          </div>
          <p className="text-xs text-[#D8B486] flex items-center gap-1.5 font-sans font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#D8B486]" />
            Scan with your iPhone or Android camera
          </p>
        </div>

        {/* Action Buttons in Warm Bronze & Espresso Palette */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#2B1D15] border border-[#8B5A2B]/40 hover:border-[#D8B486]/70 hover:bg-[#38261C] text-sm text-[#F5E6D3] font-medium transition-all cursor-pointer shadow-md"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#D8B486]" />}
            {copied ? 'Link Copied!' : 'Copy AR Link'}
          </button>

          <a
            href={arPayload.arUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-brownish-shimmer flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-lg cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#D8B486]" />
            Launch WebXR Mode
            <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
          </a>
        </div>
      </div>
    </div>
  );
};
