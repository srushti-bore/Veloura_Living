import { NextRequest } from 'next/server';
import { sendSuccess } from '@/lib/api/response';

export async function GET(req?: NextRequest) {
  return sendSuccess({
    pwaReady: true,
    version: '1.0.0',
    manifest: '/manifest.json',
    serviceWorker: '/sw.js',
    offlineFallback: '/offline.html',
    cacheKeys: {
      core: 'veloura-core-v1',
      dynamic: 'veloura-dynamic-v1',
      images: 'veloura-images-v1',
    },
    precacheCount: 14,
    themeColor: '#2A1A12',
    backgroundColor: '#1C1815',
    displayMode: 'standalone',
    shortcuts: [
      { name: '3D AR Configurator', url: '/configurator' },
      { name: 'Shop Catalog', url: '/shop' },
      { name: 'VIP Trade Portal', url: '/trade' },
      { name: 'Material Texture Studio', url: '/studio' },
    ],
    edgeCaching: {
      swRevalidate: 'public, max-age=0, must-revalidate',
      staticImagesImmutable: 'public, max-age=31536000, immutable',
      hstsEnabled: true,
      securityHeaders: [
        'Strict-Transport-Security',
        'X-Frame-Options',
        'X-Content-Type-Options',
        'Referrer-Policy',
        'Permissions-Policy',
      ],
    },
  });
}
