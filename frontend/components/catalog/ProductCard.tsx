import React from 'react';
import { formatCurrencyPEN } from '../../lib/utils/format-currency';
import { Sparkles, Tag, Scissors } from 'lucide-react';

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
      className="catalog-item group cursor-pointer font-sans bg-white p-2.5 rounded-2xl border border-[#e8e8e8] shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="relative bg-[#f7f7f7] aspect-[4/5] border border-[#f0f0f0] rounded-xl flex items-center justify-center overflow-hidden transition group-hover:border-neutral-300">
        {/* Tour Badge */}
        <span className="absolute top-2.5 left-2.5 bg-[#121212]/90 backdrop-blur-sm text-white text-[9px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-lg z-10 flex items-center gap-1 shadow-sm">
          <Sparkles className="w-2.5 h-2.5 text-amber-300" />
          <span>{product.concertEvent?.name || 'Gira Oficial'}</span>
        </span>

        {/* Product Image / Mockup */}
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition transform group-hover:scale-105 rounded-xl"
          />
        ) : (
          <div className="w-28 h-36 bg-[#121212] text-white rounded-xl flex flex-col items-center justify-center p-3 text-center transition transform group-hover:scale-105 shadow-md">
            <span className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase flex items-center gap-1">
              <Scissors className="w-2.5 h-2.5" />
              {product.cut?.name || '24/1 BOXY'}
            </span>
            <span className="text-xs font-bold mt-1 uppercase line-clamp-2">
              {product.name}
            </span>
          </div>
        )}
      </div>

      <div className="pt-3 px-1 space-y-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#121212] group-hover:underline">
          {product.name}
        </h3>

        {/* Cut / Silhouette Info */}
        <p className="text-[11px] text-neutral-500 flex items-center gap-1">
          <Tag className="w-3 h-3 text-neutral-400" />
          <span>{product.cut ? `${product.cut.name} (${product.cut.grammageGsm}g)` : 'Algodón Reactivo'}</span>
        </p>

        {/* Size Chips */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {product.sizes.map((s, idx) => (
              <span
                key={s.sizeId || idx}
                className="text-[9px] font-mono border border-neutral-200 bg-neutral-50 px-2 py-0.5 rounded-md text-neutral-700 font-semibold"
              >
                {s.label || 'Talla'}
              </span>
            ))}
          </div>
        )}

        {/* Price Formatted in PEN */}
        <p className="text-xs font-extrabold text-[#121212] pt-1">
          {formatCurrencyPEN(product.basePrice)}
        </p>
      </div>
    </div>
  );
};
