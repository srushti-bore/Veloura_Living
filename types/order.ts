export interface OrderItem {
  productId: string;
  variantId?: string;
  name: string;
  image: string;
  selectedColor: string;
  selectedMaterial: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: 'Processing' | 'In Crafting' | 'Quality Check' | 'Shipped' | 'Out for Delivery' | 'Delivered';
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    apartment?: string;
    city: string;
    state: string;
    pincode: string;
  };
  trackingNumber: string;
  estimatedDeliveryDate: string;
  paymentMethod: 'credit_card' | 'upi_razorpay' | 'netbanking' | 'emi' | 'cod' | 'international_card';
  paymentStatus: 'Paid' | 'Pending';
  currency?: string;
  exchangeRate?: number;
  codHandlingFee?: number;
  codVerified?: boolean;
  timeline: {
    status: string;
    date: string;
    description: string;
    completed: boolean;
  }[];
}
