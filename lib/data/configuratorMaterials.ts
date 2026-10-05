import { ConfigurableFurniturePiece, MaterialOption } from '@/types/configurator';

/**
 * 🏛️ Veloura Living — Curated Material Library for 3D PBR Shaders
 */
export const MATERIAL_LIBRARY: MaterialOption[] = [
  // --- TIMBER ---
  {
    id: 'mat-walnut',
    name: 'Solid American Black Walnut',
    category: 'timber',
    colorHex: '#4A2C1A',
    roughness: 0.72,
    metalness: 0.05,
    clearcoat: 0.2,
    textureUrl: '/images/materials/veloura_swatch_walnut.jpg',
    upchargeINR: 0,
    origin: 'Appalachian, USA',
    badge: 'Signature Heritage',
    description: 'Deep chocolate grain with organic cathedral figuring and natural oil finish.',
  },
  {
    id: 'mat-white-oak',
    name: 'Natural Scandinavian White Oak',
    category: 'timber',
    colorHex: '#CBB28B',
    roughness: 0.65,
    metalness: 0.04,
    clearcoat: 0.15,
    upchargeINR: 8000,
    origin: 'Småland, Sweden',
    badge: 'Light Architectural',
    description: 'Luminous honey-tan grain with refined modern Scandinavian clarity.',
  },
  {
    id: 'mat-smoked-ash',
    name: 'Smoked Charcoal Ash',
    category: 'timber',
    colorHex: '#25211E',
    roughness: 0.8,
    metalness: 0.08,
    clearcoat: 0.1,
    upchargeINR: 12000,
    origin: 'Black Forest, Germany',
    description: 'Thermo-treated dark ash with dramatic open-pore textured tactile contrast.',
  },

  // --- FABRIC ---
  {
    id: 'mat-boucle',
    name: 'Belgian Heritage Wool Bouclé',
    category: 'fabric',
    colorHex: '#F2ECE4',
    roughness: 0.95,
    metalness: 0.02,
    textureUrl: '/images/materials/veloura_swatch_boucle.jpg',
    upchargeINR: 0,
    origin: 'Flanders, Belgium',
    badge: 'Cloud Tactility',
    description: 'Loom-woven looped merino wool yarns providing soft acoustic and tactile luxury.',
  },
  {
    id: 'mat-oatmeal-linen',
    name: 'Normandy Natural Oatmeal Linen',
    category: 'fabric',
    colorHex: '#DDD1BD',
    roughness: 0.88,
    metalness: 0.01,
    upchargeINR: 6500,
    origin: 'Normandy, France',
    description: 'Heavyweight organic flax linen with subtle slub texture and breathable drape.',
  },
  {
    id: 'mat-emerald-velvet',
    name: 'Venetian Deep Forest Velvet',
    category: 'fabric',
    colorHex: '#1B3526',
    roughness: 0.55,
    metalness: 0.15,
    clearcoat: 0.4,
    upchargeINR: 15000,
    origin: 'Venice, Italy',
    badge: 'Atelier Velvet',
    description: 'High-pile cotton velvet with shimmering directional light refraction.',
  },

  // --- LEATHER ---
  {
    id: 'mat-saddle-leather',
    name: 'Tuscan Vegetable-Tanned Saddle Leather',
    category: 'leather',
    colorHex: '#7C4322',
    roughness: 0.5,
    metalness: 0.1,
    clearcoat: 0.35,
    textureUrl: '/images/materials/veloura_swatch_leather.jpg',
    upchargeINR: 25000,
    origin: 'Ponte a Egola, Tuscany',
    badge: 'Artisan Patina',
    description: 'Full-grain barrel-dyed saddle hide that ages into a deep golden patina.',
  },
  {
    id: 'mat-cognac-leather',
    name: 'Cognac Saddle Calfskin',
    category: 'leather',
    colorHex: '#9E5B28',
    roughness: 0.48,
    metalness: 0.12,
    clearcoat: 0.3,
    upchargeINR: 28000,
    origin: 'Florence, Italy',
    description: 'Smooth semi-aniline calfskin offering buttery softness and rich caramel tones.',
  },
  {
    id: 'mat-obsidian-nappa',
    name: 'Obsidian Black Nappa Leather',
    category: 'leather',
    colorHex: '#1C1A18',
    roughness: 0.42,
    metalness: 0.15,
    clearcoat: 0.45,
    upchargeINR: 32000,
    origin: 'Bologna, Italy',
    badge: 'Ultra Luxe',
    description: 'Ultra-refined monochrome black nappa hide with micro-pebble grain.',
  },

  // --- STONE ---
  {
    id: 'mat-travertine',
    name: 'Honed Roman Travertine Stone',
    category: 'stone',
    colorHex: '#D8C7B0',
    roughness: 0.68,
    metalness: 0.1,
    clearcoat: 0.25,
    textureUrl: '/images/materials/veloura_swatch_travertine.jpg',
    upchargeINR: 35000,
    origin: 'Tivoli, Italy',
    badge: 'Monolithic Stone',
    description: 'Cross-cut architectural travertine with organic microporous veining.',
  },
  {
    id: 'mat-nero-marquina',
    name: 'Nero Marquina Black Marble',
    category: 'stone',
    colorHex: '#1F2022',
    roughness: 0.25,
    metalness: 0.2,
    clearcoat: 0.85,
    upchargeINR: 42000,
    origin: 'Basque Country, Spain',
    badge: 'Dramatic Vein',
    description: 'Deep carbon marble with crisp calciferous white lightning veins.',
  },
  {
    id: 'mat-calacatta-gold',
    name: 'Calacatta Gold Italian Marble',
    category: 'stone',
    colorHex: '#EAE6DF',
    roughness: 0.22,
    metalness: 0.22,
    clearcoat: 0.9,
    upchargeINR: 48000,
    origin: 'Carrara, Italy',
    badge: 'Imperial Stone',
    description: 'Pristine white marble base with bold feathered honey-gold and smoky grey ribbons.',
  },

  // --- METAL & HARDWARE ---
  {
    id: 'mat-spun-brass',
    name: 'Hand-Spun Muted Brushed Brass',
    category: 'metal',
    colorHex: '#B59453',
    roughness: 0.32,
    metalness: 0.88,
    clearcoat: 0.3,
    textureUrl: '/images/materials/veloura_swatch_brass.jpg',
    upchargeINR: 0,
    origin: 'Birmingham, UK',
    badge: 'Warm Brass',
    description: 'Hand-brushed solid brass with a subtle protective satin wax sealant.',
  },
  {
    id: 'mat-brushed-nickel',
    name: 'Brushed Architectural Nickel',
    category: 'metal',
    colorHex: '#9E9D99',
    roughness: 0.3,
    metalness: 0.92,
    clearcoat: 0.2,
    upchargeINR: 6000,
    origin: 'Solingen, Germany',
    description: 'Cool metallic satin finish with linear micro-brushing.',
  },
  {
    id: 'mat-dark-bronze',
    name: 'Patinated Dark Gunmetal Bronze',
    category: 'metal',
    colorHex: '#302B27',
    roughness: 0.45,
    metalness: 0.82,
    clearcoat: 0.25,
    upchargeINR: 9500,
    origin: 'Milan, Italy',
    badge: 'Sculptural Bronze',
    description: 'Acid-etched dark bronze with warm copper undertones on exposed corners.',
  },
];

/**
 * 🏛️ Signature Configurable 3D Pieces
 */
export const CONFIGURABLE_PIECES: ConfigurableFurniturePiece[] = [
  {
    id: 'piece-serpentine-sofa',
    name: 'Serpentine Modular Sectional Sofa',
    slug: 'serpentine-modular-sectional-sofa',
    collection: 'Aethel Suite',
    room: 'living',
    basePriceINR: 185000,
    tagline: 'Flowing sculptural curvature with modular artisan seating.',
    description: 'An architectural centerpiece engineered with double-curved ergonomic foam, solid hardwood subframe, and customizable tactile textile modules.',
    dimensions: {
      widthCm: 280,
      depthCm: 115,
      heightCm: 76,
      seatHeightCm: 42,
      weightKg: 92,
    },
    parts: [
      {
        id: 'upholstery',
        name: 'Seat & Back Cushioning',
        allowedCategories: ['fabric', 'leather'],
        defaultMaterialId: 'mat-boucle',
        meshTarget: 'cushions',
      },
      {
        id: 'base',
        name: 'Plinth Foundation Base',
        allowedCategories: ['timber', 'metal'],
        defaultMaterialId: 'mat-walnut',
        meshTarget: 'basePlinth',
      },
      {
        id: 'accents',
        name: 'Hardware & Joinery Fasteners',
        allowedCategories: ['metal'],
        defaultMaterialId: 'mat-spun-brass',
        meshTarget: 'accents',
      },
    ],
    defaultConfiguration: {
      upholstery: 'mat-boucle',
      base: 'mat-walnut',
      accents: 'mat-spun-brass',
    },
  },
  {
    id: 'piece-aurelia-table',
    name: 'Aurelia Sculptural Dining Table',
    slug: 'aurelia-sculptural-dining-table',
    collection: 'Imperial Carrara',
    room: 'dining',
    basePriceINR: 145000,
    tagline: 'Monolithic beveled top anchored by twin fluted architectural columns.',
    description: 'Mastercrafted for 8-10 dinner guests. Features chamfered edge profiling and solid counter-weighted pedestals.',
    dimensions: {
      widthCm: 240,
      depthCm: 105,
      heightCm: 75,
      weightKg: 138,
    },
    parts: [
      {
        id: 'tabletop',
        name: 'Dining Table Surface',
        allowedCategories: ['stone', 'timber'],
        defaultMaterialId: 'mat-travertine',
        meshTarget: 'tableTop',
      },
      {
        id: 'pedestal',
        name: 'Fluted Column Pedestals',
        allowedCategories: ['timber', 'metal', 'stone'],
        defaultMaterialId: 'mat-walnut',
        meshTarget: 'pedestals',
      },
      {
        id: 'basePlate',
        name: 'Base Floor Trims',
        allowedCategories: ['metal'],
        defaultMaterialId: 'mat-spun-brass',
        meshTarget: 'baseTrim',
      },
    ],
    defaultConfiguration: {
      tabletop: 'mat-travertine',
      pedestal: 'mat-walnut',
      basePlate: 'mat-spun-brass',
    },
  },
  {
    id: 'piece-fujiwara-cabinet',
    name: 'Fujiwara 20-Pair Cane Credenza',
    slug: 'fujiwara-cane-sideboard',
    collection: 'Kyoto Minimalist',
    room: 'living',
    basePriceINR: 88000,
    tagline: 'Hand-woven natural rattan cane facade with solid mitred frame.',
    description: 'Combines Japanese joinery with European luxury storage. Features soft-closing concealed Blum hinges and internal cedar lining.',
    dimensions: {
      widthCm: 180,
      depthCm: 46,
      heightCm: 84,
      weightKg: 64,
    },
    parts: [
      {
        id: 'carcass',
        name: 'Main Cabinet Body',
        allowedCategories: ['timber'],
        defaultMaterialId: 'mat-walnut',
        meshTarget: 'carcass',
      },
      {
        id: 'doorPanels',
        name: 'Door Inset Panels',
        allowedCategories: ['fabric', 'timber', 'leather'],
        defaultMaterialId: 'mat-oatmeal-linen',
        meshTarget: 'doors',
      },
      {
        id: 'handles',
        name: 'Pulls & Tapered Legs',
        allowedCategories: ['metal'],
        defaultMaterialId: 'mat-spun-brass',
        meshTarget: 'legsAndPulls',
      },
    ],
    defaultConfiguration: {
      carcass: 'mat-walnut',
      doorPanels: 'mat-oatmeal-linen',
      handles: 'mat-spun-brass',
    },
  },
  {
    id: 'piece-zenith-lounge',
    name: 'Zenith Swivel Atelier Lounge Chair',
    slug: 'zenith-swivel-armchair',
    collection: 'Nordic Sculpt',
    room: 'office',
    basePriceINR: 94000,
    tagline: 'Continuous curvature molded shell with 360° whisper-quiet swivel.',
    description: 'Engineered with calibrated lumbar tilt geometry, high-resilience memory foam core, and precision ball-bearing swivel mechanism.',
    dimensions: {
      widthCm: 88,
      depthCm: 92,
      heightCm: 82,
      seatHeightCm: 40,
      weightKg: 34,
    },
    parts: [
      {
        id: 'outerShell',
        name: 'Molded Exterior Shell',
        allowedCategories: ['timber', 'leather'],
        defaultMaterialId: 'mat-walnut',
        meshTarget: 'shell',
      },
      {
        id: 'innerCushion',
        name: 'Interior Seat & Lumbar',
        allowedCategories: ['fabric', 'leather'],
        defaultMaterialId: 'mat-saddle-leather',
        meshTarget: 'seatCushion',
      },
      {
        id: 'swivelBase',
        name: '4-Star Swivel Base',
        allowedCategories: ['metal'],
        defaultMaterialId: 'mat-dark-bronze',
        meshTarget: 'swivelStar',
      },
    ],
    defaultConfiguration: {
      outerShell: 'mat-walnut',
      innerCushion: 'mat-saddle-leather',
      swivelBase: 'mat-dark-bronze',
    },
  },
];

/**
 * Helper to calculate total price for a given configuration
 */
export function calculateConfiguredPrice(
  piece: ConfigurableFurniturePiece,
  partMaterials: Record<string, string>
): { basePriceINR: number; totalUpchargeINR: number; finalPriceINR: number; itemizedUpcharges: { partName: string; materialName: string; upchargeINR: number }[] } {
  let totalUpchargeINR = 0;
  const itemizedUpcharges: { partName: string; materialName: string; upchargeINR: number }[] = [];

  for (const part of piece.parts) {
    const selectedMatId = partMaterials[part.id] || part.defaultMaterialId;
    const mat = MATERIAL_LIBRARY.find((m) => m.id === selectedMatId);
    if (mat) {
      totalUpchargeINR += mat.upchargeINR;
      itemizedUpcharges.push({
        partName: part.name,
        materialName: mat.name,
        upchargeINR: mat.upchargeINR,
      });
    }
  }

  return {
    basePriceINR: piece.basePriceINR,
    totalUpchargeINR,
    finalPriceINR: piece.basePriceINR + totalUpchargeINR,
    itemizedUpcharges,
  };
}
