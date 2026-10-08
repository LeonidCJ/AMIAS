'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '../../../components/layout/Header';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Scissors,
  Check,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { formatCurrencyPEN } from '../../../lib/utils/format-currency';

interface ProductDetail {
  id: string;
  name: string;
  description?: string | null;
  basePrice: number;
  concertEvent?: { id: string; name: string; venue: string };
  cut?: { id: string; name: string; grammageGsm: number };
  sizes?: { sizeId: string; label?: string }[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interactive Customization State
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string }>({
    name: 'Negro Reactivo',
    hex: '#121212',
  });
  const [selectedSize, setSelectedSize] = useState<string>('L');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/products`);
        if (res.ok) {
          const products: ProductDetail[] = await res.json();
          // Find matching product by ID or return first product as fallback
          const found = products.find((p) => p.id === productId) || products[0];
          if (found) {
            setProduct(found);
            if (found.sizes && found.sizes.length > 0) {
              setSelectedSize(found.sizes[0].label || 'L');
            }
          } else {
            throw new Error('Prenda no encontrada.');
          }
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar la prenda.');
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [API_BASE, productId]);

  const handleProceedToCheckout = () => {
    if (!product) return;
    const sizeObj = product.sizes?.find((s) => s.label === selectedSize);
    const sizeId = sizeObj?.sizeId || 'size-l';

    // Navigate to /checkout with pre-selected item parameters
    const query = new URLSearchParams({
      productId: product.id,
      productName: product.name,
      sizeId: sizeId,
      sizeLabel: selectedSize,
      colorName: selectedColor.name,
      price: String(product.basePrice),
    });

    router.push(`/checkout?${query.toString()}`);
  };

  const colors = [
    { name: 'Negro Reactivo', hex: '#121212' },
    { name: 'Blanco Óptico', hex: '#f4f4f5' },
    { name: 'Beige Crudo', hex: '#d8ccc0' },
  ];

  return (
    <div className="min-h-screen bg-white text-[#121212] font-sans selection:bg-neutral-900 selection:text-white flex flex-col justify-between">
      {/* Top Banner */}
      <div className="bg-[#121212] text-white text-[11px] tracking-[0.15em] uppercase text-center py-2.5 px-4 font-semibold flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>CONFECCIÓN OFICIAL AMIAS • ALGODÓN REACTIVO 24/1 PESADO (240G)</span>
      </div>

      <Header />

      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-8 flex-1 w-full">
        {/* Back Link */}
        <button
          onClick={() => router.push('/catalog')}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-600 hover:text-neutral-950 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </button>

        {loading && (
          <div className="py-24 text-center text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Cargando especificaciones de la prenda...
          </div>
        )}

        {error && (
          <div className="p-6 bg-red-50 border border-red-300 rounded-2xl text-red-800 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* Vercel-style Dark Stage Container matching login_user_normal.html */}
        {!loading && product && (
          <div className="bg-black text-white p-8 sm:p-12 lg:p-16 border border-neutral-800 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Garment Vector Preview & Color Controls */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-8">
                <div className="relative w-72 h-84 sm:w-80 sm:h-96 flex flex-col items-center justify-center">
                  <div className="relative w-full h-full flex items-center justify-center transition-all duration-300">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-72 h-72 sm:w-80 sm:h-80 drop-shadow-2xl transition-colors duration-300"
                      fill={selectedColor.hex}
                      stroke={selectedColor.hex === '#f4f4f5' ? '#e4e4e7' : '#333333'}
                      strokeWidth="0.3"
                    >
                      <path
                        d="M16 2l4 4-2.5 4.5-2.5-1.5V21H9V9L6.5 10.5 4 6l4-4h2a3 3 0 0 0 6 0h2z"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-12">
                      <svg
                        viewBox="0 0 100 100"
                        className={`w-36 h-36 stroke-[1.2] opacity-90 transition-all duration-300 ${
                          selectedColor.hex === '#f4f4f5' ? 'stroke-neutral-900/80' : 'stroke-white/80'
                        }`}
                        fill="none"
                      >
                        <ellipse cx="50" cy="50" rx="38" ry="18" transform="rotate(-25 50 50)" />
                        <ellipse cx="50" cy="50" rx="38" ry="18" transform="rotate(15 50 50)" />
                        <ellipse cx="50" cy="50" rx="38" ry="18" transform="rotate(55 50 50)" />
                        <ellipse cx="50" cy="50" rx="38" ry="18" transform="rotate(-65 50 50)" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Color Swatch Thumbnails */}
                <div className="flex items-center gap-3 pt-2">
                  {colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c)}
                      className={`w-14 h-14 rounded-xl flex items-center justify-center p-1 transition border-2 ${
                        selectedColor.name === c.name
                          ? 'border-blue-600 scale-105 shadow-md'
                          : 'border-neutral-800 hover:border-neutral-600'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      <span
                        className={`text-[9px] font-mono uppercase font-bold ${
                          c.hex === '#f4f4f5' ? 'text-neutral-900' : 'text-white'
                        }`}
                      >
                        {c.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Specifications & Action Sidebar */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] font-bold text-neutral-400 block mb-1">
                    {product.concertEvent?.name || 'Coldplay Lima 2026'}
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
                    {product.name}
                  </h1>

                  <div className="mt-3">
                    <span className="inline-block bg-[#2563eb] text-white text-xs font-bold px-3.5 py-1.5 rounded-full font-mono shadow-md">
                      {formatCurrencyPEN(product.basePrice)}
                    </span>
                  </div>
                </div>

                <hr className="border-neutral-800" />

                {/* Cut Specs */}
                <div className="space-y-1 text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 block">
                    Silueta & Densidad
                  </span>
                  <p className="text-neutral-200 font-semibold">
                    {product.cut?.name || 'Jersey Algodón 20/1 Oversize Boxy'} ({product.cut?.grammageGsm || 240}g GSM)
                  </p>
                </div>

                {/* Color Choice */}
                <div className="space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 block">
                    Color Seleccionado
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {colors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold transition border ${
                          selectedColor.name === c.name
                            ? 'border-2 border-blue-600 bg-neutral-900 text-white shadow-sm'
                            : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Choice */}
                <div className="space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 block">
                    Talla Seleccionada
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {['S', 'M', 'L', 'XL'].map((sLabel) => (
                      <button
                        key={sLabel}
                        onClick={() => setSelectedSize(sLabel)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition border ${
                          selectedSize === sLabel
                            ? 'border-2 border-blue-600 bg-neutral-900 text-white shadow-sm'
                            : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {sLabel}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Proceed Button */}
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-4 rounded-full bg-[#2563eb] hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition transform active:scale-95"
                >
                  <span>Continuar al Pago / Realizar Pedido</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e8e8e8] bg-[#fbfbfb] py-6 text-center text-[11px] text-neutral-400">
        © 2026 AMIAS Textile Studio. Todos los derechos reservados. Lima, Perú.
      </footer>
    </div>
  );
}
