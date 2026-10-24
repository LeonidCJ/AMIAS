'use client';

import React from 'react';
import { Header } from '../../components/layout/Header';
import { Sparkles, Ruler } from 'lucide-react';

export default function AboutPageShell() {
  return (
    <div className="min-h-screen bg-white text-[#121212] font-sans selection:bg-neutral-900 selection:text-white flex flex-col justify-between">
      {/* Top Announcement Bar */}
      <div className="bg-[#121212] text-white text-[11px] tracking-[0.15em] uppercase text-center py-2.5 px-4 font-semibold flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>Envíos garantizados antes del show • Lima 2026 • Algodón 24/1 Reactivo</span>
      </div>

      {/* Global Header */}
      <Header />

      {/* Main Content — Estructura Base de #view-about del Prototipo */}
      <main className="max-w-5xl mx-auto px-6 lg:px-12 py-10 space-y-12 flex-1 w-full">
        <div className="border-b border-[#e8e8e8] pb-6 text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">
            PROCESO TEXTIL & TALLER
          </span>
          <h1 className="text-3xl font-bold uppercase tracking-tight text-[#121212]">
            About AMIAS
          </h1>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Taller textil en Lima especializado en indumentaria para eventos masivos y streetwear. Unificamos confección en algodón reactivo 24/1 pesado con impresión DTF de alta definición.
          </p>
        </div>

        {/* Apartado: Guía de Patronaje Boxy */}
        <div className="border border-[#e8e8e8] rounded-3xl p-6 lg:p-8 space-y-4 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#121212] flex items-center gap-2">
              <Ruler className="w-4 h-4 text-neutral-700" />
              <span>Guía de Patronaje Boxy (Medidas en cm)</span>
            </h3>
            <span className="text-[10px] font-mono uppercase text-neutral-400">
              ESPECIFICACIÓN DE TALLER
            </span>
          </div>

          <div className="p-8 border border-dashed border-neutral-200 rounded-2xl text-center text-xs text-neutral-400">
            Apartado reservado para la tabla comparativa de medidas anatómicas (Talla, Ancho Pecho, Largo Total, Caída Hombro).
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e8e8e8] bg-[#fbfbfb] py-8 text-center text-[11px] text-neutral-400">
        © 2026 AMIAS Textile Studio. Todos los derechos reservados. Lima, Perú.
      </footer>
    </div>
  );
}
