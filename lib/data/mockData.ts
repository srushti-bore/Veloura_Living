import { Room, Product, Review, Coupon, JournalArticle, Order } from '@/types';

export const ROOMS: Room[] = [
  {
    id: 'living-room',
    type: 'living-room',
    name: 'Living Room',
    slug: 'living-room',
    headline: 'Spaces Made for Connection',
    subheadline: 'Curated seating, sculptural tables, and tactile textiles designed for effortless living.',
    description: 'The living room is where architecture meets intimacy. Our collection balances low-slung, architectural forms with cloud-soft bouclé, deep walnut grains, and ambient brass illumination.',
    editorialQuote: 'A living room should never feel staged — it should welcome the quiet hours of afternoon daylight as graciously as evening conversations.',
    heroImage: '/images/rooms/veloura_ultra_luxury_living_hero.jpg',
    categoryImage: '/images/rooms/veloura_ultra_luxury_living_hero.jpg',
    recommendedPalette: [
      { name: 'Warm Cream', hex: '#F5E6D3' },
      { name: 'Raw Walnut', hex: '#4A2C1A' },
      { name: 'Soft Boucle', hex: '#EEE9E1' },
      { name: 'Muted Brass', hex: '#8B5A2B' },
    ],
    styleTags: ['Warm Minimal', 'Organic Modern', 'Tactile Boucle', 'Solid Walnut'],
    productCount: 8,
    hotspots: [
      {
        id: 'hotspot-lr-sofa',
        type: 'Sofa',
        name: 'Serpentine Modular Sectional',
        xPercent: 66,
        yPercent: 68,
        productId: 'prod-lr-01',
        highlightDescription: 'Feather-blend wrapped cushions on solid kiln-dried oak frame.'
      },
      {
        id: 'hotspot-lr-table',
        type: 'Coffee Table',
        name: 'Kyoto Sculptural Walnut Table',
        xPercent: 51,
        yPercent: 72,
        productId: 'prod-lr-02',
        highlightDescription: 'Hand-carved organic oval contour in solid American Walnut.'
      },
      {
        id: 'hotspot-lr-chair',
        type: 'Lounge Chair',
        name: 'Solis Bouclé Occasional Chair',
        xPercent: 8,
        yPercent: 68,
        productId: 'prod-lr-03',
        highlightDescription: 'Curved travertine plinth and textured sculptural seat.'
      },
      {
        id: 'hotspot-lr-lamp',
        type: 'Lighting',
        name: 'Arcos Brass Arch Floor Lamp',
        xPercent: 88,
        yPercent: 62,
        productId: 'prod-lr-04',
        highlightDescription: 'Hand-spun brushed brass dome with warm diffused glow.'
      },
      {
        id: 'hotspot-lr-rug',
        type: 'Rug',
        name: 'Dune Hand-Tufted Wool Rug',
        xPercent: 50,
        yPercent: 88,
        productId: 'prod-lr-05',
        highlightDescription: '100% New Zealand high-low pile wool with organic line carving.'
      },
      {
        id: 'hotspot-lr-console',
        type: 'Media Console',
        name: 'Atelier Fluted Media Credenza',
        xPercent: 20,
        yPercent: 58,
        productId: 'prod-lr-06',
        highlightDescription: 'Fluted solid walnut tambour doors with cable channel management.'
      }
    ]
  },
  {
    id: 'bedroom',
    type: 'bedroom',
    name: 'Bedroom Sanctuary',
    slug: 'bedroom',
    headline: 'Restorative Quietude',
    subheadline: 'Low-profile platform beds, tactile linens, and softened silhouettes for deep repose.',
    description: 'A sanctuary dedicated to unwinding. Every seam, joinery detail, and textured headboard is designed to soothe the senses and welcome deep, undisturbed rest.',
    editorialQuote: 'The bedroom should hold no visual noise — only pure silhouette, warm wood, and textiles that invite sleep.',
    heroImage: '/images/rooms/veloura_luxury_bedroom_hero.jpg',
    categoryImage: '/images/rooms/veloura_luxury_bedroom_hero.jpg',
    recommendedPalette: [
      { name: 'Oat Milk Linen', hex: '#F7F4EF' },
      { name: 'Smoked Oak', hex: '#514A43' },
      { name: 'Warm Terracotta', hex: '#8B5A2B' },
      { name: 'Cloud Wool', hex: '#EADBC8' },
    ],
    styleTags: ['Japandi Rest', 'Low Profile', 'Textural Linen', 'Clean Lines'],
    productCount: 7,
    hotspots: [
      {
        id: 'hotspot-br-bed',
        type: 'Bed',
        name: 'Solitude Upholstered Platform Bed',
        xPercent: 60,
        yPercent: 64,
        productId: 'prod-br-01',
        highlightDescription: 'Padded linen headboard with recessed floating solid ash plinth.'
      },
      {
        id: 'hotspot-br-nightstand',
        type: 'Nightstand',
        name: 'Kanso Minimalist Floating Nightstand',
        xPercent: 92,
        yPercent: 62,
        productId: 'prod-br-02',
        highlightDescription: 'Soft-close drawer with bevelled solid walnut joinery.'
      },
      {
        id: 'hotspot-br-bench',
        type: 'Bench',
        name: 'Haven Bouclé End-of-Bed Bench',
        xPercent: 48,
        yPercent: 78,
        productId: 'prod-br-03',
        highlightDescription: 'Curved pill silhouette in dense textured ivory bouclé.'
      },
      {
        id: 'hotspot-br-wardrobe',
        type: 'Wardrobe',
        name: 'Pillar Fluted Wardrobe Suite',
        xPercent: 12,
        yPercent: 48,
        productId: 'prod-br-04',
        highlightDescription: 'Floor-to-ceiling fluted oak doors with internal soft LED lighting.'
      },
      {
        id: 'hotspot-br-mirror',
        type: 'Mirror',
        name: 'Aura Arch Full-Length Mirror',
        xPercent: 16,
        yPercent: 52,
        productId: 'prod-br-05',
        highlightDescription: 'Hand-welded brass minimal frame with distortion-free silvered glass.'
      }
    ]
  },
  {
    id: 'dining',
    type: 'dining',
    name: 'Dining & Gathering',
    slug: 'dining',
    headline: 'The Ritual of Table',
    subheadline: 'Heirloom solid wood tables and supportive upholstered seating for unhurried dinners.',
    description: 'Dining is the heart of memory. Our dining collections are built from generational hardwoods, hand-finished to patina with age and withstand joyful shared meals.',
    editorialQuote: 'A dining table is not just furniture; it is the stage for everyday celebration, conversation, and nourishment.',
    heroImage: '/images/rooms/veloura_luxury_dining_hero.jpg',
    categoryImage: '/images/rooms/veloura_luxury_dining_hero.jpg',
    recommendedPalette: [
      { name: 'Solid Walnut', hex: '#4A2C1A' },
      { name: 'Warm Cream Stone', hex: '#F5E6D3' },
      { name: 'Sage Linen', hex: '#557A5A' },
      { name: 'Burnished Bronze', hex: '#746B61' },
    ],
    styleTags: ['Heirloom Wood', 'Generational Craft', 'Architectural Table', 'Curved Seating'],
    productCount: 6,
    hotspots: [
      {
        id: 'hotspot-dn-table',
        type: 'Dining Table',
        name: 'Heritage 8-Seater Solid Walnut Table',
        xPercent: 52,
        yPercent: 68,
        productId: 'prod-dn-01',
        highlightDescription: 'Continuous grain 2.5-inch thick solid walnut top on pedestal base.'
      },
      {
        id: 'hotspot-dn-chair',
        type: 'Dining Chair',
        name: 'Astrid Sculptural Dining Chair',
        xPercent: 20,
        yPercent: 74,
        productId: 'prod-dn-02',
        highlightDescription: 'Steam-bent solid ash frame with padded high-resilience foam seat.'
      },
      {
        id: 'hotspot-dn-pendant',
        type: 'Chandelier',
        name: 'Eclipse Smoked Glass Pendant',
        xPercent: 54,
        yPercent: 20,
        productId: 'prod-dn-03',
        highlightDescription: 'Mouth-blown gradient glass shade with satin bronze fittings.'
      },
      {
        id: 'hotspot-dn-sideboard',
        type: 'Sideboard',
        name: 'Oslo Fluted Oak Buffet Console',
        xPercent: 22,
        yPercent: 58,
        productId: 'prod-dn-04',
        highlightDescription: 'Italian travertine top over fluted natural white oak cabinetry.'
      }
    ]
  },
  {
    id: 'office',
    type: 'office',
    name: 'Home Office & Study',
    slug: 'office',
    headline: 'Focus in Harmony',
    subheadline: 'Ergonomic precision meets warm residential materiality for thoughtful work.',
    description: 'Workspaces should calm the mind, not overwhelm it. We merge subtle executive ergonomics with tactile timber and intelligent cable architecture to elevate daily focus.',
    editorialQuote: 'Clear surfaces and warm natural wood calm the mind and elevate everyday contemplation.',
    heroImage: '/images/rooms/veloura_luxury_office_hero.jpg',
    categoryImage: '/images/rooms/veloura_luxury_office_hero.jpg',
    recommendedPalette: [
      { name: 'Espresso Walnut', hex: '#332E29' },
      { name: 'Saddle Cognac Leather', hex: '#8B5A2B' },
      { name: 'Charcoal Steel', hex: '#514A43' },
      { name: 'Bone White Paper', hex: '#FCFAF7' },
    ],
    styleTags: ['Executive Warmth', 'Ergonomic Craft', 'Concealed Tech', 'Natural Focus'],
    productCount: 6,
    hotspots: [
      {
        id: 'hotspot-of-desk',
        type: 'Executive Desk',
        name: 'Meridian Executive Solid Desk',
        xPercent: 42,
        yPercent: 72,
        productId: 'prod-of-01',
        highlightDescription: 'Integrated hidden power conduits and leather-lined drawer dividers.'
      },
      {
        id: 'hotspot-of-chair',
        type: 'Ergonomic Chair',
        name: 'Aeron Pro Leather Task Chair',
        xPercent: 74,
        yPercent: 74,
        productId: 'prod-of-02',
        highlightDescription: 'Synchronized lumbar tilt support in full-grain Italian saddle leather.'
      },
      {
        id: 'hotspot-of-bookshelf',
        type: 'Bookshelf',
        name: 'Bauhaus Architectural Bookcase',
        xPercent: 28,
        yPercent: 35,
        productId: 'prod-of-03',
        highlightDescription: 'Modular open-shelf system in solid walnut and blackened bronze.'
      },
      {
        id: 'hotspot-of-lamp',
        type: 'Desk Lamp',
        name: 'Linear Brass Precision Task Lamp',
        xPercent: 34,
        yPercent: 52,
        productId: 'prod-of-04',
        highlightDescription: 'High CRI 95+ flicker-free warm LED bar with touch dimmer.'
      }
    ]
  }
];

export const PRODUCTS: Product[] = [
  // --- LIVING ROOM ---
  {
    id: 'prod-lr-01',
    sku: 'VL-LR-SF-001',
    name: 'Serpentine Modular Sectional Sofa',
    slug: 'serpentine-modular-sectional-sofa',
    category: 'Seating',
    room: 'living-room',
    furnitureType: 'Sectional Sofa',
    price: 185000,
    salePrice: 168000,
    rating: 4.9,
    reviewCount: 42,
    stock: 8,
    availability: 'in_stock',
    dimensions: {
      width: '124"',
      depth: '68"',
      height: '31"',
      seatHeight: '17"',
      weight: '98 kg'
    },
    materials: ['Kiln-Dried European Pine', 'High-Resilience Bio-Foam', 'Italian Bouclé / Linen Blend'],
    colors: ['Warm Oat Cream', 'Earth Charcoal', 'Sage Olive'],
    tags: ['Bestseller', 'Modular', 'Feather Blend', 'Veloura Signature'],
    images: [
      '/images/products/veloura_serpentine_modular_sofa.jpg'
    ],
    description: 'A monument to modern comfort. The Serpentine Sectional combines low architectural geometry with generous, feather-wrapped seats that embrace without sagging.',
    story: 'Conceived in collaboration with Scandinavian craftsmen, the Serpentine brings expansive residential scale into modern homes. Every joint is mortise-and-tenon reinforced to last decades.',
    craftsmanship: 'Hand-upholstered in Italy with double-stitched perimeter seams and removable washable cushion covers.',
    care: 'Vacuum regularly with soft brush attachment. Spot clean with water-free solvent.',
    shippingEstimate: 'Delivers in 5–8 business days with white-glove assembly included.',
    warranty: '10-year structural frame warranty.',
    variants: [
      {
        id: 'var-lr01-cream',
        name: 'Left Chaise / Oat Cream',
        colorName: 'Oat Cream',
        colorHex: '#F5E6D3',
        material: 'Italian Bouclé',
        price: 185000,
        salePrice: 168000,
        stock: 5,
        image: '/images/products/veloura_serpentine_modular_sofa.jpg'
      },
      {
        id: 'var-lr01-charcoal',
        name: 'Left Chaise / Earth Charcoal',
        colorName: 'Earth Charcoal',
        colorHex: '#332E29',
        material: 'Heavy Linen Blend',
        price: 185000,
        salePrice: 168000,
        stock: 3,
        image: '/images/products/veloura_serpentine_modular_sofa.jpg'
      }
    ],
    complementaryProductIds: ['prod-lr-02', 'prod-lr-03', 'prod-lr-05'],
    roomFitScore: 98,
    bestseller: true,
    featured: true
  },
  {
    id: 'prod-lr-02',
    sku: 'VL-LR-TBL-002',
    name: 'Kyoto Sculptural Walnut Coffee Table',
    slug: 'kyoto-sculptural-walnut-coffee-table',
    category: 'Tables',
    room: 'living-room',
    furnitureType: 'Coffee Table',
    price: 48000,
    rating: 4.8,
    reviewCount: 38,
    stock: 12,
    availability: 'in_stock',
    dimensions: {
      width: '54"',
      depth: '32"',
      height: '14.5"',
      weight: '34 kg'
    },
    materials: ['Solid American Black Walnut', 'Natural Matte Hardwax Oil'],
    colors: ['American Walnut', 'Bleached White Oak'],
    tags: ['Organic Shape', 'Solid Hardwood', 'Editorial Pick'],
    images: [
      '/images/products/veloura_kyoto_coffee_table.jpg'
    ],
    description: 'An organic pebble silhouette that softens rectilinear seating layouts. Cut from sustainably managed American walnut with bullnose rounded edges.',
    story: 'Inspired by Japanese Zen garden stepping stones, Kyoto brings nature’s soothing irregularity indoors.',
    craftsmanship: '3-stage hand-rubbed organic wax finish preserving raw wood grain texture.',
    care: 'Wipe with damp cloth. Re-apply natural beeswax once every two years.',
    shippingEstimate: 'Ships within 3–5 business days.',
    warranty: '5-year structural warranty.',
    variants: [
      {
        id: 'var-lr02-walnut',
        name: 'Solid Walnut',
        colorName: 'American Walnut',
        colorHex: '#4A2C1A',
        material: 'Solid Walnut',
        price: 48000,
        stock: 8,
        image: '/images/products/veloura_kyoto_coffee_table.jpg'
      },
      {
        id: 'var-lr02-oak',
        name: 'Natural White Oak',
        colorName: 'White Oak',
        colorHex: '#EADBC8',
        material: 'Solid White Oak',
        price: 48000,
        stock: 4,
        image: '/images/products/veloura_kyoto_coffee_table.jpg'
      }
    ],
    complementaryProductIds: ['prod-lr-01', 'prod-lr-04', 'prod-lr-05'],
    roomFitScore: 95,
    featured: true
  },
  {
    id: 'prod-lr-03',
    sku: 'VL-LR-CHR-003',
    name: 'Solis Bouclé Occasional Chair',
    slug: 'solis-boucle-occasional-chair',
    category: 'Seating',
    room: 'living-room',
    furnitureType: 'Lounge Chair',
    price: 54000,
    salePrice: 49500,
    rating: 4.9,
    reviewCount: 29,
    stock: 6,
    availability: 'in_stock',
    dimensions: {
      width: '34"',
      depth: '35"',
      height: '30"',
      seatHeight: '16.5"',
      weight: '24 kg'
    },
    materials: ['Heavy Belgian Wool Bouclé', 'FSC Oak Internal Frame'],
    colors: ['Ivory Boucle', 'Terracotta Rust', 'Moss'],
    tags: ['Cozy', 'Curved', 'Design Icon'],
    images: [
      '/images/products/veloura_solis_boucle_chair.jpg'
    ],
    description: 'A cocoon-like embrace with an enveloping barrel back. Solis transforms any corner into an inviting contemplation spot.',
    story: 'Designed to break rigid living room grids with human-centered soft curves.',
    craftsmanship: 'Seamless 360-degree upholstery technique without visible external seams.',
    care: 'Dry vacuum. Spot clean gentle wool detergent.',
    shippingEstimate: 'Ships within 3–5 business days.',
    warranty: '5-year warranty.',
    variants: [
      {
        id: 'var-lr03-ivory',
        name: 'Ivory Cream Bouclé',
        colorName: 'Ivory Cream',
        colorHex: '#FCFAF7',
        material: 'Wool Boucle',
        price: 54000,
        salePrice: 49500,
        stock: 4,
        image: '/images/products/veloura_solis_boucle_chair.jpg'
      },
      {
        id: 'var-lr03-rust',
        name: 'Terracotta Rust Velvet',
        colorName: 'Terracotta',
        colorHex: '#8B5A2B',
        material: 'Mohair Velvet',
        price: 56000,
        salePrice: 51000,
        stock: 2,
        image: '/images/products/veloura_solis_boucle_chair.jpg'
      }
    ],
    complementaryProductIds: ['prod-lr-01', 'prod-lr-02', 'prod-lr-04'],
    roomFitScore: 92,
    bestseller: true
  },
  {
    id: 'prod-lr-04',
    sku: 'VL-LR-LGT-004',
    name: 'Arcos Brass Arch Floor Lamp',
    slug: 'arcos-brass-arch-floor-lamp',
    category: 'Lighting',
    room: 'living-room',
    furnitureType: 'Floor Lamp',
    price: 32000,
    rating: 4.7,
    reviewCount: 19,
    stock: 15,
    availability: 'in_stock',
    dimensions: {
      width: '18"',
      depth: '42"',
      height: '76"',
      weight: '18 kg'
    },
    materials: ['Solid Spun Brass', 'Spanish Black Marquina Marble Base'],
    colors: ['Brushed Brass', 'Matte Black Oxide'],
    tags: ['Ambient Light', 'Heavy Marble Base', 'Dimmable'],
    images: [
      '/images/products/veloura_arcos_brass_arch_lamp.jpg'
    ],
    description: 'A sweeping arch of warm brushed brass balanced by an unyielding solid black marble base. Creates an intimate pool of light over sofas or reading chairs.',
    story: 'Crafted to replace harsh overhead lighting with a gentle, atmospheric golden warmth.',
    craftsmanship: 'Hand-turned brass dome with brass foot switch and cotton braided cable.',
    care: 'Dust with soft micro-fiber cloth.',
    shippingEstimate: 'Ships within 2–4 business days.',
    warranty: '3-year electrical & finish warranty.',
    variants: [],
    complementaryProductIds: ['prod-lr-01', 'prod-lr-03'],
    roomFitScore: 90
  },
  {
    id: 'prod-lr-05',
    sku: 'VL-LR-RUG-005',
    name: 'Dune Hand-Tufted Wool Rug (8x10)',
    slug: 'dune-hand-tufted-wool-rug',
    category: 'Textiles',
    room: 'living-room',
    furnitureType: 'Rug',
    price: 38000,
    rating: 4.9,
    reviewCount: 45,
    stock: 14,
    availability: 'in_stock',
    dimensions: {
      width: '96" (8 ft)',
      depth: '120" (10 ft)',
      height: '0.75" pile',
      weight: '28 kg'
    },
    materials: ['100% Undyed New Zealand Wool', 'Cotton Canvas Backing'],
    colors: ['Oat Cream Relief', 'Warm Sand'],
    tags: ['Hand Tufted', 'Plush Pile', 'Zero Dye'],
    images: [
      '/images/products/veloura_dune_wool_rug.jpg'
    ],
    description: 'Subtle high-low carved linear patterns that catch raking natural sunlight. Luxuriously soft under barefoot steps.',
    story: 'Woven by master artisans in Bhadohi using unbleached highland wool.',
    craftsmanship: 'Hand-sheared relief carving with reinforced serged edges.',
    care: 'Vacuum without beater bar. Rotate every 6 months.',
    shippingEstimate: 'Ships within 3–5 business days.',
    warranty: '3-year craftsmanship warranty.',
    variants: [],
    complementaryProductIds: ['prod-lr-01', 'prod-lr-02'],
    roomFitScore: 94
  },
  {
    id: 'prod-lr-06',
    sku: 'VL-LR-CNS-006',
    name: 'Atelier Fluted Media Credenza',
    slug: 'atelier-fluted-media-credenza',
    category: 'Storage',
    room: 'living-room',
    furnitureType: 'Media Console',
    price: 76000,
    rating: 4.8,
    reviewCount: 22,
    stock: 5,
    availability: 'low_stock',
    dimensions: {
      width: '78"',
      depth: '19"',
      height: '24"',
      weight: '62 kg'
    },
    materials: ['Solid Walnut Tambour', 'Acoustic Mesh Interior', 'Brushed Brass Legs'],
    colors: ['American Walnut', 'Charcoal Stained Ash'],
    tags: ['Acoustic Transparent', 'Cable Management', 'Fluted Detail'],
    images: [
      '/images/products/veloura_atelier_fluted_credenza.jpg'
    ],
    description: 'Discreet luxury for home entertainment. Tambour doors glide smoothly around curved corners while internal channels route all cables out of sight.',
    story: 'Designed so media devices, soundbars, and consoles remain invisible while remote signals pass through effortlessly.',
    craftsmanship: 'Solid wood fluting precision-milled from single walnut logs for grain continuity.',
    care: 'Clean with natural wood polish spray.',
    shippingEstimate: 'Ships in 7–10 days with white-glove setup.',
    warranty: '5-year warranty.',
    variants: [],
    complementaryProductIds: ['prod-lr-01', 'prod-lr-02'],
    roomFitScore: 91
  },

  // --- BEDROOM ---
  {
    id: 'prod-br-01',
    sku: 'VL-BR-BED-001',
    name: 'Solitude Upholstered King Bed',
    slug: 'solitude-upholstered-king-bed',
    category: 'Beds',
    room: 'bedroom',
    furnitureType: 'King Bed',
    price: 135000,
    salePrice: 122000,
    rating: 5.0,
    reviewCount: 56,
    stock: 9,
    availability: 'in_stock',
    dimensions: {
      width: '84"',
      depth: '92"',
      height: '42" (Headboard)',
      weight: '82 kg'
    },
    materials: ['Solid Ash Subframe', 'Belgian Natural Linen', 'Pocketed Slat Base'],
    colors: ['Oat Linen', 'Warm Sand', 'Slate Charcoal'],
    tags: ['Bestseller', 'Generational Frame', 'Quiet Slat System'],
    images: [
      '/images/products/veloura_solitude_platform_bed.jpg'
    ],
    description: 'A serene centerpiece for undisturbed sleep. Features an ergonomically angled padded headboard for late-night reading and an acoustic dampening slat system.',
    story: 'Engineered for zero creaks. The recessed floating base gives the bed an ethereal, weightless appearance.',
    craftsmanship: 'Heavyweight Belgian flax linen woven with subtle slub texture for tactile depth.',
    care: 'Spot clean linen with foam upholstery cleaner.',
    shippingEstimate: 'Delivers in 5–8 days with white-glove room assembly.',
    warranty: '10-year frame warranty.',
    variants: [
      {
        id: 'var-br01-king-oat',
        name: 'King / Oat Linen',
        colorName: 'Oat Linen',
        colorHex: '#F7F4EF',
        material: 'Pure Belgian Linen',
        price: 135000,
        salePrice: 122000,
        stock: 6,
        image: '/images/products/veloura_solitude_platform_bed.jpg'
      },
      {
        id: 'var-br01-king-sand',
        name: 'King / Warm Sand',
        colorName: 'Warm Sand',
        colorHex: '#EADBC8',
        material: 'Textured Weave',
        price: 135000,
        salePrice: 122000,
        stock: 3,
        image: '/images/products/veloura_solitude_platform_bed.jpg'
      }
    ],
    complementaryProductIds: ['prod-br-02', 'prod-br-03', 'prod-br-05'],
    roomFitScore: 99,
    bestseller: true,
    featured: true
  },
  {
    id: 'prod-br-02',
    sku: 'VL-BR-NST-002',
    name: 'Kanso Minimalist Floating Nightstand',
    slug: 'kanso-minimalist-floating-nightstand',
    category: 'Nightstands',
    room: 'bedroom',
    furnitureType: 'Bedside Table',
    price: 24000,
    rating: 4.8,
    reviewCount: 31,
    stock: 18,
    availability: 'in_stock',
    dimensions: {
      width: '22"',
      depth: '16"',
      height: '18"',
      weight: '14 kg'
    },
    materials: ['Solid American Walnut', 'Concealed Soft-Close Runners'],
    colors: ['American Walnut', 'Natural Oak'],
    tags: ['Soft Close', 'Floating Feel', 'Integrated Cable Notch'],
    images: [
      '/images/products/veloura_kanso_floating_nightstand.jpg'
    ],
    description: 'Pure geometry and function. An open lower tier for books and a felt-lined soft-close drawer with a discreet rear cable channel for bedside charging.',
    story: 'Kanso embodies the Japanese concept of simplicity eliminating non-essential elements.',
    craftsmanship: 'Mitred waterfall edge joinery where wood grain wraps seamlessly around corners.',
    care: 'Dust regularly with dry lint-free cloth.',
    shippingEstimate: 'Ships within 2–4 business days.',
    warranty: '5-year warranty.',
    variants: [],
    complementaryProductIds: ['prod-br-01', 'prod-br-04'],
    roomFitScore: 96
  },
  {
    id: 'prod-br-03',
    sku: 'VL-BR-BNC-003',
    name: 'Haven Bouclé End-of-Bed Bench',
    slug: 'haven-boucle-end-of-bed-bench',
    category: 'Benches',
    room: 'bedroom',
    furnitureType: 'Bedroom Bench',
    price: 36000,
    rating: 4.9,
    reviewCount: 18,
    stock: 7,
    availability: 'in_stock',
    dimensions: {
      width: '58"',
      depth: '18"',
      height: '18"',
      weight: '19 kg'
    },
    materials: ['Heavy Ivory Bouclé', 'Walnut Wood Sled Plinth'],
    colors: ['Ivory Boucle', 'Camel Wool'],
    tags: ['Tactile', 'Low Profile', 'Dual Use'],
    images: [
      '/images/products/veloura_haven_boucle_bench.jpg'
    ],
    description: 'An architectural pill bench designed to sit comfortably at the foot of king or queen beds. Perfect for morning dressing and afternoon reading.',
    story: 'Balances the soft linen headboard with tactile bouclé textures in soothing neutral tones.',
    craftsmanship: 'Hand-upholstered over high-density molded foam core.',
    care: 'Vacuum clean only.',
    shippingEstimate: 'Ships within 3–5 business days.',
    warranty: '5-year warranty.',
    variants: [],
    complementaryProductIds: ['prod-br-01', 'prod-br-05'],
    roomFitScore: 93
  },
  {
    id: 'prod-br-04',
    sku: 'VL-BR-WRD-004',
    name: 'Pillar Fluted Wardrobe Suite',
    slug: 'pillar-fluted-wardrobe-suite',
    category: 'Storage',
    room: 'bedroom',
    furnitureType: 'Wardrobe',
    price: 165000,
    salePrice: 148000,
    rating: 4.9,
    reviewCount: 14,
    stock: 4,
    availability: 'made_to_order',
    dimensions: {
      width: '72"',
      depth: '24"',
      height: '84"',
      weight: '115 kg'
    },
    materials: ['Natural White Oak', 'Solid Fluted Oak Slats', 'Warm Internal LED Sensing Lights'],
    colors: ['Natural Oak', 'Smoked Espresso Oak'],
    tags: ['Heirloom Storage', 'Auto LED Lights', 'Custom Wardrobe'],
    images: [
      '/images/products/veloura_pillar_fluted_wardrobe.jpg'
    ],
    description: 'Generous architectural wardrobe offering hanging rails, soft-close velvet lined jewelry drawers, and adjustable luggage shelving.',
    story: 'Transforms bedroom storage from a utilitarian box into a rhythmic wall of warm natural fluting.',
    craftsmanship: 'German soft-close hinges rated for 100,000 cycles with invisible door magnets.',
    care: 'Wipe with wood-friendly microfiber cloth.',
    shippingEstimate: 'Crafted & delivered in 14–18 business days with on-site assembly.',
    warranty: '10-year warranty.',
    variants: [],
    complementaryProductIds: ['prod-br-01', 'prod-br-02'],
    roomFitScore: 91
  },
  {
    id: 'prod-br-05',
    sku: 'VL-BR-MIR-005',
    name: 'Aura Arch Full-Length Mirror',
    slug: 'aura-arch-full-length-mirror',
    category: 'Mirrors',
    room: 'bedroom',
    furnitureType: 'Full-Length Mirror',
    price: 28000,
    rating: 4.8,
    reviewCount: 39,
    stock: 15,
    availability: 'in_stock',
    dimensions: {
      width: '32"',
      depth: '2"',
      height: '74"',
      weight: '22 kg'
    },
    materials: ['Hand-Formed Solid Brass Frame', 'Ultra-Clear Shatterproof Silver Mirror'],
    colors: ['Muted Brass', 'Deep Bronze'],
    tags: ['Full Length', 'Shatterproof', 'Floor Leaning or Wall Mount'],
    images: [
      '/images/products/veloura_aura_arch_mirror.jpg'
    ],
    description: 'An elegant arched silhouette that reflects natural daylight and visually doubles room volume without visual heaviness.',
    story: 'Designed with a weighted anti-slip rubber foot for leaning or sturdy heavy-duty cleat wall mounting.',
    craftsmanship: 'Seamless continuous brass frame with hand-polished satin finish.',
    care: 'Clean with ammonia-free glass spray.',
    shippingEstimate: 'Ships within 2–4 business days in reinforced wooden crate.',
    warranty: '5-year warranty.',
    variants: [],
    complementaryProductIds: ['prod-br-01', 'prod-br-03'],
    roomFitScore: 94
  },

  // --- DINING ROOM ---
  {
    id: 'prod-dn-01',
    sku: 'VL-DN-TBL-001',
    name: 'Heritage 8-Seater Solid Walnut Dining Table',
    slug: 'heritage-8-seater-solid-walnut-dining-table',
    category: 'Dining Tables',
    room: 'dining',
    furnitureType: 'Dining Table',
    price: 145000,
    salePrice: 132000,
    rating: 5.0,
    reviewCount: 48,
    stock: 7,
    availability: 'in_stock',
    dimensions: {
      width: '94"',
      depth: '40"',
      height: '30"',
      weight: '78 kg'
    },
    materials: ['FSC Certified American Black Walnut (2.2" Thick Slab)', 'Cast Bronze Hardware'],
    colors: ['American Black Walnut', 'Natural Ash'],
    tags: ['Heirloom Grade', 'Continuous Grain', 'Seats 8-10', 'Bestseller'],
    images: [
      '/images/products/veloura_heritage_walnut_dining_table.jpg'
    ],
    description: 'The definitive dinner table. Crafted from continuous-grain solid American black walnut with gently softened pill edges and sculptural trestle legs that ensure zero knee interference.',
    story: 'Built to be passed down through generations. The natural oils in the timber develop a deeper, richer patina with every passing dinner party.',
    craftsmanship: 'Butterfly key joinery and internal steel anti-warp stabilization bars embedded beneath the slab.',
    care: 'Wipe with warm water cloth. Protect from boiling pans with trivets.',
    shippingEstimate: 'Delivered in 5–8 days with white-glove setup.',
    warranty: '25-year structural heirloom warranty.',
    variants: [
      {
        id: 'var-dn01-8seat',
        name: '8-Seater (94")',
        colorName: 'American Walnut',
        colorHex: '#4A2C1A',
        material: 'Solid Walnut',
        price: 145000,
        salePrice: 132000,
        stock: 5,
        image: '/images/products/veloura_heritage_walnut_dining_table.jpg'
      },
      {
        id: 'var-dn01-6seat',
        name: '6-Seater (78")',
        colorName: 'American Walnut',
        colorHex: '#4A2C1A',
        material: 'Solid Walnut',
        price: 115000,
        salePrice: 105000,
        stock: 2,
        image: '/images/products/veloura_heritage_walnut_dining_table.jpg'
      }
    ],
    complementaryProductIds: ['prod-dn-02', 'prod-dn-03', 'prod-dn-04'],
    roomFitScore: 99,
    bestseller: true,
    featured: true
  },
  {
    id: 'prod-dn-02',
    sku: 'VL-DN-CHR-002',
    name: 'Astrid Sculptural Dining Chair (Set of 2)',
    slug: 'astrid-sculptural-dining-chair',
    category: 'Dining Chairs',
    room: 'dining',
    furnitureType: 'Dining Chair',
    price: 42000,
    salePrice: 38000,
    rating: 4.8,
    reviewCount: 37,
    stock: 16,
    availability: 'in_stock',
    dimensions: {
      width: '21"',
      depth: '22"',
      height: '31"',
      seatHeight: '18"',
      weight: '8.5 kg each'
    },
    materials: ['Solid Steam-Bent Ash', 'High-Resilience Foam', 'Performance Bouclé Fabric'],
    colors: ['Oat Cream / Walnut Frame', 'Charcoal / Black Oak Frame'],
    tags: ['Set of 2', 'Ergonomic Curved Back', 'Stain Resistant'],
    images: [
      '/images/products/veloura_astrid_dining_chair.jpg'
    ],
    description: 'Designed for lingering conversations long after dessert. The continuous curved backrest cradles the spine naturally.',
    story: 'Tested for 4+ hour dinner comfort without fatigue.',
    craftsmanship: 'Steam-bent solid hardwood with mortise joinery.',
    care: 'Treated with water and oil repellent coating.',
    shippingEstimate: 'Ships within 3–5 business days.',
    warranty: '5-year warranty.',
    variants: [],
    complementaryProductIds: ['prod-dn-01', 'prod-dn-03'],
    roomFitScore: 97,
    bestseller: true
  },
  {
    id: 'prod-dn-03',
    sku: 'VL-DN-LGT-003',
    name: 'Eclipse Smoked Glass Pendant Chandelier',
    slug: 'eclipse-smoked-glass-pendant-chandelier',
    category: 'Lighting',
    room: 'dining',
    furnitureType: 'Chandelier',
    price: 39000,
    rating: 4.9,
    reviewCount: 23,
    stock: 11,
    availability: 'in_stock',
    dimensions: {
      width: '46"',
      depth: '14"',
      height: '18" (Adjustable drop to 60")',
      weight: '12 kg'
    },
    materials: ['Mouth-Blown Gradient Smoked Glass', 'Satin Aged Bronze Rods'],
    colors: ['Smoked Amber Glass', 'Opal Frosted Glass'],
    tags: ['Dimmable', 'Warm 2700K Glow', 'Architectural Statement'],
    images: [
      '/images/products/veloura_eclipse_glass_pendant.jpg'
    ],
    description: 'Suspended like celestial bodies above your dining table. Casts a warm, intimate pool of non-glare illumination.',
    story: 'Handmade by glass artisans with subtle gradation from clear amber to smoked bronze.',
    craftsmanship: 'Integrated triac-dimmable warm LED bulbs included.',
    care: 'Dust with soft micro-fiber cloth.',
    shippingEstimate: 'Ships in 3–5 days with reinforced shock foam packaging.',
    warranty: '3-year warranty.',
    variants: [],
    complementaryProductIds: ['prod-dn-01', 'prod-dn-04'],
    roomFitScore: 93
  },
  {
    id: 'prod-dn-04',
    sku: 'VL-DN-SBD-004',
    name: 'Oslo Fluted Oak Buffet Sideboard',
    slug: 'oslo-fluted-oak-buffet-sideboard',
    category: 'Storage',
    room: 'dining',
    furnitureType: 'Sideboard',
    price: 88000,
    salePrice: 79000,
    rating: 4.9,
    reviewCount: 17,
    stock: 6,
    availability: 'in_stock',
    dimensions: {
      width: '74"',
      depth: '19"',
      height: '32"',
      weight: '70 kg'
    },
    materials: ['Italian Travertine Stone Top', 'Solid White Oak Fluting'],
    colors: ['Natural Oak / Travertine', 'Smoked Oak / Marquina Marble'],
    tags: ['Real Stone Top', 'Wine & Dinnerware Storage', 'Luxury Buffet'],
    images: [
      '/images/products/veloura_oslo_fluted_sideboard.jpg'
    ],
    description: 'A sculptural storage unit featuring a honed Italian travertine top resistant to dinner party wine spills and hot serving dishes.',
    story: 'Four fluted push-to-open doors conceal adjustable glassware racks and felt-lined cutlery organizers.',
    craftsmanship: 'Hand-honed natural porous travertine stone sealed with food-safe impregnator.',
    care: 'Wipe stone with mild neutral pH stone cleaner.',
    shippingEstimate: 'Delivers in 7–10 days with white-glove setup.',
    warranty: '5-year warranty.',
    variants: [],
    complementaryProductIds: ['prod-dn-01', 'prod-dn-02'],
    roomFitScore: 92
  },

  // --- HOME OFFICE ---
  {
    id: 'prod-of-01',
    sku: 'VL-OF-DSK-001',
    name: 'Meridian Executive Solid Walnut Desk',
    slug: 'meridian-executive-solid-walnut-desk',
    category: 'Desks',
    room: 'office',
    furnitureType: 'Executive Desk',
    price: 95000,
    salePrice: 86000,
    rating: 4.9,
    reviewCount: 33,
    stock: 8,
    availability: 'in_stock',
    dimensions: {
      width: '66"',
      depth: '30"',
      height: '29.5"',
      weight: '52 kg'
    },
    materials: ['Solid American Walnut', 'Cognac Saddle Leather Inset Pad', 'Anodized Cable Ports'],
    colors: ['American Walnut', 'Smoked Black Ash'],
    tags: ['Built-in Wireless Charger', 'Hidden Cable Raceway', 'Executive Size'],
    images: [
      '/images/products/veloura_meridian_executive_desk.jpg'
    ],
    description: 'Commanding presence and refined warmth. Features a flush leather writing surface, hidden high-speed Qi2 wireless charging spot, and concealed power cable bay.',
    story: 'Eliminates workplace clutter so your focus stays centered on meaningful thoughts.',
    craftsmanship: 'Integrated full-grain leather desktop inlay hand-stitched by leather master artisans.',
    care: 'Condition leather yearly with beeswax balm. Clean wood with damp cloth.',
    shippingEstimate: 'Ships within 4–6 business days.',
    warranty: '10-year warranty.',
    variants: [],
    complementaryProductIds: ['prod-of-02', 'prod-of-03', 'prod-of-04'],
    roomFitScore: 98,
    bestseller: true,
    featured: true
  },
  {
    id: 'prod-of-02',
    sku: 'VL-OF-CHR-002',
    name: 'Aeron Pro Leather Ergonomic Task Chair',
    slug: 'aeron-pro-leather-ergonomic-task-chair',
    category: 'Chairs',
    room: 'office',
    furnitureType: 'Ergonomic Chair',
    price: 68000,
    salePrice: 59000,
    rating: 5.0,
    reviewCount: 47,
    stock: 12,
    availability: 'in_stock',
    dimensions: {
      width: '26"',
      depth: '26"',
      height: '38"–43" (Adjustable)',
      seatHeight: '17"–22"',
      weight: '21 kg'
    },
    materials: ['Italian Saddle Leather', 'Cast Polished Aluminum Base', 'Synchronous Dynamic Mechanism'],
    colors: ['Cognac Saddle Leather', 'Onyx Black Leather', 'Taupe Grey'],
    tags: ['12-Hour Ergonomics', 'Dynamic Lumbar Tilt', 'Bestseller'],
    images: [
      '/images/products/veloura_aeron_pro_leather_chair.jpg'
    ],
    description: 'The pinnacle of ergonomic support dressed in buttery Italian leather. Synchronized tilt follows your spinal motion throughout deep work sprints.',
    story: 'Replaces cold plastic office chairs with luxurious residential craftsmanship that supports long hours.',
    craftsmanship: 'Class-4 pneumatic lift with whisper-quiet urethane floor casters.',
    care: 'Condition with specialized leather cream.',
    shippingEstimate: 'Ships within 2–4 business days.',
    warranty: '10-year mechanism and cylinder warranty.',
    variants: [
      {
        id: 'var-of02-cognac',
        name: 'Cognac Saddle Leather',
        colorName: 'Cognac Saddle',
        colorHex: '#8B5A2B',
        material: 'Italian Top Grain Leather',
        price: 68000,
        salePrice: 59000,
        stock: 8,
        image: '/images/products/veloura_aeron_pro_leather_chair.jpg'
      },
      {
        id: 'var-of02-black',
        name: 'Onyx Black Leather',
        colorName: 'Onyx Black',
        colorHex: '#211E1B',
        material: 'Italian Top Grain Leather',
        price: 68000,
        salePrice: 59000,
        stock: 4,
        image: '/images/products/veloura_aeron_pro_leather_chair.jpg'
      }
    ],
    complementaryProductIds: ['prod-of-01', 'prod-of-04'],
    roomFitScore: 97,
    bestseller: true
  },
  {
    id: 'prod-of-03',
    sku: 'VL-OF-BKS-003',
    name: 'Bauhaus Architectural Bookcase',
    slug: 'bauhaus-architectural-bookcase',
    category: 'Storage',
    room: 'office',
    furnitureType: 'Bookshelf',
    price: 72000,
    rating: 4.8,
    reviewCount: 16,
    stock: 5,
    availability: 'in_stock',
    dimensions: {
      width: '48"',
      depth: '16"',
      height: '78"',
      weight: '48 kg'
    },
    materials: ['Solid Walnut Shelves', 'Blackened Bronze Steel Frame'],
    colors: ['Walnut / Bronze', 'Natural Oak / White Steel'],
    tags: ['Heavy Load Rating', 'Architectural Grids', 'Open Display'],
    images: [
      '/images/products/veloura_bauhaus_bookcase.jpg'
    ],
    description: 'An open-air shelving system engineered to hold heavy art monographs, design artifacts, and ceramics without shelf sagging.',
    story: 'Balances industrial precision with warm natural timber.',
    craftsmanship: 'Solid 1.5-inch walnut shelves with concealed wall-anchoring safety hardware.',
    care: 'Dust with soft feather duster.',
    shippingEstimate: 'Ships within 4–6 business days.',
    warranty: '5-year warranty.',
    variants: [],
    complementaryProductIds: ['prod-of-01', 'prod-of-02'],
    roomFitScore: 92
  },
  {
    id: 'prod-of-04',
    sku: 'VL-OF-LGT-004',
    name: 'Linear Brass Precision Task Lamp',
    slug: 'linear-brass-precision-task-lamp',
    category: 'Lighting',
    room: 'office',
    furnitureType: 'Desk Lamp',
    price: 18500,
    rating: 4.9,
    reviewCount: 26,
    stock: 20,
    availability: 'in_stock',
    dimensions: {
      width: '24"',
      depth: '6"',
      height: '18"',
      weight: '4.2 kg'
    },
    materials: ['Solid Milled Brass', 'High CRI 95+ LED Module'],
    colors: ['Brushed Brass', 'Matte Black'],
    tags: ['CRI 95+ Eye Care', 'Touch Dimmer', 'Weighted Base'],
    images: [
      '/images/products/veloura_linear_brass_task_lamp.jpg'
    ],
    description: 'Minimalist illumination engineered for zero screen glare and maximum color accuracy during late-night design & writing sessions.',
    story: 'Subtle touch-sensitive brass control smoothly cycles from 10% warm amber mood to 100% focused reading light.',
    craftsmanship: 'Precision-machined from solid brass rod with internal heat sink.',
    care: 'Wipe with microfiber cloth.',
    shippingEstimate: 'Ships within 1–2 business days.',
    warranty: '3-year LED & circuit warranty.',
    variants: [],
    complementaryProductIds: ['prod-of-01', 'prod-of-02'],
    roomFitScore: 95
  },

  // --- STORAGE & SHOE RACKS (URBAN LADDER REFERENCE CURATION) ---
  {
    id: 'prod-sr-01',
    sku: 'VL-ST-SH-001',
    name: 'Bennis 25 Pair Shoe Rack in Dark Walnut Finish',
    slug: 'bennis-25-pair-shoe-rack-in-dark-walnut-finish',
    category: 'Storage',
    room: 'living-room',
    furnitureType: 'Shoe Rack',
    price: 17799,
    salePrice: 11999,
    rating: 4.8,
    reviewCount: 34,
    stock: 14,
    availability: 'in_stock',
    dimensions: {
      width: '45"',
      depth: '15"',
      height: '34"',
      weight: '36 kg'
    },
    materials: ['Solid Sheesham & Walnut', 'High-Resilience Padded Bench Cushion', 'Louvered Slatted Timber Doors'],
    colors: ['Dark Walnut Finish', 'Classic Teak'],
    tags: ['25 Pairs Capacity', 'Louvered Ventilation', 'Integrated Bench', 'Veloura Living'],
    images: [
      '/images/products/veloura_bennis_shoe_rack.jpg'
    ],
    description: 'The Bennis Shoe Rack seamlessly integrates extensive footwear organization with an entryway seating bench. Breathable slatted louvered doors maintain fresh airflow while concealed tiers protect fine leather shoes from dust.',
    story: 'Designed to solve everyday entryway clutter with quiet architectural elegance and seating convenience.',
    craftsmanship: 'Handcrafted with mortise-and-tenon joints and moisture-resistant matte lacquer.',
    care: 'Wipe with a soft dry cloth. Spot clean upholstered bench with fabric foam.',
    shippingEstimate: 'Ships within 3–5 business days with free doorstep delivery.',
    warranty: '5-year structural warranty.',
    variants: [],
    complementaryProductIds: ['prod-lr-06', 'prod-br-04'],
    roomFitScore: 96,
    bestseller: true,
    featured: true
  },
  {
    id: 'prod-sr-02',
    sku: 'VL-ST-SH-002',
    name: 'Webster 48 Pair Shoe Rack in Walnut Finish',
    slug: 'webster-48-pair-shoe-rack-in-walnut-finish',
    category: 'Storage',
    room: 'living-room',
    furnitureType: 'Shoe Cabinet',
    price: 32199,
    salePrice: 22999,
    rating: 4.9,
    reviewCount: 41,
    stock: 9,
    availability: 'in_stock',
    dimensions: {
      width: '52"',
      depth: '16"',
      height: '44"',
      weight: '58 kg'
    },
    materials: ['Kiln-Dried American Walnut', 'Solid Wood Splayed Legs', 'Soft-Close Concealed European Hinges'],
    colors: ['Walnut Finish', 'Espresso Dark Oak'],
    tags: ['48 Pairs Huge Capacity', 'Soft Close Doors', 'Adjustable Internal Tiers', 'Veloura Living'],
    images: [
      '/images/products/veloura_webster_shoe_cabinet.jpg'
    ],
    description: 'A grand-capacity shoe console engineered for multi-pair collections. Behind its minimalist dual walnut doors lie 8 adjustable internal tiers with anti-dust seal gaskets and angled heels support.',
    story: 'Accommodates up to 48 pairs of formal footwear, sneakers, and boots without visual bulk.',
    craftsmanship: 'Continuous matching wood grain across both front doors with hidden acoustic dampers.',
    care: 'Dust with soft micro-fiber cloth and apply natural wood wax twice a year.',
    shippingEstimate: 'Ships within 4–7 business days with white-glove setup.',
    warranty: '10-year warranty.',
    variants: [],
    complementaryProductIds: ['prod-sr-01', 'prod-of-03'],
    roomFitScore: 98,
    bestseller: true,
    featured: true
  },
  {
    id: 'prod-sr-03',
    sku: 'VL-ST-SH-003',
    name: 'Alex 21 Pair Shoe Cabinet in Classic Walnut Finish',
    slug: 'alex-21-pair-shoe-cabinet-in-classic-walnut-finish',
    category: 'Storage',
    room: 'living-room',
    furnitureType: 'Shoe Bench & Cabinet',
    price: 15999,
    salePrice: 7999,
    rating: 4.7,
    reviewCount: 29,
    stock: 18,
    availability: 'in_stock',
    dimensions: {
      width: '42"',
      depth: '14"',
      height: '38"',
      weight: '32 kg'
    },
    materials: ['Engineered Hardwood with Walnut Grain', 'High-Density Foam Padded Seat', 'Heavy-Duty Hardware'],
    colors: ['Classic Walnut', 'Natural Muted Oak'],
    tags: ['50% Privilege Offer', 'Entryway Bench', '21 Pair Capacity', 'Veloura Living'],
    images: [
      '/images/products/veloura_alex_shoe_bench_cabinet.jpg'
    ],
    description: 'Smart dual-zone entryway console combining a vertical 2-door enclosed cabinet with an open quick-access 2-tier bench seat for daily sneakers, loafers, and guest footwear.',
    story: 'Optimized for modern apartments where space efficiency meets comfortable morning shoe tying.',
    craftsmanship: 'Scratch-resistant melamine polymer coat with reinforced bench load capacity of 130 kg.',
    care: 'Clean with damp cloth and dry immediately.',
    shippingEstimate: 'Ships within 2–4 business days.',
    warranty: '3-year warranty.',
    variants: [],
    complementaryProductIds: ['prod-sr-01', 'prod-lr-06'],
    roomFitScore: 94,
    bestseller: false,
    featured: true
  },
  {
    id: 'prod-sr-04',
    sku: 'VL-ST-SH-004',
    name: 'Nina 24 Pairs Solid Wood Shoe Cabinet in Mango Walnut Finish',
    slug: 'nina-24-pairs-solid-wood-shoe-cabinet-in-mango-walnut-finish',
    category: 'Storage',
    room: 'living-room',
    furnitureType: 'Solid Wood Shoe Cabinet',
    price: 49999,
    salePrice: 29999,
    rating: 4.9,
    reviewCount: 53,
    stock: 7,
    availability: 'in_stock',
    dimensions: {
      width: '38"',
      depth: '16"',
      height: '46"',
      weight: '52 kg'
    },
    materials: ['Solid Mango Wood with Walnut Stain', 'Hand-Laid Chevron Herringbone Parquet', 'Brushed Brass Metal Base'],
    colors: ['Mango Walnut Finish', 'Smoked Espresso Teak'],
    tags: ['Handcrafted Chevron', 'Solid Wood Heritage', 'Brushed Brass Base', 'Veloura Living'],
    images: [
      '/images/products/veloura_nina_chevron_cabinet.jpg'
    ],
    description: 'An heirloom statement storage piece. Features hand-laid geometric chevron wood parquet door fronts, slim vertical champagne brass pulls, and an elevated metal chassis that allows robotic vacuums to pass underneath.',
    story: 'Crafted in Jodhpur by master carpenters specializing in generational wood parquet marquetry.',
    craftsmanship: 'Solid kiln-seasoned mango hardwood frame with hand-rubbed organic oil stain.',
    care: 'Condition with natural beeswax polish. Wipe brass with dry cloth.',
    shippingEstimate: 'Ships within 5–8 business days with white-glove setup.',
    warranty: '7-year structural warranty.',
    variants: [],
    complementaryProductIds: ['prod-br-04', 'prod-dn-04'],
    roomFitScore: 99,
    bestseller: true,
    featured: true
  },
  {
    id: 'prod-sr-05',
    sku: 'VL-ST-SH-005',
    name: 'Fujiwara 20 Pair Solid Wood and Cane Cabinet With Drawer In Amber Walnut',
    slug: 'fujiwara-20-pair-solid-wood-and-cane-cabinet-with-drawer-in-amber-walnut',
    category: 'Storage',
    room: 'living-room',
    furnitureType: 'Solid Wood & Cane Shoe Cabinet',
    price: 54999,
    salePrice: 33999,
    rating: 5.0,
    reviewCount: 62,
    stock: 6,
    availability: 'in_stock',
    dimensions: {
      width: '40"',
      depth: '15"',
      height: '45"',
      weight: '46 kg'
    },
    materials: ['Solid Amber Walnut Wood', 'Handwoven Natural Rattan Cane Mesh', 'Solid Brass Knobs'],
    colors: ['Amber Walnut & Natural Cane', 'Aged Teak & Honey Cane'],
    tags: ['Japandi Cane Weave', 'Top Accessory Drawer', 'Breathable Storage', 'Veloura Living'],
    images: [
      '/images/products/veloura_fujiwara_cane_cabinet.jpg'
    ],
    description: 'Harmonious Japandi craftsmanship integrating natural handwoven rattan cane panels with warm amber walnut. Top accessory drawer stores keys, sunglasses, and shoe care essentials with effortless elegance.',
    story: 'Inspired by traditional Kyoto lattice cabinetry, allowing shoes to naturally breathe through woven cane while remaining discreetly concealed.',
    craftsmanship: 'Double-woven octagonal rattan cane mesh tightly stretched over solid walnut rails.',
    care: 'Dust cane gently with dry brush. Keep away from direct water contact.',
    shippingEstimate: 'Ships within 4–6 business days with white-glove setup.',
    warranty: '5-year craftsmanship warranty.',
    variants: [],
    complementaryProductIds: ['prod-lr-02', 'prod-of-04'],
    roomFitScore: 97,
    bestseller: true,
    featured: true
  }
];

export const COUPONS: Coupon[] = [
  {
    code: 'VELOURA10',
    discountType: 'percentage',
    value: 10,
    minSpend: 20000,
    description: '10% off on complete furniture orders above ₹20,000'
  },
  {
    code: 'ROOM5000',
    discountType: 'fixed',
    value: 5000,
    minSpend: 50000,
    description: 'Flat ₹5,000 instant saving on Room collections above ₹50,000'
  },
  {
    code: 'LUXURY20',
    discountType: 'percentage',
    value: 20,
    minSpend: 200000,
    description: 'Exclusive 20% privilege savings for comprehensive space curation above ₹2,00,000'
  }
];

export const REVIEWS: Review[] = [
  {
    id: 'rev-01',
    productId: 'prod-lr-01',
    author: 'Aarav Singhania',
    city: 'Mumbai',
    rating: 5,
    date: '14 September 2026',
    title: 'Transformed our entire high-rise living room',
    content: 'The Serpentine Sectional is worth every single rupee. The bouclé fabric feels incredibly rich, and the seat depth is unmatched. The white-glove team assembled it in 20 minutes without any mess.',
    verifiedPurchase: true,
    helpfulCount: 34,
    roomType: 'Living Room'
  },
  {
    id: 'rev-02',
    productId: 'prod-br-01',
    author: 'Dr. Radhika Sen',
    city: 'Bengaluru',
    rating: 5,
    date: '28 August 2026',
    title: 'The quietest and most comfortable bed I have owned',
    content: 'Zero squeaks, zero wobble. The low-profile platform makes our bedroom feel twice as spacious and airy. Paired it with the Kanso nightstands for a clean Japandi sanctuary.',
    verifiedPurchase: true,
    helpfulCount: 28,
    roomType: 'Bedroom'
  },
  {
    id: 'rev-03',
    productId: 'prod-dn-01',
    author: 'Kunal & Meera Varma',
    city: 'Pune',
    rating: 5,
    date: '02 September 2026',
    title: 'An heirloom walnut slab that commands the room',
    content: 'The wood grain on this dining table is hypnotic. We have hosted three family dinners already, and everyone was blown away by the craftsmanship. Outstanding packaging as well.',
    verifiedPurchase: true,
    helpfulCount: 19,
    roomType: 'Dining'
  },
  {
    id: 'rev-04',
    productId: 'prod-of-01',
    author: 'Vikramaditya Rao',
    city: 'Hyderabad',
    rating: 5,
    date: '19 August 2026',
    title: 'Work from home elevated to executive perfection',
    content: 'The hidden cable tray and leather inset make daily work so pleasant. No dangling wires anywhere. The solid walnut smell is pure luxury.',
    verifiedPurchase: true,
    helpfulCount: 15,
    roomType: 'Office'
  }
];

export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    id: 'journal-01',
    slug: 'the-art-of-proportion-in-modern-living-rooms',
    title: 'The Art of Proportion in Modern Living Rooms',
    subtitle: 'Why low-slung seating and spatial breathing room redefine residential elegance.',
    readTime: '4 min read',
    date: 'September 24, 2026',
    category: 'Spatial Design',
    author: {
      name: 'Aditi Deshmukh',
      role: 'Principal Interior Architect',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    },
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'How thoughtful furniture scaling, low sightlines, and tactile negative space allow natural light to become your home’s finest material.',
    paragraphs: [
      'In traditional interior staging, rooms were often crowded with heavy upright furniture that created visual barriers across the sightline. Today’s architectural homes demand a different sensibility — one rooted in horizontal calm.',
      'By lowering the seating profile to 16–17 inches and embracing organic curved silhouettes, furniture ceases to block windows. Instead, it invites the golden evening sunlight deep into the room.',
      'When curating your living space, start with the negative space first. Allow at least 36 inches of clear walking circulation between the sectional sofa and coffee table.'
    ],
    tags: ['Architecture', 'Living Room', 'Proportions', 'Lighting']
  },
  {
    id: 'journal-02',
    slug: 'why-boucle-and-raw-walnut-are-timeless-partners',
    title: 'Why Bouclé & Raw Walnut Are Timeless Partners',
    subtitle: 'Exploring the tactile harmony of textured wool against the warm grain of American hardwood.',
    readTime: '5 min read',
    date: 'September 12, 2026',
    category: 'Material Stories',
    author: {
      name: 'Rohan Mehra',
      role: 'Head of Material Craft',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    },
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'The interplay between organic softness and architectural firmness creates rooms that comfort the body and delight the eye.',
    paragraphs: [
      'There is an undeniable alchemy when tactile, loopy bouclé meets the rich dark tones of kiln-dried American walnut. Bouclé softens the geometric sharpness, while dark timber anchors the light-reflecting fabric.',
      'At Veloura, we select our walnut from sustainable Midwest forests where slow winter growth produces dense, tight grain rings. Hand-rubbed with natural botanical oils, the wood breathes without plastic sheen.'
    ],
    tags: ['Materials', 'Craftsmanship', 'Walnut', 'Boucle']
  },
  {
    id: 'journal-03',
    slug: 'circadian-lighting-and-bedroom-sanctuary',
    title: 'Circadian Architecture: Designing a Bedroom for Deep Repose',
    subtitle: 'How warm diffuse lighting and acoustic timber create a sensory shift toward restorative sleep.',
    readTime: '6 min read',
    date: 'August 30, 2026',
    category: 'Wellbeing & Sleep',
    author: {
      name: 'Siddharth Joshi',
      role: 'Lighting & Acoustic Designer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
    },
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Eliminating harsh overhead lighting and blue glare in favor of low-level brass warmth and tactile linen surfaces.',
    paragraphs: [
      'The bedroom must signal to the brain that the day’s work has concluded. Overhead ceiling spots stimulate the alert response; transitioning to low-level 2700K brass illumination immediately triggers melatonin release.',
      'Our Kanso nightstands and Solitude platform bed incorporate zero-reflectance matte joinery to soften room reverberation.'
    ],
    tags: ['Bedroom', 'Lighting', 'Sleep', 'Sanctuary']
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-9021',
    orderNumber: 'VL-2026-8941',
    createdAt: '26 Sep 2026, 02:40 PM',
    status: 'Shipped',
    items: [
      {
        productId: 'prod-lr-01',
        variantId: 'var-lr01-cream',
        name: 'Serpentine Modular Sectional Sofa',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
        selectedColor: 'Oat Cream',
        selectedMaterial: 'Italian Bouclé',
        price: 168000,
        quantity: 1
      },
      {
        productId: 'prod-lr-02',
        variantId: 'var-lr02-walnut',
        name: 'Kyoto Sculptural Walnut Coffee Table',
        image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&q=80',
        selectedColor: 'American Walnut',
        selectedMaterial: 'Solid Walnut',
        price: 48000,
        quantity: 1
      }
    ],
    subtotal: 216000,
    discount: 21600,
    shipping: 0,
    total: 194400,
    customer: {
      fullName: 'Aarav Singhania',
      email: 'aarav.singhania@veloura.live',
      phone: '+91 98201 54321',
      address: 'Skyline Penthouse 34A, Worli Sea Face',
      apartment: 'Tower B, 34th Floor',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400018'
    },
    trackingNumber: 'VL-EXP-8941-TRK',
    estimatedDeliveryDate: '02 Oct 2026',
    paymentMethod: 'upi_razorpay',
    paymentStatus: 'Paid',
    timeline: [
      {
        status: 'Order Placed & Payment Confirmed',
        date: '26 Sep 2026, 02:40 PM',
        description: 'Order confirmed and allocated to master workshop.',
        completed: true
      },
      {
        status: 'Master Crafting & Tailoring',
        date: '27 Sep 2026, 11:15 AM',
        description: 'Kiln-dried frame inspection and hand upholstery finished.',
        completed: true
      },
      {
        status: 'Quality & Acoustic Inspection',
        date: '29 Sep 2026, 04:30 PM',
        description: 'Passed 32-point finish and structural test.',
        completed: true
      },
      {
        status: 'Dispatched via Veloura White-Glove Fleet',
        date: '30 Sep 2026, 09:00 AM',
        description: 'In transit to Mumbai Distribution Hub.',
        completed: true
      },
      {
        status: 'White-Glove In-Home Installation',
        date: '02 Oct 2026 (Scheduled)',
        description: 'Team will unbox, place in room, and clear all packaging.',
        completed: false
      }
    ]
  }
];
