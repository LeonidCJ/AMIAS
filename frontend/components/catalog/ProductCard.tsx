import React from 'react';
import { formatCurrencyPEN } from '../../lib/utils/format-currency';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description?: string | null;
    basePrice: number;
    imageUrl?: string | null;
    concertEvent?: { id: string; name: string; venue: string };
    cut?: { id: string; name: string; grammageGsm: number };
    sizes?: { sizeId: string; label?: string }[];
  };
  onSelect?: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  return (
    <div
      onClick={() => onSelect && onSelect(product.id)}
      className="catalog-item group cursor-pointer font-sans"
    >
      <div className="relative bg-[#f7f7f7] aspect-[4/5] border border-[#e8e8e8] flex items-center justify-center overflow-hidden transition group-hover:border-neutral-400">
        {/* Tour Badge */}
        <span className="absolute top-2.5 left-2.5 bg-[#121212] text-white text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5 z-10">
          {product.concertEvent?.name || 'Gira Oficial'}
        </span>

        {/* Product Visual Mockup / Image */}
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition transform group-hover:scale-105"
          />
        ) : (
          <div className="w-28 h-36 bg-[#121212] text-white flex flex-col items-center justify-center p-3 text-center transition transform group-hover:scale-105 shadow-sm">
            <span className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">
              {product.cut?.name || '24/1 BOXY'}
            </span>
            <span className="text-xs font-bold mt-1 uppercase line-clamp-2">
              {product.name}
            </span>
          </div>
        )}
      </div>

      <div className="pt-3 space-y-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#121212] group-hover:underline">
          {product.name}
        </h3>

        {/* Cut / Silhouette Type */}
        <p className="text-[11px] font-sans text-neutral-500">
          {product.cut ? `${product.cut.name} (${product.cut.grammageGsm}g)` : 'Algodón Reactivo'}
        </p>

        {/* Sizes Available Chips */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {product.sizes.map((s, idx) => (
              <span
                key={s.sizeId || idx}
                className="text-[9px] font-mono border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 rounded text-neutral-700"
              >
                {s.label || 'Talla'}
              </span>
            ))}
          </div>
        )}

        {/* Price formatted in PEN */}
        <p className="text-xs font-bold text-[#121212] pt-1">
          {formatCurrencyPEN(product.basePrice)}
        </p>
      </div>
    </div>
  );
};
