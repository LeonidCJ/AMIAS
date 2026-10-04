import React from 'react';
import { Check, Scissors, Printer, PackageCheck, Clock } from 'lucide-react';

export interface OrderTrackerProps {
  currentStatus: 'PENDING' | 'PAID' | 'IN_PRODUCTION' | 'COMPLETED' | 'CANCELLED' | string;
  orderNumber?: string;
  updatedAt?: string | Date;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  currentStatus,
  orderNumber,
  updatedAt,
}) => {
  // Determine step progress level (0 to 4)
  // Stage 1: Pago Confirmado
  // Stage 2: En Corte
  // Stage 3: Estampado DTF
  // Stage 4: Listo para Entrega
  let activeStep = 1;

  if (currentStatus === 'PAID') {
    activeStep = 1;
  } else if (currentStatus === 'IN_PRODUCTION') {
    activeStep = 3; // In production covers both Corte & DTF
  } else if (currentStatus === 'COMPLETED') {
    activeStep = 4;
  } else if (currentStatus === 'CANCELLED') {
    activeStep = 0;
  }

  const stages = [
    {
      step: 1,
      title: 'Pago Confirmado',
      description: 'Voucher validado con SHA-256',
      icon: Check,
    },
    {
      step: 2,
      title: 'En Corte',
      description: 'Patronaje 20/1 y corte de tela',
      icon: Scissors,
    },
    {
      step: 3,
      title: 'Estampado DTF',
      description: 'Curado térmico 300 DPI',
      icon: Printer,
    },
    {
      step: 4,
      title: 'Listo para Entrega',
      description: 'Control de calidad y empaque',
      icon: PackageCheck,
    },
  ];

  return (
    <div className="bg-white border border-[#e8e8e8] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm font-sans">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e8e8e8] pb-4">
        <div>
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">
            TRACKER DE CONFECCIÓN EN TIEMPO REAL
          </span>
          <h3 className="text-lg font-bold uppercase text-[#121212] mt-0.5">
            Estado del Pedido {orderNumber || ''}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-neutral-100 text-neutral-800 border border-neutral-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {currentStatus === 'COMPLETED'
                ? 'Listo para Retiro/Delivery'
                : currentStatus === 'CANCELLED'
                ? 'Cancelado'
                : 'En Proceso de Taller'}
            </span>
          </span>
        </div>
      </div>

      {/* 4-Stage Progress Bar (TR-026) */}
      <div className="relative py-4">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1.5 bg-neutral-100 rounded-full z-0 hidden sm:block" />

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative z-10">
          {stages.map((st) => {
            const isDone = activeStep > st.step;
            const isCurrent = activeStep === st.step;
            const Icon = st.icon;

            return (
              <div key={st.step} className="flex sm:flex-col items-center gap-3 sm:text-center">
                {/* Numbered Step Circle */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-sm transition-all duration-300 shadow-sm ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-[#121212] text-white ring-4 ring-neutral-200 scale-105'
                      : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                  }`}
                >
                  {isDone ? <Check className="w-6 h-6 stroke-[3]" /> : <Icon className="w-5 h-5" />}
                </div>

                {/* Stage Title & Description */}
                <div className="space-y-0.5">
                  <h4
                    className={`text-xs uppercase font-bold tracking-wider ${
                      isCurrent || isDone ? 'text-[#121212]' : 'text-neutral-400'
                    }`}
                  >
                    0{st.step}. {st.title}
                  </h4>
                  <p className="text-[10px] text-neutral-400 leading-tight">
                    {st.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info Badge */}
      <div className="bg-[#fafafa] border border-neutral-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-neutral-600 font-medium">
          🧵 Taller Lima: Confección en algodón reactivo 24/1 pesado (240g).
        </span>
        <span className="text-neutral-400 font-mono text-[11px]">
          Última actualización: {updatedAt ? new Date(updatedAt).toLocaleDateString('es-PE') : 'Hoy'}
        </span>
      </div>
    </div>
  );
};
