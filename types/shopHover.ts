import { RoomType } from './room';

export interface ShopRoomSubcategory {
  id: string;
  name: string;
  subtitle?: string;
  iconName?: string;
  count?: number;
  badge?: string;
  categoryFilter?: string;
  materialFilter?: string;
  furnitureType?: string;
  href?: string;
}

export interface ShopRoomFeaturedHero {
  title: string;
  subtitle?: string;
  tag?: string;
  image: string;
  href?: string;
  targetRoom?: RoomType | 'all';
  targetCategory?: string;
}

export interface ShopRoomPanelData {
  id: string; // 'all' | 'living-room' | 'bedroom' | 'dining' | 'office'
  roomType: RoomType | 'all';
  label: string;
  eyebrow: string;
  headline: string;
  description: string;
  primaryCtaText: string;
  roomSlug?: string;
  items: ShopRoomSubcategory[];
  featuredHero: ShopRoomFeaturedHero;
}
