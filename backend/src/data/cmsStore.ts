/**
 * 🏛️ Veloura Living — CMS Content, Banners & Editorial Store
 * Reference: docs/Veloura_Living_SRS.md (Section 25, Phase 8)
 */

import { DbCmsBanner } from '@/types';

const bannersStore: Map<string, DbCmsBanner> = new Map();
let isCmsInitialized = false;

export function initCmsStore() {
  if (isCmsInitialized) return;
  isCmsInitialized = true;

  const initialBanners: DbCmsBanner[] = [
    {
      id: 'ban-001',
      section_name: 'HERO_SLIDER',
      title: 'Solstice Architecture 2026',
      subtitle: 'Where organic warmth meets architectural restraint. Curated bespoke furnishings.',
      image_url: '/video/day_night_frame_0001.jpg',
      cta_label: 'Explore Living Collection',
      cta_link: '/shop?category=living',
      display_order: 1,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'ban-002',
      section_name: 'EDITORIAL_SPOTLIGHT',
      title: 'The Kyoto Salon Collection',
      subtitle: 'Sculpted from sustainably sourced Japanese Walnut with hand-rubbed oil finishes.',
      image_url: '/images/products/veloura_kyoto_coffee_table.jpg',
      cta_label: 'View Spatial Story',
      cta_link: '/collections',
      display_order: 2,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'ban-003',
      section_name: 'PROMO_BANNER',
      title: 'Complimentary White-Glove Installation',
      subtitle: 'On all orders above ₹1,00,000 across Mumbai, Delhi NCR, Bangalore & Hyderabad.',
      image_url: '/images/products/veloura_solis_boucle_chair.jpg',
      cta_label: 'Learn More',
      cta_link: '/journal',
      display_order: 3,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ];

  for (const b of initialBanners) {
    bannersStore.set(b.id, b);
  }
}

export function getCmsBanners(sectionName?: string): DbCmsBanner[] {
  initCmsStore();
  let list = Array.from(bannersStore.values());
  if (sectionName) {
    list = list.filter((b) => b.section_name.toLowerCase() === sectionName.toLowerCase());
  }
  return list.sort((a, b) => a.display_order - b.display_order);
}

export function createCmsBanner(data: Omit<DbCmsBanner, 'id' | 'created_at'>): DbCmsBanner {
  initCmsStore();
  const id = `ban-${crypto.randomUUID().slice(0, 8)}`;
  const banner: DbCmsBanner = {
    ...data,
    id,
    created_at: new Date().toISOString(),
  };
  bannersStore.set(id, banner);
  return banner;
}

export function updateCmsBanner(id: string, data: Partial<DbCmsBanner>): DbCmsBanner | undefined {
  initCmsStore();
  const banner = bannersStore.get(id);
  if (!banner) return undefined;
  Object.assign(banner, data);
  return banner;
}

export function deleteCmsBanner(id: string): boolean {
  initCmsStore();
  return bannersStore.delete(id);
}
