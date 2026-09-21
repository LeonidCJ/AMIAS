'use client';

import React, { useEffect, useState } from 'react';
import { ProductCard } from '../../components/catalog/ProductCard';

interface ConcertEvent {
  id: string;
  name: string;
  venue: string;
}

interface Product {
  id: string;
  name: string;
  description?: string | null;
  basePrice: number;
  concertEventId: string;
  cutId: string;
  imageUrl?: string | null;
  concertEvent?: { id: string; name: string; venue: string };
  cut?: { id: string; name: string; grammageGsm: number };
  sizes?: { sizeId: string; label?: string }[];
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [tours, setTours] = useState<ConcertEvent[]>([]);
  const [activeTourId, setActiveTourId] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [resProducts, resTours] = await Promise.all([
          fetch(`${API_BASE}/products`),
          fetch(`${API_BASE}/concert-events`),
        ]);

        if (!resProducts.ok || !resTours.ok) {
          throw new Error('No se pudo cargar la información del catálogo.');
        }

        const dataProducts = await resProducts.json();
        const dataTours = await resTours.json();

        setProducts(dataProducts);
        setTours(dataTours);
      } catch (err: any) {
        setError(err.message || 'Error al conectar con el servidor.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [API_BASE]);

  const filteredProducts = activeTourId === 'all'
    ? products
    : products.filter((p) => p.concertEventId === activeTourId);

  return (
    <div className="min-h-screen bg-white text-[#121212] font-sans">
      <!-- Announcement Bar -->
      <div className="bg-[#121212] text-white text-[11px] tracking-[0.15em] uppercase text-center py-2.5 px-4 font-semibold">
        Envíos garantizados antes del show • Lima 2026 • Algodón 24/1 Reactivo
      </div>

      <!-- Header -->
      <header className="border-b border-[#e8e8e8] bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <div>
            <span className="text-2xl font-extrabold tracking-[-0.04em] uppercase block leading-none">AMIAS</span>
            <span className="text-[10px] tracking-[0.25em] text-neutral-400 uppercase font-sans mt-1 block">Textile Studio Lima</span>
          </div>
          <nav className="flex items-center gap-6 text-xs uppercase tracking-[0.14em] font-semibold text-neutral-700">
            <span className="py-1 border-b-2 border-[#121212] text-[#121212]">Catálogo Público</span>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-10">
        <!-- Catalog Header Banner -->
        <section className="bg-[#f6f6f6] border border-[#e8e8e8] p-8 sm:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-neutral-500 block">
              AMIAS COLECCIONES 2026
            </span>
            <h1 class="text-3xl sm:text-4xl font-bold tracking-[-0.03em] uppercase text-[#121212]">
              Catálogo de Conciertos
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Selecciona cualquier prenda confeccionada en algodón reactivo 24/1 de alta densidad para eventos oficiales.
            </p>
          </div>
        </section>

        {/* Dynamic Tour Filter Tabs (TR-020) */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e8e8e8] pb-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs uppercase tracking-wider font-semibold">
              <button
                onClick={() => setActiveTourId('all')}
                className={`px-4 py-1.5 border transition ${
                  activeTourId === 'all'
                    ? 'border-[#121212] bg-[#121212] text-white'
                    : 'border-[#e8e8e8] text-neutral-700 hover:border-neutral-950'
                }`}
              >
                Todas las Giras
              </button>

              {tours.map((tour) => (
                <button
                  key={tour.id}
                  onClick={() => setActiveTourId(tour.id)}
                  className={`px-4 py-1.5 border transition whitespace-nowrap ${
                    activeTourId === tour.id
                      ? 'border-[#121212] bg-[#121212] text-white'
                      : 'border-[#e8e8e8] text-neutral-700 hover:border-neutral-950'
                  }`}
                >
                  {tour.name}
                </button>
              ))}
            </div>

            <span className="text-xs text-neutral-400">
              Mostrando {filteredProducts.length} prenda{filteredProducts.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Loading / Error States */}
          {loading && (
            <div className="py-16 text-center text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Cargando prendas del catálogo...
            </div>
          )}

          {error && (
            <div className="py-8 p-4 border border-red-200 bg-red-50 text-red-700 text-xs font-semibold rounded">
              {error}
            </div>
          )}

          {/* Adaptive Product Grid (TR-020) */}
          {!loading && !error && (
            filteredProducts.length === 0 ? (
              <div className="py-16 text-center text-xs font-body text-neutral-500 border border-dashed border-neutral-300 p-8">
                No hay prendas disponibles para la gira seleccionada.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )
          )}
        </section>
      </main>

      <!-- Footer -->
      <footer className="border-t border-[#e8e8e8] bg-[#fbfbfb] mt-16 py-8 text-center text-[11px] text-neutral-400">
        © 2026 AMIAS. Todos los derechos reservados. Lima, Perú.
      </footer>
    </div>
  );
}
