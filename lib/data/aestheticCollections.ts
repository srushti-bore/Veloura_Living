export interface AestheticImageItem {
  id: string;
  title: string;
  category: string;
  image: string;
  caption: string;
  materialTag: string;
  dimensionsRatio: '4:5';
  productId?: string;
  productSlug?: string;
  price?: number;
}

export interface AestheticCollectionSection {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  heroImage: string;
  room: string;
  materialTokens: string[];
  piecesCount: number;
  images: AestheticImageItem[];
}

export const aestheticCollectionsData: AestheticCollectionSection[] = [
  // 1. WARM MINIMALIST LIVING
  {
    id: 'col-warm-minimal',
    slug: 'warm-minimalist-living',
    title: 'Warm Minimalist Living',
    subtitle: 'Low horizontal profiles in tactile Belgian bouclé and oiled American walnut.',
    tagline: 'Tactile bouclé, oiled American walnut & diffused natural light.',
    description: 'A study in low horizontal profiles and grounded proportions. Soft textural Belgian wool balances the crisp architectural lines of solid American walnut and honed travertine.',
    heroImage: '/images/collections/warm-minimalist-living/warm-minimalist-living-01.jpg',
    room: 'living-room',
    materialTokens: ['Belgian Wool Bouclé', 'Oiled American Walnut', 'Honed Travertine', 'Cast Bronze'],
    piecesCount: 15,
    images: [
      {
        id: 'wm-01',
        title: 'Veloura Bouclé Grand Sofa Suite',
        category: 'Living Architecture',
        image: '/images/collections/warm-minimalist-living/warm-minimalist-living-01.jpg',
        caption: 'Low-profile monolithic sofa surrounded by natural walnut joinery and full-height glazing.',
        materialTag: 'Belgian Bouclé & Walnut',
        dimensionsRatio: '4:5',
        productId: 'prod-sofa-01',
        productSlug: 'arcadia-modular-sofa',
        price: 245000
      },
      {
        id: 'wm-02',
        title: 'Tactile Bouclé Armchair & Walnut Edge',
        category: 'Macro Detail',
        image: '/images/collections/warm-minimalist-living/warm-minimalist-living-02.jpg',
        caption: 'Micro-texture of thick looped wool upholstery paired with bullnose solid walnut bevels.',
        materialTag: 'Wool Bouclé Weave',
        dimensionsRatio: '4:5',
        productId: 'prod-armchair-01',
        productSlug: 'kyoto-lounge-chair',
        price: 88000
      },
      {
        id: 'wm-03',
        title: 'Organic Monolith Coffee Table',
        category: 'Centerpiece',
        image: '/images/collections/warm-minimalist-living/warm-minimalist-living-03.jpg',
        caption: 'Continuous grain American walnut slab with low-slung architectural floor clearance.',
        materialTag: 'Solid Hardwood',
        dimensionsRatio: '4:5',
        productId: 'prod-table-01',
        productSlug: 'oslo-coffee-table',
        price: 64000
      },
      {
        id: 'wm-04',
        title: 'Travertine & Warm Wood Lounge',
        category: 'Spatial Framing',
        image: '/images/collections/warm-minimalist-living/warm-minimalist-living-04.jpg',
        caption: 'Grounded living room composition bathed in morning sun with minimal floor rugs.',
        materialTag: 'Honed Travertine',
        dimensionsRatio: '4:5',
        productId: 'prod-sofa-01',
        productSlug: 'arcadia-modular-sofa',
        price: 245000
      },
      {
        id: 'wm-05',
        title: 'Sculptural Ceramic & Floating Credenza',
        category: 'Storage & Surfaces',
        image: '/images/collections/warm-minimalist-living/warm-minimalist-living-05.jpg',
        caption: 'Minimalist low credenza with soft-close tambour slats and raw stoneware pottery.',
        materialTag: 'Natural Oak & Ceramic',
        dimensionsRatio: '4:5',
        price: 115000
      },
      {
        id: 'wm-06',
        title: 'Curved Bouclé Reading Nook',
        category: 'Seating Corner',
        image: '/images/collections/warm-minimalist-living/warm-minimalist-living-06.jpg',
        caption: 'Enveloping swivel armchair positioned beside acoustic fluted timber panels.',
        materialTag: 'Merino Wool Bouclé',
        dimensionsRatio: '4:5',
        productId: 'prod-armchair-01',
        productSlug: 'kyoto-lounge-chair',
        price: 88000
      },
      {
        id: 'wm-07',
        title: 'Ambient Floor Lamp Glow at Dusk',
        category: 'Lighting',
        image: '/images/collections/warm-minimalist-living/warm-minimalist-living-07.jpg',
        caption: 'Warm 2400K diffuse illumination washing across ribbed plaster accent walls.',
        materialTag: 'Spun Brass & Frosted Glass',
        dimensionsRatio: '4:5',
        price: 32000
      },
      {
        id: 'wm-08',
        title: 'Low Slung Hearthside Composition',
        category: 'Fireplace Setting',
        image: '/images/collections/warm-minimalist-living/warm-minimalist-living-08.jpg',
        caption: 'Minimal linear fireplace recessed into textured limestone with walnut benching.',
        materialTag: 'Limestone & Walnut',
        dimensionsRatio: '4:5',
        price: 195000
      },
      {
        id: 'wm-09',
        title: 'Oiled Walnut Architectural Shelving',
        category: 'Case Goods',
        image: '/images/collections/warm-minimalist-living/warm-minimalist-living-09.jpg',
        caption: 'Precision tenon-joined open shelving displaying curated hardcover architectural monographs.',
        materialTag: 'FSC American Walnut',
        dimensionsRatio: '4:5',
        price: 145000
      },
      {
        id: 'wm-10',
        title: 'Sunlit Minimalist Daybed',
        category: 'Daybed',
        image: '/images/collections/warm-minimalist-living/warm-minimalist-living-10.jpg',
        caption: 'Strapped saddle leather suspension on a continuous solid walnut perimeter frame.',
        materialTag: 'Cognac Leather & Oak',
        dimensionsRatio: '4:5',
        price: 175000
      },
      {
        id: 'wm-11',
        title: 'Matte Plaster & Jute Harmony',
        category: 'Texture Study',
        image: '/images/collections/warm-minimalist-living/warm-minimalist-living-11.jpg',
        caption: 'Hand-knotted unbleached wool rug under a low sculptural monolithic table.',
        materialTag: 'Natural Jute & Wool',
        dimensionsRatio: '4:5',
        price: 48000
      },
      {
        id: 'wm-12',
        title: 'Architectural Shadow & Minimalist Glazing',
        category: 'Atmosphere',
        image: '/images/collections/warm-minimalist-living/warm-minimalist-living-12.jpg',
        caption: 'Geometric slatted sunlight falling across blonde oak flooring and clean plaster walls.',
        materialTag: 'European White Oak',
        dimensionsRatio: '4:5',
        price: 210000
      },
      {
        id: 'wm-13',
        title: 'Floating Walnut Media Credenza',
        category: 'Living Storage',
        image: '/images/collections/warm-minimalist-living/warm-minimalist-living-13.jpg',
        caption: 'Seamless miter-joint cabinetry with integrated acoustic cloth speaker bays.',
        materialTag: 'American Black Walnut',
        dimensionsRatio: '4:5',
        price: 138000
      },
      {
        id: 'wm-14',
        title: 'Tactile Ceramic Table Lamp',
        category: 'Lighting Object',
        image: '/images/collections/warm-minimalist-living/warm-minimalist-living-14.jpg',
        caption: 'Wheel-thrown volcanic clay base with pleated natural linen shade.',
        materialTag: 'Volcanic Stoneware',
        dimensionsRatio: '4:5',
        price: 26000
      },
      {
        id: 'wm-15',
        title: 'Veloura Complete Minimalist Living Sanctuary',
        category: 'Signature Suite',
        image: '/images/collections/warm-minimalist-living/warm-minimalist-living-15.jpg',
        caption: 'The complete warm minimalist living room proportioned for calm architectural living.',
        materialTag: 'Veloura Signature Living',
        dimensionsRatio: '4:5',
        productId: 'prod-sofa-01',
        productSlug: 'arcadia-modular-sofa',
        price: 420000
      }
    ]
  },

  // 2. JAPANDI REST SANCTUARY
  {
    id: 'col-japandi-rest',
    slug: 'japandi-rest-sanctuary',
    title: 'Japandi Rest Sanctuary',
    subtitle: 'Low-profile platform beds with zero-creak acoustic timber slats and pure flax linens.',
    tagline: 'Low-profile platform beds, acoustic timber slats & pure flax linen.',
    description: 'Where Japanese wabi-sabi meets Scandinavian functional warmth. Acoustic wood slats promote stillness, while unbleached natural linens and floating platform joinery ground the space.',
    heroImage: '/images/collections/japandi-rest-sanctuary/japandi-rest-sanctuary-01.jpg',
    room: 'bedroom',
    materialTokens: ['Solid White Oak', 'Acoustic Timber Slats', 'Organic Flax Linen', 'Washi Rice Paper'],
    piecesCount: 15,
    images: [
      {
        id: 'jp-01',
        title: 'Veloura Slatted Platform Bed Suite',
        category: 'Bedroom Masterpiece',
        image: '/images/collections/japandi-rest-sanctuary/japandi-rest-sanctuary-01.jpg',
        caption: 'Low-slung white oak platform bed with continuous timber slat headboard and washi paper lantern.',
        materialTag: 'Solid Oak & Washi Paper',
        dimensionsRatio: '4:5',
        productId: 'prod-bed-01',
        productSlug: 'nordic-platform-bed',
        price: 195000
      },
      {
        id: 'jp-02',
        title: 'Ceramic Tea Set & Morning Sunlight',
        category: 'Ritual Detail',
        image: '/images/collections/japandi-rest-sanctuary/japandi-rest-sanctuary-02.jpg',
        caption: 'Handcrafted stoneware tea kettle on solid oak cube nightstand with waffle linen blanket.',
        materialTag: 'Stoneware & Solid Oak',
        dimensionsRatio: '4:5',
        productId: 'prod-nightstand-01',
        productSlug: 'nara-bedside-table',
        price: 34000
      },
      {
        id: 'jp-03',
        title: 'Acoustic Oak Slat Wall & Low Headboard',
        category: 'Acoustic Joinery',
        image: '/images/collections/japandi-rest-sanctuary/japandi-rest-sanctuary-03.jpg',
        caption: 'Sound-dampening vertical timber slats integrated behind a minimal linen headrest.',
        materialTag: 'FSC European Oak',
        dimensionsRatio: '4:5',
        productId: 'prod-bed-01',
        productSlug: 'nordic-platform-bed',
        price: 195000
      },
      {
        id: 'jp-04',
        title: 'Washi Paper Pendant Light Sphere',
        category: 'Lighting Art',
        image: '/images/collections/japandi-rest-sanctuary/japandi-rest-sanctuary-04.jpg',
        caption: 'Oversized sculptural mulberry paper globe casting an ethereal shadowless glow.',
        materialTag: 'Handmade Washi Paper',
        dimensionsRatio: '4:5',
        price: 42000
      },
      {
        id: 'jp-05',
        title: 'Minimal Tatami Bedside Bench',
        category: 'Low Seating',
        image: '/images/collections/japandi-rest-sanctuary/japandi-rest-sanctuary-05.jpg',
        caption: 'Woven rush grass and mortise-and-tenon solid ash timber bench for end-of-bed styling.',
        materialTag: 'Natural Ash & Rush Grass',
        dimensionsRatio: '4:5',
        price: 52000
      },
      {
        id: 'jp-06',
        title: 'Pure Unbleached Flax Linen Bedding',
        category: 'Textiles',
        image: '/images/collections/japandi-rest-sanctuary/japandi-rest-sanctuary-06.jpg',
        caption: 'Stone-washed 180 GSM Belgian flax linens in oatmeal and undyed natural stone.',
        materialTag: '100% Organic Flax',
        dimensionsRatio: '4:5',
        price: 24000
      },
      {
        id: 'jp-07',
        title: 'Floating Oak Nightstand with Brass Pull',
        category: 'Bedside Table',
        image: '/images/collections/japandi-rest-sanctuary/japandi-rest-sanctuary-07.jpg',
        caption: 'Cantilevered wall-mounted nightstand keeping the floor plane open and restful.',
        materialTag: 'White Oak & Brushed Brass',
        dimensionsRatio: '4:5',
        productId: 'prod-nightstand-01',
        productSlug: 'nara-bedside-table',
        price: 34000
      },
      {
        id: 'jp-08',
        title: 'Shoji Screen Window Diffuser',
        category: 'Architectural Screen',
        image: '/images/collections/japandi-rest-sanctuary/japandi-rest-sanctuary-08.jpg',
        caption: 'Translucent sliding timber screen providing quiet privacy and softened daylight.',
        materialTag: 'Natural Cedar & Rice Paper',
        dimensionsRatio: '4:5',
        price: 88000
      },
      {
        id: 'jp-09',
        title: 'Bonsai & Ceramic Ikebana Vessel',
        category: 'Living Accent',
        image: '/images/collections/japandi-rest-sanctuary/japandi-rest-sanctuary-09.jpg',
        caption: 'Curated organic green accent on a blackened burnt-oak display plinth.',
        materialTag: 'Shou Sugi Ban Timber',
        dimensionsRatio: '4:5',
        price: 18000
      },
      {
        id: 'jp-10',
        title: 'Minimalist Louvered Wardrobe Closets',
        category: 'Bedroom Storage',
        image: '/images/collections/japandi-rest-sanctuary/japandi-rest-sanctuary-10.jpg',
        caption: 'Continuous wood slat door fronts with recessed flush handles for invisible storage.',
        materialTag: 'Natural White Oak',
        dimensionsRatio: '4:5',
        price: 280000
      },
      {
        id: 'jp-11',
        title: 'Zen Meditation Corner Armchair',
        category: 'Quiet Seating',
        image: '/images/collections/japandi-rest-sanctuary/japandi-rest-sanctuary-11.jpg',
        caption: 'Low profile ash wood frame with natural unbleached cotton cord weaving.',
        materialTag: 'Natural Ash & Cotton Weave',
        dimensionsRatio: '4:5',
        price: 68000
      },
      {
        id: 'jp-12',
        title: 'Woven Sisal & Wool Bedroom Rug',
        category: 'Floor Coverings',
        image: '/images/collections/japandi-rest-sanctuary/japandi-rest-sanctuary-12.jpg',
        caption: 'High-density natural fiber rug providing acoustic dampening and warm barefoot feel.',
        materialTag: 'Natural Sisal & Wool',
        dimensionsRatio: '4:5',
        price: 36000
      },
      {
        id: 'jp-13',
        title: 'Charcoal Shou Sugi Ban Accent Side Table',
        category: 'Accent Furniture',
        image: '/images/collections/japandi-rest-sanctuary/japandi-rest-sanctuary-13.jpg',
        caption: 'Japanese flame-charred solid cedar wood block with textured tactile finish.',
        materialTag: 'Burnt Cedar Wood',
        dimensionsRatio: '4:5',
        price: 29000
      },
      {
        id: 'jp-14',
        title: 'Soft Cast Evening Glow in Bedroom',
        category: 'Night Ambience',
        image: '/images/collections/japandi-rest-sanctuary/japandi-rest-sanctuary-14.jpg',
        caption: 'Under-bed ambient LED channel providing gentle floating floor reflection at night.',
        materialTag: 'Warm Architectural Lighting',
        dimensionsRatio: '4:5',
        price: 22000
      },
      {
        id: 'jp-15',
        title: 'Veloura Complete Japandi Master Suite',
        category: 'Complete Sanctuary',
        image: '/images/collections/japandi-rest-sanctuary/japandi-rest-sanctuary-15.jpg',
        caption: 'The complete Japandi master bedroom architectural layout with full natural airflow.',
        materialTag: 'Veloura Japandi Suite',
        dimensionsRatio: '4:5',
        productId: 'prod-bed-01',
        productSlug: 'nordic-platform-bed',
        price: 380000
      }
    ]
  },

  // 3. HEIRLOOM GATHERING TABLE
  {
    id: 'col-generational-wood',
    slug: 'heirloom-gathering-table',
    title: 'Heirloom Gathering Table',
    subtitle: 'Continuous slab solid walnut dining tables with steam-bent supportive seating.',
    tagline: 'Continuous slab solid walnut dining tables & steam-bent seating.',
    description: 'Built for multi-generational dining and lasting memories. 40mm thick bookmatched American walnut slabs with butterfly joint keys and steam-bent saddle leather chairs.',
    heroImage: '/images/collections/heirloom-gathering-table/heirloom-gathering-table-01.jpg',
    room: 'dining',
    materialTokens: ['Bookmatched American Walnut', 'Steam-Bent Hardwood', 'Cognac Saddle Leather', 'Architectural Brass'],
    piecesCount: 15,
    images: [
      {
        id: 'hg-01',
        title: 'Heirloom 10-Seater Walnut Live Edge Table',
        category: 'Dining Masterpiece',
        image: '/images/collections/heirloom-gathering-table/heirloom-gathering-table-01.jpg',
        caption: 'Continuous live-edge solid walnut dining table surrounded by custom saddle leather dining chairs and brass pendant.',
        materialTag: 'Solid Live Edge Walnut',
        dimensionsRatio: '4:5',
        productId: 'prod-dining-01',
        productSlug: 'heritage-dining-table',
        price: 280000
      },
      {
        id: 'hg-02',
        title: 'Steam-Bent Walnut Dining Chair with Leather Seat',
        category: 'Dining Chair',
        image: '/images/collections/heirloom-gathering-table/heirloom-gathering-table-02.jpg',
        caption: 'Ergonomic steam-bent lumbar support paired with vegetable-tanned saddle leather cushion.',
        materialTag: 'American Walnut & Saddle Leather',
        dimensionsRatio: '4:5',
        productId: 'prod-chair-01',
        productSlug: 'verona-dining-chair',
        price: 38000
      },
      {
        id: 'hg-03',
        title: 'Fluted Walnut Dining Credenza & Marble Top',
        category: 'Buffet Sideboard',
        image: '/images/collections/heirloom-gathering-table/heirloom-gathering-table-03.jpg',
        caption: 'Hand-routed vertical fluting with Carrara marble countertop and brass cutlery drawers.',
        materialTag: 'Walnut & Carrara Marble',
        dimensionsRatio: '4:5',
        price: 165000
      },
      {
        id: 'hg-04',
        title: 'Linear Brass Minimalist Chandelier',
        category: 'Dining Lighting',
        image: '/images/collections/heirloom-gathering-table/heirloom-gathering-table-04.jpg',
        caption: 'Suspended architectural brass beam with downward glare-free continuous CRI 98 light.',
        materialTag: 'Brushed Architectural Brass',
        dimensionsRatio: '4:5',
        price: 58000
      },
      {
        id: 'hg-05',
        title: 'Bookmatched Walnut Wood Grain Detail',
        category: 'Timber Macro',
        image: '/images/collections/heirloom-gathering-table/heirloom-gathering-table-05.jpg',
        caption: 'Natural figure, chatoyancy, and hand-rubbed organic plant oil finish on 40mm slab.',
        materialTag: 'Natural Plant-Oiled Timber',
        dimensionsRatio: '4:5',
        productId: 'prod-dining-01',
        productSlug: 'heritage-dining-table',
        price: 280000
      },
      {
        id: 'hg-06',
        title: 'Monolithic Dining Bench for Family Seating',
        category: 'Bench Seating',
        image: '/images/collections/heirloom-gathering-table/heirloom-gathering-table-06.jpg',
        caption: 'Full-length solid timber bench fitting 4 adults with rounded bevel comfort edges.',
        materialTag: 'Solid American Walnut',
        dimensionsRatio: '4:5',
        price: 78000
      },
      {
        id: 'hg-07',
        title: 'Curated Tableware & Stoneware Decanter',
        category: 'Dining Tabletop',
        image: '/images/collections/heirloom-gathering-table/heirloom-gathering-table-07.jpg',
        caption: 'Artisanal ceramic plates and brass flatware styled over an unbleached linen runner.',
        materialTag: 'Handcrafted Ceramic & Brass',
        dimensionsRatio: '4:5',
        price: 18000
      },
      {
        id: 'hg-08',
        title: 'Sun-Drenched Garden View Dining Room',
        category: 'Architecture',
        image: '/images/collections/heirloom-gathering-table/heirloom-gathering-table-08.jpg',
        caption: 'Bifold steel-framed glass doors opening the dining area to private olive tree courtyard.',
        materialTag: 'Steel & Solid Hardwood',
        dimensionsRatio: '4:5',
        price: 340000
      },
      {
        id: 'hg-09',
        title: 'Bar Cabinet with Ribbed Fluted Glass Doors',
        category: 'Hospitality Storage',
        image: '/images/collections/heirloom-gathering-table/heirloom-gathering-table-09.jpg',
        caption: 'Integrated stemware racks, mirrored backpanel, and touch-activated brass illumination.',
        materialTag: 'Fluted Glass & Walnut',
        dimensionsRatio: '4:5',
        price: 148000
      },
      {
        id: 'hg-10',
        title: 'Curved Leather Host Armchair',
        category: 'Captain Seating',
        image: '/images/collections/heirloom-gathering-table/heirloom-gathering-table-10.jpg',
        caption: 'Extended armrest profile for head-of-table hosting with high-resilience foam core.',
        materialTag: 'Full-Grain Italian Leather',
        dimensionsRatio: '4:5',
        productId: 'prod-chair-01',
        productSlug: 'verona-dining-chair',
        price: 48000
      },
      {
        id: 'hg-11',
        title: 'Limestone Floor & Wool Dining Rug',
        category: 'Floor Composition',
        image: '/images/collections/heirloom-gathering-table/heirloom-gathering-table-11.jpg',
        caption: 'Flatweave stain-resistant New Zealand wool rug grounding the solid wood dining footprint.',
        materialTag: 'New Zealand Wool',
        dimensionsRatio: '4:5',
        price: 45000
      },
      {
        id: 'hg-12',
        title: 'Sculptural Fruit Bowl in Turned Walnut',
        category: 'Accessories',
        image: '/images/collections/heirloom-gathering-table/heirloom-gathering-table-12.jpg',
        caption: 'Hand-lathe carved solid walnut decorative bowl with visible end grain growth rings.',
        materialTag: 'Turned Walnut Wood',
        dimensionsRatio: '4:5',
        price: 14000
      },
      {
        id: 'hg-13',
        title: 'Evening Candlelit Gathering Atmosphere',
        category: 'Intimate Dining',
        image: '/images/collections/heirloom-gathering-table/heirloom-gathering-table-13.jpg',
        caption: 'Warm ambient glow reflecting off the rich oiled timber surface for private dinners.',
        materialTag: 'Natural Beeswax & Brass',
        dimensionsRatio: '4:5',
        price: 260000
      },
      {
        id: 'hg-14',
        title: 'Dovetail Joint & Butterfly Key Craftsmanship',
        category: 'Joinery Macro',
        image: '/images/collections/heirloom-gathering-table/heirloom-gathering-table-14.jpg',
        caption: 'Brass inlaid butterfly keys reinforcing natural slab splits with structural elegance.',
        materialTag: 'Brass Inlay & Hardwood',
        dimensionsRatio: '4:5',
        productId: 'prod-dining-01',
        productSlug: 'heritage-dining-table',
        price: 280000
      },
      {
        id: 'hg-15',
        title: 'Veloura Complete Heirloom Dining Pavilion',
        category: 'Complete Suite',
        image: '/images/collections/heirloom-gathering-table/heirloom-gathering-table-15.jpg',
        caption: 'The full 10-piece Heirloom Gathering dining room package designed for modern hosting.',
        materialTag: 'Veloura Dining Pavilion',
        dimensionsRatio: '4:5',
        productId: 'prod-dining-01',
        productSlug: 'heritage-dining-table',
        price: 490000
      }
    ]
  },

  // 4. EXECUTIVE RESIDENTIAL FOCUS
  {
    id: 'col-executive-study',
    slug: 'executive-residential-focus',
    title: 'Executive Residential Focus',
    subtitle: 'Concealed power channels and saddle leather task ergonomics for deep work.',
    tagline: 'Concealed power channels, saddle leather task ergonomics & architectural shelving.',
    description: 'Designed for high-output deep work in luxury residential environments. Concealed magnetic power channels, soundproof acoustics, and saddle leather executive seating.',
    heroImage: '/images/collections/executive-residential-focus/executive-residential-focus-01.jpg',
    room: 'office',
    materialTokens: ['Blackened American Walnut', 'Tan Saddle Leather', 'Brushed Champagne Brass', 'Acoustic Wool'],
    piecesCount: 15,
    images: [
      {
        id: 'ef-01',
        title: 'Veloura Executive Study Desk & Library',
        category: 'Study Architecture',
        image: '/images/collections/executive-residential-focus/executive-residential-focus-01.jpg',
        caption: 'Solid walnut executive desk with brushed brass reveals, tan saddle leather chair, and floor-to-ceiling illuminated library.',
        materialTag: 'Solid Walnut & Brass',
        dimensionsRatio: '4:5',
        productId: 'prod-desk-01',
        productSlug: 'oxford-executive-desk',
        price: 220000
      },
      {
        id: 'ef-02',
        title: 'Ergonomic Tan Saddle Leather Executive Swivel Chair',
        category: 'Ergonomic Seating',
        image: '/images/collections/executive-residential-focus/executive-residential-focus-02.jpg',
        caption: 'Synchronized tilt mechanism with top-grain saddle leather and cast aluminum bronze base.',
        materialTag: 'Full Grain Leather & Cast Bronze',
        dimensionsRatio: '4:5',
        productId: 'prod-chair-02',
        productSlug: 'koben-office-chair',
        price: 94000
      },
      {
        id: 'ef-03',
        title: 'Floor-to-Ceiling Built-In Walnut Bookshelves',
        category: 'Library Wall',
        image: '/images/collections/executive-residential-focus/executive-residential-focus-03.jpg',
        caption: 'Warm recessed 2700K LED vertical channels highlighting collectible art monographs.',
        materialTag: 'Architectural Millwork',
        dimensionsRatio: '4:5',
        price: 320000
      },
      {
        id: 'ef-04',
        title: 'Concealed Magnetic Cable Channel & Desk Top',
        category: 'Product Detail',
        image: '/images/collections/executive-residential-focus/executive-residential-focus-04.jpg',
        caption: 'Flush magnetic flip-top lid concealing dual USB-C PD, HDMI, and fast wireless charging pad.',
        materialTag: 'Brushed Brass & Walnut',
        dimensionsRatio: '4:5',
        productId: 'prod-desk-01',
        productSlug: 'oxford-executive-desk',
        price: 220000
      },
      {
        id: 'ef-05',
        title: 'Heavyweight Solid Brass Desk Lamp',
        category: 'Task Lighting',
        image: '/images/collections/executive-residential-focus/executive-residential-focus-05.jpg',
        caption: 'Precision knurled rotary dimmer switch with directional glare-shield hood.',
        materialTag: 'Machined Solid Brass',
        dimensionsRatio: '4:5',
        price: 28000
      },
      {
        id: 'ef-06',
        title: 'Executive Credenza & Secure Document Storage',
        category: 'Case Goods',
        image: '/images/collections/executive-residential-focus/executive-residential-focus-06.jpg',
        caption: 'Biometric fingerprint lock drawer with acoustic felt lining and letter-file suspension.',
        materialTag: 'Blackened Oak & Felt',
        dimensionsRatio: '4:5',
        price: 135000
      },
      {
        id: 'ef-07',
        title: 'Velvet Lounge Corner for Deep Reading',
        category: 'Lounge Seating',
        image: '/images/collections/executive-residential-focus/executive-residential-focus-07.jpg',
        caption: 'Deep seating club chair with matching ottoman positioned in the study corner.',
        materialTag: 'Cotton Velvet & Walnut',
        dimensionsRatio: '4:5',
        price: 82000
      },
      {
        id: 'ef-08',
        title: 'Acoustic Soundproof Slat Wall for Calls',
        category: 'Acoustic Treatment',
        image: '/images/collections/executive-residential-focus/executive-residential-focus-08.jpg',
        caption: 'NRC 0.85 certified sound absorption backing behind vertical micro-slats.',
        materialTag: 'Recycled PET & Oiled Oak',
        dimensionsRatio: '4:5',
        price: 64000
      },
      {
        id: 'ef-09',
        title: 'Vegetable Tanned Leather Desk Blotter Pad',
        category: 'Desk Accessories',
        image: '/images/collections/executive-residential-focus/executive-residential-focus-09.jpg',
        caption: 'Hand-burnished leather mat offering smooth stylus friction and laptop comfort.',
        materialTag: 'Bridle Saddle Leather',
        dimensionsRatio: '4:5',
        price: 16000
      },
      {
        id: 'ef-10',
        title: 'Private Garden Vista from Study Window',
        category: 'Atmosphere',
        image: '/images/collections/executive-residential-focus/executive-residential-focus-10.jpg',
        caption: 'Biophilic natural framing that reduces cognitive fatigue during intense work days.',
        materialTag: 'Architectural Glazing',
        dimensionsRatio: '4:5',
        price: 190000
      },
      {
        id: 'ef-11',
        title: 'Blackened Bronze Floor Uplight',
        category: 'Ambient Lighting',
        image: '/images/collections/executive-residential-focus/executive-residential-focus-11.jpg',
        caption: 'Subtle ceiling bounce light preventing eye strain during late night strategy reviews.',
        materialTag: 'Cast Iron & Bronze',
        dimensionsRatio: '4:5',
        price: 24000
      },
      {
        id: 'ef-12',
        title: 'Minimalist Walnut Waste Basket & Organizer',
        category: 'Accessories',
        image: '/images/collections/executive-residential-focus/executive-residential-focus-12.jpg',
        caption: 'Steam-bent circular solid walnut bin with concealed bag liner retention ring.',
        materialTag: 'Bent Solid Walnut',
        dimensionsRatio: '4:5',
        price: 12000
      },
      {
        id: 'ef-13',
        title: 'Curated Architectural Sculpture Display',
        category: 'Objects of Art',
        image: '/images/collections/executive-residential-focus/executive-residential-focus-13.jpg',
        caption: 'Cast bronze abstract spatial maquette placed on study console shelf.',
        materialTag: 'Lost Wax Cast Bronze',
        dimensionsRatio: '4:5',
        price: 38000
      },
      {
        id: 'ef-14',
        title: 'Executive Meeting Table & Guest Chairs',
        category: 'Secondary Seating',
        image: '/images/collections/executive-residential-focus/executive-residential-focus-14.jpg',
        caption: 'Round walnut consultation table with 2 leather visitor armchairs for in-office advisory.',
        materialTag: 'Solid Walnut & Leather',
        dimensionsRatio: '4:5',
        price: 142000
      },
      {
        id: 'ef-15',
        title: 'Veloura Complete Executive Study Suite',
        category: 'Complete Office',
        image: '/images/collections/executive-residential-focus/executive-residential-focus-15.jpg',
        caption: 'The comprehensive executive workspace proportioned for focus, quiet, and timeless elegance.',
        materialTag: 'Veloura Executive Suite',
        dimensionsRatio: '4:5',
        productId: 'prod-desk-01',
        productSlug: 'oxford-executive-desk',
        price: 460000
      }
    ]
  }
];
