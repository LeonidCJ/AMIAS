'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  LogOut,
  Plus,
  Calendar,
  Package,
  Layers,
  ShoppingBag,
  Check,
  X,
} from 'lucide-react';
import { formatCurrencyPEN } from '../../../lib/utils/format-currency';

interface ConcertEvent {
  id: string;
  name: string;
  venue: string;
  capacity: number;
  rate: number;
  eventDate: string;
}

interface Product {
  id: string;
  name: string;
  description?: string | null;
  basePrice: number;
  concertEventId: string;
  cutId: string;
  imageUrl?: string | null;
  concertEvent?: { id: string; name: string; venue: string };
  cut?: { id: string; name: string; grammageGsm: number };
  sizes?: { sizeId: string; label?: string }[];
}

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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'events' | 'catalog' | 'production'>('events');

  // Data States
  const [events, setEvents] = useState<ConcertEvent[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [queue, setQueue] = useState<PriorityQueueItem[]>([]);

  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // New Event Form Modal State
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventVenue, setNewEventVenue] = useState('Estadio Nacional');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventCapacity, setNewEventCapacity] = useState(45000);
  const [creatingEvent, setCreatingEvent] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const savedToken = localStorage.getItem('access_token') || '';
    setAuthToken(savedToken);
    loadAllAdminData(savedToken);
  }, [API_BASE]);

  const loadAllAdminData = async (token: string) => {
    try {
      setLoading(true);
      setError(null);

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [resEvents, resProducts, resQueue] = await Promise.all([
        fetch(`${API_BASE}/concert-events`),
        fetch(`${API_BASE}/products`),
        fetch(`${API_BASE}/workshop/priority-queue`, { headers }),
      ]);

      if (resEvents.ok) {
        const eventsData = await resEvents.json();
        setEvents(eventsData);
      }

      if (resProducts.ok) {
        const productsData = await resProducts.json();
        setProducts(productsData);
      }

      if (resQueue.ok) {
        const queueData = await resQueue.json();
        setQueue(queueData);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos del panel operativo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName.trim() || !newEventDate) return;

    try {
      setCreatingEvent(true);
      const res = await fetch(`${API_BASE}/concert-events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: newEventName.trim(),
          venue: newEventVenue,
          capacity: Number(newEventCapacity),
          rate: 0.004,
          eventDate: new Date(newEventDate).toISOString(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Error al crear concierto.');
      }

      setShowEventModal(false);
      setNewEventName('');
      setNewEventDate('');
      await loadAllAdminData(authToken);
    } catch (err: any) {
      alert(err.message || 'Error al crear evento.');
    } finally {
      setCreatingEvent(false);
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
        throw new Error(errData.message || 'Error al actualizar el estado.');
      }

      await loadAllAdminData(authToken);
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleLogoutAdmin = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    router.push('/login');
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
    <div className="min-h-screen bg-white text-[#121212] font-sans selection:bg-neutral-900 selection:text-white flex flex-col justify-between">
      {/* Top Banner */}
      <div className="bg-[#121212] text-white text-[11px] tracking-[0.15em] uppercase text-center py-2.5 px-4 font-semibold flex items-center justify-center gap-2 border-b border-neutral-800">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>CONSOLA OPERATIVA TALLER AMIAS • GESTIÓN DE PRODUCCIÓN & CONCIERTOS</span>
      </div>

      {/* Header Superior matching login_admin_predictivo.html */}
      <header className="border-b border-[#e8e8e8] bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <button onClick={() => router.push('/catalog')} className="text-left cursor-pointer">
            <span className="text-2xl font-extrabold tracking-[-0.04em] uppercase block leading-none">AMIAS</span>
            <span className="text-[10px] tracking-[0.25em] text-neutral-400 uppercase font-sans mt-1 block">Textile Studio Lima</span>
          </button>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-neutral-100 border border-neutral-200 rounded-full text-xs font-semibold text-neutral-600 uppercase">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Panel Operativo Taller</span>
            </div>

            {/* Logout Button matching login_admin_predictivo.html */}
            <button
              onClick={handleLogoutAdmin}
              className="text-xs uppercase tracking-wider font-bold text-neutral-500 hover:text-red-600 transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-8 flex-1 w-full">
        {/* 3-Module Tab Bar matching login_admin_predictivo.html prototype */}
        <div className="flex items-center justify-between border-b border-[#e8e8e8] pb-4">
          <div className="flex items-center gap-2 overflow-x-auto text-xs uppercase tracking-wider font-semibold p-1 bg-neutral-100 rounded-2xl border border-[#e8e8e8]">
            {/* TAB 1: GIRAS & CONCIERTOS */}
            <button
              onClick={() => setActiveTab('events')}
              className={`px-5 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-[#121212] text-white shadow-sm font-bold'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>1. Giras & Conciertos</span>
              <span className="px-2 py-0.5 bg-white text-black text-[10px] font-mono font-bold rounded-full">
                {events.length}
              </span>
            </button>

            {/* TAB 2: CATÁLOGO */}
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-5 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-[#121212] text-white shadow-sm font-bold'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>2. Catálogo</span>
              <span className="px-2 py-0.5 bg-white text-black text-[10px] font-mono font-bold rounded-full">
                {products.length}
              </span>
            </button>

            {/* TAB 3: PRODUCCIÓN & VENTAS */}
            <button
              onClick={() => setActiveTab('production')}
              className={`px-5 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'production'
                  ? 'bg-[#121212] text-white shadow-sm font-bold'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              <Scissors className="w-4 h-4" />
              <span>3. Producción & Ventas</span>
              <span className="px-2 py-0.5 bg-white text-black text-[10px] font-mono font-bold rounded-full">
                {queue.length}
              </span>
            </button>
          </div>

          <button
            onClick={() => loadAllAdminData(authToken)}
            className="btn-dawn-secondary px-4 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Actualizar Todo</span>
          </button>
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
            Cargando módulos operativos del taller...
          </div>
        )}

        {!loading && (
          <>
            {/* ======================================================= */}
            {/* TAB 1: GIRAS & CONCIERTOS                               */}
            {/* ======================================================= */}
            {activeTab === 'events' && (
              <div className="space-y-6">
                <div className="border border-[#e8e8e8] p-6 lg:p-8 bg-white rounded-3xl space-y-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#f0f0f0] pb-4 gap-4">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
                        CONTROL MAESTRO DE EVENTOS
                      </span>
                      <h2 className="text-xl font-bold uppercase tracking-wider text-[#121212] mt-0.5">
                        Giras y Conciertos Activos
                      </h2>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Alimentan exclusivamente los selectores del catálogo y las fechas límite del taller.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowEventModal(true)}
                      className="btn-dawn-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Crear Nuevo Concierto</span>
                    </button>
                  </div>

                  {/* Concert Events List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className="p-5 border border-[#e8e8e8] bg-[#fafafa] rounded-2xl space-y-3 hover:border-neutral-900 transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <strong className="text-sm font-bold text-[#121212] block">
                            {event.name}
                          </strong>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold uppercase rounded-full">
                            Activo
                          </span>
                        </div>

                        <div className="text-xs font-mono text-neutral-600 space-y-1">
                          <p>📍 Recinto: <strong className="text-neutral-900">{event.venue}</strong></p>
                          <p>📅 Fecha Show: <strong className="text-neutral-900">{new Date(event.eventDate).toLocaleDateString('es-PE')}</strong></p>
                          <p>👥 Aforo Proyectado: <strong className="text-neutral-900">{event.capacity.toLocaleString()} personas</strong></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================= */}
            {/* TAB 2: CATÁLOGO                                         */}
            {/* ======================================================= */}
            {activeTab === 'catalog' && (
              <div className="space-y-6">
                <div className="border border-[#e8e8e8] p-6 lg:p-8 bg-white rounded-3xl space-y-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#f0f0f0] pb-4 gap-4">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
                        ADMINISTRADOR DEL CATÁLOGO
                      </span>
                      <h2 className="text-xl font-bold uppercase tracking-wider text-[#121212] mt-0.5">
                        Prendas de Concierto en Tienda
                      </h2>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Publicación restringida asociada a giras oficiales y cortes textiles autorizados.
                      </p>
                    </div>

                    <button
                      onClick={() => router.push('/admin/products/new')}
                      className="btn-dawn-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Publicar Nueva Prenda</span>
                    </button>
                  </div>

                  {/* Product Cards List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="p-5 border border-[#e8e8e8] bg-[#fafafa] rounded-2xl space-y-3 hover:border-neutral-900 transition flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <span className="text-[10px] font-mono uppercase font-bold text-neutral-400 block">
                            {product.concertEvent?.name || 'Gira Oficial'}
                          </span>
                          <strong className="text-sm font-bold text-[#121212] block">
                            {product.name}
                          </strong>
                          <p className="text-xs font-mono text-neutral-500">
                            Corte: <strong className="text-neutral-900">{product.cut?.name || 'Oversize Boxy'}</strong>
                          </p>
                        </div>

                        <div className="pt-2 border-t border-[#e8e8e8] flex items-center justify-between">
                          <span className="text-xs font-extrabold text-[#121212] font-mono">
                            {formatCurrencyPEN(product.basePrice)}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold uppercase bg-emerald-50 px-2 py-0.5 rounded">
                            En Tienda
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================= */}
            {/* TAB 3: PRODUCCIÓN & VENTAS                              */}
            {/* ======================================================= */}
            {activeTab === 'production' && (
              <div className="space-y-6">
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

                    <div className="flex items-center gap-2">
                      <button
                        onClick={exportSalesDatasetJSON}
                        className="btn-dawn-secondary px-4 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Exportar Dataset (JSON)</span>
                      </button>
                    </div>
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
                                        onClick={() => handleAdvanceStatus(item.orderId, item.orderStatus)}
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
            )}
          </>
        )}
      </main>

      {/* CREATE EVENT MODAL */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#121212] rounded-3xl w-full max-w-lg p-6 sm:p-8 relative space-y-6 shadow-2xl">
            <button
              onClick={() => setShowEventModal(false)}
              className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-950 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-[#e8e8e8] pb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold block">
                CONTROL MAESTRO DE EVENTOS
              </span>
              <h2 className="text-xl font-bold uppercase tracking-tight text-[#121212] mt-0.5">
                Crear Nuevo Concierto / Gira
              </h2>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 font-sans text-xs">
              <div className="space-y-1">
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-700">
                  Nombre del Concierto / Gira *
                </label>
                <input
                  type="text"
                  required
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  placeholder="Ej. Iron Maiden - Future Past Tour 2026"
                  className="w-full px-3.5 py-2.5 border border-[#cccccc] rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-700">
                    Recinto / Estadio *
                  </label>
                  <select
                    value={newEventVenue}
                    onChange={(e) => setNewEventVenue(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#cccccc] rounded-xl bg-white text-xs font-semibold"
                  >
                    <option value="Estadio Nacional">Estadio Nacional (~45k)</option>
                    <option value="Estadio San Marcos">Estadio San Marcos (~35k)</option>
                    <option value="Estadio Monumental">Estadio Monumental (~50k)</option>
                    <option value="Costa 21">Costa 21 (~15k)</option>
                    <option value="Arena 1">Arena 1 (~20k)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-700">
                    Aforo del Evento *
                  </label>
                  <input
                    type="number"
                    required
                    value={newEventCapacity}
                    onChange={(e) => setNewEventCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-[#cccccc] rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-700">
                  Fecha del Concierto *
                </label>
                <input
                  type="date"
                  required
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#cccccc] rounded-xl text-xs font-mono"
                />
              </div>

              <div className="pt-4 border-t border-[#f0f0f0] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="btn-dawn-secondary px-5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingEvent}
                  className="btn-dawn-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  {creatingEvent ? 'Guardando...' : 'Crear Concierto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#e8e8e8] bg-[#fbfbfb] py-8 text-center text-[11px] text-neutral-400">
        © 2026 AMIAS. Todos los derechos reservados. Lima, Perú.
      </footer>
    </div>
  );
}
