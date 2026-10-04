/**
 * 🏛️ Veloura Living — Shopping Cart, Wishlist & Discovery Store
 * Reference: docs/Veloura_Living_SRS.md (Section 8, 10, 11, 32)
 */

import { getProductBySlugOrId, getVariantBySku, EnrichedVariant } from './catalogStore';

export interface AuthoritativeCartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  variant_id: string;
  variant_name: string;
  sku: string;
  image_url: string;
  selected_color: string;
  selected_material: string;
  unit_price: number;
  compare_at_price?: number;
  quantity: number;
  total_price: number;
  available_stock: number;
  is_in_stock: boolean;
}

export interface AuthoritativeCart {
  id: string;
  owner_key: string; // userId or sessionId
  items: AuthoritativeCartItem[];
  subtotal: number;
  estimated_tax: number;
  estimated_shipping: number;
  grand_total: number;
  total_items: number;
  updated_at: string;
}

// In-memory persistent stores keyed by userId or sessionId
const cartsStore: Map<string, AuthoritativeCart> = new Map();
const wishlistsStore: Map<string, Set<string>> = new Map();

export function calculateCartSummary(items: AuthoritativeCartItem[]): Omit<AuthoritativeCart, 'id' | 'owner_key' | 'items' | 'updated_at'> {
  const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const total_items = items.reduce((sum, item) => sum + item.quantity, 0);
  // Default GST 18% on luxury furniture (per SRS baseline)
  const estimated_tax = Math.round(subtotal * 0.18);
  // Complimentary White-Glove Shipping for luxury orders over ₹50,000; otherwise ₹2,500
  const estimated_shipping = subtotal > 50000 || subtotal === 0 ? 0 : 2500;
  const grand_total = subtotal + estimated_tax + estimated_shipping;

  return {
    subtotal,
    estimated_tax,
    estimated_shipping,
    grand_total,
    total_items,
  };
}

export function getCart(ownerKey: string): AuthoritativeCart {
  let cart = cartsStore.get(ownerKey);
  if (!cart) {
    cart = {
      id: crypto.randomUUID(),
      owner_key: ownerKey,
      items: [],
      subtotal: 0,
      estimated_tax: 0,
      estimated_shipping: 0,
      grand_total: 0,
      total_items: 0,
      updated_at: new Date().toISOString(),
    };
    cartsStore.set(ownerKey, cart);
  } else {
    // Re-verify prices and stock against live catalog
    cart.items.forEach((item) => {
      const liveVariant = getVariantBySku(item.sku);
      if (liveVariant) {
        item.unit_price = liveVariant.price;
        item.available_stock = liveVariant.stock;
        item.is_in_stock = liveVariant.stock >= item.quantity;
        item.total_price = item.unit_price * item.quantity;
      }
    });
    const summary = calculateCartSummary(cart.items);
    cart = { ...cart, ...summary, updated_at: new Date().toISOString() };
    cartsStore.set(ownerKey, cart);
  }
  return cart;
}

export const MAX_QUANTITY_PER_SKU = 10; // Aligned with SRS v1.1 CART-006

export function addToCart(
  ownerKey: string,
  variantSku: string,
  quantity = 1
): { cart: AuthoritativeCart; error?: string } {
  const cart = getCart(ownerKey);
  const variant = getVariantBySku(variantSku);

  if (!variant) {
    return { cart, error: `Variant with SKU '${variantSku}' not found.` };
  }

  const product = getProductBySlugOrId(variant.product_id);
  if (!product) {
    return { cart, error: 'Associated product not found.' };
  }

  const existingItemIndex = cart.items.findIndex((item) => item.sku.toUpperCase() === variantSku.toUpperCase());

  if (existingItemIndex > -1) {
    const newQty = cart.items[existingItemIndex].quantity + quantity;
    if (newQty > MAX_QUANTITY_PER_SKU) {
      return {
        cart,
        error: `Maximum allowed quantity per item is ${MAX_QUANTITY_PER_SKU} units (SRS CART-006).`,
      };
    }
    if (newQty > variant.stock) {
      return {
        cart,
        error: `Only ${variant.stock} units available in inventory for SKU '${variantSku}'.`,
      };
    }
    cart.items[existingItemIndex].quantity = newQty;
    cart.items[existingItemIndex].total_price = cart.items[existingItemIndex].unit_price * newQty;
    cart.items[existingItemIndex].available_stock = variant.stock;
  } else {
    if (quantity > MAX_QUANTITY_PER_SKU) {
      return {
        cart,
        error: `Maximum allowed quantity per item is ${MAX_QUANTITY_PER_SKU} units (SRS CART-006).`,
      };
    }
    if (quantity > variant.stock) {
      return {
        cart,
        error: `Requested ${quantity} units, but only ${variant.stock} available in stock.`,
      };
    }
    const newItem: AuthoritativeCartItem = {
      id: crypto.randomUUID(),
      product_id: product.id,
      product_name: product.name,
      product_slug: product.slug,
      variant_id: variant.id,
      variant_name: variant.variant_name,
      sku: variant.sku,
      image_url: variant.image_url || product.images[0],
      selected_color: variant.color_name || 'Natural',
      selected_material: variant.material || 'Solid Walnut',
      unit_price: variant.price,
      compare_at_price: variant.compare_at_price,
      quantity,
      total_price: variant.price * quantity,
      available_stock: variant.stock,
      is_in_stock: true,
    };
    cart.items.push(newItem);
  }

  const summary = calculateCartSummary(cart.items);
  const updatedCart: AuthoritativeCart = {
    ...cart,
    ...summary,
    updated_at: new Date().toISOString(),
  };
  cartsStore.set(ownerKey, updatedCart);
  return { cart: updatedCart };
}

export function updateCartItemQuantity(
  ownerKey: string,
  itemId: string,
  quantity: number
): { cart: AuthoritativeCart; error?: string } {
  const cart = getCart(ownerKey);
  const itemIndex = cart.items.findIndex((i) => i.id === itemId || i.sku === itemId);

  if (itemIndex === -1) {
    return { cart, error: 'Cart item not found.' };
  }

  if (quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    if (quantity > MAX_QUANTITY_PER_SKU) {
      return {
        cart,
        error: `Cannot set quantity to ${quantity}. Maximum allowed quantity per item is ${MAX_QUANTITY_PER_SKU} units.`,
      };
    }

    const variant = getVariantBySku(cart.items[itemIndex].sku);
    const maxStock = variant ? variant.stock : 99;

    if (quantity > maxStock) {
      return {
        cart,
        error: `Cannot set quantity to ${quantity}. Maximum available stock is ${maxStock}.`,
      };
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].total_price = cart.items[itemIndex].unit_price * quantity;
    cart.items[itemIndex].available_stock = maxStock;
    cart.items[itemIndex].is_in_stock = maxStock >= quantity;
  }

  const summary = calculateCartSummary(cart.items);
  const updatedCart: AuthoritativeCart = {
    ...cart,
    ...summary,
    updated_at: new Date().toISOString(),
  };
  cartsStore.set(ownerKey, updatedCart);
  return { cart: updatedCart };
}

export function removeFromCart(ownerKey: string, itemId: string): AuthoritativeCart {
  const cart = getCart(ownerKey);
  cart.items = cart.items.filter((i) => i.id !== itemId && i.sku !== itemId);
  const summary = calculateCartSummary(cart.items);
  const updatedCart: AuthoritativeCart = {
    ...cart,
    ...summary,
    updated_at: new Date().toISOString(),
  };
  cartsStore.set(ownerKey, updatedCart);
  return updatedCart;
}

export function clearCart(ownerKey: string): AuthoritativeCart {
  const emptyCart: AuthoritativeCart = {
    id: crypto.randomUUID(),
    owner_key: ownerKey,
    items: [],
    subtotal: 0,
    estimated_tax: 0,
    estimated_shipping: 0,
    grand_total: 0,
    total_items: 0,
    updated_at: new Date().toISOString(),
  };
  cartsStore.set(ownerKey, emptyCart);
  return emptyCart;
}

// ============================================================================
// WISHLIST
// ============================================================================

export function getWishlist(ownerKey: string): string[] {
  let list = wishlistsStore.get(ownerKey);
  if (!list) {
    list = new Set<string>();
    wishlistsStore.set(ownerKey, list);
  }
  return Array.from(list);
}

export function toggleWishlistItem(ownerKey: string, productId: string): { wishlist: string[]; isWishlisted: boolean } {
  let list = wishlistsStore.get(ownerKey);
  if (!list) {
    list = new Set<string>();
    wishlistsStore.set(ownerKey, list);
  }

  let isWishlisted = false;
  if (list.has(productId)) {
    list.delete(productId);
    isWishlisted = false;
  } else {
    list.add(productId);
    isWishlisted = true;
  }

  return {
    wishlist: Array.from(list),
    isWishlisted,
  };
}

export function removeFromWishlist(ownerKey: string, productId: string): string[] {
  const list = wishlistsStore.get(ownerKey);
  if (list) {
    list.delete(productId);
  }
  return list ? Array.from(list) : [];
}
