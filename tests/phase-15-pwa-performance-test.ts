// 🏛️ Veloura Living — Phase 15 PWA Offline & Global Performance Test Suite
import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, description: string) {
  if (condition) {
    console.log(`  \x1b[32m✓\x1b[0m ${description}`);
    passed++;
  } else {
    console.error(`  \x1b[31m✗\x1b[0m ${description}`);
    failed++;
  }
}

console.log('\n🏛️ =========================================================================');
console.log('🏛️ VELOURA LIVING — PHASE 15 PWA OFFLINE & GLOBAL PERFORMANCE TEST SUITE');
console.log('🏛️ =========================================================================\n');

// 1. PWA Web App Manifest
console.log('📦 1. Testing Web App Manifest (public/manifest.json)...');
const manifestPath = path.resolve(process.cwd(), 'public/manifest.json');
assert(fs.existsSync(manifestPath), 'manifest.json file exists in public/ directory');

const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert(manifestContent.name === 'Veloura Living — Luxury Furniture Intelligence', 'Manifest contains full brand name');
assert(manifestContent.short_name === 'Veloura', 'Manifest contains short name');
assert(manifestContent.start_url === '/', 'Manifest start_url is root (/)');
assert(manifestContent.display === 'standalone', 'Manifest display mode is standalone');
assert(manifestContent.theme_color === '#2A1A12', 'Theme color matches Veloura Espresso token (#2A1A12)');
assert(manifestContent.background_color === '#1C1815', 'Background color matches dark spatial canvas token (#1C1815)');
assert(Array.isArray(manifestContent.icons) && manifestContent.icons.length >= 2, 'Manifest defines at least 2 icon sizes (192 & 512)');
assert(Array.isArray(manifestContent.shortcuts) && manifestContent.shortcuts.length >= 4, 'Manifest includes app shortcuts for 3D Studio, Catalog, VIP Trade & Studio');

// 2. Service Worker File & Strategies
console.log('\n📦 2. Testing Service Worker Implementation (public/sw.js)...');
const swPath = path.resolve(process.cwd(), 'public/sw.js');
assert(fs.existsSync(swPath), 'sw.js Service Worker file exists in public/ directory');

const swContent = fs.readFileSync(swPath, 'utf8');
assert(swContent.includes('veloura-core-v1'), 'Service Worker defines core cache key');
assert(swContent.includes('veloura-images-v1'), 'Service Worker defines high-res images cache key');
assert(swContent.includes('veloura-dynamic-v1'), 'Service Worker defines dynamic runtime cache key');
assert(swContent.includes('/offline.html'), 'Service Worker pre-caches offline fallback page');
assert(swContent.includes('/configurator'), 'Service Worker pre-caches 3D AR Studio shell');
assert(swContent.includes('/images/materials/veloura_swatch_walnut.jpg'), 'Service Worker pre-caches 8K tactile macro swatches');
assert(swContent.includes('self.skipWaiting()'), 'Service Worker handles instant activation on install');
assert(swContent.includes('self.clients.claim()'), 'Service Worker claims clients immediately on activate');
assert(swContent.includes("request.mode === 'navigate'"), 'Service Worker handles document navigation with network-first + offline fallback');

// 3. Offline HTML Fallback Page
console.log('\n📦 3. Testing Offline Fallback UI (public/offline.html)...');
const offlinePath = path.resolve(process.cwd(), 'public/offline.html');
assert(fs.existsSync(offlinePath), 'offline.html fallback template exists in public/ directory');

const offlineContent = fs.readFileSync(offlinePath, 'utf8');
assert(offlineContent.includes('<!DOCTYPE html>'), 'offline.html is a valid HTML5 document');
assert(offlineContent.includes('Veloura Living — Offline Mode'), 'offline.html has branded title');
assert(offlineContent.includes('Spatial Atelier — Offline Mode'), 'offline.html displays spatial offline pill');
assert(offlineContent.includes('Check Network Connection'), 'offline.html provides network retry button');
assert(offlineContent.includes('/configurator'), 'offline.html provides quick navigation back to 3D AR Studio');

// 4. React 19 / Next.js Client Integration
console.log('\n📦 4. Testing Client PWA Provider & Layout Integration...');
const providerPath = path.resolve(process.cwd(), 'providers/PWAProvider.tsx');
assert(fs.existsSync(providerPath), 'PWAProvider.tsx exists in providers/ directory');

const providerContent = fs.readFileSync(providerPath, 'utf8');
assert(providerContent.includes('navigator.serviceWorker.register'), 'PWAProvider registers Service Worker');
assert(providerContent.includes('beforeinstallprompt'), 'PWAProvider captures beforeinstallprompt for PWA installation');
assert(providerContent.includes('promptInstall'), 'PWAProvider exposes promptInstall function');
assert(providerContent.includes('Offline Mode Active'), 'PWAProvider renders quiet luxury offline floating indicator');

const layoutPath = path.resolve(process.cwd(), 'app/layout.tsx');
const layoutContent = fs.readFileSync(layoutPath, 'utf8');
assert(layoutContent.includes('PWAProvider'), 'Root layout wraps application in PWAProvider');
assert(layoutContent.includes("manifest: '/manifest.json'"), 'Root layout metadata links manifest.json');
assert(layoutContent.includes('appleWebApp'), 'Root layout defines Apple Web App standalone capabilities');

// 5. Next.js 16 Edge Caching & Security Headers Configuration
console.log('\n📦 5. Testing Next.js Configuration & Security Headers (next.config.mjs)...');
const nextConfigPath = path.resolve(process.cwd(), 'next.config.mjs');
const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');

assert(nextConfigContent.includes('headers()'), 'next.config.mjs exports async headers() function');
assert(nextConfigContent.includes('/sw.js'), 'next.config.mjs configures revalidation headers for sw.js');
assert(nextConfigContent.includes('public, max-age=31536000, immutable'), 'next.config.mjs configures 1-year immutable cache for static images and bundles');
assert(nextConfigContent.includes('Strict-Transport-Security'), 'next.config.mjs configures HSTS security header');
assert(nextConfigContent.includes('X-Frame-Options'), 'next.config.mjs configures X-Frame-Options (SAMEORIGIN)');
assert(nextConfigContent.includes('X-Content-Type-Options'), 'next.config.mjs configures X-Content-Type-Options (nosniff)');
assert(nextConfigContent.includes('Referrer-Policy'), 'next.config.mjs configures Referrer-Policy');
assert(nextConfigContent.includes('Permissions-Policy'), 'next.config.mjs configures Permissions-Policy');

// 6. PWA Health & Edge Telemetry Endpoint
console.log('\n📦 6. Testing PWA Telemetry & Diagnostics (/api/pwa/status)...');
const { GET: getPwaStatus } = await import('../app/api/pwa/status/route');
const pwaRes = await getPwaStatus();
assert(pwaRes.status === 200, 'PWA status endpoint returns HTTP 200');
const pwaData = await pwaRes.json();
assert(pwaData.data.pwaReady === true, 'PWA status indicates pwaReady is true');
assert(pwaData.data.manifest === '/manifest.json', 'PWA status specifies manifest path');
assert(pwaData.data.serviceWorker === '/sw.js', 'PWA status specifies serviceWorker path');
assert(pwaData.data.cacheKeys.core === 'veloura-core-v1', 'PWA status specifies core cache key');
assert(Array.isArray(pwaData.data.shortcuts) && pwaData.data.shortcuts.length >= 4, 'PWA status specifies all 4 spatial shortcuts');

console.log('\n🏛️ =========================================================================');
console.log(`📊 PHASE 15 PWA OFFLINE & GLOBAL PERFORMANCE TEST SUMMARY:`);
console.log(`   ✓ Passed: ${passed}`);
console.log(`   ✗ Failed: ${failed}`);
console.log(`   🎯 Total:  ${passed + failed}`);
console.log('🏛️ =========================================================================\n');

if (failed > 0) {
  console.error('❌ SOME PHASE 15 TESTS FAILED!');
  process.exit(1);
} else {
  console.log('🎉 ALL PHASE 15 PWA OFFLINE & GLOBAL PERFORMANCE TESTS PASSED 100%!\n');
}
