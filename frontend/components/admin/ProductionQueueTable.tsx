import React from 'react';
import { Download, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatCurrencyPEN } from '../../lib/utils/format-currency';

export interface QueueItem {
  orderId: string;
  orderNumber: string;
  orderCreatedAt: string;
  customerName: string;
  customerPhone: string;
  orderStatus: 'CONFIRMED' | 'IN_CUTTING' | 'DTF_PRINTING' | 'READY' | 'COMPLETED' | 'CANCELLED' | string;
  itemId: string;
  productName: string;
  concertEventName: string;
  eventVenue: string;
  eventDate: string;
  daysRemaining: number;
  cutName: string;
  grammageGsm: number;
  sizeLabel: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ProductionQueueTableProps {
  queue: QueueItem[];
  updatingOrderId: string | null;
  onAdvanceStatus: (orderId: string, currentStatus: string) => void;
  onExportJSON: () => void;
}

export const ProductionQueueTable: React.FC<ProductionQueueTableProps> = ({
  queue,
  updatingOrderId,
  onAdvanceStatus,
  onExportJSON,
}) => {
  return (
    <div className="space-y-6 font-sans">
      <div className="border border-[#e8e8e8] p-6 lg:p-8 bg-white rounded-3xl space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#f0f0f0] pb-4 gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
              DATASET & PEDIDOS PRIORIZADOS
            </span>
            <h2 className="text-xl font-bold uppercase tracking-wider text-[#121212] mt-0.5">
              3. Producción & Registro de Ventas
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Los pedidos cuyo concierto esté más próximo encabezan automáticamente la cola del taller.
            </p>
          </div>

          <button
            onClick={onExportJSON}
            className="btn-dawn-secondary px-4 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Dataset (JSON)</span>
          </button>
        </div>

        {/* Prioritized Production Table (TR-028) */}
        <div className="border border-[#e8e8e8] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#121212] text-white border-b border-[#e8e8e8] text-[10px] uppercase tracking-widest font-bold">
                <tr>
                  <th className="p-4">Prioridad & Evento</th>
                  <th className="p-4">Pedido / Cliente</th>
                  <th className="p-4">Prenda & Silueta</th>
                  <th className="p-4">Talla & Cant.</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Estado Confección</th>
                  <th className="p-4 text-right">Acción Operario</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#f0f0f0] text-neutral-800 bg-white">
                {queue.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-neutral-400">
                      No hay prendas activas en la cola de producción.
                    </td>
                  </tr>
                ) : (
                  queue.map((item, idx) => {
                    const isUrgent = item.daysRemaining <= 7;
                    const isVeryUrgent = item.daysRemaining <= 3;

                    return (
                      <tr key={item.itemId || idx} className="hover:bg-neutral-50 transition">
                        {/* Priority & Concert Event */}
                        <td className="p-4 space-y-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isVeryUrgent
                                ? 'bg-red-100 text-red-800 border border-red-300'
                                : isUrgent
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>
                              {isVeryUrgent
                                ? `¡Urgente! En ${item.daysRemaining} días`
                                : `En ${item.daysRemaining} días`}
                            </span>
                          </span>

                          <div className="font-bold text-[#121212] text-xs">
                            {item.concertEventName}
                          </div>
                          <div className="text-[10px] text-neutral-400 font-mono">
                            {new Date(item.eventDate).toLocaleDateString('es-PE')} • {item.eventVenue}
                          </div>
                        </td>

                        {/* Order Number & Customer */}
                        <td className="p-4 space-y-0.5">
                          <span className="font-mono font-extrabold text-xs text-[#121212] block">
                            {item.orderNumber}
                          </span>
                          <span className="font-bold text-neutral-700 block">{item.customerName}</span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {item.customerPhone}
                          </span>
                        </td>

                        {/* Product & Cut */}
                        <td className="p-4 space-y-0.5">
                          <span className="font-bold text-[#121212] block">{item.productName}</span>
                          <span className="text-[10px] text-neutral-500 font-mono block">
                            {item.cutName} ({item.grammageGsm}g GSM)
                          </span>
                        </td>

                        {/* Size & Quantity */}
                        <td className="p-4 space-y-0.5">
                          <span className="inline-block bg-[#121212] text-white text-xs font-mono font-bold px-2.5 py-0.5 rounded-md">
                            Talla {item.sizeLabel}
                          </span>
                          <span className="text-xs font-bold text-neutral-800 block pt-1">
                            x{item.quantity} unidad{item.quantity === 1 ? '' : 'es'}
                          </span>
                        </td>

                        {/* Total PEN */}
                        <td className="p-4 font-mono font-bold text-[#121212]">
                          {formatCurrencyPEN(item.totalPrice)}
                        </td>

                        {/* Status Badge */}
                        <td className="p-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              item.orderStatus === 'CONFIRMED'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : item.orderStatus === 'IN_CUTTING'
                                ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                : item.orderStatus === 'DTF_PRINTING'
                                ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            }`}
                          >
                            {item.orderStatus === 'CONFIRMED'
                              ? '1. Confirmado'
                              : item.orderStatus === 'IN_CUTTING'
                              ? '2. En Corte'
                              : item.orderStatus === 'DTF_PRINTING'
                              ? '3. DTF'
                              : '4. Listo'}
                          </span>
                        </td>

                        {/* Action Button */}
                        <td className="p-4 text-right">
                          {item.orderStatus === 'READY' || item.orderStatus === 'COMPLETED' ? (
                            <span className="text-[10px] font-bold text-emerald-600 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Entregado
                            </span>
                          ) : (
                            <button
                              onClick={() => onAdvanceStatus(item.orderId, item.orderStatus)}
                              disabled={updatingOrderId === item.orderId}
                              className="btn-dawn-primary px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold inline-flex items-center gap-1 active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                              <span>Avanzar Etapa</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
