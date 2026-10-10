import React from 'react';
import {
  Download,
  Clock,
  CheckCircle2,
  ArrowRight,
  Eye,
  Scissors,
  AlertTriangle,
} from 'lucide-react';
import { formatCurrencyPEN } from '../../lib/utils/format-currency';

export interface QueueItem {
  orderId: string;
  orderNumber: string;
  orderCreatedAt: string;
  customerName: string;
  customerPhone: string;
  orderStatus: 'CONFIRMED' | 'IN_CUTTING' | 'DTF_PRINTING' | 'READY' | 'COMPLETED' | 'CANCELLED' | string;
  itemId: string;
  productId: string;
  productName: string;
  concertEventName: string;
  eventVenue: string;
  eventDate: string;
  daysRemaining: number;
  isUrgent?: boolean;
  cutName: string;
  grammageGsm: number;
  sizeLabel: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receiptOperationCode?: string;
}

export interface ProductionQueueTableProps {
  queue: QueueItem[];
  updatingOrderId: string | null;
  onAdvanceStatus: (orderId: string, currentStatus: string) => void;
  onStartProductionWithStockDeduction: (orderId: string) => void;
  onViewArtPresignedUrl: (orderId: string, itemId: string) => void;
  onExportJSON: () => void;
}

export const ProductionQueueTable: React.FC<ProductionQueueTableProps> = ({
  queue,
  updatingOrderId,
  onAdvanceStatus,
  onStartProductionWithStockDeduction,
  onViewArtPresignedUrl,
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
              Los pedidos cuyo concierto esté más próximo (<strong className="text-[#121212]">&lt; 48h</strong>) encabezan la cola con transacciones atómicas de stock.
            </p>
          </div>

          <button
            onClick={onExportJSON}
            className="btn-dawn-secondary px-4 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Dataset (JSON)</span>
          </button>
        </div>

        {/* Prioritized Production Table Fit 100% Without Scrollbar */}
        <div className="border border-[#e8e8e8] rounded-2xl overflow-hidden shadow-xs bg-white">
          <table className="w-full text-left text-xs font-sans border-collapse">
            <thead className="bg-[#121212] text-white text-[10px] uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3 px-3">Prioridad & Evento</th>
                <th className="py-3 px-3">Pedido / Cliente</th>
                <th className="py-3 px-3">Prenda & Silueta</th>
                <th className="py-3 px-2 text-center">Talla</th>
                <th className="py-3 px-2 text-center">Arte DTF</th>
                <th className="py-3 px-2 text-right">Total</th>
                <th className="py-3 px-3 text-center">Estado</th>
                <th className="py-3 px-3 text-right">Acción Operario</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#f0f0f0] text-neutral-800 bg-white">
              {queue.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-neutral-400">
                    No hay prendas activas en la cola de producción.
                  </td>
                </tr>
              ) : (
                queue.map((item, idx) => {
                  const isUrgent = item.isUrgent || item.daysRemaining <= 2;

                  return (
                    <tr key={item.itemId || idx} className="hover:bg-neutral-50/80 transition align-middle">
                      {/* Priority & Concert Event */}
                      <td className="py-3 px-3 space-y-1 align-middle">
                        {isUrgent ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-300 animate-pulse whitespace-nowrap">
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                            <span>URGENTE &lt; 48H</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-700 border border-neutral-200 whitespace-nowrap">
                            <Clock className="w-3 h-3 text-neutral-500" />
                            <span>En {item.daysRemaining} días</span>
                          </span>
                        )}

                        <div className="font-bold text-[#121212] text-xs leading-tight">
                          {item.concertEventName}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          {new Date(item.eventDate).toLocaleDateString('es-PE')} • {item.eventVenue}
                        </div>
                      </td>

                      {/* Order Number & Customer */}
                      <td className="py-3 px-3 space-y-0.5 align-middle">
                        <span className="font-mono font-extrabold text-xs text-[#121212] block">
                          {item.orderNumber}
                        </span>
                        <span className="font-bold text-neutral-700 block text-xs">{item.customerName}</span>
                        <span className="text-[10px] text-neutral-400 font-mono block">
                          {item.customerPhone}
                        </span>
                      </td>

                      {/* Product & Cut */}
                      <td className="py-3 px-3 space-y-0.5 align-middle">
                        <span className="font-bold text-[#121212] block text-xs leading-tight">{item.productName}</span>
                        <span className="text-[10px] text-neutral-500 font-mono block">
                          {item.cutName} ({item.grammageGsm}g)
                        </span>
                      </td>

                      {/* Size & Quantity */}
                      <td className="py-3 px-2 text-center align-middle whitespace-nowrap">
                        <span className="inline-block bg-[#121212] text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded-md">
                          Talla {item.sizeLabel}
                        </span>
                        <span className="text-[11px] font-bold text-neutral-800 block pt-0.5">
                          x{item.quantity} und
                        </span>
                      </td>

                      {/* Presigned URL Button */}
                      <td className="py-3 px-2 text-center align-middle whitespace-nowrap">
                        <button
                          onClick={() => onViewArtPresignedUrl(item.orderId, item.itemId)}
                          className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-300 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 transition cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-blue-600" />
                          <span>Ver Arte</span>
                        </button>
                      </td>

                      {/* Total PEN */}
                      <td className="py-3 px-2 text-right font-mono font-bold text-[#121212] align-middle whitespace-nowrap">
                        {formatCurrencyPEN(item.totalPrice)}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3 text-center align-middle whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
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

                      {/* Action Buttons */}
                      <td className="py-3 px-3 text-right align-middle whitespace-nowrap">
                        {item.orderStatus === 'CONFIRMED' ? (
                          <button
                            onClick={() => onStartProductionWithStockDeduction(item.orderId)}
                            disabled={updatingOrderId === item.orderId}
                            className="btn-dawn-primary px-2.5 py-1.5 text-[10px] uppercase tracking-wider font-bold inline-flex items-center gap-1 active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
                          >
                            <Scissors className="w-3 h-3 text-amber-300" />
                            <span>Iniciar Confección</span>
                          </button>
                        ) : item.orderStatus === 'READY' || item.orderStatus === 'COMPLETED' ? (
                          <span className="text-[10px] font-bold text-emerald-600 inline-flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Entregado
                          </span>
                        ) : (
                          <button
                            onClick={() => onAdvanceStatus(item.orderId, item.orderStatus)}
                            disabled={updatingOrderId === item.orderId}
                            className="btn-dawn-secondary px-2.5 py-1.5 text-[10px] uppercase tracking-wider font-bold inline-flex items-center gap-1 active:scale-95 disabled:opacity-50 cursor-pointer"
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
  );
};
