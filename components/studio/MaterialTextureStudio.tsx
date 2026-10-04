'use client';

import React, { useState } from 'react';
import { ShieldCheck, Sparkles, Layers, ZoomIn } from 'lucide-react';

interface MaterialItem {
  id: string;
  name: string;
  category: 'Timber' | 'Textile' | 'Stone' | 'Leather' | 'Metal';
  origin: string;
  finish: string;
  durability: string;
  tactileFeel: string;
  colorHex: string;
  imageUrl?: string;
  description: string;
  maintenanceNote: string;
}

export const MaterialTextureStudio: React.FC = () => {
  const MATERIALS: MaterialItem[] = [
    {
      id: 'mat-walnut',
      name: 'Solid American Black Walnut',
      category: 'Timber',
      origin: 'Appalachian Slow-Growth Forests, North America',
      finish: 'Hand-rubbed organic botanical oil & matte beeswax',
      durability: 'Janka Hardness: 1,010 lbf (Generational Resilience)',
      tactileFeel: 'Dense, silky smooth grain with deep dimensional chocolate undertones',
      colorHex: '#4A2C1A',
      imageUrl: '/images/materials/veloura_swatch_walnut.jpg',
      description: 'Harvested from sustainably managed old-growth forests. The natural grain shifts gracefully across decades without synthetic resin sealing.',
      maintenanceNote: 'Condition biannually with natural beeswax cream. Avoid direct radiant heating sources.',
    },
    {
      id: 'mat-boucle',
      name: 'Belgian Heritage Wool Bouclé',
      category: 'Textile',
      origin: 'Flanders, Belgium',
      finish: 'Uncut loop yarn with natural lanolin barrier',
      durability: 'Martindale Abrasion: 65,000+ Cycles (Heavy Contract Grade)',
      tactileFeel: 'Plush, sculptural cloud-like hand feel with organic temperature regulation',
      colorHex: '#F5E6D3',
      imageUrl: '/images/materials/veloura_swatch_boucle.jpg',
      description: 'Woven on vintage rapier looms using pure New Zealand virgin wool blended with long-staple European flax.',
      maintenanceNote: 'Vacuum gently with upholstery brush attachment. Blot spills immediately with distilled water.',
    },
    {
      id: 'mat-leather',
      name: 'Vegetable-Tanned Saddle Leather',
      category: 'Leather',
      origin: 'Tuscany, Italy',
      finish: 'Aniline dyed with chestnut & mimosa bark extracts',
      durability: 'Full-Grain 2.2mm Bull Hide',
      tactileFeel: 'Supple, butter-soft leather that develops an exquisite vintage caramel patina',
      colorHex: '#8B5A2B',
      imageUrl: '/images/materials/veloura_swatch_leather.jpg',
      description: 'Tanned using generational organic bark recipes. Free from synthetic chrome coatings to allow natural breathing.',
      maintenanceNote: 'Buff with horsehair brush. Natural moisture oils enhance the patina over time.',
    },
    {
      id: 'mat-travertine',
      name: 'Honed Roman Travertine Stone',
      category: 'Stone',
      origin: 'Tivoli Quarries, Italy',
      finish: 'Honed matte surface with natural mineral voids preserved',
      durability: 'Solid Volcanic Sedimentary Limestone',
      tactileFeel: 'Cool, architectural texture with sculptural weight and porous character',
      colorHex: '#EADBC8',
      imageUrl: '/images/materials/veloura_swatch_travertine.jpg',
      description: 'Quarried from the historic geothermal mineral springs of central Italy. Each slab is hand-chiseled with zero synthetic fillers.',
      maintenanceNote: 'Clean with pH-neutral stone soap. Penetrating sealant applied at workshop.',
    },
    {
      id: 'mat-brass',
      name: 'Hand-Spun Muted Brushed Brass',
      category: 'Metal',
      origin: 'Birmingham, United Kingdom',
      finish: 'Directional micro-brushed satin with protective microcrystalline wax',
      durability: 'Solid Architectural Grade C26000 Brass',
      tactileFeel: 'Warm, refined metallic luster that catches and softens interior illumination',
      colorHex: '#A47A45',
      imageUrl: '/images/materials/veloura_swatch_brass.jpg',
      description: 'Precision turned from solid heavy-gauge brass billet. Subtly reflects ambient daylight without harsh specular glare.',
      maintenanceNote: 'Wipe with microfiber cloth. Wax barrier prevents uneven oxidization.',
    },
  ];

  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('mat-walnut');
  const selectedMaterial = MATERIALS.find((m) => m.id === selectedMaterialId) || MATERIALS[0];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4A2C1A]/10 shadow-soft-lg">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#F5E6D3] text-[#4A2C1A] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-[#8B5A2B]/20 mb-2">
            <Layers className="w-3.5 h-3.5 text-[#8B5A2B]" />
            <span>Tactile Material Laboratory</span>
          </div>
          <h3 className="font-display font-bold text-2xl sm:text-3xl text-[#211E1B]">
            Generational Hardwoods, Textiles & Stones
          </h3>
          <p className="text-xs sm:text-sm text-[#746B61] mt-1 max-w-xl">
            Inspect our materials under macro focus. Every piece is sourced from certified generational masters.
          </p>
        </div>

        {/* Category Swatch Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {MATERIALS.map((mat) => (
            <button
              key={mat.id}
              onClick={() => setSelectedMaterialId(mat.id)}
              className={`interactive-pill flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide whitespace-nowrap cursor-pointer border ${
                selectedMaterialId === mat.id
                  ? 'bg-[#4A2C1A] text-white border-[#4A2C1A] shadow-md'
                  : 'bg-[#FCFAF7] text-[#514A43] border-[#DED7CD] hover:border-[#8B5A2B]'
              }`}
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-white shadow-sm flex-shrink-0"
                style={{ backgroundColor: mat.colorHex }}
              />
              <span>{mat.name.split(' ')[1] || mat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Material Detail Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Macro Visual Preview */}
        <div className="lg:col-span-6 relative aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-[#211E1B] border border-[#4A2C1A]/15 shadow-xl group">
          {selectedMaterial.imageUrl ? (
            <img
              src={selectedMaterial.imageUrl}
              alt={selectedMaterial.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center relative"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${selectedMaterial.colorHex}dd, ${selectedMaterial.colorHex}88, #1c1815)`,
              }}
            >
              <div className="text-center p-6 text-white">
                <span className="text-xs uppercase font-bold tracking-widest text-[#F5E6D3] block mb-2">
                  Tactile Swatch Macro
                </span>
                <h4 className="font-display font-bold text-2xl">{selectedMaterial.name}</h4>
              </div>
            </div>
          )}

          {/* Top Zoom Badge */}
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-white/20">
            <ZoomIn className="w-3.5 h-3.5 text-[#8B5A2B]" />
            <span>8K Macro Grain Preview</span>
          </div>

          {/* Bottom Swatch Info Overlay */}
          <div className="absolute bottom-4 inset-x-4 bg-black/80 backdrop-blur-md rounded-xl p-3.5 border border-white/15 text-white flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5A2B] block">
                {selectedMaterial.category} • Origin
              </span>
              <span className="font-display text-xs sm:text-sm font-semibold text-[#FCFAF7]">
                {selectedMaterial.origin}
              </span>
            </div>
            <span
              className="w-5 h-5 rounded-full border-2 border-white shadow"
              style={{ backgroundColor: selectedMaterial.colorHex }}
            />
          </div>
        </div>

        {/* Right Material Specifications & Architectural Rationale */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#8B5A2B] mb-1">
              Material Specification
            </div>
            <h4 className="font-display font-bold text-2xl text-[#211E1B]">
              {selectedMaterial.name}
            </h4>
            <p className="text-sm text-[#746B61] leading-relaxed mt-2">
              {selectedMaterial.description}
            </p>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#FCFAF7] border border-[#EEE9E1]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#9C9287] block mb-1">
                Finish & Wax
              </span>
              <span className="text-xs font-semibold text-[#211E1B] leading-snug block">
                {selectedMaterial.finish}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#FCFAF7] border border-[#EEE9E1]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#9C9287] block mb-1">
                Durability Rating
              </span>
              <span className="text-xs font-semibold text-[#211E1B] leading-snug block">
                {selectedMaterial.durability}
              </span>
            </div>
          </div>

          {/* Tactile Feel Highlight */}
          <div className="p-4 rounded-xl bg-[#F5E6D3]/40 border border-[#8B5A2B]/20 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#8B5A2B] flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-[#4A2C1A] block">
                Sensory Hand-Feel & Acoustics
              </span>
              <p className="text-xs text-[#746B61] mt-0.5 leading-relaxed">
                {selectedMaterial.tactileFeel}
              </p>
            </div>
          </div>

          {/* Maintenance Assurance */}
          <div className="text-xs text-[#9C9287] flex items-center gap-2 pt-2 border-t border-[#EEE9E1]">
            <ShieldCheck className="w-4 h-4 text-[#8B5A2B]" />
            <span>Care: {selectedMaterial.maintenanceNote}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MaterialTextureStudio;
