import { RoomType } from './room';

export interface ProductVariant {
  id: string;
  name: string;
  colorName: string;
  colorHex: string;
  material: string;
  price: number;
  salePrice?: number;
  stock: number;
  image: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: string;
  room: RoomType;
  furnitureType: string;
  price: number;
  salePrice?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  availability: 'in_stock' | 'low_stock' | 'made_to_order' | 'out_of_stock';
  dimensions: {
    width: string;
    depth: string;
    height: string;
    seatHeight?: string;
    weight?: string;
  };
  materials: string[];
  colors: string[];
  tags: string[];
  images: string[];
  description: string;
  story: string;
  craftsmanship: string;
  care: string;
  shippingEstimate: string;
  warranty: string;
  variants: ProductVariant[];
  complementaryProductIds: string[];
  roomFitScore?: number;
  bestseller?: boolean;
  featured?: boolean;
  isNew?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  city: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  roomType?: string;
}
