import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ConfiguratorStudioPage } from '@/components/views/configurator/ConfiguratorStudioPage';

export const metadata: Metadata = {
  title: '3D Spatial Configurator & AR Atelier | Veloura Living',
  description:
    'Customize luxury furniture in interactive 3D, swap 8K macro materials in real-time, inspect exploded joinery, and project true-scale pieces into your room via Apple QuickLook and WebXR.',
  openGraph: {
    title: '3D Spatial Configurator & AR Customizer — Veloura Living',
    description: 'Interactive 3D luxury furniture design studio with real-time 8K PBR textures and mobile AR room placement.',
    images: ['/images/materials/veloura_swatch_walnut.jpg'],
  },
};

export default function ConfiguratorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0F0D0B] flex items-center justify-center pt-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-[#8B5A2B] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs uppercase tracking-widest text-[#D8B486]">
              Initializing 3D Spatial Atelier...
            </p>
          </div>
        </div>
      }
    >
      <ConfiguratorStudioPage />
    </Suspense>
  );
}
