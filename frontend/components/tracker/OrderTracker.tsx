import React from 'react';
import { Check, Scissors, Printer, PackageCheck, Clock } from 'lucide-react';

export interface OrderTrackerProps {
  currentStatus: 'CONFIRMED' | 'IN_CUTTING' | 'DTF_PRINTING' | 'READY' | 'COMPLETED' | 'CANCELLED' | string;
  orderNumber?: string;
  updatedAt?: string | Date;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  currentStatus,
  orderNumber,
  updatedAt,
}) => {
  // Determine step progress level (1 to 4)
  // Stage 1: Confirmado (CONFIRMED)
  // Stage 2: En Corte (IN_CUTTING)
  // Stage 3: DTF (DTF_PRINTING)
  // Stage 4: Listo (READY / COMPLETED)
  let activeStep = 1;

  if (currentStatus === 'CONFIRMED') {
    activeStep = 1;
  } else if (currentStatus === 'IN_CUTTING') {
    activeStep = 2;
  } else if (currentStatus === 'DTF_PRINTING') {
    activeStep = 3;
  } else if (currentStatus === 'READY' || currentStatus === 'COMPLETED') {
    activeStep = 4;
  } else if (currentStatus === 'CANCELLED') {
    activeStep = 0;
  }

  const stages = [
    {
      step: 1,
      code: 'CONFIRMED',
      title: '1. Confirmado',
      description: 'Voucher validado',
      icon: Check,
    },
    {
      step: 2,
      code: 'IN_CUTTING',
      title: '2. En Corte',
      description: 'Patronaje 20/1 y mesa de corte',
      icon: Scissors,
    },
    {
      step: 3,
      code: 'DTF_PRINTING',
      title: '3. DTF',
      description: 'Curado térmico 300 DPI',
      icon: Printer,
    },
    {
      step: 4,
      code: 'READY',
      title: '4. Listo',
      description: 'Control de calidad y entrega',
      icon: PackageCheck,
    },
  ];

  return (
    <div className="bg-white border border-[#e8e8e8] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm font-sans">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e8e8e8] pb-4">
        <div>
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">
            LÍNEA DE CONFECCIÓN EN TALLER AMIAS
          </span>
          <h3 className="text-lg font-bold uppercase text-[#121212] mt-0.5">
            Estado del Pedido {orderNumber || ''}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>
              {currentStatus === 'CONFIRMED'
                ? 'Pago Confirmado'
                : currentStatus === 'IN_CUTTING'
                ? 'En Mesa de Corte'
                : currentStatus === 'DTF_PRINTING'
                ? 'Estampado DTF'
                : currentStatus === 'READY' || currentStatus === 'COMPLETED'
                ? 'Listo para Entrega'
                : 'Procesando'}
            </span>
          </span>
        </div>
      </div>

      {/* 4-Stage Confection Tracker (TR-026) */}
      <div className="py-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
          {stages.map((st) => {
            const isDone = activeStep > st.step;
            const isCurrent = activeStep === st.step;
            const Icon = st.icon;

            return (
              <div
                key={st.step}
                className={`p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-md ring-2 ring-neutral-300'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-neutral-50 text-neutral-400 border-neutral-200 opacity-50'
                }`}
              >
                <div
                  className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center font-bold text-xs mb-2 ${
                    isCurrent
                      ? 'bg-amber-400 text-neutral-950 animate-pulse'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'border border-neutral-300 text-neutral-400'
                  }`}
                >
                  {isDone ? <Check className="w-5 h-5 stroke-[3]" /> : st.step}
                </div>

                <strong className="block font-bold uppercase tracking-wider text-xs mb-0.5">
                  {st.title}
                </strong>
                <span className="text-[10px] block opacity-80 leading-tight">
                  {st.description}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technical Spec Summary Footer */}
      <div className="bg-[#fafafa] border border-neutral-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-neutral-600 font-medium">
          🧵 Algodón Reactivo 24/1 Pesado (240g) • Trazabilidad Industrial AMIAS
        </span>
        <span className="text-neutral-400 font-mono text-[11px]">
          Actualizado: {updatedAt ? new Date(updatedAt).toLocaleDateString('es-PE') : 'Hoy'}
        </span>
      </div>
    </div>
  );
};
