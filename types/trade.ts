/**
 * 🏛️ Veloura Living — Phase 14 Trade B2B & VIP Concierge Types
 * Reference: Phase 14 Master Roadmap & B2B Commercial Specification
 */

export type TradeRole = 'INTERIOR_DESIGNER' | 'ARCHITECT' | 'HOSPITALITY_DEVELOPER' | 'LUXURY_BUILDER';

export type TradeTier = 'BRONZE_15' | 'SILVER_20' | 'GOLD_25';

export interface TradePartner {
  id: string;
  userId?: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  tradeRole: TradeRole;
  gstin: string;
  websiteOrPortfolio?: string;
  tier: TradeTier;
  discountRate: number; // 0.15, 0.20, 0.25
  verified: boolean;
  dedicatedManagerName?: string;
  dedicatedManagerEmail?: string;
  createdAt: string;
}

export interface RFQLineItem {
  productId: string;
  productName: string;
  sku: string;
  customFinish?: string;
  unitBasePriceINR: number;
  quantity: number;
  totalPriceINR: number;
}

export type RFQStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'ESTIMATED' | 'APPROVED' | 'CONVERTED_TO_ORDER';

export interface ProjectRFQ {
  id: string;
  tradePartnerId: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  projectTitle: string;
  projectLocation: string;
  targetInstallationDate: string;
  lineItems: RFQLineItem[];
  subtotalINR: number;
  tierDiscountRate: number;
  tierDiscountINR: number;
  taxableINR: number;
  gstINR: number; // 18% GST
  shippingINR: number; // White-glove commercial installation
  grandTotalINR: number;
  notes?: string;
  status: RFQStatus;
  quotationNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface SwatchSampleBoxOrder {
  id: string;
  tradePartnerId: string;
  businessName: string;
  recipientName: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  selectedSwatchIds: string[]; // 5 material IDs
  status: 'PROCESSING' | 'DISPATCHED' | 'DELIVERED';
  trackingNumber: string;
  courierPartner: string;
  createdAt: string;
}

export type ConciergeServiceType =
  | 'IN_HOME_SPATIAL'
  | 'VIRTUAL_ATELIER_TOUR'
  | 'MATERIALS_CONSULTATION'
  | 'TRADE_PROJECT_KICKOFF';

export interface VIPConciergeBooking {
  id: string;
  clientName: string;
  email: string;
  phone: string;
  serviceType: ConciergeServiceType;
  scheduledDate: string;
  timeSlot: string;
  locationOrVirtual: string;
  roomDetails?: string;
  status: 'CONFIRMED' | 'COMPLETED' | 'RESCHEDULED' | 'CANCELLED';
  conciergeSpecialist: string;
  meetingLinkOrAddress: string;
  createdAt: string;
}
