# 🛋️ Veloura Living — Shop Room Hover & Hotspot Discovery

This document details the spatial room discovery and interactive product hotspots implemented across room detail scenes and shop pages.

---

## 1. Hotspot Coordinate Model

Each room scene contains pre-calculated normalized 2D hotspot markers:

```typescript
export interface RoomHotspot {
  id: string;
  type: string;                    // e.g. 'Sofa', 'Coffee Table', 'Lighting'
  name: string;                    // Signature piece name
  xPercent: number;                // 0 to 100 horizontal %
  yPercent: number;                // 0 to 100 vertical %
  productId: string;               // Bound catalog product ID
  highlightDescription: string;    // Architectural detail callout
}
```

---

## 2. Interaction State Flow

1. **Hover / Focus**: Hotspot pin pulses with concentric champagne gold rings.
2. **Click Marker**: Opens `HotspotPreviewModal.tsx` showing the full piece card, current pricing, color swatches, dimensions, and instant **"Add to Shopping Bag"** CTA.
3. **Deep Linking**: Direct navigation into `/products/[slug]` or `/configurator?piece=[pieceId]`.
