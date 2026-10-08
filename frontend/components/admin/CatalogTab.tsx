import React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Tag } from 'lucide-react';
import { formatCurrencyPEN } from '../../lib/utils/format-currency';

export interface ProductItem {
  id: string;
  name: string;
  description?: string | null;
  basePrice: number;
  concertEventId: string;
  cutId: string;
  imageUrl?: string | null;
  concertEvent?: { id: string; name: string; venue: string };
  cut?: { id: string; name: string; grammageGsm: number };
}

export interface CatalogTabProps {
  products: ProductItem[];
  onSelectDeleteProduct: (product: ProductItem) => void;
}

export const CatalogTab: React.FC<CatalogTabProps> = ({
  products,
  onSelectDeleteProduct,
}) => {
  const router = useRouter();

  return (
    <div className="space-y-6 font-sans">
      <div className="border border-[#e8e8e8] p-6 lg:p-8 bg-white rounded-3xl space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#f0f0f0] pb-4 gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
              ADMINISTRADOR DEL CATÁLOGO
            </span>
            <h2 className="text-xl font-bold uppercase tracking-wider text-[#121212] mt-0.5">
              Prendas de Concierto en Tienda
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Publicación y retiro de prendas del catálogo oficial de AMIAS.
            </p>
          </div>

          <button
            onClick={() => router.push('/admin/products/new')}
            className="btn-dawn-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Publicar Nueva Prenda</span>
          </button>
        </div>

        {/* Product Cards Grid with Delete Option */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.length === 0 ? (
            <p className="col-span-full py-8 text-center text-xs text-neutral-400">
              No hay prendas publicadas en el catálogo.
            </p>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className="p-5 border border-[#e8e8e8] bg-[#fafafa] rounded-2xl space-y-4 hover:border-neutral-900 transition flex flex-col justify-between shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-neutral-400 block flex items-center gap-1">
                      <Tag className="w-3 h-3 text-neutral-400" />
                      {product.concertEvent?.name || 'Gira Oficial'}
                    </span>

                    <button
                      onClick={() => onSelectDeleteProduct(product)}
                      title="Quitar Prenda del Catálogo"
                      className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <strong className="text-sm font-bold text-[#121212] block">
                    {product.name}
                  </strong>
                  <p className="text-xs font-mono text-neutral-500">
                    Corte: <strong className="text-neutral-900">{product.cut?.name || 'Oversize Boxy'}</strong>
                  </p>
                </div>

                <div className="pt-2 border-t border-[#e8e8e8] flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#121212] font-mono">
                    {formatCurrencyPEN(product.basePrice)}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    En Tienda
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
