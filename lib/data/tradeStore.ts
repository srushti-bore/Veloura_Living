import {
  TradePartner,
  ProjectRFQ,
  RFQLineItem,
  SwatchSampleBoxOrder,
  VIPConciergeBooking,
  TradeTier,
  TradeRole,
  ConciergeServiceType,
} from '@/types/trade';

/**
 * 🏛️ Seeded Trade Partners Registry
 */
let TRADE_PARTNERS: TradePartner[] = [
  {
    id: 'trade_partner_001',
    userId: 'user_trade_01',
    businessName: 'Studio Milan Architectural Interiors',
    contactPerson: 'Ar. Matteo Rossi',
    email: 'matteo@studiomilan.it',
    phone: '+91 98200 88776',
    tradeRole: 'ARCHITECT',
    gstin: '27AAACS1234F1Z9',
    websiteOrPortfolio: 'https://studiomilan.design',
    tier: 'SILVER_20',
    discountRate: 0.2,
    verified: true,
    dedicatedManagerName: 'Elena Bianchi (Senior Trade Concierge)',
    dedicatedManagerEmail: 'elena.concierge@velouraliving.com',
    createdAt: '2026-09-15T10:00:00.000Z',
  },
];

/**
 * 🏛️ Seeded Project RFQ Registry
 */
let PROJECT_RFQS: ProjectRFQ[] = [
  {
    id: 'rfq_vl_2026_901',
    tradePartnerId: 'trade_partner_001',
    businessName: 'Studio Milan Architectural Interiors',
    contactPerson: 'Ar. Matteo Rossi',
    email: 'matteo@studiomilan.it',
    phone: '+91 98200 88776',
    projectTitle: 'Villa Bellissima Penthouse Suite',
    projectLocation: 'Worli Sea Face, Mumbai',
    targetInstallationDate: '2026-11-20',
    lineItems: [
      {
        productId: 'prod-lr-01',
        productName: 'Serpentine Modular Sectional Sofa',
        sku: 'VL-LR-SF-001-OAT',
        customFinish: 'Belgian Wool Bouclé & Appalachian Walnut Plinth',
        unitBasePriceINR: 185000,
        quantity: 2,
        totalPriceINR: 370000,
      },
      {
        productId: 'prod-din-01',
        productName: 'Aurelia Sculptural Dining Table',
        sku: 'VL-DN-TBL-001-TRA',
        customFinish: 'Honed Roman Travertine & Solid Walnut',
        unitBasePriceINR: 145000,
        quantity: 1,
        totalPriceINR: 145000,
      },
      {
        productId: 'prod-off-01',
        productName: 'Zenith Swivel Atelier Lounge Chair',
        sku: 'VL-OF-CHR-001-SAD',
        customFinish: 'Tuscan Saddle Leather & Dark Gunmetal Bronze',
        unitBasePriceINR: 94000,
        quantity: 4,
        totalPriceINR: 376000,
      },
    ],
    subtotalINR: 891000,
    tierDiscountRate: 0.2,
    tierDiscountINR: 178200,
    taxableINR: 712800,
    gstINR: 128304, // 18% GST
    shippingINR: 0, // Complimentary White-Glove Commercial Logistics
    grandTotalINR: 841104,
    notes: 'Requires freight elevator coordination and pre-installed floor floorpads.',
    status: 'ESTIMATED',
    quotationNumber: 'VL/TRADE/2026-27/0412',
    createdAt: '2026-10-01T14:30:00.000Z',
    updatedAt: '2026-10-02T09:15:00.000Z',
  },
];

/**
 * 🏛️ Seeded Swatch Box Registry
 */
let SWATCH_BOX_ORDERS: SwatchSampleBoxOrder[] = [
  {
    id: 'swatch_box_001',
    tradePartnerId: 'trade_partner_001',
    businessName: 'Studio Milan Architectural Interiors',
    recipientName: 'Ar. Matteo Rossi',
    shippingAddress: 'Level 14, One World Center, Lower Parel',
    city: 'Mumbai',
    postalCode: '400013',
    selectedSwatchIds: [
      'mat-walnut',
      'mat-boucle',
      'mat-saddle-leather',
      'mat-travertine',
      'mat-spun-brass',
    ],
    status: 'DELIVERED',
    trackingNumber: 'VL-SWATCH-BLR-9042',
    courierPartner: 'BlueDart White-Glove Express',
    createdAt: '2026-09-18T11:00:00.000Z',
  },
];

/**
 * 🏛️ Seeded VIP Concierge Bookings
 */
let VIP_BOOKINGS: VIPConciergeBooking[] = [
  {
    id: 'concierge_bk_001',
    clientName: 'Ar. Matteo Rossi',
    email: 'matteo@studiomilan.it',
    phone: '+91 98200 88776',
    serviceType: 'TRADE_PROJECT_KICKOFF',
    scheduledDate: '2026-10-12',
    timeSlot: '11:00 AM - 12:30 PM IST',
    locationOrVirtual: 'Atelier Milan Virtual Spatial Tour (Google Meet)',
    roomDetails: 'Villa Bellissima Penthouse — 4,500 sq ft Master Living & Dining',
    status: 'CONFIRMED',
    conciergeSpecialist: 'Elena Bianchi (Senior Trade Architect)',
    meetingLinkOrAddress: 'https://meet.google.com/vel-trade-901',
    createdAt: '2026-10-03T16:00:00.000Z',
  },
];

export class TradeStore {
  /**
   * Determine trade tier & discount rate based on estimated annual or project volume
   */
  static determineTier(projectSubtotalINR: number): { tier: TradeTier; discountRate: number } {
    if (projectSubtotalINR > 2500000) {
      return { tier: 'GOLD_25', discountRate: 0.25 };
    }
    if (projectSubtotalINR > 1000000) {
      return { tier: 'SILVER_20', discountRate: 0.2 };
    }
    return { tier: 'BRONZE_15', discountRate: 0.15 };
  }

  /**
   * Register a new trade partner application
   */
  static registerTradePartner(params: {
    businessName: string;
    contactPerson: string;
    email: string;
    phone: string;
    tradeRole: TradeRole;
    gstin: string;
    websiteOrPortfolio?: string;
  }): TradePartner {
    const existing = TRADE_PARTNERS.find((p) => p.email.toLowerCase() === params.email.toLowerCase());
    if (existing) {
      return existing;
    }

    const newPartner: TradePartner = {
      id: `trade_partner_${Date.now().toString().slice(-6)}`,
      businessName: params.businessName,
      contactPerson: params.contactPerson,
      email: params.email,
      phone: params.phone,
      tradeRole: params.tradeRole,
      gstin: params.gstin.toUpperCase(),
      websiteOrPortfolio: params.websiteOrPortfolio || '',
      tier: 'BRONZE_15',
      discountRate: 0.15,
      verified: true, // Auto-verified for seamless prototyping & live testing
      dedicatedManagerName: 'Marco Valenti (Trade Concierge Lead)',
      dedicatedManagerEmail: 'trade.concierge@velouraliving.com',
      createdAt: new Date().toISOString(),
    };

    TRADE_PARTNERS.push(newPartner);
    return newPartner;
  }

  /**
   * Get Trade Partner by Email or ID
   */
  static getTradePartner(identifier: string): TradePartner | undefined {
    return TRADE_PARTNERS.find(
      (p) => p.id === identifier || p.email.toLowerCase() === identifier.toLowerCase()
    );
  }

  /**
   * Submit and calculate a new Project RFQ
   */
  static createProjectRFQ(params: {
    tradePartnerId?: string;
    businessName: string;
    contactPerson: string;
    email: string;
    phone: string;
    projectTitle: string;
    projectLocation: string;
    targetInstallationDate: string;
    lineItems: {
      productId: string;
      productName: string;
      sku: string;
      customFinish?: string;
      unitBasePriceINR: number;
      quantity: number;
    }[];
    notes?: string;
  }): ProjectRFQ {
    // 1. Calculate line totals
    const processedLines: RFQLineItem[] = params.lineItems.map((item) => ({
      ...item,
      totalPriceINR: item.unitBasePriceINR * item.quantity,
    }));

    const subtotalINR = processedLines.reduce((acc, curr) => acc + curr.totalPriceINR, 0);

    // 2. Determine applicable trade tier discount
    const partner = params.tradePartnerId ? this.getTradePartner(params.tradePartnerId) : undefined;
    const tierCalc = this.determineTier(subtotalINR);
    const discountRate = partner ? Math.max(partner.discountRate, tierCalc.discountRate) : tierCalc.discountRate;

    const tierDiscountINR = Math.round(subtotalINR * discountRate);
    const taxableINR = Math.max(0, subtotalINR - tierDiscountINR);
    const gstINR = Math.round(taxableINR * 0.18); // 18% GST statutory
    const shippingINR = taxableINR >= 500000 ? 0 : 7500; // Free white-glove above 5L
    const grandTotalINR = taxableINR + gstINR + shippingINR;

    const quotationNumber = `VL/TRADE/2026-27/${(PROJECT_RFQS.length + 413).toString().padStart(4, '0')}`;

    const newRFQ: ProjectRFQ = {
      id: `rfq_vl_${Date.now()}`,
      tradePartnerId: params.tradePartnerId || 'guest_trade_partner',
      businessName: params.businessName,
      contactPerson: params.contactPerson,
      email: params.email,
      phone: params.phone,
      projectTitle: params.projectTitle,
      projectLocation: params.projectLocation,
      targetInstallationDate: params.targetInstallationDate,
      lineItems: processedLines,
      subtotalINR,
      tierDiscountRate: discountRate,
      tierDiscountINR,
      taxableINR,
      gstINR,
      shippingINR,
      grandTotalINR,
      notes: params.notes,
      status: 'SUBMITTED',
      quotationNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    PROJECT_RFQS.unshift(newRFQ);
    return newRFQ;
  }

  /**
   * Get all RFQs or filter by trade partner
   */
  static getRFQs(partnerId?: string): ProjectRFQ[] {
    if (partnerId) {
      return PROJECT_RFQS.filter((r) => r.tradePartnerId === partnerId);
    }
    return PROJECT_RFQS;
  }

  /**
   * Get single RFQ by ID or Quotation Number
   */
  static getRFQById(idOrQuotation: string): ProjectRFQ | undefined {
    return PROJECT_RFQS.find((r) => r.id === idOrQuotation || r.quotationNumber === idOrQuotation);
  }

  /**
   * Order a 5-material physical sample box
   */
  static orderSwatchSampleBox(params: {
    tradePartnerId?: string;
    businessName: string;
    recipientName: string;
    shippingAddress: string;
    city: string;
    postalCode: string;
    selectedSwatchIds: string[];
  }): SwatchSampleBoxOrder {
    const newBox: SwatchSampleBoxOrder = {
      id: `swatch_box_${Date.now().toString().slice(-6)}`,
      tradePartnerId: params.tradePartnerId || 'guest_trade_partner',
      businessName: params.businessName,
      recipientName: params.recipientName,
      shippingAddress: params.shippingAddress,
      city: params.city,
      postalCode: params.postalCode,
      selectedSwatchIds: params.selectedSwatchIds.slice(0, 5),
      status: 'PROCESSING',
      trackingNumber: `VL-SWATCH-${Math.floor(1000 + Math.random() * 9000)}`,
      courierPartner: 'BlueDart White-Glove Express',
      createdAt: new Date().toISOString(),
    };

    SWATCH_BOX_ORDERS.unshift(newBox);
    return newBox;
  }

  /**
   * Get Swatch Box Orders
   */
  static getSwatchBoxOrders(partnerId?: string): SwatchSampleBoxOrder[] {
    if (partnerId) {
      return SWATCH_BOX_ORDERS.filter((b) => b.tradePartnerId === partnerId);
    }
    return SWATCH_BOX_ORDERS;
  }

  /**
   * Book a VIP Consultation appointment
   */
  static bookVIPConcierge(params: {
    clientName: string;
    email: string;
    phone: string;
    serviceType: ConciergeServiceType;
    scheduledDate: string;
    timeSlot: string;
    locationOrVirtual: string;
    roomDetails?: string;
  }): VIPConciergeBooking {
    const newBooking: VIPConciergeBooking = {
      id: `concierge_bk_${Date.now().toString().slice(-6)}`,
      clientName: params.clientName,
      email: params.email,
      phone: params.phone,
      serviceType: params.serviceType,
      scheduledDate: params.scheduledDate,
      timeSlot: params.timeSlot,
      locationOrVirtual: params.locationOrVirtual,
      roomDetails: params.roomDetails,
      status: 'CONFIRMED',
      conciergeSpecialist: 'Elena Bianchi (Senior Trade Architect)',
      meetingLinkOrAddress: params.locationOrVirtual.includes('Virtual')
        ? `https://meet.google.com/vel-vip-${Math.floor(100 + Math.random() * 900)}`
        : params.locationOrVirtual,
      createdAt: new Date().toISOString(),
    };

    VIP_BOOKINGS.unshift(newBooking);
    return newBooking;
  }

  /**
   * Get VIP Concierge Bookings
   */
  static getVIPBookings(email?: string): VIPConciergeBooking[] {
    if (email) {
      return VIP_BOOKINGS.filter((b) => b.email.toLowerCase() === email.toLowerCase());
    }
    return VIP_BOOKINGS;
  }

  /**
   * Generate Formal Trade Quotation HTML Document
   */
  static generateQuotationHTML(rfq: ProjectRFQ): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Trade Quotation ${rfq.quotationNumber} — Veloura Living Atelier</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #FAF7F2; color: #1C1815; margin: 0; padding: 40px; }
    .container { max-width: 800px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E6DEC8; border-radius: 12px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #8B5A2B; padding-bottom: 20px; margin-bottom: 30px; }
    .brand { font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #4A2C1A; text-transform: uppercase; }
    .tagline { font-size: 11px; color: #8B5A2B; letter-spacing: 1px; text-transform: uppercase; }
    .badge { display: inline-block; background: #8B5A2B; color: #FFF; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #8B5A2B; font-weight: bold; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #4A2C1A; color: #FAF7F2; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; padding: 10px; text-align: left; }
    td { padding: 12px 10px; border-bottom: 1px solid #EFEAE1; font-size: 13px; }
    .totals { width: 320px; margin-left: auto; margin-bottom: 30px; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
    .total-row.grand { font-size: 16px; font-weight: bold; border-top: 2px solid #8B5A2B; border-bottom: 2px solid #8B5A2B; padding: 10px 0; color: #4A2C1A; }
    .footer { border-top: 1px solid #EFEAE1; padding-top: 20px; font-size: 11px; color: #766E65; text-align: center; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div class="brand">Veloura Living</div>
        <div class="tagline">Trade & Commercial Architectural Atelier</div>
      </div>
      <div style="text-align: right;">
        <span class="badge">${rfq.status}</span>
        <div style="font-size: 13px; font-weight: bold; margin-top: 6px;">${rfq.quotationNumber}</div>
        <div style="font-size: 11px; color: #666;">Date: ${new Date(rfq.createdAt).toLocaleDateString('en-IN')}</div>
      </div>
    </div>

    <div class="details-grid">
      <div>
        <div class="section-title">Trade Partner & Client</div>
        <div style="font-weight: bold; font-size: 14px;">${rfq.businessName}</div>
        <div style="color: #444; font-size: 13px;">Attn: ${rfq.contactPerson}</div>
        <div style="color: #666; font-size: 12px;">${rfq.email} | ${rfq.phone}</div>
      </div>
      <div>
        <div class="section-title">Project Specification</div>
        <div style="font-weight: bold; font-size: 14px;">${rfq.projectTitle}</div>
        <div style="color: #444; font-size: 13px;">Location: ${rfq.projectLocation}</div>
        <div style="color: #666; font-size: 12px;">Target Install: ${rfq.targetInstallationDate}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item & Custom Finish</th>
          <th>SKU</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit (₹)</th>
          <th style="text-align: right;">Total (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${rfq.lineItems
          .map(
            (item) => `
          <tr>
            <td>
              <strong>${item.productName}</strong>
              ${item.customFinish ? `<div style="font-size: 11px; color: #765236;">Finish: ${item.customFinish}</div>` : ''}
            </td>
            <td style="font-family: monospace; font-size: 11px;">${item.sku}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">₹${item.unitBasePriceINR.toLocaleString('en-IN')}</td>
            <td style="text-align: right;">₹${item.totalPriceINR.toLocaleString('en-IN')}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="total-row">
        <span>Catalog Subtotal:</span>
        <span>₹${rfq.subtotalINR.toLocaleString('en-IN')}</span>
      </div>
      <div class="total-row" style="color: #8B5A2B;">
        <span>Trade Privilege (${Math.round(rfq.tierDiscountRate * 100)}% Off):</span>
        <span>-₹${rfq.tierDiscountINR.toLocaleString('en-IN')}</span>
      </div>
      <div class="total-row">
        <span>Taxable Value:</span>
        <span>₹${rfq.taxableINR.toLocaleString('en-IN')}</span>
      </div>
      <div class="total-row">
        <span>Statutory GST (18%):</span>
        <span>₹${rfq.gstINR.toLocaleString('en-IN')}</span>
      </div>
      <div class="total-row">
        <span>White-Glove Installation:</span>
        <span>${rfq.shippingINR === 0 ? 'Complimentary (₹0)' : `₹${rfq.shippingINR.toLocaleString('en-IN')}`}</span>
      </div>
      <div class="total-row grand">
        <span>Grand Total Payable:</span>
        <span>₹${rfq.grandTotalINR.toLocaleString('en-IN')}</span>
      </div>
    </div>

    <div class="footer">
      <div>Veloura Living Luxury Furniture Pvt. Ltd. | GSTIN: 27AABCV1234F1Z5</div>
      <div>Atelier Headquarters: Via Montenapoleone 8, Milan | India Concierge: BKC Mumbai 400051</div>
      <div>This quotation is authoritative and valid for 30 days from date of issuance.</div>
    </div>
  </div>
</body>
</html>`;
  }
}
