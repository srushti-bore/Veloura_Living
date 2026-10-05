# 🎨 Veloura Living — Frontend Design System & Tokens

This document outlines the visual identity, color palette, typography hierarchy, spacing scale, glassmorphism parameters, and micro-interaction tokens that govern the Veloura Living frontend.

---

## 🤎 Core Color Palette

The Veloura palette is rooted in warm earth tones, raw timbers, champagne golds, and rich espresso leathers.

| Token Name | Hex Code | HSL Equivalent | Primary Usage |
| :--- | :--- | :--- | :--- |
| **Canvas Spatial** | `#150E0A` | `hsl(20, 38%, 6%)` | Dark Spatial Studio backdrop, announcement bar |
| **Dark Walnut Base** | `#1C140E` | `hsl(24, 39%, 8%)` | Primary Header, modal popovers, luxury dark cards |
| **Espresso Surface** | `#2A1A12` | `hsl(22, 39%, 12%)` | Elevated cards, sidebar panels, input fields |
| **Timber Border** | `#3D271D` | `hsl(20, 35%, 18%)` | Subtle borders, dividers, card outlines |
| **Bronze Accent** | `#8B5A2B` | `hsl(30, 53%, 36%)` | Secondary accents, interactive icon badges |
| **Champagne Gold** | `#D8B486` | `hsl(34, 52%, 69%)` | Primary accent, CTA buttons, active states, stars |
| **Warm Sand / Parchment**| `#E8D8C5` | `hsl(33, 44%, 84%)` | Secondary text, modal backgrounds, QR containers |
| **Parchment Light** | `#F5E6D3` | `hsl(33, 62%, 90%)` | Light mode card fills, subtle hover highlights |
| **Light Canvas / Oat** | `#FBF8F3` | `hsl(38, 56%, 97%)` | Standard customer catalog background |
| **Warm White** | `#FAF7F2` | `hsl(38, 43%, 97%)` | High-contrast display typography, logo |

---

## 🔤 Typography System

### 1. Display & Heading Typography
* **Font Family**: `var(--font-cormorant)`, `var(--font-instrument-serif)`, serif
* **Style**: Elegant, unhurried, high-contrast serif with letter-spacing.
* **Weights**: 300 (Light), 400 (Regular), 600 (Semi-bold).
* **Usage**: Brand logo (`VELOURA`), hero headlines, collection titles, room names, quotation callouts.

### 2. UI & Body Typography
* **Font Family**: `var(--font-dmsans)`, `var(--font-instrument-sans)`, sans-serif
* **Style**: Clean, architectural, highly legible grotesque sans.
* **Weights**: 400 (Regular), 500 (Medium), 600 (Semi-bold), 700 (Bold).
* **Usage**: Navigation links, product specifications, pricing, body copy, drawer controls.

---

## 🪞 Glassmorphism & Elevation Tokens

```css
/* Dark Architectural Glassmorphism (Header & Studio Sidebars) */
.glass-panel-dark {
  background: rgba(28, 20, 14, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(61, 39, 29, 0.5);
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.6);
}

/* Light Architectural Glassmorphism (Parchment Modals) */
.glass-panel-light {
  background: rgba(251, 248, 243, 0.94);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(216, 180, 134, 0.3);
  box-shadow: 0 25px 50px -12px rgba(42, 26, 18, 0.12);
}
```

---

## ✨ Micro-Animations & Keyframes

### 1. Luxury Gold/Bronze Shimmer (`.btn-brownish-shimmer`)
```css
@keyframes luxuryGoldShimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.btn-brownish-shimmer {
  background: linear-gradient(
    90deg,
    #4A2C1A 0%,
    #8B5A2B 30%,
    #D8B486 50%,
    #8B5A2B 70%,
    #4A2C1A 100%
  );
  background-size: 250% 100%;
  animation: luxuryGoldShimmer 4s ease-in-out infinite;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
```

### 2. Interactive Spotlight Glow Physics
* Cards calculate real-time normalized cursor coordinates `(x, y)` on `onMouseMove`.
* Radial spotlight gradient shifts dynamically:
  ```css
  background: radial-gradient(
    300px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(216, 180, 134, 0.15),
    transparent 80%
  );
  ```
