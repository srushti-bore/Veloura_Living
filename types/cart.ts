import { Product } from './product';

export interface CartItem {
  id: string; // unique item id in cart (productId + variantId)
  productId: string;
  variantId?: string;
  quantity: number;
  selectedColor: string;
  selectedMaterial: string;
  price: number;
  product: Product;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minSpend: number;
  description: string;
}
