import React, { useState } from 'react';
import Image from 'next/image';
import { X, Package, Plus, Check, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Product } from '@/types';

interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProduct: (product: Partial<Product>) => void;
  initialProduct?: Product | null;
}

const PRODUCT_IMAGE_PRESETS = [
  { label: 'Solis Bouclé Chair', url: '/images/products/veloura_solis_boucle_chair.jpg' },
  { label: 'Serpentine Modular Sofa', url: '/images/products/veloura_serpentine_modular_sofa.jpg' },
  { label: 'Kyoto Coffee Table', url: '/images/products/veloura_kyoto_coffee_table.jpg' },
  { label: 'Solitude Platform Bed', url: '/images/products/veloura_solitude_platform_bed.jpg' },
  { label: 'Heritage Walnut Table', url: '/images/products/veloura_heritage_walnut_dining_table.jpg' },
  { label: 'Meridian Executive Desk', url: '/images/products/veloura_meridian_executive_desk.jpg' },
  { label: 'Aeron Pro Leather Chair', url: '/images/products/veloura_aeron_pro_leather_chair.jpg' },
  { label: 'Arcos Brass Floor Lamp', url: '/images/products/veloura_arcos_brass_arch_lamp.jpg' },
];

export const AdminProductModal: React.FC<AdminProductModalProps> = ({
  isOpen,
  onClose,
  onSaveProduct,
  initialProduct,
}) => {
  const [name, setName] = useState(initialProduct?.name || '');
  const [category, setCategory] = useState(initialProduct?.category || 'living');
  const [room, setRoom] = useState(initialProduct?.room || 'living-room');
  const [price, setPrice] = useState(initialProduct?.price || 45000);
  const [stock, setStock] = useState(initialProduct?.stock || 12);
  const [sku, setSku] = useState(initialProduct?.sku || '');
  const [imageUrl, setImageUrl] = useState(
    initialProduct?.images?.[0] || '/images/products/veloura_solis_boucle_chair.jpg'
  );
  const [materials, setMaterials] = useState(
    initialProduct?.materials?.join(', ') || 'Solid Walnut, Bouclé'
  );
  const [description, setDescription] = useState(
    initialProduct?.description || 'Handcrafted bespoke piece with harmonic architectural lines.'
  );

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveProduct({
      id: initialProduct?.id,
      name: name.trim(),
      category,
      room: room as any,
      price: Number(price),
      stock: Number(stock),
      sku: sku.trim() || `VEL-${name.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      materials: materials.split(',').map((m) => m.trim()),
      description: description.trim(),
      images: [imageUrl],
      availability: Number(stock) > 5 ? 'in_stock' : Number(stock) > 0 ? 'low_stock' : 'out_of_stock',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FAF7F2] rounded-2xl border border-[#E6DDD0] shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto font-sans text-[#2E1E12]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#EAE2D7] bg-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#523623] text-white flex items-center justify-center font-bold">
              <Package className="w-5 h-5 text-[#E6DDD0]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2E1E12]">
                {initialProduct ? 'Edit Furniture Piece' : 'Add Furniture Piece'}
              </h3>
              <p className="text-xs text-[#796B5F]">
                {initialProduct ? 'Update specifications & inventory' : 'Catalog new handcrafted luxury piece'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#F2ECE2] flex items-center justify-center text-[#796B5F] hover:text-[#2E1E12] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#523623]">Product Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aurelia Modular Velvet Sofa"
              className="w-full bg-white border border-[#E4DCD0] rounded-xl px-3.5 py-2 text-xs text-[#2E1E12] focus:outline-none focus:border-[#8B5A2B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#523623]">Room Collection</label>
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value as any)}
                className="w-full bg-white border border-[#E4DCD0] rounded-xl px-3.5 py-2 text-xs text-[#2E1E12] focus:outline-none focus:border-[#8B5A2B]"
              >
                <option value="living-room">Living Room</option>
                <option value="bedroom">Bedroom</option>
                <option value="dining">Dining Room</option>
                <option value="office">Home Office</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#523623]">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-[#E4DCD0] rounded-xl px-3.5 py-2 text-xs text-[#2E1E12] focus:outline-none focus:border-[#8B5A2B]"
              >
                <option value="living">Seating & Sofas</option>
                <option value="dining">Tables & Consoles</option>
                <option value="bedroom">Beds & Nightstands</option>
                <option value="storage">Storage & Credenzas</option>
                <option value="lighting">Architectural Lighting</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#523623]">Price (₹)</label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-white border border-[#E4DCD0] rounded-xl px-3.5 py-2 text-xs text-[#2E1E12] focus:outline-none focus:border-[#8B5A2B]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#523623]">Current Stock</label>
              <input
                type="number"
                required
                min="0"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full bg-white border border-[#E4DCD0] rounded-xl px-3.5 py-2 text-xs text-[#2E1E12] focus:outline-none focus:border-[#8B5A2B]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#523623]">SKU (Optional)</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="VEL-AUR-01"
                className="w-full bg-white border border-[#E4DCD0] rounded-xl px-3.5 py-2 text-xs text-[#2E1E12] focus:outline-none focus:border-[#8B5A2B]"
              />
            </div>
          </div>

          {/* Product Image Selection & Upload */}
          <div className="space-y-2 p-3.5 bg-white rounded-xl border border-[#E4DCD0]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#523623] flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Product Image & Visual Asset</span>
              </label>
              <label className="cursor-pointer text-[11px] font-medium text-[#7D5A3C] hover:text-[#523623] flex items-center gap-1 px-2.5 py-1 bg-[#FAF6F0] rounded-lg border border-[#EADBCC] hover:bg-[#F2ECE2] transition-colors">
                <Upload className="w-3 h-3" />
                <span>Upload File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center gap-3">
              {/* Preview Thumbnail */}
              <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#E4DCD0] bg-[#FAF7F2] shrink-0 shadow-xs">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt="Product preview"
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#8C7A6B]">
                    <ImageIcon className="w-6 h-6 opacity-40" />
                  </div>
                )}
              </div>

              {/* Image URL input */}
              <div className="flex-1 space-y-1">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Image path (/images/products/... or https://...)"
                  className="w-full bg-[#FAF7F2] border border-[#E4DCD0] rounded-lg px-3 py-1.5 text-xs text-[#2E1E12] focus:outline-none focus:border-[#8B5A2B]"
                />
                <span className="text-[10px] text-[#8C7A6B] block">
                  Select a luxury preset below or upload a custom image.
                </span>
              </div>
            </div>

            {/* Quick Catalog Image Presets */}
            <div className="pt-2 border-t border-[#F2ECE2]">
              <div className="text-[10px] font-medium text-[#796B5F] mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#B88E58]" />
                <span>Quick Catalog Presets:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRODUCT_IMAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`text-[10px] px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      imageUrl === preset.url
                        ? 'bg-[#523623] text-white font-medium shadow-xs'
                        : 'bg-[#FAF6F0] text-[#796B5F] border border-[#EADBCC] hover:bg-[#F2ECE2] hover:text-[#2E1E12]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#523623]">Materials (Comma separated)</label>
            <input
              type="text"
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
              placeholder="Solid Oak, Belgian Linen, Muted Brass"
              className="w-full bg-white border border-[#E4DCD0] rounded-xl px-3.5 py-2 text-xs text-[#2E1E12] focus:outline-none focus:border-[#8B5A2B]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#523623]">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-[#E4DCD0] rounded-xl p-3 text-xs text-[#2E1E12] focus:outline-none focus:border-[#8B5A2B]"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#EAE2D7] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-[#E4DCD0] text-[#523623] hover:bg-[#F2ECE2] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#523623] text-white hover:bg-[#3D2515] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{initialProduct ? 'Update Piece' : 'Save & Publish Piece'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
