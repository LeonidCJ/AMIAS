'use client';

import React, { useEffect, useState } from 'react';
import {
  Scissors,
  Download,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
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
    } font-sans finally {
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
    <div className="min-h-screen bg-[#fcfcfc] text-[#121212] font-sans selection:bg-neutral-900 selection:text-white">
      {/* Top Announcement Bar */}
      <div className="bg-[#121212] text-white text-[11px] tracking-[0.15em] uppercase text-center py-2 px-4 font-semibold border-b border-neutral-800 flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>SISTEMA TALLER AMIAS • GESTIÓN DE PRODUCCIÓN Y MODELO ANALÍTICO DE DEMANDA</span>
      </div>

      {/* Header Superior matching login_admin_predictivo.html */}
      <header className="border-b border-[#e8e8e8] bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-extrabold tracking-[-0.04em] uppercase block leading-none">AMIAS</span>
            <span className="text-[10px] font-mono tracking-widest bg-neutral-100 text-neutral-800 px-2.5 py-1 border border-[#e8e8e8] flex items-center gap-1.5 rounded-md">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
              PANEL OPERATIVO
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-6 text-xs text-neutral-500 font-sans">
            <div>
              Órdenes en Taller: <strong className="text-neutral-900 font-mono">{queue.length}</strong>
            </div>
            <div>
              Giras Activas: <strong className="text-neutral-900 font-mono">3</strong>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Rol: ADMIN / OPERARIO
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8 space-y-6">
        {/* Module 3 Header */}
        <div className="border border-[#e8e8e8] p-6 lg:p-8 bg-white rounded-3xl space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#f0f0f0] pb-4 gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
                DATASET & COLA PRIORIZADA POR PROXIMIDAD DE SHOW (TR-028 / US-09)
              </span>
              <h2 className="text-xl font-bold uppercase tracking-wider text-[#121212] mt-0.5">
                Módulo 3: Producción & Registro de Órdenes
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Los pedidos cuyo concierto esté más próximo encabezan automáticamente la cola del taller.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadPriorityQueue(authToken)}
                className="btn-dawn-secondary px-4 py-2 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Actualizar Cola</span>
              </button>

              <button
                onClick={exportSalesDatasetJSON}
                className="btn-dawn-primary px-4 py-2 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Dataset (JSON)</span>
              </button>
            </div>
          </div>

          {/* Auth Token Input */}
          <div className="bg-neutral-50 border border-neutral-200 p-4 space-y-1.5 text-xs rounded-2xl">
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
              placeholder="Pega aquí el accessToken de /auth/login..."
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

          {/* Table matching login_admin_predictivo.html */}
          <div className="border border-[#e8e8e8] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans divide-y divide-[#f0f0f0]">
                <thead className="bg-[#fafafa] text-neutral-400 uppercase tracking-wider text-[10px] border-b border-[#e8e8e8] font-bold">
                  <tr>
                    <th className="p-3.5">ID / FECHA</th>
                    <th className="p-3.5">CLIENTE</th>
                    <th className="p-3.5">GIRA / CONCIERTO</th>
                    <th className="p-3.5">PRENDA / ESPECIFICACIÓN</th>
                    <th className="p-3.5">TALLA</th>
                    <th className="p-3.5">TOTAL</th>
                    <th className="p-3.5">ESTADO</th>
                    <th className="p-3.5 text-right">ACCIÓN</th>
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
                      const isUrgent = item.daysRemaining <= 7;

                      return (
                        <tr key={item.itemId || idx} className="hover:bg-[#fafafa] transition">
                          <td className="p-3.5">
                            <strong className="font-mono text-[#121212] block text-xs">
                              {item.orderNumber}
                            </strong>
                            <span className="text-[10px] text-neutral-400 block font-mono">
                              {new Date(item.orderCreatedAt).toLocaleDateString('es-PE')}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <strong className="block text-neutral-900">{item.customerName}</strong>
                            <span className="text-[11px] text-neutral-400 font-mono">
                              {item.customerPhone}
                            </span>
                          </td>

                          <td className="p-3.5 space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold block">{item.concertEventName}</span>
                              {isUrgent && (
                                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-red-100 text-red-800 border border-red-300">
                                  {item.daysRemaining}d
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-neutral-500 font-mono block">
                              {new Date(item.eventDate).toLocaleDateString('es-PE')} • {item.eventVenue}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <span className="block font-bold text-neutral-900">{item.productName}</span>
                            <span className="text-[11px] text-neutral-500 block">
                              {item.cutName} ({item.grammageGsm}g)
                            </span>
                          </td>

                          <td className="p-3.5 font-bold font-mono">Talla {item.sizeLabel}</td>

                          <td className="p-3.5 font-bold font-mono text-[#121212]">
                            {formatCurrencyPEN(item.totalPrice)}
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider inline-block ${
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

                          <td className="p-3.5 text-right">
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
        </div>
      </main>
    </div>
  );
}
