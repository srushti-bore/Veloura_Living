# 🏛️ Veloura Living — Master Design Tokens & CSS Variables

## 1. Color Palette Tokens

```css
:root {
  /* Spatial Canvas Tokens */
  --color-canvas-spatial: #150e0a;
  --color-canvas-light: #fbf8f3;
  --color-parchment-base: #f5e6d3;
  --color-sand-warm: #e8d8c5;

  /* Timber & Leather Tokens */
  --color-walnut-dark: #1c140e;
  --color-espresso-surface: #2a1a12;
  --color-timber-border: #3d271d;
  --color-cognac-leather: #7a3e1d;

  /* Accent & Illumination Tokens */
  --color-champagne-gold: #d8b486;
  --color-gold-hover: #e8c599;
  --color-bronze-accent: #8b5a2b;
  --color-brass-spun: #c5a059;

  /* Typography Colors */
  --color-text-primary-dark: #faf7f2;
  --color-text-secondary-dark: #e8d8c5;
  --color-text-muted-dark: #b9aa99;
  --color-text-primary-light: #4a2c1a;
  --color-text-secondary-light: #705848;
}
```

## 2. Typography Token Classes

```css
.font-display {
  font-family: var(--font-cormorant), var(--font-instrument-serif), Georgia, serif;
}

.font-body {
  font-family: var(--font-dmsans), var(--font-instrument-sans), -apple-system, sans-serif;
}
```

## 3. Radii & Shadow Tokens

* **Border Radius**:
  * Pill buttons: `9999px` (`rounded-full`)
  * Elevated cards: `1rem` (`rounded-2xl`)
  * Dropdown popovers: `0.75rem` (`rounded-xl`)
  * Swatch chips: `0.5rem` (`rounded-lg`)
* **Box Shadows**:
  * Luxury card drop: `0 20px 40px -15px rgba(0, 0, 0, 0.4)`
  * Glass modal drop: `0 25px 60px -15px rgba(21, 14, 10, 0.7)`
  * Gold glow: `0 0 25px rgba(216, 180, 134, 0.25)`
