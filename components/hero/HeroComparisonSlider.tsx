'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/hooks/useStore';
import { Sparkles, Plus, SlidersHorizontal, Sun, Moon, ArrowRight, Play, Pause } from 'lucide-react';

interface Props {
  selectedRoomSlug?: string;
}

const TOTAL_FRAMES = 300;
const FPS = 24;
const FRAME_INTERVAL = 1000 / FPS;

function getFrameUrl(type: 'day' | 'night', index: number): string {
  const padded = String(index).padStart(3, '0');
  return `/video/${type}/ezgif-frame-${padded}.jpg`;
}

export const HeroComparisonSlider: React.FC<Props> = ({ selectedRoomSlug = 'living-room' }) => {
  const { allProducts, rooms, navigate } = useStore();
  const [sliderPos, setSliderPos] = useState<number>(50); // 50% initial
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentFrame, setCurrentFrame] = useState<number>(1);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const nightLayerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const sliderPosRef = useRef<number>(50);
  const currentFrameRef = useRef<number>(1);
  const isPlayingRef = useRef<boolean>(true);
  const lastFrameTimeRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);

  // Canvas refs for high-performance lockstep rendering
  const dayCanvasRef = useRef<HTMLCanvasElement>(null);
  const nightCanvasRef = useRef<HTMLCanvasElement>(null);

  // Image cache
  const dayImagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES + 1).fill(null));
  const nightImagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES + 1).fill(null));

  const currentRoom = rooms.find((r) => r.slug === selectedRoomSlug) || rooms[0];

  // Draw current frame to canvas
  const drawFrame = useCallback((frameIdx: number) => {
    const dayImg = dayImagesRef.current[frameIdx];
    const nightImg = nightImagesRef.current[frameIdx];

    if (dayCanvasRef.current && dayImg && dayImg.complete && dayImg.naturalWidth > 0) {
      const ctx = dayCanvasRef.current.getContext('2d');
      if (ctx) {
        if (dayCanvasRef.current.width !== dayImg.naturalWidth) {
          dayCanvasRef.current.width = dayImg.naturalWidth;
          dayCanvasRef.current.height = dayImg.naturalHeight;
        }
        ctx.drawImage(dayImg, 0, 0);
      }
    }

    if (nightCanvasRef.current && nightImg && nightImg.complete && nightImg.naturalWidth > 0) {
      const ctx = nightCanvasRef.current.getContext('2d');
      if (ctx) {
        if (nightCanvasRef.current.width !== nightImg.naturalWidth) {
          nightCanvasRef.current.width = nightImg.naturalWidth;
          nightCanvasRef.current.height = nightImg.naturalHeight;
        }
        ctx.drawImage(nightImg, 0, 0);
      }
    }
  }, []);

  // Frame loading & buffering engine
  useEffect(() => {
    let isCancelled = false;

    // Load an individual frame
    const loadSingleFrame = (type: 'day' | 'night', index: number): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        const cache = type === 'day' ? dayImagesRef.current : nightImagesRef.current;
        if (cache[index] && cache[index]!.complete) {
          resolve(cache[index]!);
          return;
        }

        const img = new Image();
        img.src = getFrameUrl(type, index);
        img.onload = () => {
          cache[index] = img;
          resolve(img);
        };
        img.onerror = () => {
          resolve(img);
        };
      });
    };

    // Stage 1: Load first frame immediately
    Promise.all([
      loadSingleFrame('day', 1),
      loadSingleFrame('night', 1)
    ]).then(() => {
      if (isCancelled) return;
      drawFrame(1);
      setIsLoaded(true);

      // Stage 2: Load initial buffer (frames 2-30) for smooth playback
      const initialBufferPromises: Promise<HTMLImageElement>[] = [];
      for (let i = 2; i <= Math.min(30, TOTAL_FRAMES); i++) {
        initialBufferPromises.push(loadSingleFrame('day', i));
        initialBufferPromises.push(loadSingleFrame('night', i));
      }

      Promise.all(initialBufferPromises).then(() => {
        if (isCancelled) return;

        // Stage 3: Progressively buffer the remaining frames in the background
        let nextIndex = 31;
        const loadRemainingBatch = () => {
          if (isCancelled || nextIndex > TOTAL_FRAMES) return;
          const batchEnd = Math.min(nextIndex + 15, TOTAL_FRAMES);
          const batchPromises: Promise<HTMLImageElement>[] = [];
          for (let i = nextIndex; i <= batchEnd; i++) {
            batchPromises.push(loadSingleFrame('day', i));
            batchPromises.push(loadSingleFrame('night', i));
          }
          nextIndex = batchEnd + 1;
          Promise.all(batchPromises).then(() => {
            if (!isCancelled && nextIndex <= TOTAL_FRAMES) {
              if (window.requestIdleCallback) {
                window.requestIdleCallback(loadRemainingBatch);
              } else {
                setTimeout(loadRemainingBatch, 60);
              }
            }
          });
        };

        if (window.requestIdleCallback) {
          window.requestIdleCallback(loadRemainingBatch);
        } else {
          setTimeout(loadRemainingBatch, 100);
        }
      });
    });

    return () => {
      isCancelled = true;
    };
  }, [drawFrame]);

  // Synchronized playback animation loop (Lockstep 1..300)
  useEffect(() => {
    const loop = (timestamp: number) => {
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = timestamp;
      }

      const elapsed = timestamp - lastFrameTimeRef.current;

      if (isPlayingRef.current && elapsed >= FRAME_INTERVAL) {
        lastFrameTimeRef.current = timestamp - (elapsed % FRAME_INTERVAL);
        
        // Advance frame 1..300
        let next = currentFrameRef.current + 1;
        if (next > TOTAL_FRAMES) {
          next = 1;
        }
        currentFrameRef.current = next;

        // Draw synchronized frames
        drawFrame(next);
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [drawFrame]);

  // Toggle play/pause
  const togglePlayPause = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isPlayingRef.current;
    isPlayingRef.current = nextState;
    setIsPlaying(nextState);
  }, []);

  // Update slider position with direct DOM manipulation for 60fps zero-lag response
  const updateSliderVisual = useCallback((percentage: number) => {
    const clamped = Math.max(0, Math.min(100, percentage));
    sliderPosRef.current = clamped;

    if (dividerRef.current) {
      dividerRef.current.style.left = `${clamped}%`;
    }
    if (nightLayerRef.current) {
      // Reveal NIGHT from clamped% to 100% (Right side)
      nightLayerRef.current.style.clipPath = `inset(0 0 0 ${clamped}%)`;
      (nightLayerRef.current.style as CSSStyleDeclaration & { webkitClipPath?: string }).webkitClipPath = `inset(0 0 0 ${clamped}%)`;
    }
  }, []);

  // Pointer interaction handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    isDraggingRef.current = true;
    containerRef.current.setPointerCapture(e.pointerId);

    const rect = containerRef.current.getBoundingClientRect();
    const percentage = ((e.clientX - rect.left) / rect.width) * 100;
    updateSliderVisual(percentage);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const percentage = ((e.clientX - rect.left) / rect.width) * 100;
    updateSliderVisual(percentage);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (containerRef.current && containerRef.current.hasPointerCapture(e.pointerId)) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }
    // Sync React state on release
    setSliderPos(sliderPosRef.current);
  };

  // Synchronize initial clip path and divider on mount
  useEffect(() => {
    updateSliderVisual(50);
  }, [updateSliderVisual]);

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/11] rounded-3xl overflow-hidden shadow-soft-2xl border border-[#4A2C1A]/20 select-none bg-[#1A1614]">
      {/* Interactive Drag Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full h-full cursor-ew-resize overflow-hidden touch-pan-y"
        style={{ touchAction: 'pan-y' }}
      >
        {/* ============================================================ */}
        {/* BASE LAYER: DAY LIVING ROOM (Visible on the LEFT side)        */}
        {/* ============================================================ */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Fallback image while loading */}
          <img
            src={getFrameUrl('day', 1)}
            alt="Veloura Living Room Day Cinematic"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              isLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          />
          {/* Canvas for smooth lockstep frame animation */}
          <canvas
            ref={dayCanvasRef}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15 pointer-events-none" />

          {/* DAY Pill Badge (Left Side) */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold uppercase tracking-wider shadow-lg">
              <Sun className="w-3.5 h-3.5 text-[#F5B041]" />
              Day Scene
            </span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* TOP LAYER: NIGHT LIVING ROOM (Clipped to RIGHT side)        */}
        {/* ============================================================ */}
        <div
          ref={nightLayerRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10 will-change-[clip-path]"
          style={{
            clipPath: `inset(0 0 0 ${sliderPos}%)`,
            WebkitClipPath: `inset(0 0 0 ${sliderPos}%)`,
          }}
        >
          {/* Fallback image while loading */}
          <img
            src={getFrameUrl('night', 1)}
            alt="Veloura Living Room Night Cinematic"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              isLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          />
          {/* Canvas for smooth lockstep frame animation */}
          <canvas
            ref={nightCanvasRef}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25 pointer-events-none" />

          {/* NIGHT Pill Badge (Right Side) */}
          <div className="absolute top-4 right-4 z-20 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold uppercase tracking-wider shadow-lg">
              <Moon className="w-3.5 h-3.5 text-[#C49A6C]" />
              Night Glow
            </span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* DRAGGABLE VERTICAL DIVIDER & TACTILE BRASS HANDLE           */}
        {/* ============================================================ */}
        <div
          ref={dividerRef}
          className="absolute top-0 bottom-0 z-30 -translate-x-1/2 pointer-events-none will-change-[left]"
          style={{ left: `${sliderPos}%` }}
        >
          {/* Vertical Precision Divider Line */}
          <div className="w-[2px] h-full bg-gradient-to-b from-white via-[#E0C097] to-white shadow-[0_0_12px_rgba(224,192,151,0.9)]" />

          {/* Center Tactile Brass Handle Knob */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#3D2314] border-2 border-[#E0C097] shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex items-center justify-center text-white transition-transform active:scale-110">
            <div className="flex items-center gap-0.5 text-[#F5E6D3]">
              <span className="text-[9px] font-bold tracking-tighter">◀</span>
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="text-[9px] font-bold tracking-tighter">▶</span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* INTERACTIVE PIECE HOTSPOTS (Sofa, Lamp, Fireplace)           */}
        {/* ============================================================ */}
        {currentRoom.hotspots &&
          currentRoom.hotspots.slice(0, 3).map((hs) => {
            const linkedProduct = allProducts.find((p) => p.id === hs.productId);
            return (
              <div
                key={hs.id}
                style={{ top: `${hs.yPercent}%`, left: `${hs.xPercent}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group/hs pointer-events-auto"
              >
                <span className="absolute -inset-2 rounded-full bg-[#8B5A2B]/40 hotspot-pulse-anim pointer-events-none" />
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (linkedProduct) navigate(`/products/${linkedProduct.slug}`);
                  }}
                  className="relative w-6 h-6 rounded-full bg-white text-[#4A2C1A] flex items-center justify-center shadow-xl border-2 border-[#8B5A2B] text-[11px] font-bold group-hover/hs:scale-125 transition-transform cursor-pointer"
                  aria-label={`Inspect ${hs.name}`}
                >
                  <Plus className="w-3.5 h-3.5 text-[#8B5A2B]" />
                </button>

                {/* Hotspot Floating Preview Card */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-black/90 backdrop-blur-md text-white p-2.5 rounded-xl shadow-2xl border border-white/20 whitespace-nowrap opacity-0 group-hover/hs:opacity-100 transition-opacity pointer-events-none z-30 min-w-[150px]">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-[#EADBC8]">{hs.type}</div>
                  <div className="text-xs font-bold text-white truncate">{hs.name}</div>
                  {linkedProduct && (
                    <div className="text-[11px] font-semibold text-[#C49A6C] mt-0.5">
                      ₹{linkedProduct.price.toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

        {/* ============================================================ */}
        {/* BOTTOM CONTROLS & CINEMATIC BAR                             */}
        {/* ============================================================ */}
        <div className="absolute bottom-4 inset-x-4 flex items-center justify-between z-30 pointer-events-auto">
          {/* Play/Pause & Live Frame Indicator */}
          <div className="flex items-center gap-2">
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={togglePlayPause}
              className="px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-lg hover:bg-black/90 transition-colors cursor-pointer"
              title={isPlaying ? 'Pause Motion' : 'Play Motion'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3 h-3 text-[#F5B041]" />
                  <span className="hidden sm:inline">Living Motion</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-[#F5B041] fill-current" />
                  <span className="hidden sm:inline">Play Motion</span>
                </>
              )}
            </button>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md text-[#E0D7CD] text-[10px] font-medium border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Day ↔ Night Lockstep
            </span>
          </div>

          {/* Quick CTA to explore the room */}
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/rooms/${currentRoom.slug}`);
            }}
            className="text-xs font-bold text-[#F5E6D3] hover:text-white bg-[#8B5A2B] hover:bg-[#A06C38] px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1 shadow-lg cursor-pointer"
          >
            <span>Explore {currentRoom.name}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
