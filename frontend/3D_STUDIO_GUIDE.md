# 🛋️ Veloura Living — 3D Spatial Studio & Augmented Reality Guide

This document details the architecture, rendering pipeline, procedural geometry algorithms, PBR material system, and WebXR AR intent pipeline powering the **Veloura 3D Configurator Studio** (`/configurator`).

---

## 📐 3D Viewport Architecture (`ThreeStudioViewport.tsx`)

### 1. Scene Setup & Multi-Point Architectural Lighting
* **Key Light**: Warm 3200K Directional Light (`#FFF5E6`, intensity 2.2) casting soft shadows.
* **Fill Light**: Cool 6500K Directional Light (`#E6F0FF`, intensity 0.9) to soften timber crevices.
* **Rim Light**: Champagne Gold Point Light (`#D8B486`, intensity 1.5) behind the piece to accentuate sculptural silhouettes.
* **Ambient Base**: Hemispherical Light (`#FAF7F2` sky, `#2A1A12` ground, intensity 0.75).
* **Studio Gallery Podium**: Subtle circular travertine plinth with contact shadow receiver.

### 2. Piece-Specific Camera Presets (`PIECE_CAMERA_PRESETS`)
Different furniture pieces possess unique aspect ratios and focus regions. The studio defines customized camera coordinates for each piece:

```typescript
export const PIECE_CAMERA_PRESETS: Record<string, CameraPresetConfig> = {
  'piece-serpentine-sofa': {
    fov: 42,
    presets: {
      front:  { position: [0, 1.2, 4.2], target: [0, 0.4, 0] },
      iso:    { position: [3.2, 2.0, 3.4], target: [0, 0.4, 0] },
      top:    { position: [0, 4.8, 0.1], target: [0, 0, 0] },
      detail: { position: [1.2, 0.9, 1.6], target: [0.3, 0.5, 0] }
    }
  },
  'piece-aurelia-table': {
    fov: 40,
    presets: {
      front:  { position: [0, 1.3, 3.8], target: [0, 0.45, 0] },
      iso:    { position: [2.8, 2.2, 2.8], target: [0, 0.45, 0] },
      top:    { position: [0, 4.2, 0.1], target: [0, 0, 0] },
      detail: { position: [1.0, 1.1, 1.4], target: [0.2, 0.6, 0] }
    }
  },
  // Additional presets for credenza and swivel lounge chair...
};
```

---

## 🪵 Procedural PBR Material Library (`configuratorMaterials.ts`)

15 curated luxury materials with realistic physical properties:
* **Tactile Bouclé** (`mat-boucle`): High roughness (0.88), micro-bump velvet response.
* **Italian Saddle Leather** (`mat-leather-cognac`): Sheen (0.45), rich cognac tones (`#7A3E1D`).
* **Raw American Walnut** (`mat-walnut`): Natural wood grain reflection (roughness 0.55).
* **Smoked Ebonized Oak** (`mat-ebonized-oak`): Dark architectural grain (`#211D1A`).
* **Hand-Spun Brushed Brass** (`mat-spun-brass`): Metalness (0.92), subtle anisotropic reflection.
* **Roman Travertine Stone** (`mat-travertine`): Mineral texture, matte porous surface.

---

## 📱 Augmented Reality (AR) Pipeline & QR Placement Modal

### 1. WebXR Intent & iOS Quick Look Integration
* **Android (Scene Viewer)**:
  `intent://arvr.google.com/scene-viewer/1.0?file=https://veloura.luxury/models/sofa.glb&mode=ar_only...#Intent;scheme=https;package=com.google.ar.core;end`
* **iOS (Quick Look / USDZ)**:
  Direct anchor link pointing to `model.usdz` with `rel="ar"`.

### 2. Real-Time Interactive Cursor Spotlight
The AR QR placement modal (`ARPlacementModal.tsx`) features:
* Interactive cursor tracking spotlight that illuminates the modal dialog.
* High-contrast dark walnut QR code dots (`#2E1B11`) on warm sand parchment (`#E8D8C5`) for 100% scanning reliability.
* Live serialization of customized upholstery, timber base, and accent configurations into query parameters.
