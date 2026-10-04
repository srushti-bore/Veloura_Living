export type RoomType = 'living-room' | 'bedroom' | 'dining' | 'office';

export interface RoomFurnitureHotspot {
  id: string;
  type: string;
  name: string;
  xPercent: number;
  yPercent: number;
  productId: string;
  highlightDescription: string;
}

export interface Room {
  id: string;
  type: RoomType;
  name: string;
  slug: string;
  headline: string;
  subheadline: string;
  description: string;
  editorialQuote: string;
  heroImage: string;
  categoryImage: string;
  secondaryImage?: string;
  hotspots: RoomFurnitureHotspot[];
  recommendedPalette: { name: string; hex: string }[];
  styleTags: string[];
  productCount: number;
}
