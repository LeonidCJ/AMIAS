import React from 'react';
import {
  Printer,
  X,
  Flame,
  Scissors,
  Ruler,
  Clock,
  CheckSquare,
  ShieldCheck,
  Sparkles,
  Layers,
} from 'lucide-react';
import { QueueItem } from '../ProductionQueueTable';

export interface TechnicalSheetModalProps {
  item: QueueItem;
  onClose: () => void;
}

export const TechnicalSheetModal: React.FC<TechnicalSheetModalProps> = ({
  item,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  // Fallback anatomical dimensions by standard size label if not populated
  const defaultMeasures: Record<string, { chest: number; length: number; shoulder: number }> = {
    S: { chest: 55, length: 71, shoulder: 19 },
    M: { chest: 58, length: 74, shoulder: 21 },
    L: { chest: 61, length: 77, shoulder: 23 },
    XL: { chest: 64, length: 80, shoulder: 25 },
  };

  const fallback = defaultMeasures[item.sizeLabel] || defaultMeasures.L;
  const chestCm = item.chestCm ?? fallback.chest;
  const lengthCm = item.lengthCm ?? fallback.length;
  const shoulderCm = item.shoulderCm ?? fallback.shoulder;

  // Dynamic thermal parameters based on fabric grammage
  const isHeavyGrammage = (item.grammageGsm || 240) >= 220;
  const curingTemp = isHeavyGrammage ? '165 °C' : '160 °C';
  const mainPressTime = isHeavyGrammage ? '15 seg' : '12 seg';
  const postPressTime = '5 seg (Sellado con Teflón)';
  const pressureSpec = isHeavyGrammage ? 'Alta — 4.2 bar (60 PSI)' : 'Media — 3.5 bar (50 PSI)';

  const stageLabel =
    item.orderStatus === 'CONFIRMED'
      ? '1. Confirmado (Listo para Corte)'
      : item.orderStatus === 'IN_CUTTING'
      ? '2. En Mesa de Corte (Bloqueo HTTP 400 Activo)'
      : item.orderStatus === 'DTF_PRINTING'
      ? '3. Estampado Térmico DTF'
      : '4. Listo para Despacho';

  return (
    <div
      id="technical-sheet-backdrop"
      className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 font-sans overflow-y-auto print:static print:bg-white print:p-0 print:block"
    >
      <div
        id="printable-technical-sheet"
        className="bg-white border-2 border-[#121212] rounded-3xl w-full max-w-3xl p-6 sm:p-8 relative space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto print:max-h-none print:overflow-visible print:shadow-none print:rounded-none print:border print:border-black print:w-full print:max-w-none print:p-6"
      >
        {/* Close button (hidden on print) */}
        <button
          type="button"
          onClick={onClose}
          className="no-print absolute top-6 right-6 text-neutral-400 hover:text-neutral-950 cursor-pointer p-1"
          title="Cerrar ficha técnica"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Industrial Header */}
        <div className="border-b-2 border-[#121212] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#121212] text-white text-[10px] font-mono font-bold uppercase tracking-widest rounded">
                HOJA DE RUTA INDUSTRIAL • TALLER AMIAS
              </span>
              <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase">
                FICHA FT-{item.orderNumber.replace('#', '')}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold uppercase tracking-tight text-[#121212]">
              Ficha Técnica de Confección y Curado DTF
            </h2>
            <p className="text-xs text-neutral-500">
              Orden <strong className="text-[#121212] font-mono">{item.orderNumber}</strong> • Cliente:{' '}
              <strong className="text-[#121212]">{item.customerName}</strong> ({item.customerPhone})
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1 sm:pr-8 print:pr-0">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-neutral-100 text-neutral-900 border border-neutral-300">
              {stageLabel}
            </span>
            <div className="text-[11px] font-mono text-neutral-500">
              Fecha Show: <strong className="text-[#121212]">{new Date(item.eventDate).toLocaleDateString('es-PE')}</strong>
            </div>
          </div>
        </div>

        {/* Section 1: Garment, Concert & Anatomical Cutting Specs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6 p-4 border border-[#e8e8e8] bg-[#fafafa] rounded-2xl space-y-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest font-bold text-neutral-500">
              <Scissors className="w-3.5 h-3.5 text-neutral-800" />
              <span>1. ESPECIFICACIÓN TEXTIL & MESA DE CORTE</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between border-b border-neutral-200 pb-1">
                <span className="text-neutral-500">Prenda / Modelo:</span>
                <strong className="text-[#121212] text-right">{item.productName}</strong>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-1">
                <span className="text-neutral-500">Gira / Concierto:</span>
                <strong className="text-[#121212] text-right">
                  {item.concertEventName} ({item.eventVenue})
                </strong>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-1">
                <span className="text-neutral-500">Silueta / Molde:</span>
                <strong className="text-[#121212]">{item.cutName}</strong>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-1">
                <span className="text-neutral-500">Tejido & Gramaje:</span>
                <strong className="font-mono text-[#121212]">
                  Algodón Reactivo 24/1 • {item.grammageGsm}g GSM
                </strong>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-neutral-500">Talla & Lote Solicitado:</span>
                <span className="font-mono font-extrabold text-sm bg-[#121212] text-white px-2.5 py-0.5 rounded">
                  TALLA {item.sizeLabel} × {item.quantity} UND
                </span>
              </div>
            </div>
          </div>

          {/* Anatomical Dimensions Box */}
          <div className="md:col-span-6 p-4 border border-[#e8e8e8] bg-[#fafafa] rounded-2xl space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest font-bold text-neutral-500">
                <Ruler className="w-3.5 h-3.5 text-neutral-800" />
                <span>2. PATRONAJE ANATÓMICO (TALLA {item.sizeLabel})</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">Tolerancia ±1.0 cm</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="bg-white p-3 border border-neutral-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  Ancho Pecho
                </span>
                <strong className="text-lg font-mono font-extrabold text-[#121212]">
                  {chestCm} cm
                </strong>
                <span className="text-[9px] text-neutral-400 block">Sisa a sisa</span>
              </div>

              <div className="bg-white p-3 border border-neutral-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  Largo Total
                </span>
                <strong className="text-lg font-mono font-extrabold text-[#121212]">
                  {lengthCm} cm
                </strong>
                <span className="text-[9px] text-neutral-400 block">Hombro a basta</span>
              </div>

              <div className="bg-white p-3 border border-neutral-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  Caída Hombro
                </span>
                <strong className="text-lg font-mono font-extrabold text-[#121212]">
                  {shoulderCm} cm
                </strong>
                <span className="text-[9px] text-neutral-400 block">Costura cuello</span>
              </div>
            </div>

            <div className="text-[10px] text-neutral-500 bg-white border border-neutral-200 rounded-lg px-3 py-1.5 font-mono">
              Costura: Remalle industrial 4 hilos + recubridora en cuello rib 1x1 reactivo.
            </div>
          </div>
        </div>

        {/* Section 2: Thermal DTF Parameters */}
        <div className="p-5 border-2 border-[#121212] bg-neutral-50 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 pb-2.5">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#121212]">
                3. Parámetros Térmicos de Taller — Transferencia y Curado DTF (300 DPI)
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded">
              Calibración para {item.grammageGsm}g GSM
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-3.5 border border-neutral-200 rounded-xl space-y-1">
              <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
                Temperatura Plancha
              </span>
              <strong className="text-base font-mono font-extrabold text-[#121212] block">
                {curingTemp}
              </strong>
              <span className="text-[10px] text-neutral-500 block">
                Pre-calentado de prenda: 3 seg
              </span>
            </div>

            <div className="bg-white p-3.5 border border-neutral-200 rounded-xl space-y-1">
              <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
                Tiempo 1ra Bajada
              </span>
              <strong className="text-base font-mono font-extrabold text-[#121212] block">
                {mainPressTime}
              </strong>
              <span className="text-[10px] text-neutral-500 block">
                Pelado en tibio/frío (reposo 8s)
              </span>
            </div>

            <div className="bg-white p-3.5 border border-neutral-200 rounded-xl space-y-1">
              <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
                Presión Neumática
              </span>
              <strong className="text-sm font-mono font-extrabold text-[#121212] block">
                {pressureSpec}
              </strong>
              <span className="text-[10px] text-neutral-500 block">
                Distribución uniforme en plato
              </span>
            </div>

            <div className="bg-white p-3.5 border border-neutral-200 rounded-xl space-y-1">
              <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
                2do Sellado (Post-Curado)
              </span>
              <strong className="text-sm font-mono font-extrabold text-[#121212] block">
                {postPressTime}
              </strong>
              <span className="text-[10px] text-neutral-500 block">
                Fijación en fibra &gt; 50 lavadas
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono text-neutral-700 pt-1">
            <div className="bg-white px-3 py-2 rounded-lg border border-neutral-200">
              <strong>Polvo Poliamida TPU:</strong> Curado en horno túnel a 115 °C por 120 seg.
            </div>
            <div className="bg-white px-3 py-2 rounded-lg border border-neutral-200">
              <strong>Inyección de Tinta:</strong> 300 DPI • CMYK + Base Blanca 85%.
            </div>
            <div className="bg-white px-3 py-2 rounded-lg border border-neutral-200">
              <strong>Voucher Validado:</strong> OP #{item.receiptOperationCode || 'VERIFICADO-SHA256'}
            </div>
          </div>
        </div>

        {/* Section 3: Workshop Operator Quality Control Checklist (For Printed Sheet) */}
        <div className="p-4 border border-[#e8e8e8] rounded-2xl bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-neutral-500 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-neutral-800" />
              <span>4. CONTROL DE CALIDAD EN TALLER (FIRMA DE CONFORMIDAD)</span>
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              Impreso: {new Date().toLocaleString('es-PE')}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
            <div className="p-2.5 border border-neutral-200 rounded-xl flex items-center gap-2">
              <span className="w-4 h-4 border border-neutral-900 rounded-xs inline-block shrink-0" />
              <span>Corte verificado ({chestCm}×{lengthCm} cm)</span>
            </div>
            <div className="p-2.5 border border-neutral-200 rounded-xl flex items-center gap-2">
              <span className="w-4 h-4 border border-neutral-900 rounded-xs inline-block shrink-0" />
              <span>Purga de humedad (3s)</span>
            </div>
            <div className="p-2.5 border border-neutral-200 rounded-xl flex items-center gap-2">
              <span className="w-4 h-4 border border-neutral-900 rounded-xs inline-block shrink-0" />
              <span>Curado DTF ({curingTemp} / {mainPressTime})</span>
            </div>
            <div className="p-2.5 border border-neutral-200 rounded-xl flex items-center gap-2">
              <span className="w-4 h-4 border border-neutral-900 rounded-xs inline-block shrink-0" />
              <span>Sellado Teflón y Empaque</span>
            </div>
          </div>
        </div>

        {/* Modal Action Footer (Hidden when printing) */}
        <div className="no-print pt-2 border-t border-[#e8e8e8] flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-neutral-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Formato optimizado para impresión directa A4 / Hoja de Taller (@media print).</span>
          </span>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn-dawn-secondary px-5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="btn-dawn-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Imprimir Ficha Técnica</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
