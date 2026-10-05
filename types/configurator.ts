/**
 * 🏛️ Veloura Living — Phase 13 3D Spatial Configurator & Customizer Types
 * Reference: Phase 13 Master Roadmap & WebXR AR Specification
 */

export type MaterialCategory = 'timber' | 'fabric' | 'leather' | 'stone' | 'metal';

export type LightingEnvironment = 'morning-sun' | 'golden-dusk' | 'gallery-spotlight' | 'midnight-atelier';

export interface MaterialOption {
  id: string;
  name: string;
  category: MaterialCategory;
  colorHex: string;
  roughness: number;
  metalness: number;
  clearcoat?: number;
  textureUrl?: string;
  upchargeINR: number;
  origin: string;
  badge?: string;
  description: string;
}

export interface CustomizablePart {
  id: string;
  name: string;
  allowedCategories: MaterialCategory[];
  defaultMaterialId: string;
  meshTarget: string; // targets group in Three.js model
}

export interface FurnitureDimensions {
  widthCm: number;
  depthCm: number;
  heightCm: number;
  seatHeightCm?: number;
  weightKg: number;
}

export interface ConfigurableFurniturePiece {
  id: string;
  name: string;
  slug: string;
  collection: string;
  room: 'living' | 'dining' | 'bedroom' | 'office';
  basePriceINR: number;
  tagline: string;
  description: string;
  dimensions: FurnitureDimensions;
  parts: CustomizablePart[];
  defaultConfiguration: Record<string, string>; // partId -> materialId
  usdzModelUrl?: string;
  glbModelUrl?: string;
}

export interface ActiveConfiguration {
  pieceId: string;
  partMaterials: Record<string, string>; // partId -> materialId
  lighting: LightingEnvironment;
  showCalipers: boolean;
  explodedProgress: number; // 0.0 to 1.0
  autoRotate: boolean;
}

export interface ConfiguredCartItemPayload {
  pieceId: string;
  pieceName: string;
  slug: string;
  sku: string;
  configurationSummary: {
    partName: string;
    materialName: string;
    materialCategory: string;
  }[];
  basePriceINR: number;
  totalUpchargeINR: number;
  finalPriceINR: number;
  dimensions: FurnitureDimensions;
  snapshotDataUrl?: string;
}
