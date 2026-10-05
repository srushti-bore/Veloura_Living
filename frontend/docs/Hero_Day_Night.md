# ☀️🌙 Veloura Living — Hero Dual-Lighting Comparison Slider

This specification governs the 60fps locked comparison stage between daylight illumination and atmospheric evening lighting on signature spaces.

---

## 1. Synchronization Architecture

* **Dual Video / Canvas Streams**: Both Day (`/Video/Day/`) and Night (`/Video/Night/`) sequences are loaded in parallel.
* **Lockstep Playback**: A shared animation ticker synchronizes current playback time to ensure zero phase drift.
* **Divider Physics**: Draggable vertical divider with touch and pointer support (`touch-action: none`).
* **Clip-Path Interpolation**: Left element is clipped dynamically using `clip-path: polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`.

---

## 2. Atmosphere Transition Metrics

* **Day Mode**: Natural 5500K daylight, soft diffuse window illumination, highlighting oat milk bouclé texture and raw ash grain.
* **Night Mode**: Intimate 2700K ambient illumination from brass floor lamps and recessed plinth lighting, highlighting warm dark walnut reflections.
