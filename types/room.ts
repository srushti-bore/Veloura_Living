export type RoomType = 'living-room' | 'bedroom' | 'dining' | 'office';

export interface RoomFurnitureHotspot {
  id: string;
  type: string;
  name: string;
  xPercent: number; // 0 to 100 for responsive placement on room scene
  yPercent: number; // 0 to 100
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
