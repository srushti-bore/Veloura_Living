# ✨ Veloura Living — Animation & Interaction Physics

This specification outlines the choreography, micro-interactions, scroll dynamics, and hover physics implemented across the Veloura frontend.

---

## 1. Lenis Smooth Momentum Scroll

* **Orientation**: Vertical
* **Smooth Wheel**: Enabled with exponential dampening (`lerp: 0.08`, `duration: 1.2`).
* **Touch Multiplier**: `1.5` for responsive mobile gesture inertia.
* **Anchor Snapping**: Smooth cubic-bezier ease-out transition when navigating across room sections.

---

## 2. Cursor Spotlight Dynamic Tracking

Used on luxury feature cards, 3D AR modal, and promotional banners:
* On `mousemove`: Calculates element offset coordinates `x = e.clientX - rect.left`, `y = e.clientY - rect.top`.
* Updates CSS variables `--mouse-x: ${x}px` and `--mouse-y: ${y}px`.
* Hardware-accelerated radial spotlight renders via GPU without layout thrashing.

---

## 3. Button Shimmer Keyframes

```css
@keyframes luxuryGoldShimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
```

---

## 4. 360° Rotational Product Physics (`Interactive360Viewer.tsx`)

* 36 high-resolution preloaded frames representing a complete 360° piece rotation.
* Drag sensitivity: 1 frame per 10px horizontal cursor delta.
* Momentum coasting: Inertial decay over 400ms after release.
