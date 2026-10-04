'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';

export default function ApiDocsPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Inject Swagger UI CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui.css';
    document.head.appendChild(link);

    // Inject Swagger UI Bundle JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-bundle.js';
    script.async = true;
    script.onload = () => {
      if ((window as any).SwaggerUIBundle) {
        (window as any).SwaggerUIBundle({
          url: '/api/openapi.json',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [
            (window as any).SwaggerUIBundle.presets.apis,
            (window as any).SwaggerUIBundle.SwaggerUIStandalonePreset
          ],
          layout: 'BaseLayout',
          defaultModelsExpandDepth: 1,
          defaultModelExpandDepth: 1,
          docExpansion: 'list',
          showExtensions: true,
          showCommonExtensions: true
        });
        setIsLoaded(true);
      }
    };
    document.body.appendChild(script);

    return () => {
      try {
        document.head.removeChild(link);
        document.body.removeChild(script);
      } catch {}
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FCFAF7] text-[#211E1B]">
      {/* Top Luxury Navigation Header */}
      <header className="bg-white border-b border-[#4A2C1A]/10 sticky top-0 z-50 px-6 py-4 shadow-soft-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-xl bg-[#FCFAF7] border border-[#EEE9E1] hover:border-[#8B5A2B]/40 transition-all text-[#4A2C1A] hover:bg-[#F5E6D3]/40"
              title="Return to Veloura Living"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#8B5A2B]" />
                <h1 className="font-display font-bold text-lg text-[#211E1B]">
                  Veloura Living — Interactive Swagger & OpenAPI Suite
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#557A5A]/10 text-[#557A5A] border border-[#557A5A]/20">
                  v1.1 Live
                </span>
              </div>
              <p className="text-xs text-[#746B61]">
                Interactive API Explorer, Live Execution Sandbox & OpenAPI 3.0 Contract
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/api/openapi.json"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl border border-[#DED7CD] bg-[#FCFAF7] hover:bg-white text-[#4A2C1A] transition-all shadow-soft-sm"
            >
              <span>Raw JSON Spec</span>
              <ExternalLink className="w-3 h-3 text-[#8B5A2B]" />
            </a>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#557A5A] bg-[#557A5A]/10 px-3 py-1.5 rounded-xl border border-[#557A5A]/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>JWT Bearer Enabled</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Swagger Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {!isLoaded && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-3 border-[#8B5A2B]/30 border-t-[#8B5A2B] rounded-full animate-spin" />
            <p className="text-xs font-semibold text-[#8B5A2B] tracking-wider uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-pulse" />
              Initializing Swagger API Sandbox...
            </p>
          </div>
        )}

        <div className="bg-white rounded-3xl p-4 sm:p-8 border border-[#4A2C1A]/10 shadow-soft-md">
          <div id="swagger-ui" />
        </div>
      </main>
    </div>
  );
}
