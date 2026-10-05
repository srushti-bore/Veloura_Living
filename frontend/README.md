# 🏛️ Veloura Living — Frontend Architecture & Technical Overview

> **Furniture Intelligence + Luxury Space Discovery Platform**  
> Built with Next.js 16 (App Router) • React 19 • TypeScript • Tailwind CSS v4 • Three.js WebGL/WebXR

---

## 🌟 Executive Summary

The **Veloura Living Frontend** is an ultra-premium, editorial e-commerce and spatial exploration platform. It delivers an unhurried, tactile, and quiet luxury experience for curating bespoke living spaces, configuring handcrafted furniture in real-time 3D, previewing pieces in augmented reality (AR), and receiving instant architectural advice via an AI Spatial Consultant.

---

## 📐 Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16 (App Router + Turbopack)** | Server Components, dynamic streaming, zero-layout-shift routing |
| **UI Library** | **React 19** | Concurrent rendering, declarative hooks, transitional UI states |
| **Styling** | **Tailwind CSS v4 + Vanilla CSS Tokens** | Architectural glassmorphism, responsive grids, luxury bronze shimmers |
| **3D & WebGL** | **Three.js (0.186.1)** | Procedural geometry, PBR materials, multi-point lighting & studio podium |
| **Augmented Reality** | **WebXR + Intent Bridge** | True-to-scale AR preview via USDZ (iOS) & Scene Viewer (Android) |
| **Motion & Scroll** | **Lenis Smooth Scroll + GSAP** | Cinematic momentum scrolling, parallax hero choreography |
| **Icons & Media** | **Lucide React** | Minimalist editorial iconography |
| **Type Safety** | **TypeScript 5.8+** | Strict end-to-end interface typing & authoritative models |
| **PWA & Offline** | **Custom Service Worker + Manifest** | Standalone installation, offline cache fallback, 8K tactile preloading |

---

## 📁 Directory Structure

```
frontend/
├── README.md                      # Primary Frontend Architecture & System Guide
├── DESIGN_SYSTEM.md               # Luxury Tokens, Warm Palette, Typography & Glassmorphism
├── FRONTEND_FEATURES.md           # 15-Phase Master Feature & Capabilities Matrix
├── COMPONENTS_GUIDE.md            # Component Hierarchy, Views, Modals & Drawers
├── 3D_STUDIO_GUIDE.md             # Three.js Viewport, PBR Textures & WebXR AR Pipeline
├── API_HOOKS_REFERENCE.md         # React Context Hooks, Data Stores & REST Integrations
├── docs/                          # Detailed Specification Markdown Documents
│   ├── Design_Tokens.md           # Complete CSS & Tailwind Token Dictionary
│   ├── Animation_Interaction.md   # Micro-interactions, Shimmer & Hover Physics
│   ├── Hero_Day_Night.md          # 60fps Lockstep Dual-Lighting Slider Spec
│   ├── Shop_Room_Hover.md         # Interactive Room Hotspot Discovery Guide
│   └── Auth_Experience.md         # Quiet Luxury Authentication Modal Architecture
```

---

## 🎨 Design Philosophy & Aesthetics

* **Color Harmony**: Deep Raw Walnut (`#1C140E`), Dark Espresso (`#150E0A`), Warm Champagne Gold (`#D8B486`), and Oat Milk Parchment (`#FBF8F3`).
* **Typography**:
  * **Display & Headlines**: *Cormorant Garamond* / *Instrument Serif* (Timeless Italian & Parisian editorial elegance).
  * **UI & Body**: *DM Sans* / *Instrument Sans* (Clean architectural legibility).
* **Quiet Luxury Micro-Interactions**:
  * Interactive cursor-following spotlights on cards.
  * Luxury bronze/gold button shimmers (`.btn-brownish-shimmer`).
  * 24px architectural glassmorphism with delicate warm timber borders (`#3D271D`).
  * Sticky 3D studio viewport with smooth camera preset lerping.

---

## 🚀 Getting Started & Local Development

### 1. Prerequisites
* Node.js 20.x or higher
* npm or yarn

### 2. Run Next.js Frontend Server
```bash
# Start Next.js development server on port 3000
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 3. Run Dedicated Backend API Server (Optional/Parallel)
```bash
# Start Express TypeScript backend on port 5000
cd backend
npm run dev
```

### 4. Build & Production Check
```bash
npm run build
```

---

## 🧪 Automated Testing Suite

```bash
# Run full automated regression suite (33/33 tests)
npm test

# Run Phase 13 3D AR Configurator Suite (42/42 tests)
npm run test:phase13

# Run Phase 14 VIP Concierge & Trade B2B Suite (40/40 tests)
npm run test:phase14

# Run Phase 15 PWA & Offline Performance Suite (47/47 tests)
npm run test:phase15
```
