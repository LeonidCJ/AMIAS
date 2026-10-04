'use client';

import React, { useEffect, useState } from 'react';
import {
  Scissors,
  Download,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { formatCurrencyPEN } from '../../../lib/utils/format-currency';

interface PriorityQueueItem {
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

export default function AdminProductionPage() {
  const [queue, setQueue] = useState<PriorityQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const savedToken = localStorage.getItem('access_token') || '';
    setAuthToken(savedToken);
    loadPriorityQueue(savedToken);
  }, [API_BASE]);

  const loadPriorityQueue = async (token: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE}/workshop/priority-queue`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al cargar la cola de producción de taller.');
      }

      setQueue(data);
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStatus = async (orderId: string, currentStatus: string) => {
    let nextStatus = 'IN_CUTTING';
    if (currentStatus === 'CONFIRMED') {
      nextStatus = 'IN_CUTTING';
    } else if (currentStatus === 'IN_CUTTING') {
      nextStatus = 'DTF_PRINTING';
    } else if (currentStatus === 'DTF_PRINTING') {
      nextStatus = 'READY';
    } else if (currentStatus === 'READY') {
      nextStatus = 'COMPLETED';
    }

    try {
      setUpdatingOrderId(orderId);
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Error al actualizar el estado de confección.');
      }

      await loadPriorityQueue(authToken);
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const exportSalesDatasetJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(queue, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `amias_production_dataset_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-white text-[#121212] font-sans selection:bg-neutral-900 selection:text-white">
      {/* Top Banner */}
      <div className="bg-[#121212] text-white text-[11px] tracking-[0.15em] uppercase text-center py-2.5 px-4 font-semibold flex items-center justify-center gap-2 border-b border-neutral-800">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>CONSOLA OPERATIVA TALLER AMIAS • ORDENAMIENTO POR URGENCIA DE SHOW</span>
      </div>

      {/* Header Superior */}
      <header className="border-b border-[#e8e8e8] bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <div>
            <span className="text-2xl font-extrabold tracking-[-0.04em] uppercase block leading-none">AMIAS</span>
            <span className="text-[10px] tracking-[0.25em] text-neutral-400 uppercase font-sans mt-1 block">Textile Studio Lima</span>
          </div>

          <div className="text-xs uppercase font-semibold text-neutral-600 flex items-center gap-2 px-3 py-1.5 bg-neutral-100 border border-neutral-200 rounded-full">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Módulo 3: Producción & Dataset</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-8">
        <div className="border-b border-[#e8e8e8] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-widest font-bold text-neutral-400 block">
              PRIORIZACIÓN AUTOMÁTICA POR PROXIMIDAD DE FECHA (TR-028 / US-09)
            </span>
            <h1 className="text-2xl font-bold uppercase tracking-tight text-[#121212] flex items-center gap-2 mt-1">
              <Scissors className="w-6 h-6 text-neutral-800" />
              Consola de Producción en Taller
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => loadPriorityQueue(authToken)}
              className="btn-dawn-secondary px-4 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Actualizar Cola</span>
            </button>

            <button
              onClick={exportSalesDatasetJSON}
              className="btn-dawn-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Dataset (JSON)</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-300 rounded-2xl text-red-800 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-16 text-center text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Cargando y ordenando cola de producción por fecha de show...
          </div>
        )}

        {/* Prioritized Production Table (TR-028) */}
        {!loading && !error && (
          <div className="border border-[#e8e8e8] rounded-3xl overflow-hidden shadow-sm bg-white">
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
                                onClick={() => handleAdvanceStatus(item.orderId, item.orderStatus)}
                                disabled={updatingOrderId === item.orderId}
                                className="btn-dawn-primary px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider inline-flex items-center gap-1 active:scale-95 disabled:opacity-50"
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
        )}
      </main>
    </div>
  );
}
