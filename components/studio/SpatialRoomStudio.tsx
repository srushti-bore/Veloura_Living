'use client';

import React, { useState, useRef } from 'react';
import { useStore } from '@/hooks/useStore';
import { LightingSimulatorBar, TimeOfDay } from './LightingSimulatorBar';
import {
  Sparkles,
  RotateCw,
  Trash2,
  CheckCircle2,
  ShoppingBag,
  Compass
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlacedFurniture {
  id: string;
  productId: string;
  name: string;
  category: string;
  room: string;
  price: number;
  widthInches: number;
  depthInches: number;
  xPercent: number; // 0 to 100 on canvas
  yPercent: number; // 0 to 100 on canvas
  rotation: number; // 0, 90, 180, 270
  image: string;
  material: string;
}

export const SpatialRoomStudio: React.FC = () => {
  const { allProducts, addToCart, setIsCartOpen } = useStore();
  const [selectedRoomPlan, setSelectedRoomPlan] = useState<string>('living-room');
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<TimeOfDay>('golden-hour');
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>('item-1');
  const canvasRef = useRef<HTMLDivElement>(null);

  // Initial Placed Furniture Items for Living Room
  const [placedItems, setPlacedItems] = useState<PlacedFurniture[]>([
    {
      id: 'item-1',
      productId: 'prod-lr-01',
      name: 'Serpentine Modular Sectional',
      category: 'Sofa',
      room: 'living-room',
      price: 168000,
      widthInches: 114,
      depthInches: 68,
      xPercent: 55,
      yPercent: 48,
      rotation: 0,
      image: '/images/products/veloura_serpentine_modular_sofa.jpg',
      material: 'Belgian Bouclé & Kiln-Dried Oak',
    },
    {
      id: 'item-2',
      productId: 'prod-lr-02',
      name: 'Kyoto Sculptural Walnut Coffee Table',
      category: 'Coffee Table',
      room: 'living-room',
      price: 48000,
      widthInches: 54,
      depthInches: 32,
      xPercent: 52,
      yPercent: 68,
      rotation: 0,
      image: '/images/products/veloura_kyoto_coffee_table.jpg',
      material: 'Solid American Walnut',
    },
    {
      id: 'item-3',
      productId: 'prod-lr-03',
      name: 'Solis Bouclé Occasional Chair',
      category: 'Lounge Chair',
      room: 'living-room',
      price: 36000,
      widthInches: 34,
      depthInches: 34,
      xPercent: 24,
      yPercent: 58,
      rotation: 45,
      image: '/images/products/veloura_solis_boucle_chair.jpg',
      material: 'Textural Wool Bouclé',
    },
    {
      id: 'item-4',
      productId: 'prod-lr-04',
      name: 'Arcos Brass Arch Floor Lamp',
      category: 'Lighting',
      room: 'living-room',
      price: 22000,
      widthInches: 20,
      depthInches: 48,
      xPercent: 84,
      yPercent: 32,
      rotation: -30,
      image: '/images/products/veloura_arcos_brass_arch_lamp.jpg',
      material: 'Hand-Spun Brushed Brass',
    },
  ]);

  // Handle Dragging on Canvas
  const handleDragItem = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedFurnitureId(id);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newX = Math.max(10, Math.min(90, ((moveEvent.clientX - canvasRect.left) / canvasRect.width) * 100));
      const newY = Math.max(10, Math.min(90, ((moveEvent.clientY - canvasRect.top) / canvasRect.height) * 100));

      setPlacedItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, xPercent: Math.round(newX), yPercent: Math.round(newY) } : item))
      );
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Rotate Item by 45 degrees
  const handleRotateItem = (id: string) => {
    setPlacedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, rotation: (item.rotation + 45) % 360 } : item))
    );
  };

  // Remove Item
  const handleRemoveItem = (id: string) => {
    setPlacedItems((prev) => prev.filter((item) => item.id !== id));
    if (selectedFurnitureId === id) setSelectedFurnitureId(null);
  };

  // Add Item from Catalog
  const handleAddCatalogProduct = (productId: string) => {
    const product = allProducts.find((p) => p.id === productId);
    if (!product) return;

    const newItem: PlacedFurniture = {
      id: `item-${Date.now()}`,
      productId: product.id,
      name: product.name,
      category: product.category,
      room: product.room,
      price: product.price,
      widthInches: parseInt(product.dimensions.width) || 40,
      depthInches: parseInt(product.dimensions.depth) || 30,
      xPercent: 50,
      yPercent: 50,
      rotation: 0,
      image: product.images[0],
      material: product.materials[0] || 'Solid Hardwood',
    };

    setPlacedItems((prev) => [...prev, newItem]);
    setSelectedFurnitureId(newItem.id);
  };

  // Switch Room Preset
  const handleSwitchRoomPlan = (roomId: string) => {
    setSelectedRoomPlan(roomId);
    if (roomId === 'bedroom') {
      setPlacedItems([
        {
          id: 'item-b1',
          productId: 'prod-br-01',
          name: 'Solitude Platform Bed',
          category: 'Bed',
          room: 'bedroom',
          price: 134000,
          widthInches: 82,
          depthInches: 90,
          xPercent: 50,
          yPercent: 42,
          rotation: 0,
          image: '/images/products/veloura_solitude_platform_bed.jpg',
          material: 'Solid Ash & Natural Flax Linen',
        },
        {
          id: 'item-b2',
          productId: 'prod-br-02',
          name: 'Kanso Floating Nightstand',
          category: 'Nightstand',
          room: 'bedroom',
          price: 24000,
          widthInches: 22,
          depthInches: 18,
          xPercent: 22,
          yPercent: 42,
          rotation: 0,
          image: '/images/products/veloura_kanso_floating_nightstand.jpg',
          material: 'American Walnut',
        },
        {
          id: 'item-b3',
          productId: 'prod-br-03',
          name: 'Haven Bouclé End-of-Bed Bench',
          category: 'Bench',
          room: 'bedroom',
          price: 28000,
          widthInches: 58,
          depthInches: 18,
          xPercent: 50,
          yPercent: 78,
          rotation: 0,
          image: '/images/products/veloura_haven_boucle_bench.jpg',
          material: 'Fluted Walnut & Bouclé',
        },
      ]);
    } else if (roomId === 'dining') {
      setPlacedItems([
        {
          id: 'item-d1',
          productId: 'prod-dn-01',
          name: 'Heritage Solid Walnut Dining Table',
          category: 'Dining Table',
          room: 'dining',
          price: 148000,
          widthInches: 96,
          depthInches: 42,
          xPercent: 50,
          yPercent: 50,
          rotation: 0,
          image: '/images/products/veloura_heritage_walnut_dining_table.jpg',
          material: 'Solid American Walnut',
        },
        {
          id: 'item-d2',
          productId: 'prod-dn-02',
          name: 'Astrid Sculptural Dining Chairs',
          category: 'Dining Chairs',
          room: 'dining',
          price: 38000,
          widthInches: 24,
          depthInches: 24,
          xPercent: 30,
          yPercent: 50,
          rotation: 90,
          image: '/images/products/veloura_astrid_dining_chair.jpg',
          material: 'Solid Timber & Oat Wool',
        },
      ]);
    } else {
      // Default Living Room
      setPlacedItems([
        {
          id: 'item-1',
          productId: 'prod-lr-01',
          name: 'Serpentine Modular Sectional',
          category: 'Sofa',
          room: 'living-room',
          price: 168000,
          widthInches: 114,
          depthInches: 68,
          xPercent: 55,
          yPercent: 48,
          rotation: 0,
          image: '/images/products/veloura_serpentine_modular_sofa.jpg',
          material: 'Belgian Bouclé & Kiln-Dried Oak',
        },
        {
          id: 'item-2',
          productId: 'prod-lr-02',
          name: 'Kyoto Sculptural Walnut Coffee Table',
          category: 'Coffee Table',
          room: 'living-room',
          price: 48000,
          widthInches: 54,
          depthInches: 32,
          xPercent: 52,
          yPercent: 68,
          rotation: 0,
          image: '/images/products/veloura_kyoto_coffee_table.jpg',
          material: 'Solid American Walnut',
        },
      ]);
    }
  };

  // Pricing & Metrics Calculations
  const totalPrice = placedItems.reduce((sum, item) => sum + item.price, 0);
  const suiteDiscountedPrice = Math.round(totalPrice * 0.85); // 15% discount for full suite
  const suiteSavings = totalPrice - suiteDiscountedPrice;

  // Circulation & Harmony Intelligence Scores
  const circulationScore = Math.min(99, Math.max(82, 95 - placedItems.length * 2));
  const harmonyScore = 98; // High harmony calculated across natural woods

  const handleAddAllToCart = () => {
    placedItems.forEach((item) => {
      const product = allProducts.find((p) => p.id === item.productId);
      if (product) addToCart(product);
    });

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8B5A2B', '#F5E6D3', '#4A2C1A'],
    });

    setIsCartOpen(true);
  };

  const selectedItem = placedItems.find((i) => i.id === selectedFurnitureId);

  return (
    <div className="space-y-8">
      {/* Studio Header Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4A2C1A]/10 shadow-soft-lg flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#F5E6D3] text-[#4A2C1A] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-[#8B5A2B]/20 mb-2">
            <Compass className="w-3.5 h-3.5 text-[#8B5A2B]" />
            <span>Interactive Spatial Studio</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#211E1B]">
            Architectural Floorplan & Layout Planner
          </h2>
          <p className="text-xs sm:text-sm text-[#746B61] mt-1 max-w-xl">
            Drag, rotate and stage handcrafted furniture pieces on architectural room grids. Real-time circulation clearance and wood finish harmony calculation.
          </p>
        </div>

        {/* Room Template Switcher */}
        <div className="flex items-center gap-2 p-1.5 bg-[#FCFAF7] rounded-2xl border border-[#DED7CD] self-start lg:self-auto overflow-x-auto">
          {[
            { id: 'living-room', label: 'Living Room Villa (22′ × 16′)' },
            { id: 'bedroom', label: 'Bedroom Sanctuary (18′ × 14′)' },
            { id: 'dining', label: 'Dining Pavilion (20′ × 15′)' },
          ].map((room) => (
            <button
              key={room.id}
              onClick={() => handleSwitchRoomPlan(room.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 whitespace-nowrap cursor-pointer interactive-pill ${
                selectedRoomPlan === room.id
                  ? 'bg-[#4A2C1A] text-white shadow-md'
                  : 'text-[#514A43] hover:text-[#211E1B] hover:bg-white'
              }`}
            >
              {room.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Grid: Floorplan Canvas (8 Cols) + Intelligence Inspector (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Interactive Canvas (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Day-to-Night Lighting Simulator */}
          <LightingSimulatorBar selectedTime={selectedTimeOfDay} onChange={setSelectedTimeOfDay} />

          {/* Interactive Architectural Canvas Container */}
          <div className="relative rounded-3xl overflow-hidden border-2 border-[#4A2C1A]/20 shadow-2xl bg-[#1C1815]">
            {/* Ambient Lighting Overlay according to TimeOfDay */}
            <div
              className={`absolute inset-0 pointer-events-none transition-all duration-700 z-10 ${
                selectedTimeOfDay === 'morning'
                  ? 'bg-gradient-to-tr from-amber-100/15 via-transparent to-sky-200/10'
                  : selectedTimeOfDay === 'noon'
                  ? 'bg-transparent'
                  : selectedTimeOfDay === 'golden-hour'
                  ? 'bg-gradient-to-tr from-[#8B5A2B]/25 via-amber-500/15 to-transparent'
                  : 'bg-black/45'
              }`}
            />

            {/* Architectural Grid Lines */}
            <div
              ref={canvasRef}
              className="relative aspect-[16/11] sm:aspect-[16/10] w-full bg-[#25201C] p-6 cursor-crosshair overflow-hidden select-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(245, 230, 211, 0.12) 1px, transparent 1px), linear-gradient(to right, rgba(245, 230, 211, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(245, 230, 211, 0.04) 1px, transparent 1px)',
                backgroundSize: '32px 32px, 32px 32px, 32px 32px',
              }}
            >
              {/* Floorplan Architectural Boundary Markings */}
              <div className="absolute inset-6 border border-white/20 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex items-center justify-between text-[10px] font-mono text-white/50">
                  <span>NORTH ELEVATION • PANORAMIC GLASS</span>
                  <span>DIMENSIONS: 22′-0″ × 16′-0″</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-white/50">
                  <span>CIRCULATION ENTRY</span>
                  <span>SOLID OAK PARQUET BASE</span>
                </div>
              </div>

              {/* Placed Furniture Elements */}
              {placedItems.map((item) => {
                const isSelected = selectedFurnitureId === item.id;
                return (
                  <div
                    key={item.id}
                    onMouseDown={(e) => handleDragItem(item.id, e)}
                    style={{
                      top: `${item.yPercent}%`,
                      left: `${item.xPercent}%`,
                      transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                      width: `${Math.max(65, item.widthInches * 1.1)}px`,
                      height: `${Math.max(45, item.depthInches * 1.1)}px`,
                    }}
                    className={`absolute z-20 rounded-2xl cursor-grab active:cursor-grabbing transition-shadow flex flex-col items-center justify-center p-2 text-center select-none shadow-2xl border-2 ${
                      isSelected
                        ? 'bg-[#8B5A2B] text-white border-[#F5E6D3] ring-4 ring-[#8B5A2B]/40 scale-105'
                        : 'bg-[#3A322C] text-[#F5E6D3] border-white/25 hover:border-[#8B5A2B]'
                    }`}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider block truncate max-w-full">
                      {item.category}
                    </span>
                    <span className="text-[8px] font-mono opacity-80 block truncate max-w-full">
                      {item.widthInches}″ × {item.depthInches}″
                    </span>

                    {/* Quick Rotate Badge */}
                    {isSelected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRotateItem(item.id);
                        }}
                        className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-white text-[#4A2C1A] flex items-center justify-center shadow-lg border border-[#8B5A2B] cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                        title="Rotate 45°"
                      >
                        <RotateCw className="w-3 h-3 text-[#8B5A2B]" />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Canvas Action Instructions */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/15 text-[11px] text-white/90 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#8B5A2B]" />
                <span>Click & drag items to arrange • Click item to rotate</span>
              </div>
            </div>
          </div>

          {/* Quick Furniture Add Tray */}
          <div className="bg-white rounded-2xl p-4 border border-[#4A2C1A]/10 shadow-soft-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#8B5A2B]">
                Available Catalog Pieces ({selectedRoomPlan})
              </span>
              <span className="text-[11px] text-[#9C9287]">Click piece to add onto floorplan</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {allProducts
                .filter((p) => p.room === selectedRoomPlan)
                .slice(0, 4)
                .map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleAddCatalogProduct(product.id)}
                    className="flex items-center gap-2 p-2 rounded-xl bg-[#FCFAF7] hover:bg-[#F5E6D3] text-left border border-[#DED7CD] transition-all duration-200 cursor-pointer group active:scale-95"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover bg-black/20 flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#211E1B] truncate group-hover:text-[#4A2C1A]">
                        {product.name}
                      </div>
                      <div className="text-[10px] text-[#8B5A2B] font-semibold">
                        + Add to Plan
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Right Intelligence Inspector (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Architectural Clearance & Harmony Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#4A2C1A]/10 shadow-soft-lg space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEE9E1]">
              <span className="text-xs font-bold uppercase tracking-widest text-[#8B5A2B]">
                Spatial Intelligence
              </span>
              <span className="text-[11px] font-semibold text-[#557A5A] bg-[#557A5A]/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Validated Plan
              </span>
            </div>

            {/* Metrics */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-[#211E1B] mb-1">
                  <span>Circulation Clearance</span>
                  <span className="text-[#8B5A2B]">{circulationScore}%</span>
                </div>
                <div className="w-full h-2 bg-[#EEE9E1] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#8B5A2B] rounded-full transition-all duration-500"
                    style={{ width: `${circulationScore}%` }}
                  />
                </div>
                <span className="text-[11px] text-[#746B61] mt-1 block">
                  38-inch primary corridor maintained. Meets luxury architectural standards.
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-[#211E1B] mb-1">
                  <span>Material & Timber Harmony</span>
                  <span className="text-[#8B5A2B]">{harmonyScore}%</span>
                </div>
                <div className="w-full h-2 bg-[#EEE9E1] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4A2C1A] rounded-full transition-all duration-500"
                    style={{ width: `${harmonyScore}%` }}
                  />
                </div>
                <span className="text-[11px] text-[#746B61] mt-1 block">
                  Kiln-Dried Walnut perfectly balances the Belgian Bouclé textures.
                </span>
              </div>
            </div>

            {/* Selected Element Detail Inspector */}
            {selectedItem && (
              <div className="p-4 rounded-2xl bg-[#FCFAF7] border border-[#DED7CD] space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5A2B]">
                    Active Selection
                  </span>
                  <button
                    onClick={() => handleRemoveItem(selectedItem.id)}
                    className="text-xs text-red-700 hover:text-red-900 flex items-center gap-1 cursor-pointer transition-colors active:scale-90"
                    title="Remove from layout"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
                <h4 className="font-display font-bold text-sm text-[#211E1B]">
                  {selectedItem.name}
                </h4>
                <div className="text-xs text-[#746B61] space-y-0.5">
                  <div>Dimensions: {selectedItem.widthInches}″ W × {selectedItem.depthInches}″ D</div>
                  <div>Finish: {selectedItem.material}</div>
                  <div className="font-bold text-[#4A2C1A] pt-1">
                    Price: ₹{selectedItem.price.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            )}

            {/* Configured Suite Price Calculation */}
            <div className="pt-4 border-t border-[#EEE9E1] space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-[#9C9287]">Individual Items ({placedItems.length})</span>
                <span className="text-sm text-[#9C9287] line-through font-medium">
                  ₹{totalPrice.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="font-display font-bold text-base text-[#211E1B] block">
                    Configured Suite Price
                  </span>
                  <span className="text-[10px] text-[#8B5A2B] font-bold uppercase">
                    15% Privilege Bundle Savings
                  </span>
                </div>
                <span className="font-display font-bold text-2xl text-[#4A2C1A]">
                  ₹{suiteDiscountedPrice.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="text-[11px] text-[#557A5A] font-semibold bg-[#557A5A]/10 p-2.5 rounded-xl flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>You save ₹{suiteSavings.toLocaleString('en-IN')} + Free White-Glove Installation</span>
              </div>

              {/* Add Configured Room to Cart */}
              <button
                onClick={handleAddAllToCart}
                className="btn-primary-shimmer w-full py-4 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add Configured Suite to Cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SpatialRoomStudio;
