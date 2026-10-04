/**
 * 🏛️ Veloura Living — Catalog, Categories & Variant/SKU Data Store
 * Initialized with canonical luxury catalog from Phase 1 Foundation & mockData.
 * Reference: docs/Veloura_Living_SRS.md (Section 4, 5, 6, 7, Phase 3)
 */

import {
  DbCategory,
  DbBrand,
  DbProduct,
  DbProductVariant,
  DbInventory,
  FilterParams,
  PaginationParams,
} from '@/types';
import { SEED_CATEGORIES, SEED_BRANDS } from './dbSeedData';
import { PRODUCTS, ROOMS } from './mockData';

export interface EnrichedProduct extends DbProduct {
  sku?: string;
  category_name?: string;
  brand_name?: string;
  images: string[];
  materials: string[];
  colors: string[];
  room_slug?: string;
  room_name?: string;
  variants: EnrichedVariant[];
  total_inventory: number;
  availability: 'in_stock' | 'low_stock' | 'made_to_order' | 'out_of_stock';
}

export interface EnrichedVariant extends DbProductVariant {
  stock: number;
  image_url?: string;
}

// In-memory collections for fast server-side querying & dynamic mutations
let categoriesStore: DbCategory[] = [];
let brandsStore: DbBrand[] = [];
let productsStore: EnrichedProduct[] = [];
let isCatalogInitialized = false;

export function initCatalogStore() {
  if (isCatalogInitialized) return;
  isCatalogInitialized = true;

  // 1. Categories
  categoriesStore = [...SEED_CATEGORIES];

  // 2. Brands
  brandsStore = [...SEED_BRANDS];

  // 3. Products & Variants from canonical catalog
  productsStore = PRODUCTS.map((p, idx) => {
    // Map room to category
    let categoryId = categoriesStore[0]?.id;
    const roomStr = String(p.room || '');
    if (roomStr === 'living-room' || roomStr === 'living') categoryId = '55555555-5555-5555-5555-555555555501';
    else if (roomStr === 'dining-room' || roomStr === 'dining') categoryId = '55555555-5555-5555-5555-555555555502';
    else if (roomStr === 'bedroom') categoryId = '55555555-5555-5555-5555-555555555503';
    else if (roomStr === 'home-office' || roomStr === 'office') categoryId = '55555555-5555-5555-5555-555555555504';
    else if (roomStr === 'lighting') categoryId = '55555555-5555-5555-5555-555555555505';

    const productId = `77777777-7777-7777-7777-7777777777${(idx + 1).toString().padStart(2, '0')}`;

    const variants: EnrichedVariant[] = (p.variants || []).map((v, vIdx) => ({
      id: `88888888-8888-8888-8888-88888888${(idx + 1).toString().padStart(2, '0')}${(vIdx + 1).toString().padStart(2, '0')}`,
      product_id: productId,
      sku: `${p.sku || 'VEL'}-${(v.colorName || 'DEF').slice(0, 3).toUpperCase()}`,
      variant_name: v.name,
      price: v.price || p.price,
      compare_at_price: v.salePrice || p.salePrice,
      material: v.material || p.materials?.[0] || 'Solid Timber',
      finish: 'Architectural Matte Oil',
      color_name: v.colorName || 'Natural Tone',
      color_hex: v.colorHex || '#4A2C1A',
      dimensions: `${p.dimensions.width} × ${p.dimensions.depth} × ${p.dimensions.height}`,
      weight_kg: 25.0 + idx * 5,
      is_active: true,
      stock: v.stock || p.stock || 10,
      image_url: v.image || p.images[0],
      created_at: '2026-10-01T00:00:00Z',
      updated_at: '2026-10-01T00:00:00Z',
    }));

    // If no variants defined, create default variant
    if (variants.length === 0) {
      variants.push({
        id: `88888888-8888-8888-8888-88888888${(idx + 1).toString().padStart(2, '0')}01`,
        product_id: productId,
        sku: p.sku || `VEL-PROD-${idx + 1}`,
        variant_name: 'Standard Edition',
        price: p.price,
        compare_at_price: p.salePrice,
        material: p.materials?.[0] || 'Solid Walnut',
        finish: 'Natural Matte',
        color_name: p.colors?.[0] || 'Natural Walnut',
        color_hex: '#4A2C1A',
        dimensions: `${p.dimensions.width} × ${p.dimensions.depth} × ${p.dimensions.height}`,
        weight_kg: 30.0,
        is_active: true,
        stock: p.stock || 12,
        image_url: p.images[0],
        created_at: '2026-10-01T00:00:00Z',
        updated_at: '2026-10-01T00:00:00Z',
      });
    }

    const totalInventory = variants.reduce((sum, v) => sum + v.stock, 0);

    return {
      id: productId,
      category_id: categoryId,
      brand_id: brandsStore[0]?.id,
      category_name: categoriesStore.find((c) => c.id === categoryId)?.name || 'Living Room',
      brand_name: brandsStore[0]?.name || 'Veloura Atelier',
      name: p.name,
      slug: p.slug,
      tagline: p.story ? p.story.slice(0, 100) + '...' : undefined,
      short_description: p.description,
      full_description: p.story || p.description,
      base_price: p.price,
      compare_at_price: p.salePrice,
      is_featured: !!p.featured,
      is_active: true,
      rating_avg: p.rating || 4.9,
      review_count: p.reviewCount || 15,
      meta_title: `${p.name} | Veloura Living`,
      meta_description: p.description,
      images: p.images,
      materials: p.materials || [],
      colors: p.colors || [],
      room_slug: p.room,
      room_name: ROOMS.find((r) => r.slug === p.room)?.name || p.room,
      variants,
      total_inventory: totalInventory,
      availability: p.availability || (totalInventory > 5 ? 'in_stock' : totalInventory > 0 ? 'low_stock' : 'made_to_order'),
      created_at: '2026-10-01T00:00:00Z',
      updated_at: '2026-10-01T00:00:00Z',
    };
  });
}

// ============================================================================
// CATEGORIES
// ============================================================================

export function getCategories(activeOnly = true): DbCategory[] {
  initCatalogStore();
  if (activeOnly) {
    return categoriesStore.filter((c) => c.is_active).sort((a, b) => a.display_order - b.display_order);
  }
  return [...categoriesStore].sort((a, b) => a.display_order - b.display_order);
}

export function getCategoryByIdOrSlug(idOrSlug: string): DbCategory | undefined {
  initCatalogStore();
  return categoriesStore.find((c) => c.id === idOrSlug || c.slug === idOrSlug);
}

export function createCategory(data: Omit<DbCategory, 'id' | 'created_at' | 'updated_at'>): DbCategory {
  initCatalogStore();
  const now = new Date().toISOString();
  const newCat: DbCategory = {
    ...data,
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
  };
  categoriesStore.push(newCat);
  return newCat;
}

export function updateCategory(id: string, data: Partial<DbCategory>): DbCategory | undefined {
  initCatalogStore();
  const index = categoriesStore.findIndex((c) => c.id === id);
  if (index === -1) return undefined;

  categoriesStore[index] = {
    ...categoriesStore[index],
    ...data,
    updated_at: new Date().toISOString(),
  };
  return categoriesStore[index];
}

export function deleteCategory(id: string): boolean {
  initCatalogStore();
  const index = categoriesStore.findIndex((c) => c.id === id);
  if (index === -1) return false;
  categoriesStore.splice(index, 1);
  return true;
}

// ============================================================================
// BRANDS
// ============================================================================

export function getBrands(): DbBrand[] {
  initCatalogStore();
  return [...brandsStore];
}

export function createBrand(data: Omit<DbBrand, 'id' | 'created_at' | 'updated_at'>): DbBrand {
  initCatalogStore();
  const now = new Date().toISOString();
  const newBrand: DbBrand = {
    ...data,
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
  };
  brandsStore.push(newBrand);
  return newBrand;
}

// ============================================================================
// PRODUCTS & VARIANTS
// ============================================================================

export function getProducts(
  filters: FilterParams & { isFeatured?: boolean } = {},
  pagination: PaginationParams = {}
): { products: EnrichedProduct[]; total: number; page: number; totalPages: number } {
  initCatalogStore();

  let list = [...productsStore].filter((p) => p.is_active);

  // 1. Filter by category
  if (filters.category && filters.category !== 'all') {
    list = list.filter(
      (p) =>
        p.category_id === filters.category ||
        p.category_name?.toLowerCase() === filters.category?.toLowerCase() ||
        p.room_slug?.toLowerCase() === filters.category?.toLowerCase()
    );
  }

  // 2. Filter by room
  if (filters.room && filters.room !== 'all') {
    list = list.filter((p) => p.room_slug === filters.room);
  }

  // 3. Filter by price range
  if (filters.minPrice !== undefined) {
    list = list.filter((p) => p.base_price >= (filters.minPrice || 0));
  }
  if (filters.maxPrice !== undefined) {
    list = list.filter((p) => p.base_price <= (filters.maxPrice || Infinity));
  }

  // 4. Filter by material
  if (filters.material && filters.material !== 'all') {
    const mat = filters.material.toLowerCase();
    list = list.filter((p) => p.materials.some((m) => m.toLowerCase().includes(mat)));
  }

  // 5. Filter by color
  if (filters.color && filters.color !== 'all') {
    const col = filters.color.toLowerCase();
    list = list.filter((p) => p.colors.some((c) => c.toLowerCase().includes(col)));
  }

  // 6. Filter by search term
  if (filters.search && filters.search.trim()) {
    const query = filters.search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.short_description?.toLowerCase().includes(query) ||
        p.category_name?.toLowerCase().includes(query) ||
        p.room_name?.toLowerCase().includes(query) ||
        p.materials.some((m) => m.toLowerCase().includes(query)) ||
        p.variants.some((v) => v.sku.toLowerCase().includes(query) || v.variant_name.toLowerCase().includes(query))
    );
  }

  // 7. Filter by featured flag
  if (filters.isFeatured) {
    list = list.filter((p) => p.is_featured);
  }

  // 8. Sorting
  const sortBy = pagination.sortBy || 'featured';
  if (sortBy === 'price-asc') {
    list.sort((a, b) => a.base_price - b.base_price);
  } else if (sortBy === 'price-desc') {
    list.sort((a, b) => b.base_price - a.base_price);
  } else if (sortBy === 'rating') {
    list.sort((a, b) => b.rating_avg - a.rating_avg);
  } else if (sortBy === 'newest') {
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else {
    // Default featured sort
    list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
  }

  const total = list.length;
  const page = Math.max(1, pagination.page || 1);
  const limit = Math.max(1, Math.min(100, pagination.limit || 20));
  const totalPages = Math.ceil(total / limit);

  const paginated = list.slice((page - 1) * limit, page * limit);

  return {
    products: paginated,
    total,
    page,
    totalPages,
  };
}

export function getProductBySlugOrId(slugOrId: string): EnrichedProduct | undefined {
  initCatalogStore();
  return productsStore.find((p) => p.id === slugOrId || p.slug === slugOrId);
}

export function createProduct(productData: any): EnrichedProduct {
  initCatalogStore();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const newProduct: EnrichedProduct = {
    id,
    category_id: productData.category_id || categoriesStore[0]?.id,
    brand_id: productData.brand_id || brandsStore[0]?.id,
    category_name: categoriesStore.find((c) => c.id === productData.category_id)?.name || 'Living Room',
    brand_name: brandsStore.find((b) => b.id === productData.brand_id)?.name || 'Veloura Atelier',
    name: productData.name,
    slug: productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    tagline: productData.tagline,
    short_description: productData.short_description,
    full_description: productData.full_description || productData.short_description,
    base_price: Number(productData.base_price) || 0,
    compare_at_price: productData.compare_at_price ? Number(productData.compare_at_price) : undefined,
    is_featured: !!productData.is_featured,
    is_active: productData.is_active !== undefined ? !!productData.is_active : true,
    rating_avg: 5.0,
    review_count: 0,
    images: productData.images || ['/images/products/veloura_solis_boucle_chair.jpg'],
    materials: productData.materials || ['Solid Walnut'],
    colors: productData.colors || ['Natural Walnut'],
    room_slug: productData.room_slug || 'living-room',
    room_name: 'Living Room',
    variants: (productData.variants || []).map((v: any, vIdx: number) => ({
      id: crypto.randomUUID(),
      product_id: id,
      sku: v.sku || `VEL-PROD-${Date.now().toString().slice(-4)}-${vIdx + 1}`,
      variant_name: v.variant_name || 'Standard Edition',
      price: Number(v.price) || Number(productData.base_price),
      compare_at_price: v.compare_at_price ? Number(v.compare_at_price) : undefined,
      material: v.material || 'Solid Timber',
      finish: v.finish || 'Matte Lacquer',
      color_name: v.color_name || 'Natural',
      color_hex: v.color_hex || '#4A2C1A',
      dimensions: v.dimensions || 'W 100 x D 100 x H 75 cm',
      weight_kg: Number(v.weight_kg) || 25,
      is_active: true,
      stock: Number(v.stock) || 10,
      image_url: v.image_url || productData.images?.[0] || '/images/products/veloura_solis_boucle_chair.jpg',
      created_at: now,
      updated_at: now,
    })),
    total_inventory: 10,
    availability: 'in_stock',
    created_at: now,
    updated_at: now,
  };

  productsStore.unshift(newProduct);
  return newProduct;
}

export function updateProduct(id: string, updateData: Partial<EnrichedProduct>): EnrichedProduct | undefined {
  initCatalogStore();
  const index = productsStore.findIndex((p) => p.id === id);
  if (index === -1) return undefined;

  productsStore[index] = {
    ...productsStore[index],
    ...updateData,
    updated_at: new Date().toISOString(),
  };
  return productsStore[index];
}

export function deleteProduct(id: string): boolean {
  initCatalogStore();
  const index = productsStore.findIndex((p) => p.id === id);
  if (index === -1) return false;
  productsStore.splice(index, 1);
  return true;
}

// ============================================================================
// VARIANTS & SKU INVENTORY
// ============================================================================

export function getVariantBySku(sku: string): EnrichedVariant | undefined {
  initCatalogStore();
  const target = sku.trim().toUpperCase();
  for (const p of productsStore) {
    const v = p.variants.find((variant) => variant.sku.toUpperCase() === target);
    if (v) return v;
    if (p.sku && p.sku.toUpperCase() === target && p.variants.length > 0) {
      return p.variants[0];
    }
  }
  return undefined;
}

export function updateVariantStock(sku: string, newStock: number): EnrichedVariant | undefined {
  initCatalogStore();
  for (const p of productsStore) {
    const vIndex = p.variants.findIndex((v) => v.sku.toUpperCase() === sku.toUpperCase());
    if (vIndex !== -1) {
      p.variants[vIndex].stock = Math.max(0, newStock);
      p.variants[vIndex].updated_at = new Date().toISOString();
      p.total_inventory = p.variants.reduce((sum, v) => sum + v.stock, 0);
      p.availability = p.total_inventory > 5 ? 'in_stock' : p.total_inventory > 0 ? 'low_stock' : 'out_of_stock';
      return p.variants[vIndex];
    }
  }
  return undefined;
}

export function getAllVariants(): EnrichedVariant[] {
  initCatalogStore();
  const list: EnrichedVariant[] = [];
  for (const p of productsStore) {
    list.push(...p.variants);
  }
  return list;
}

export function adjustVariantStock(paramsOrSku: any, delta?: number, type?: string, note?: string): EnrichedVariant | undefined {
  if (typeof paramsOrSku === 'string') {
    const current = getVariantBySku(paramsOrSku);
    if (!current) return undefined;
    const newStock = Math.max(0, current.stock + (delta || 0));
    return updateVariantStock(paramsOrSku, newStock);
  }
  const current = getVariantBySku(paramsOrSku.sku);
  if (!current) return undefined;
  const newStock = Math.max(0, current.stock + paramsOrSku.quantityDelta);
  return updateVariantStock(paramsOrSku.sku, newStock);
}

