import { ShopRoomPanelData } from '@/types/shopHover';

export const SHOP_ROOM_HOVER_DATA: Record<string, ShopRoomPanelData> = {
  all: {
    id: 'all',
    roomType: 'all',
    label: 'All Living Spaces',
    eyebrow: 'VELOURA CATALOG',
    headline: 'Your Complete Architectural Living Space',
    description: 'Four foundational environments handcrafted with solid American walnut, tactile Belgian bouclé, and ambient brass details.',
    primaryCtaText: 'Explore Complete Catalog →',
    items: [
      {
        id: 'item-all-living',
        name: 'Living Room Sanctuary',
        subtitle: 'Modular sectionals, occasional chairs & coffee tables',
        iconName: 'sofa',
        count: 8,
        badge: 'Flagship',
        categoryFilter: 'all',
        href: '/rooms/living-room'
      },
      {
        id: 'item-all-bedroom',
        name: 'Bedroom Sanctuary',
        subtitle: 'Platform beds, floating nightstands & shoe suites',
        iconName: 'bed',
        count: 7,
        badge: 'Restorative',
        categoryFilter: 'all',
        href: '/rooms/bedroom'
      },
      {
        id: 'item-all-dining',
        name: 'Dining & Gathering',
        subtitle: '8-seater walnut tables, dining chairs & pendants',
        iconName: 'table',
        count: 6,
        badge: 'Heirloom',
        categoryFilter: 'all',
        href: '/rooms/dining'
      },
      {
        id: 'item-all-office',
        name: 'Home Office & Study',
        subtitle: 'Executive desks, ergonomic leather & bookcases',
        iconName: 'desk',
        count: 6,
        badge: 'Executive',
        categoryFilter: 'all',
        href: '/rooms/office'
      },
      {
        id: 'item-all-materials',
        name: 'Material & Craftsmanship Lab',
        subtitle: 'Oiled American walnut, bouclé & Italian travertine',
        iconName: 'layers',
        badge: 'Heritage',
        materialFilter: 'Solid Walnut'
      }
    ],
    featuredHero: {
      title: 'Warm Minimalist Living',
      subtitle: 'Tactile Bouclé & Oiled American Walnut',
      tag: 'Curated Lookbook',
      image: '/images/rooms/veloura_ultra_luxury_living_hero.jpg',
      href: '/collections/warm-minimalist-living'
    }
  },

  'living-room': {
    id: 'living-room',
    roomType: 'living-room',
    label: 'Living Room',
    eyebrow: 'LIVING ROOM SANCTUARY',
    headline: 'Spaces Made for Connection & Form',
    description: 'Low-slung monolithic profiles, tactile Italian bouclé, and deep walnut joinery designed for unhurried comfort.',
    primaryCtaText: 'Explore Living Room →',
    roomSlug: 'living-room',
    items: [
      {
        id: 'item-lr-sectional',
        name: 'Modular Sectional Sofas',
        subtitle: 'Serpentine cloud-soft feather-blend seating',
        iconName: 'sofa',
        categoryFilter: 'Seating',
        furnitureType: 'Sectional Sofa',
        count: 3,
        badge: 'Signature'
      },
      {
        id: 'item-lr-lounge',
        name: 'Solis Bouclé Occasional Chairs',
        subtitle: 'Textured bouclé with carved travertine plinth',
        iconName: 'armchair',
        categoryFilter: 'Seating',
        furnitureType: 'Lounge Chair',
        count: 2
      },
      {
        id: 'item-lr-coffee',
        name: 'Kyoto Hand-Carved Walnut Tables',
        subtitle: 'Sculptural organic coffee & side tables',
        iconName: 'table',
        categoryFilter: 'Tables',
        furnitureType: 'Coffee Table',
        count: 2,
        badge: 'Bestseller'
      },
      {
        id: 'item-lr-credenza',
        name: 'Atelier Fluted Media Credenzas',
        subtitle: 'Solid walnut tambour doors & wire conduits',
        iconName: 'storage',
        categoryFilter: 'Storage',
        furnitureType: 'Media Console',
        count: 2
      },
      {
        id: 'item-lr-lighting',
        name: 'Arcos Brass Lamps & Wool Rugs',
        subtitle: 'Spun brass arch illumination & tufted New Zealand wool',
        iconName: 'lighting',
        categoryFilter: 'Lighting',
        count: 2
      }
    ],
    featuredHero: {
      title: 'Serpentine Modular Suite',
      subtitle: 'Feather-Wrapped Bouclé & Solid European Pine',
      tag: 'Veloura Signature',
      image: '/images/products/veloura_serpentine_modular_sofa.jpg',
      targetRoom: 'living-room',
      targetCategory: 'Seating'
    }
  },

  bedroom: {
    id: 'bedroom',
    roomType: 'bedroom',
    label: 'Bedroom Sanctuary',
    eyebrow: 'BEDROOM SANCTUARY',
    headline: 'Grounded Silence & Tactile Warmth',
    description: 'Low-profile platform beds, bespoke shoe cabinets, fluted wardrobes, and oat-milk linens for deep repose.',
    primaryCtaText: 'Explore Bedroom →',
    roomSlug: 'bedroom',
    items: [
      {
        id: 'item-br-bed',
        name: 'Solitude Upholstered Platform Beds',
        subtitle: 'Recessed floating solid ash plinth & linen headboard',
        iconName: 'bed',
        categoryFilter: 'Beds',
        furnitureType: 'Platform Bed',
        count: 2,
        badge: 'Signature'
      },
      {
        id: 'item-br-shoeracks',
        name: 'Solid Wood Shoe Storage Suites',
        subtitle: 'Bennis, Webster & Alex louvred cabinets',
        iconName: 'storage',
        categoryFilter: 'Storage',
        count: 5,
        badge: '5 Designs'
      },
      {
        id: 'item-br-nightstand',
        name: 'Kanso Minimalist Floating Nightstands',
        subtitle: 'Soft-close bevelled American walnut joinery',
        iconName: 'table',
        categoryFilter: 'Tables',
        furnitureType: 'Nightstand',
        count: 2
      },
      {
        id: 'item-br-wardrobe',
        name: 'Pillar Fluted Wardrobe Suites',
        subtitle: 'Floor-to-ceiling fluted white oak doors with LEDs',
        iconName: 'wardrobe',
        categoryFilter: 'Storage',
        furnitureType: 'Wardrobe',
        count: 2
      },
      {
        id: 'item-br-mirror',
        name: 'Aura Arch Brass Full-Length Mirrors',
        subtitle: 'Hand-welded brushed brass with silvered glass',
        iconName: 'mirror',
        categoryFilter: 'Decor',
        furnitureType: 'Mirror',
        count: 1
      }
    ],
    featuredHero: {
      title: 'Solitude Rest Sanctuary',
      subtitle: 'Low-Profile Platform & Floating Ash Plinth',
      tag: 'Restorative Suite',
      image: '/images/rooms/veloura_luxury_bedroom_hero.jpg',
      targetRoom: 'bedroom',
      targetCategory: 'Beds'
    }
  },

  dining: {
    id: 'dining',
    roomType: 'dining',
    label: 'Dining & Gathering',
    eyebrow: 'DINING & GATHERING',
    headline: 'Heirloom Hardwoods for Unhurried Meals',
    description: 'Generational solid walnut dining tables, steam-bent dining chairs, and mouth-blown smoked glass pendants.',
    primaryCtaText: 'Explore Dining →',
    roomSlug: 'dining',
    items: [
      {
        id: 'item-dn-table',
        name: 'Heritage 8-Seater Solid Walnut Tables',
        subtitle: '2.5-inch continuous grain top on pedestal base',
        iconName: 'table',
        categoryFilter: 'Tables',
        furnitureType: 'Dining Table',
        count: 2,
        badge: 'Heirloom'
      },
      {
        id: 'item-dn-chair',
        name: 'Astrid Sculptural Dining Chairs',
        subtitle: 'Steam-bent solid ash frame with padded seat',
        iconName: 'chair',
        categoryFilter: 'Seating',
        furnitureType: 'Dining Chair',
        count: 2,
        badge: 'Set of 2'
      },
      {
        id: 'item-dn-sideboard',
        name: 'Oslo Fluted Oak Buffet Sideboards',
        subtitle: 'Italian travertine top over fluted natural white oak',
        iconName: 'storage',
        categoryFilter: 'Storage',
        furnitureType: 'Sideboard',
        count: 2
      },
      {
        id: 'item-dn-pendant',
        name: 'Eclipse Smoked Glass Chandeliers',
        subtitle: 'Mouth-blown gradient glass with satin bronze fittings',
        iconName: 'pendant',
        categoryFilter: 'Lighting',
        furnitureType: 'Chandelier',
        count: 1
      },
      {
        id: 'item-dn-bench',
        name: 'Solid Oak Gathering Benches',
        subtitle: 'Bevelled edge timber seating for shared meals',
        iconName: 'layers',
        categoryFilter: 'Seating',
        count: 1
      }
    ],
    featuredHero: {
      title: 'Heritage Gathering Table',
      subtitle: '2.5-Inch Continuous Walnut Grain Top',
      tag: 'Heirloom Craft',
      image: '/images/rooms/veloura_luxury_dining_hero.jpg',
      targetRoom: 'dining',
      targetCategory: 'Tables'
    }
  },

  office: {
    id: 'office',
    roomType: 'office',
    label: 'Home Office & Study',
    eyebrow: 'HOME OFFICE & STUDY',
    headline: 'Executive Precision & Calm Focus',
    description: 'Full-grain Italian saddle leather ergonomics, solid walnut executive desks, and architectural bookcase suites.',
    primaryCtaText: 'Explore Office →',
    roomSlug: 'office',
    items: [
      {
        id: 'item-of-desk',
        name: 'Meridian Executive Solid Desks',
        subtitle: 'Integrated hidden power conduits & leather linings',
        iconName: 'desk',
        categoryFilter: 'Tables',
        furnitureType: 'Executive Desk',
        count: 2,
        badge: 'Executive'
      },
      {
        id: 'item-of-chair',
        name: 'Aeron Pro Leather Task Chairs',
        subtitle: 'Synchronized lumbar tilt support in Italian saddle leather',
        iconName: 'chair',
        categoryFilter: 'Seating',
        furnitureType: 'Ergonomic Chair',
        count: 2,
        badge: 'Italian Leather'
      },
      {
        id: 'item-of-bookcase',
        name: 'Bauhaus Architectural Bookcases',
        subtitle: 'Modular open-shelf in solid walnut & blackened bronze',
        iconName: 'book',
        categoryFilter: 'Storage',
        furnitureType: 'Bookshelf',
        count: 2
      },
      {
        id: 'item-of-lamp',
        name: 'Linear Brass Precision Task Lamps',
        subtitle: 'High CRI 95+ flicker-free warm LED bar with touch dimmer',
        iconName: 'lighting',
        categoryFilter: 'Lighting',
        furnitureType: 'Desk Lamp',
        count: 1
      },
      {
        id: 'item-of-blotter',
        name: 'Full-Grain Leather Desktop Blotters',
        subtitle: 'Water-resistant saddle leather desktop protection',
        iconName: 'briefcase',
        categoryFilter: 'Decor',
        count: 1
      }
    ],
    featuredHero: {
      title: 'Meridian Executive Suite',
      subtitle: 'Solid Walnut & Italian Saddle Leather',
      tag: 'Architectural Focus',
      image: '/images/rooms/veloura_luxury_office_hero.jpg',
      targetRoom: 'office',
      targetCategory: 'Tables'
    }
  }
};
