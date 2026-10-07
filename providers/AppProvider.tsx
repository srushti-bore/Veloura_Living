'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order, Coupon, AIMessage, RoomType, ProductVariant, Room } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import { PRODUCTS, ROOMS, COUPONS } from '@/lib/data/mockData';

export interface FilterState {
  room: RoomType | 'all';
  category: string;
  furnitureType: string;
  maxPrice: number;
  material: string;
  color: string;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
}

const INITIAL_FILTERS: FilterState = {
  room: 'all',
  category: 'all',
  furnitureType: 'all',
  maxPrice: 200000,
  material: 'all',
  color: 'all',
  sortBy: 'featured'
};

const INITIAL_AI_MESSAGES: AIMessage[] = [
  {
    id: 'ai-welcome',
    sender: 'assistant',
    text: "Namaste! I am Veloura's Spatial Intelligence Consultant. I can help you select furniture tailored to your room dimensions, architectural lighting, material palette, or budget. What space are you curating today?",
    timestamp: 'Just now',
    actionPrompt: 'Help me choose furniture for my living room'
  }
];

export function useVelouraStore() {
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = pathname || '/';

  const navigate = (path: string) => {
    const target = path.startsWith('/') ? path : `/${path}`;
    try {
      router.push(target);
    } catch {
      if (typeof window !== 'undefined') {
        window.location.href = target;
      }
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const savedCart = localStorage.getItem('veloura_cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCart(parsed);
        }
      }
      const savedWishlist = localStorage.getItem('veloura_wishlist');
      if (savedWishlist) {
        const parsed = JSON.parse(savedWishlist);
        if (Array.isArray(parsed)) {
          setWishlist(parsed);
        }
      }
      const savedOrders = localStorage.getItem('veloura_orders');
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        if (Array.isArray(parsed)) {
          setOrders(parsed);
        }
      }
    } catch (e) {
      console.error('Storage initialization error:', e);
    }
  }, []);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem('veloura_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart, isMounted]);

  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem('veloura_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist, isMounted]);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const addToCart = (product: Product, variant?: ProductVariant, quantity: number = 1) => {
    const variantId = variant?.id;
    const itemKey = variantId ? `${product.id}-${variantId}` : product.id;
    const price = variant?.salePrice || variant?.price || product.salePrice || product.price;
    const selectedColor = variant?.colorName || product.colors[0] || 'Default';
    const selectedMaterial = variant?.material || product.materials[0] || 'Default';

    setCart(prev => {
      const existing = prev.find(item => item.id === itemKey);
      if (existing) {
        return prev.map(item =>
          item.id === itemKey ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: itemKey,
          productId: product.id,
          variantId,
          quantity,
          selectedColor,
          selectedMaterial,
          price,
          product
        }
      ];
    });

    setIsCartOpen(true);
  };

  const updateCartQuantity = (itemKey: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemKey);
      return;
    }
    setCart(prev => prev.map(item => (item.id === itemKey ? { ...item, quantity: newQuantity } : item)));
  };

  const removeFromCart = (itemKey: string) => {
    setCart(prev => prev.filter(item => item.id !== itemKey));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  let discountAmount = 0;
  if (appliedCoupon && cartSubtotal >= appliedCoupon.minSpend) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round((cartSubtotal * appliedCoupon.value) / 100);
    } else {
      discountAmount = appliedCoupon.value;
    }
  }

  const shippingCost = cartSubtotal >= 2999 || cartSubtotal === 0 ? 0 : 199;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost);

  const applyCouponCode = (code: string): { success: boolean; message: string } => {
    const found = COUPONS.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!found) {
      return { success: false, message: 'Invalid coupon code. Try VELOURA10 or ROOM5000' };
    }
    if (cartSubtotal < found.minSpend) {
      return {
        success: false,
        message: `Minimum order amount of ₹${found.minSpend.toLocaleString('en-IN')} required for this privilege code.`
      };
    }
    setAppliedCoupon(found);
    return { success: true, message: `Applied: ${found.description}` };
  };

  const [orders, setOrders] = useState<Order[]>([]);

  const createOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'trackingNumber' | 'timeline'>): Order => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `VL-2026-${randomNum}`,
      createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      trackingNumber: `VL-EXP-${randomNum}-TRK`,
      timeline: [
        {
          status: 'Order Placed & Payment Verified',
          date: 'Just now',
          description: 'Payment captured securely. Order dispatched to production desk.',
          completed: true
        },
        {
          status: 'Master Crafting & Upholstery',
          date: 'Expected in 1-2 days',
          description: 'Kiln-dried frame prep and hand upholstery inspection.',
          completed: false
        },
        {
          status: 'Quality Inspection',
          date: 'Expected in 3 days',
          description: '32-point stability & finish examination.',
          completed: false
        },
        {
          status: 'White-Glove In-Home Delivery',
          date: 'Expected in 5-7 days',
          description: 'Delivery team will position in room and remove all packaging.',
          completed: false
        }
      ]
    };

    const updated = [newOrder, ...orders];
    setOrders(updated);
    if (isMounted) {
      try {
        localStorage.setItem('veloura_orders', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    }
    clearCart();
    return newOrder;
  };

  const [aiMessages, setAiMessages] = useState<AIMessage[]>(INITIAL_AI_MESSAGES);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);

  const sendAIMessage = async (promptText: string) => {
    const userMsg: AIMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: 'Just now'
    };

    setAiMessages(prev => [...prev, userMsg]);
    setIsAIThinking(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptText,
          conversationHistory: aiMessages.map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const aiReply: AIMessage = {
            id: `ai-${Date.now()}`,
            sender: 'assistant',
            text: data.data.message,
            timestamp: 'Just now',
            recommendedProducts: data.data.recommendedProducts && data.data.recommendedProducts.length > 0
              ? data.data.recommendedProducts.map((p: any) => ({
                  id: p.id,
                  name: p.name,
                  slug: p.slug,
                  price: p.price,
                  salePrice: p.salePrice,
                  rating: 5.0,
                  reviewsCount: 18,
                  images: [p.image || '/images/products/veloura_solis_boucle_chair.jpg'],
                  room: p.category?.toLowerCase() || 'living-room',
                  category: p.category || 'Living',
                  materials: p.materials || ['Solid Walnut'],
                  dimensions: 'Standard Dimensions',
                  leadTime: '3-5 business days',
                  isFeatured: true,
                  stock: 10,
                  shortDescription: p.name,
                  fullDescription: p.name,
                  sku: p.slug || 'SKU-001',
                  careGuide: 'Wipe with soft cloth',
                  availability: p.availability || 'in_stock'
                }))
              : PRODUCTS.slice(0, 3),
            roomTip: data.data.roomTip,
            paletteSuggestion: data.data.paletteSuggestion || ['#4A2C1A', '#A9794F', '#D8B486', '#FAF7F2']
          };

          setAiMessages(prev => [...prev, aiReply]);
          setIsAIThinking(false);
          return;
        }
      }
    } catch (e) {
      console.warn('AI API fallback to local model:', e);
    }

    // Local Fallback Heuristics
    setTimeout(() => {
      const lower = promptText.toLowerCase();
      let responseText = "";
      let matchedProds: Product[] = [];
      let roomTip = "";
      let palette: string[] = [];

      if (lower.includes('living') || lower.includes('sofa') || lower.includes('sectional') || lower.includes('coffee')) {
        matchedProds = PRODUCTS.filter(p => p.room === 'living-room').slice(0, 3);
        responseText = "For your living room, I recommend pairing the low-profile Serpentine Sectional with the organic Kyoto Walnut Coffee Table. This preserves sightlines and allows natural light to bounce across the boucle texture.";
        roomTip = "Spatial Tip: Maintain at least 36 inches between your sofa edge and coffee table for effortless flow.";
        palette = ['#F5E6D3', '#4A2C1A', '#EEE9E1', '#8B5A2B'];
      } else if (lower.includes('bed') || lower.includes('sleep') || lower.includes('bedroom')) {
        matchedProds = PRODUCTS.filter(p => p.room === 'bedroom').slice(0, 3);
        responseText = "For a restful sanctuary, low-profile horizontal lines signal calming reassurance to the circadian rhythm. The Solitude King Bed with floating Kanso nightstands eliminates visual clutter.";
        roomTip = "Acoustic Tip: Solid wood slats and dense linen headboards reduce room flutter echo by up to 35%.";
        palette = ['#F7F4EF', '#514A43', '#8B5A2B', '#EADBC8'];
      } else if (lower.includes('dining') || lower.includes('dinner') || lower.includes('table')) {
        matchedProds = PRODUCTS.filter(p => p.room === 'dining').slice(0, 3);
        responseText = "The Heritage 8-Seater Solid Walnut table is crafted with a continuous grain top. When paired with steam-bent Astrid chairs and warm 2700K Eclipse lighting, it creates an unhurried, intimate dining atmosphere.";
        roomTip = "Dining Rule: Hang your chandelier 30–34 inches above the tabletop surface for non-glare illumination.";
        palette = ['#4A2C1A', '#F5E6D3', '#557A5A', '#746B61'];
      } else if (lower.includes('office') || lower.includes('desk') || lower.includes('work') || lower.includes('chair')) {
        matchedProds = PRODUCTS.filter(p => p.room === 'office').slice(0, 3);
        responseText = "For elevated focus, our Meridian Desk conceals all wiring channels while the Aeron Pro Chair delivers 12-hour synchronous lumbar support in Italian saddle leather.";
        roomTip = "Ergonomic Rule: Screen top should align with eye level, with feet planted flat on the floor.";
        palette = ['#332E29', '#8B5A2B', '#514A43', '#FCFAF7'];
      } else if (lower.includes('budget') || lower.includes('price') || lower.includes('under') || lower.includes('lakh')) {
        matchedProds = PRODUCTS.filter(p => p.price < 60000).slice(0, 3);
        responseText = "Here are our finest handcrafted essential pieces under ₹60,000 that deliver signature Veloura craftsmanship without compromise.";
        palette = ['#8B5A2B', '#F5E6D3', '#4A2C1A'];
      } else {
        matchedProds = PRODUCTS.slice(0, 3);
        responseText = "Veloura's design philosophy centers on warm minimalism, natural timber, and tactile comfort. Here are our flagship architectural pieces that elevate any space:";
        roomTip = "Every piece in our catalog is backed by our generational warranty and white-glove room assembly.";
        palette = ['#8B5A2B', '#4A2C1A', '#F5E6D3', '#EADBC8'];
      }

      const aiReply: AIMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: 'Just now',
        recommendedProducts: matchedProds,
        roomTip,
        paletteSuggestion: palette
      };

      setAiMessages(prev => [...prev, aiReply]);
      setIsAIThinking(false);
    }, 600);
  };


  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [searchQuery, setSearchQuery] = useState('');

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSearchQuery('');
  };

  return {
    currentPath,
    navigate,
    cart,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartCount,
    discountAmount,
    shippingCost,
    cartTotal,
    appliedCoupon,
    applyCouponCode,
    wishlist,
    toggleWishlist,
    isWishlisted,
    orders,
    createOrder,
    aiMessages,
    isAIOpen,
    setIsAIOpen,
    isAIThinking,
    sendAIMessage,
    previewProduct,
    setPreviewProduct,
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    resetFilters,
    rooms: ROOMS as Room[],
    allProducts: PRODUCTS as Product[]
  };
}

export type VelouraStoreType = ReturnType<typeof useVelouraStore>;

const StoreContext = createContext<VelouraStoreType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useVelouraStore();
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within an AppProvider');
  }
  return context;
};
