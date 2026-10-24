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
  Calendar,
  Package,
  AlertCircle,
  Layers,
  Plus,
} from 'lucide-react';

import { EventsTab, ConcertEventItem } from '../../../components/admin/EventsTab';
import { CatalogTab, ProductItem } from '../../../components/admin/CatalogTab';
import { ProductionQueueTable, QueueItem } from '../../../components/admin/ProductionQueueTable';
import { CreateEventModal } from '../../../components/admin/modals/CreateEventModal';
import { ConfirmDeleteModal } from '../../../components/admin/modals/ConfirmDeleteModal';
import { ConfirmCancelOrderModal } from '../../../components/admin/modals/ConfirmCancelOrderModal';
import { ReplenishStockModal } from '../../../components/admin/modals/ReplenishStockModal';
import { TechnicalSheetModal } from '../../../components/admin/modals/TechnicalSheetModal';
import { logout } from '../../../lib/auth/session';

export default function AdminProductionPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'events' | 'catalog' | 'production' | 'stock' | 'attributes'>('events');

  // Data States
  const [events, setEvents] = useState<ConcertEventItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);

  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [authToken, setAuthToken] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Modal States
  const [showEventModal, setShowEventModal] = useState(false);
  const [showReplenishModal, setShowReplenishModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<ConcertEventItem | null>(null);
  const [deletingEvent, setDeletingEvent] = useState(false);

  // Order Cancel & Technical Sheet Modal States
  const [orderToCancel, setOrderToCancel] = useState<{ orderId: string; orderNumber: string } | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [selectedTechnicalItem, setSelectedTechnicalItem] = useState<QueueItem | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const savedToken = localStorage.getItem('access_token') || '';
    const savedRole = localStorage.getItem('user_role') || '';

    // Guard: Require valid Admin / Operator session
    if (!savedToken || (savedRole !== 'ADMIN' && savedRole !== 'OPERARIO')) {
      router.replace('/login');
      return;
    }

    setAuthToken(savedToken);
    loadAllAdminData(savedToken);
  }, [API_BASE]);

  const loadAllAdminData = async (token: string) => {
    try {
      setLoading(true);
      setError(null);

      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [resEvents, resProducts, resQueue] = await Promise.all([
        fetch(`${API_BASE}/concert-events`),
        fetch(`${API_BASE}/products`),
        fetch(`${API_BASE}/workshop/priority-queue`, { headers }),
      ]);

      if (resEvents.ok) setEvents(await resEvents.json());
      if (resProducts.ok) setProducts(await resProducts.json());
      if (resQueue.ok) setQueue(await resQueue.json());
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos del panel operativo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      setDeletingEvent(true);
      setFeedback(null);

      const res = await fetch(`${API_BASE}/concert-events/${eventToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al eliminar el concierto.');

      setFeedback({ type: 'success', text: `¡Concierto '${eventToDelete.name}' eliminado correctamente!` });
      setEventToDelete(null);
      await loadAllAdminData(authToken);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'No se pudo eliminar el concierto.' });
    } finally {
      setDeletingEvent(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      setDeletingProduct(true);
      setFeedback(null);

      const res = await fetch(`${API_BASE}/products/${productToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al quitar la prenda del catálogo.');

      setFeedback({ type: 'success', text: `¡Prenda '${productToDelete.name}' eliminada correctamente del catálogo!` });
      setProductToDelete(null);
      await loadAllAdminData(authToken);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'No se pudo eliminar la prenda.' });
    } finally {
      setDeletingProduct(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;

    try {
      setCancellingOrder(true);
      setFeedback(null);

      const res = await fetch(`${API_BASE}/orders/${orderToCancel.orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al cancelar el pedido.');
      }

      setFeedback({
        type: 'success',
        text: `¡Pedido ${orderToCancel.orderNumber} cancelado correctamente!`,
      });

      setOrderToCancel(null);
      await loadAllAdminData(authToken);
    } catch (err: any) {
      setOrderToCancel(null);
      setFeedback({
        type: 'error',
        text: err.message || 'No se pudo cancelar el pedido.',
      });
    } finally {
      setCancellingOrder(false);
    }
  };

  const handleStartProductionWithStockDeduction = async (orderId: string) => {
    setFeedback(null);
    try {
      setUpdatingOrderId(orderId);
      const res = await fetch(`${API_BASE}/workshop/orders/${orderId}/start-production`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Falta de stock o error al iniciar confección.');
      }

      setFeedback({
        type: 'success',
        text: '¡Confección iniciada y stock de tela descontado en transacción atómica (ACID)!',
      });

      await loadAllAdminData(authToken);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'Error al ejecutar la transacción de stock.',
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleViewArtPresignedUrl = async (orderId: string, itemId: string) => {
    try {
      const res = await fetch(`${API_BASE}/workshop/orders/${orderId}/items/${itemId}/art-presigned-url`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al solicitar URL firmada del arte.');
      }

      if (data.presignedUrl) {
        window.open(data.presignedUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err: any) {
      alert(err.message || 'Error al obtener URL firmada.');
    }
  };

  const handleAdvanceStatus = async (orderId: string, currentStatus: string) => {
    let nextStatus = 'IN_CUTTING';
    if (currentStatus === 'CONFIRMED') nextStatus = 'IN_CUTTING';
    else if (currentStatus === 'IN_CUTTING') nextStatus = 'DTF_PRINTING';
    else if (currentStatus === 'DTF_PRINTING') nextStatus = 'READY';
    else if (currentStatus === 'READY') nextStatus = 'COMPLETED';

    try {
      setUpdatingOrderId(orderId);
      setFeedback(null);
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

      setFeedback({
        type: 'success',
        text: `¡Estado de confección avanzado correctamente en la Máquina de Estados (FSM) a ${nextStatus}!`,
      });

      await loadAllAdminData(authToken);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'Error al cambiar estado en la FSM.',
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleLogoutAdmin = () => {
    logout();
    router.replace('/login');
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
          <button onClick={() => router.push('/admin/production')} className="text-left cursor-pointer">
            <span className="text-2xl font-extrabold tracking-[-0.04em] uppercase block leading-none">AMIAS</span>
            <span className="text-[10px] tracking-[0.25em] text-neutral-400 uppercase font-sans mt-1 block">Textile Studio Lima</span>
          </button>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-neutral-100 border border-neutral-200 rounded-full text-xs font-semibold text-neutral-600 uppercase">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Panel Operativo Taller</span>
            </div>

            {/* Clean Minimal Icon Logout Button */}
            <button
              onClick={handleLogoutAdmin}
              title="Cerrar Sesión"
              className="p-2 border border-neutral-200 hover:border-red-600 hover:bg-red-50 text-neutral-600 hover:text-red-600 rounded-full transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-8 flex-1 w-full">
        {/* Responsive 5-Module Tab Switcher matching login_admin_predictivo.html & Refresh Button */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-[#e8e8e8] pb-4">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs uppercase tracking-wider font-semibold p-1 bg-neutral-100 rounded-2xl border border-[#e8e8e8] w-full xl:w-auto">
            <button
              onClick={() => { setActiveTab('events'); setFeedback(null); }}
              className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'events' ? 'bg-[#121212] text-white shadow-sm font-bold' : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>1. Giras & Conciertos</span>
              <span className="px-2 py-0.5 bg-white text-black text-[10px] font-mono font-bold rounded-full">{events.length}</span>
            </button>

            <button
              onClick={() => { setActiveTab('catalog'); setFeedback(null); }}
              className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'catalog' ? 'bg-[#121212] text-white shadow-sm font-bold' : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>2. Catálogo</span>
              <span className="px-2 py-0.5 bg-white text-black text-[10px] font-mono font-bold rounded-full">{products.length}</span>
            </button>

            <button
              onClick={() => { setActiveTab('production'); setFeedback(null); }}
              className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'production' ? 'bg-[#121212] text-white shadow-sm font-bold' : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              <Scissors className="w-4 h-4" />
              <span>3. Producción & Ventas</span>
              <span className="px-2 py-0.5 bg-white text-black text-[10px] font-mono font-bold rounded-full">{queue.length}</span>
            </button>

            <button
              onClick={() => { setActiveTab('stock'); setFeedback(null); }}
              className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'stock' ? 'bg-[#121212] text-white shadow-sm font-bold' : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              <span>4. Almacén & Predicción</span>
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-bold rounded-full uppercase">Predicción N1</span>
            </button>

            <button
              onClick={() => { setActiveTab('attributes'); setFeedback(null); }}
              className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'attributes' ? 'bg-[#121212] text-white shadow-sm font-bold' : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              <span>5. Parámetros Textiles</span>
            </button>
          </div>

          <div className="flex items-center gap-2 self-end xl:self-auto shrink-0">
            <button
              onClick={() => setShowReplenishModal(true)}
              className="btn-dawn-primary px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Layers className="w-3.5 h-3.5 text-amber-300" />
              <span>+ Reabastecer Tela</span>
            </button>

            <button
              onClick={() => loadAllAdminData(authToken)}
              className="btn-dawn-secondary px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Actualizar Todo</span>
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div className={`p-4 border text-xs font-semibold flex items-center gap-2 rounded-2xl ${
            feedback.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-red-50 border-red-300 text-red-800'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            <span>{feedback.text}</span>
          </div>
        )}

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
            {activeTab === 'events' && (
              <EventsTab
                events={events}
                onOpenCreateModal={() => setShowEventModal(true)}
                onSelectDeleteEvent={(evt) => setEventToDelete(evt)}
              />
            )}

            {activeTab === 'catalog' && (
              <CatalogTab
                products={products}
                onSelectDeleteProduct={(prod) => setProductToDelete(prod)}
              />
            )}

            {activeTab === 'production' && (
              <ProductionQueueTable
                queue={queue}
                updatingOrderId={updatingOrderId}
                onAdvanceStatus={handleAdvanceStatus}
                onStartProductionWithStockDeduction={handleStartProductionWithStockDeduction}
                onSelectCancelOrder={(ord) => setOrderToCancel(ord)}
                onViewArtPresignedUrl={handleViewArtPresignedUrl}
                onOpenTechnicalSheet={(item) => setSelectedTechnicalItem(item)}
                onExportJSON={exportSalesDatasetJSON}
              />
            )}

            {/* MÓDULO 4: ALMACÉN TEXTIL & PREDICCIÓN DE DEMANDA (Estructura / Apartados para Semanas 10, 11 y 12) */}
            {activeTab === 'stock' && (
              <section className="space-y-10">
                {/* Bloque de Predicción de Demanda e Insumos por Concierto (Semanas 11 y 12) */}
                <div className="border-2 border-[#121212] rounded-3xl p-6 sm:p-8 bg-[#fbfbfb] space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-[#121212] text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                          Modelo Heurístico • Prevención de Quiebre de Tela
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight mt-2">
                        Previsión de Demanda para Conciertos
                      </h2>
                      <p className="text-xs text-neutral-500 mt-1">
                        Calcula automáticamente cuántos polos base (Algodón 24/1) necesitará el taller según el aforo del evento y el stock actual disponible.
                      </p>
                    </div>
                    <div className="w-full md:w-72">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-500 block mb-1.5">
                        Seleccionar Concierto a Proyectar
                      </label>
                      <select
                        disabled
                        className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs font-bold bg-neutral-100 text-neutral-400 cursor-not-allowed"
                      >
                        <option>Pendiente de activación (Semana 11)</option>
                      </select>
                    </div>
                  </div>

                  {/* Tarjetas de Métricas Predictivas (Sin contenido funcional aún) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-[#e8e8e8] p-5 rounded-2xl">
                      <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block">
                        Aforo del Recinto
                      </span>
                      <p className="text-2xl font-bold font-mono mt-1 text-neutral-300">—</p>
                      <span className="text-[11px] text-neutral-400 mt-1 block">
                        Capacidad oficial estimada
                      </span>
                    </div>
                    <div className="bg-white border border-[#e8e8e8] p-5 rounded-2xl">
                      <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block">
                        Demanda Proyectada (Tasa 0.4%)
                      </span>
                      <p className="text-2xl font-bold font-mono mt-1 text-neutral-300">—</p>
                      <span className="text-[11px] text-neutral-400 mt-1 block">
                        Prendas estimadas para este show
                      </span>
                    </div>
                    <div className="bg-white border border-[#e8e8e8] p-5 rounded-2xl">
                      <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block">
                        Déficit Crítico de Tela
                      </span>
                      <p className="text-2xl font-bold font-mono mt-1 text-neutral-300">—</p>
                      <span className="text-[11px] text-neutral-400 mt-1 block">
                        Polos lisos por comprar/confeccionar
                      </span>
                    </div>
                  </div>

                  {/* Desglose por Talla y Recomendación de Abastecimiento (Estructura vacía) */}
                  <div className="bg-white border border-[#e8e8e8] rounded-2xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                        Desglose Sugerido por Tallas (Patronaje Boxy 24/1)
                      </h3>
                      <button
                        type="button"
                        disabled
                        className="text-[11px] font-bold uppercase tracking-wider px-3.5 py-2 bg-neutral-200 text-neutral-400 rounded-xl cursor-not-allowed"
                      >
                        Auto-Rellenar en &quot;Ingresar Lote&quot; →
                      </button>
                    </div>
                    <div className="border border-dashed border-neutral-300 rounded-xl p-8 text-center">
                      <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                        Apartado reservado para Semanas 11 y 12 (Algoritmo Predictivo y Auto-Relleno)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bloque de Inventario Textil Liso (Semana 10) */}
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-semibold block">
                        INVENTARIO TEXTIL LISO
                      </span>
                      <h2 className="text-2xl font-bold uppercase tracking-tight mt-1">
                        Polos sin Estampar Disponibles
                      </h2>
                    </div>
                    <button
                      type="button"
                      disabled
                      className="px-5 py-3 text-xs font-bold uppercase tracking-wider bg-neutral-200 text-neutral-400 rounded-xl cursor-not-allowed"
                    >
                      + Ingresar Lote de Telas
                    </button>
                  </div>

                  <div className="border border-dashed border-neutral-300 rounded-2xl p-12 text-center bg-[#fbfbfb]">
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                      Apartado reservado para Semana 10 (Monitor de Inventario por SKU con Alerta &lt;10 unid. e Ingreso Transaccional)
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* MÓDULO 5: PARÁMETROS TEXTILES MAESTROS (Estructura / Apartados del Prototipo) */}
            {activeTab === 'attributes' && (
              <section className="space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* 1. COLORES DE TELA */}
                  <div className="border border-[#e8e8e8] rounded-2xl p-6 bg-white space-y-5 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                          PALETA TEXTIL MAESTRA
                        </span>
                        <h3 className="text-base font-bold uppercase tracking-wider mt-0.5">
                          Colores de Algodón Reactivo
                        </h3>
                      </div>
                      <div className="border border-dashed border-neutral-300 rounded-xl p-8 text-center bg-[#fbfbfb]">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                          Apartado de Paleta Textil (Sin contenido)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 2. TIPOS DE CORTE / SILUETAS */}
                  <div className="border border-[#e8e8e8] rounded-2xl p-6 bg-white space-y-5 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                          PATRONAJE &amp; DENSIDAD
                        </span>
                        <h3 className="text-base font-bold uppercase tracking-wider mt-0.5">
                          Tipos de Silueta / Cortes
                        </h3>
                      </div>
                      <div className="border border-dashed border-neutral-300 rounded-xl p-8 text-center bg-[#fbfbfb]">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                          Apartado de Cortes y Gramajes (Sin contenido)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3. TALLAS Y MEDIDAS */}
                  <div className="border border-[#e8e8e8] rounded-2xl p-6 bg-white space-y-5 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                          TABLA OFICIAL DE MEDIDAS
                        </span>
                        <h3 className="text-base font-bold uppercase tracking-wider mt-0.5">
                          Tallas &amp; Centímetros Exactos
                        </h3>
                      </div>
                      <div className="border border-dashed border-neutral-300 rounded-xl p-8 text-center bg-[#fbfbfb]">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                          Apartado de Tallas y Medidas (Sin contenido)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {selectedTechnicalItem && (
        <TechnicalSheetModal
          item={selectedTechnicalItem}
          onClose={() => setSelectedTechnicalItem(null)}
        />
      )}

      {orderToCancel && (
        <ConfirmCancelOrderModal
          orderNumber={orderToCancel.orderNumber}
          isCancelling={cancellingOrder}
          onConfirm={handleCancelOrder}
          onClose={() => setOrderToCancel(null)}
        />
      )}

      {showReplenishModal && (
        <ReplenishStockModal
          authToken={authToken}
          apiBase={API_BASE}
          onSuccess={() => {
            setFeedback({ type: 'success', text: '¡Stock de tela lisa reabastecido exitosamente en el almacén!' });
            loadAllAdminData(authToken);
          }}
          onClose={() => setShowReplenishModal(false)}
        />
      )}

      {productToDelete && (
        <ConfirmDeleteModal
          title="¿Quitar Prenda del Catálogo?"
          itemName={productToDelete.name}
          description="¿Estás seguro de que deseas eliminar la prenda"
          confirmButtonText="Sí, Quitar Prenda"
          isDeleting={deletingProduct}
          onConfirm={handleDeleteProduct}
          onCancel={() => setProductToDelete(null)}
        />
      )}

      {eventToDelete && (
        <ConfirmDeleteModal
          title="¿Quitar Concierto del Sistema?"
          itemName={eventToDelete.name}
          description="¿Estás seguro de que deseas eliminar el concierto"
          confirmButtonText="Sí, Quitar Concierto"
          isDeleting={deletingEvent}
          onConfirm={handleDeleteEvent}
          onCancel={() => setEventToDelete(null)}
        />
      )}

      {showEventModal && (
        <CreateEventModal
          authToken={authToken}
          apiBase={API_BASE}
          onSuccess={() => {
            setFeedback({ type: 'success', text: '¡Concierto registrado exitosamente!' });
            loadAllAdminData(authToken);
          }}
          onClose={() => setShowEventModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-[#e8e8e8] bg-[#fbfbfb] py-8 text-center text-[11px] text-neutral-400 font-sans">
        © 2026 AMIAS. Todos los derechos reservados. Lima, Perú.
      </footer>
    </div>
  );
}
