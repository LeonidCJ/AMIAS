'use client';

import React, { useState } from 'react';
import {
  Search,
  Ruler,
  Scissors,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { OrderTracker } from '../../../components/tracker/OrderTracker';
import { formatCurrencyPEN } from '../../../lib/utils/format-currency';

interface PreferredCut {
  cutName: string;
  grammageGsm: number;
  count: number;
}

interface AnatomicalMeasurement {
  label: string;
  chestCm: number;
  lengthCm: number;
  shoulderCm: number;
  heightRef: string | null;
  count: number;
}

interface OrderHistoryItem {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: {
    productName: string;
    concertEvent: string;
    cutName: string;
    sizeLabel: string;
    chestCm: number;
    lengthCm: number;
    shoulderCm: number;
    quantity: number;
    unitPrice: number;
  }[];
}

interface PatternHistoryResponse {
  customerPhone: string;
  customerName: string;
  totalOrdersCount: number;
  preferredCuts: PreferredCut[];
  anatomicalMeasurements: AnatomicalMeasurement[];
  ordersHistory: OrderHistoryItem[];
}

export default function CustomerHistoryPage() {
  const [phoneQuery, setPhonePhoneQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PatternHistoryResponse | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setData(null);

    if (!phoneQuery.trim()) {
      setError('Ingresa tu número de teléfono para buscar tu historial.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/customers/${phoneQuery.trim()}/pattern-history`);
      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || 'No se encontró historial para este teléfono.');
      }

      setData(responseData);
    } catch (err: any) {
      setError(err.message || 'Error inesperado al buscar tu historial.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#121212] font-sans selection:bg-neutral-900 selection:text-white">
      {/* Announcement Bar */}
      <div className="bg-[#121212] text-white text-[11px] tracking-[0.15em] uppercase text-center py-2.5 px-4 font-semibold flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>SEGUIMIENTO DE PEDIDOS Y PATRONAJE ANATÓMICO HISTÓRICO • AMIAS</span>
      </div>

      {/* Header */}
      <header className="border-b border-[#e8e8e8] bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <div>
            <span className="text-2xl font-extrabold tracking-[-0.04em] uppercase block leading-none">AMIAS</span>
            <span className="text-[10px] tracking-[0.25em] text-neutral-400 uppercase font-sans mt-1 block">Textile Studio Lima</span>
          </div>
          <div className="text-xs uppercase font-semibold text-neutral-700 flex items-center gap-1.5">
            <Ruler className="w-4 h-4 text-neutral-900" />
            <span>Mis Medidas y Pedidos</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {/* Banner */}
        <section className="bg-[#f6f6f6] border border-[#e8e8e8] rounded-3xl p-8 sm:p-12 space-y-4 shadow-sm">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-neutral-500 block">
              TR-026 & TR-027 (US-08)
            </span>
            <h1 className="text-3xl font-bold uppercase tracking-tight text-[#121212]">
              Historial de Patronaje y Rastreo de Pedidos
            </h1>
            <p className="text-xs text-neutral-600 leading-relaxed max-w-xl">
              Ingresa tu número de teléfono registrado en WhatsApp para ver el estado de tu pedido en tiempo real y consultar tus medidas corporales de referencia.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="tel"
              required
              value={phoneQuery}
              onChange={(e) => setPhonePhoneQuery(e.target.value)}
              placeholder="Ej. 987654321"
              className="px-4 py-3 border border-[#cccccc] rounded-xl text-xs focus:outline-none focus:border-[#121212] flex-1 font-mono"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-dawn-primary px-6 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Buscando...' : 'Consultar Mi Historial'}</span>
            </button>
          </form>
        </section>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-300 rounded-2xl text-red-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Results View */}
        {data && (
          <div className="space-y-10">
            {/* Active Order Tracker (TR-026) */}
            {data.ordersHistory && data.ordersHistory.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-lg font-bold uppercase text-[#121212] flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-neutral-800" />
                  Rastreo de Pedido Activo
                </h2>
                <OrderTracker
                  currentStatus={data.ordersHistory[0].status}
                  orderNumber={data.ordersHistory[0].orderNumber}
                  updatedAt={data.ordersHistory[0].createdAt}
                />
              </section>
            )}

            {/* TR-027: Mis Medidas y Patronaje Histórico */}
            <section className="bg-white border border-[#e8e8e8] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="border-b border-[#e8e8e8] pb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">
                    MEDIDAS ANATÓMICAS DE REFERENCIA
                  </span>
                  <h2 className="text-xl font-bold uppercase text-[#121212] flex items-center gap-2 mt-0.5">
                    <Ruler className="w-5 h-5 text-neutral-800" />
                    Mis Medidas y Patronaje Histórico
                  </h2>
                </div>
                <span className="text-xs font-semibold text-neutral-600 bg-neutral-100 border border-neutral-200 px-3 py-1 rounded-full">
                  {data.customerName}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Anatomical Measurements Table */}
                <div className="lg:col-span-7 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Dimensiones de Tallas Utilizadas (cm)
                  </h3>
                  <div className="border border-[#e8e8e8] rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs font-sans">
                      <thead className="bg-[#fafafa] border-b border-[#e8e8e8] text-[10px] uppercase font-bold text-neutral-500">
                        <tr>
                          <th className="p-3">Talla</th>
                          <th className="p-3">Ancho Pecho</th>
                          <th className="p-3">Largo Total</th>
                          <th className="p-3">Caída Hombro</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f0f0f0] text-neutral-800">
                        {data.anatomicalMeasurements.map((m, idx) => (
                          <tr key={idx} className="hover:bg-neutral-50">
                            <td className="p-3 font-bold font-mono">Talla {m.label}</td>
                            <td className="p-3">{m.chestCm} cm</td>
                            <td className="p-3">{m.lengthCm} cm</td>
                            <td className="p-3">{m.shoulderCm} cm</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Preferred Cuts Summary */}
                <div className="lg:col-span-5 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-neutral-500" />
                    Cortes & Siluetas Preferidas
                  </h3>
                  <div className="space-y-2">
                    {data.preferredCuts.map((cut, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 border border-[#e8e8e8] bg-[#fafafa] rounded-2xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-[#121212] block">{cut.cutName}</span>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            Gramaje: {cut.grammageGsm}g GSM
                          </span>
                        </div>
                        <span className="text-[10px] font-bold bg-[#121212] text-white px-2.5 py-1 rounded-full">
                          {cut.count} pedido{cut.count === 1 ? '' : 's'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Past Orders History List */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold uppercase text-[#121212] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-neutral-800" />
                Historial Completo de Pedidos
              </h2>

              <div className="space-y-4">
                {data.ordersHistory.map((order) => (
                  <div
                    key={order.id}
                    className="border border-[#e8e8e8] rounded-2xl p-6 bg-white space-y-4 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e8e8e8] pb-3 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-extrabold text-sm text-[#121212]">
                          {order.orderNumber}
                        </span>
                        <span className="text-neutral-400">
                          {new Date(order.createdAt).toLocaleDateString('es-PE')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-[#121212]">
                          {formatCurrencyPEN(order.totalAmount)}
                        </span>
                      </div>
                    </div>

                    <div className="divide-y divide-neutral-100 text-xs font-sans">
                      {order.items.map((item) => (
                        <div key={item.id} className="py-2 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-[#121212]">{item.productName}</span>
                            <span className="text-[11px] text-neutral-500 block">
                              Gira: {item.concertEvent} • Corte: {item.cutName} • Talla: {item.sizeLabel} ({item.chestCm}x{item.lengthCm}cm)
                            </span>
                          </div>
                          <span className="font-mono font-bold text-neutral-700">
                            x{item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
