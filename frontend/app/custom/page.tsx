'use client';

import React from 'react';
import { Header } from '../../components/layout/Header';
import { Sparkles, Layers, Calculator } from 'lucide-react';

export default function CustomizerPageShell() {
  return (
    <div className="min-h-screen bg-white text-[#121212] font-sans selection:bg-neutral-900 selection:text-white flex flex-col justify-between">
      {/* Top Announcement Bar */}
      <div className="bg-[#121212] text-white text-[11px] tracking-[0.15em] uppercase text-center py-2.5 px-4 font-semibold flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>Envíos garantizados antes del show • Lima 2026 • Algodón 24/1 Reactivo</span>
      </div>

      {/* Global Header */}
      <Header />

      {/* Main Content — Estructura Base de #view-custom del Prototipo */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-10 flex-1 w-full">
        {/* Cabecera Principal */}
        <div className="border-b border-[#e8e8e8] pb-4">
          <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">
            HERRAMIENTA A MEDIDA
          </span>
          <h1 className="text-3xl font-bold uppercase tracking-[-0.02em] text-[#121212] mt-0.5">
            Personalizados
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Configura patronaje, color de tela, ubicación de estampa y carga tu archivo gráfico.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Apartado Izquierdo: Lienzo Canvas SVG (Semana 13) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-[#f7f7f7] border border-[#e8e8e8] rounded-3xl min-h-[420px] flex flex-col justify-between p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-[#e8e8e8] pb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest bg-white border border-[#e8e8e8] px-3 py-1 rounded-full text-neutral-600 font-bold">
                  PATRÓN: OVERSIZE BOXY
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                  SEMANA 13
                </span>
              </div>

              {/* Contenedor vacío para el Lienzo Canvas SVG */}
              <div className="my-auto py-16 text-center space-y-2 border border-dashed border-neutral-300 rounded-2xl bg-white/60 p-6">
                <Layers className="w-6 h-6 text-neutral-400 mx-auto" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Lienzo Canvas SVG Interactivo — Previsualización y Maquetación DTF
                </h2>
                <p className="text-[11px] text-neutral-400 max-w-sm mx-auto">
                  Apartado reservado para el posicionamiento interactivo y previsualización vectorial de estampados DTF.
                </p>
              </div>

              <div className="w-full flex items-center justify-between text-xs text-neutral-500 border-t border-[#e8e8e8] pt-4">
                <span>Jersey Reactivo 24/1 Pesado (240g)</span>
                <span className="font-semibold text-neutral-900">Talla: —</span>
              </div>
            </div>

            {/* Apartado de Carga de Arte 300 DPI */}
            <div className="border border-dashed border-[#cccccc] bg-[#fbfbfb] rounded-2xl p-6 text-center space-y-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#121212] block">
                Adjuntar Archivo Gráfico (PNG / PDF 300 DPI)
              </span>
              <span className="text-[11px] text-neutral-400 block">
                Formato transparente para DTF industrial (Pendiente de activación)
              </span>
            </div>
          </div>

          {/* Apartado Derecho: Opciones de Configuración y Motor Dinámico (Semana 14) */}
          <div className="lg:col-span-6 space-y-6 border border-[#e8e8e8] rounded-3xl p-6 sm:p-8 bg-white shadow-xs">
            <div className="border-b border-[#f0f0f0] pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold block">
                  CONFIGURADOR TÉCNICO
                </span>
                <h2 className="text-lg font-bold uppercase tracking-tight text-[#121212]">
                  Parámetros de Estampado y Cotización
                </h2>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                SEMANA 14
              </span>
            </div>

            {/* Sub-apartado: Corte */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-[0.15em] font-bold text-neutral-700 block">
                1. Corte / Silueta
              </span>
              <div className="p-4 border border-dashed border-neutral-200 rounded-xl text-xs text-neutral-400 text-center">
                Selector de corte (Oversize Boxy / Regular Fit) — Sin contenido por ahora
              </div>
            </div>

            {/* Sub-apartado: Color */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-[0.15em] font-bold text-neutral-700 block">
                2. Color Reactivo
              </span>
              <div className="p-4 border border-dashed border-neutral-200 rounded-xl text-xs text-neutral-400 text-center">
                Selector de color de prenda (Negro / Blanco / Beige) — Sin contenido por ahora
              </div>
            </div>

            {/* Sub-apartado: Área de Impresión DTF */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-[0.15em] font-bold text-neutral-700 block">
                3. Área de Impresión DTF
              </span>
              <div className="p-4 border border-dashed border-neutral-200 rounded-xl text-xs text-neutral-400 text-center">
                Selector de zona DTF (Bolsillo 10×10 / Pecho A4 / Espalda A3) — Sin contenido por ahora
              </div>
            </div>

            {/* Sub-apartado: Motor de Recálculo Dinámico */}
            <div className="border-t border-[#e8e8e8] pt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">
                  Total Calculado (Motor Dinámico)
                </span>
                <span className="text-xl font-bold text-neutral-400 font-mono flex items-center gap-1.5 mt-0.5">
                  <Calculator className="w-4 h-4" />
                  <span>S/ — PEN</span>
                </span>
              </div>
              <button
                type="button"
                disabled
                className="btn-dawn-primary px-6 py-3.5 text-xs font-bold uppercase tracking-wider opacity-40 cursor-not-allowed"
              >
                Confirmar por WhatsApp →
              </button>
            </div>
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
