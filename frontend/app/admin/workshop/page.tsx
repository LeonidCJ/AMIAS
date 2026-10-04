'use client';

import React, { useEffect, useState } from 'react';
import {
  Scissors,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { formatCurrencyPEN } from '../../../lib/utils/format-currency';

interface QueueItem {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  orderStatus: 'PENDING' | 'PAID' | 'IN_PRODUCTION' | 'COMPLETED' | 'CANCELLED';
  orderCreatedAt: string;
  itemId: string;
  productName: string;
  concertEventName: string;
  eventVenue: string;
  eventDate: string;
  daysRemaining: number;
  cutName: string;
  grammageGsm: number;
  sizeLabel: string;
  chestCm: number;
  lengthCm: number;
  shoulderCm: number;
  quantity: number;
  unitPrice: number;
  receiptOperationCode?: string;
}

export default function WorkshopQueuePage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const savedToken = localStorage.getItem('access_token') || '';
    setAuthToken(savedToken);
    loadQueue(savedToken);
  }, [API_BASE]);

  const loadQueue = async (token: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/workshop/queue`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al cargar la cola de taller.');
      }

      setQueue(data);
    } catch (err: any) {
      setError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStatus = async (orderId: string, currentStatus: string) => {
    let nextStatus = 'IN_PRODUCTION';
    if (currentStatus === 'IN_PRODUCTION') {
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
        throw new Error(errData.message || 'Error al actualizar estado.');
      }

      // Reload queue
      await loadQueue(authToken);
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#121212] font-sans selection:bg-neutral-900 selection:text-white">
      {/* Top Admin Header */}
      <div className="bg-[#121212] text-white text-xs uppercase tracking-widest py-3 px-6 flex items-center justify-between font-semibold border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Scissors className="w-4 h-4 text-amber-300" />
          <span>COLA DE TALLER PRIORIZADA POR PROXIMIDAD DE EVENTO (TR-028 / US-09)</span>
        </div>
        <span className="text-[10px] text-neutral-400 font-mono">Rol: ADMIN / OPERARIO</span>
      </div>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-8">
        <div className="border-b border-[#e8e8e8] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-widest font-bold text-neutral-400 block">
              ORDENAMIENTO DE URGENCIA POR FECHA DE CONCIERTO
            </span>
            <h1 className="text-2xl font-bold uppercase tracking-tight text-[#121212] flex items-center gap-2 mt-1">
              <Scissors className="w-6 h-6 text-neutral-800" />
              Bandeja de Confección Taller AMIAS
            </h1>
          </div>

          <button
            onClick={() => loadQueue(authToken)}
            className="btn-dawn-secondary px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualizar Cola</span>
          </button>
        </div>

        {/* Auth Token Helper */}
        <div className="bg-neutral-50 border border-neutral-200 p-4 space-y-2 text-xs rounded-2xl shadow-sm">
          <label className="font-bold uppercase tracking-wider block text-neutral-700">
            Token JWT de Operario / Admin:
          </label>
          <input
            type="text"
            value={authToken}
            onChange={(e) => {
              setAuthToken(e.target.value);
              localStorage.setItem('access_token', e.target.value);
            }}
            placeholder="Pega aquí el accessToken de /auth/login para autenticar la cola de taller..."
            className="w-full px-3 py-2 border border-neutral-300 font-mono text-[11px] focus:outline-none focus:border-[#121212] rounded-xl"
          />
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
            Cargando y priorizando pedidos del taller...
          </div>
        )}

        {/* Prioritized Workshop Table (TR-028) */}
        {!loading && !error && (
          <div className="border border-[#e8e8e8] rounded-3xl overflow-hidden shadow-sm bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#121212] text-white border-b border-[#e8e8e8] text-[10px] uppercase tracking-widest font-bold">
                  <tr>
                    <th className="p-4">Prioridad & Evento</th>
                    <th className="p-4">Pedido / Cliente</th>
                    <th className="p-4">Corte & Silueta</th>
                    <th className="p-4">Talla & Cant.</th>
                    <th className="p-4">Estado Confección</th>
                    <th className="p-4 text-right">Acción Operario</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#f0f0f0] text-neutral-800">
                  {queue.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-neutral-400">
                        No hay prendas pendientes en la cola del taller.
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

                          {/* Cut / Silhouette */}
                          <td className="p-4 space-y-0.5">
                            <span className="font-bold text-[#121212] block">{item.cutName}</span>
                            <span className="text-[10px] text-neutral-500 font-mono block">
                              Gramaje: {item.grammageGsm}g GSM
                            </span>
                            <span className="text-[10px] text-neutral-400 block line-clamp-1">
                              Prenda: {item.productName}
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
                            {item.chestCm && (
                              <span className="text-[10px] text-neutral-400 font-mono block">
                                ({item.chestCm}x{item.lengthCm}cm)
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="p-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                item.orderStatus === 'COMPLETED'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : item.orderStatus === 'IN_PRODUCTION'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {item.orderStatus === 'PAID'
                                ? 'Pago Confirmado'
                                : item.orderStatus === 'IN_PRODUCTION'
                                ? 'En Confección'
                                : item.orderStatus === 'COMPLETED'
                                ? 'Listo para Entrega'
                                : item.orderStatus}
                            </span>
                          </td>

                          {/* Action Button */}
                          <td className="p-4 text-right">
                            {item.orderStatus === 'COMPLETED' ? (
                              <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-end gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Listo
                              </span>
                            ) : (
                              <button
                                onClick={() => handleAdvanceStatus(item.orderId, item.orderStatus)}
                                disabled={updatingOrderId === item.orderId}
                                className="btn-dawn-primary px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold inline-flex items-center gap-1 active:scale-95 disabled:opacity-50"
                              >
                                <span>
                                  {item.orderStatus === 'PAID'
                                    ? 'Pasar a Corte'
                                    : 'Avanzar a Entrega'}
                                </span>
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
