'use client';

import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  Ruler,
  User,
  MapPin,
  Sparkles,
  Scissors,
  CheckCircle2,
  Clock,
  Shirt,
  Printer,
  Calendar,
  Save,
  AlertCircle,
} from 'lucide-react';
import { OrderTracker } from '../../components/tracker/OrderTracker';
import { formatCurrencyPEN } from '../../lib/utils/format-currency';

interface UserProfileData {
  id: string | null;
  customerName: string;
  customerPhone: string;
  email: string;
  preferredCut: { id: string; name: string; grammageGsm: number } | null;
  preferredSize: { id: string; label: string; chestCm: number; lengthCm: number; shoulderCm: number } | null;
  deliveryAddress: string;
  deliveryDistrict: string;
  deliveryReference: string;
}

interface ActiveOrderData {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: {
    productName: string;
    concertEventName: string;
    eventVenue: string;
    eventDate: string;
    cutName: string;
    grammageGsm: number;
    sizeLabel: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'sizing' | 'personal' | 'address'>('orders');

  // Master Data
  const [cuts, setCuts] = useState<{ id: string; name: string; grammageGsm: number }[]>([]);
  const [sizes, setSizes] = useState<{ id: string; label: string; chestCm: number; lengthCm: number; shoulderCm: number }[]>([]);

  // Profile & Order Data
  const [profile, setProfile] = useState<UserProfileData>({
    id: null,
    customerName: 'Carlos Rivas',
    customerPhone: '987654321',
    email: 'carlos.rivas@gmail.com',
    preferredCut: null,
    preferredSize: null,
    deliveryAddress: 'Av. Petit Thouars 1850, Dpto 402',
    deliveryDistrict: 'Lince',
    deliveryReference: 'Frente al parque, portón negro',
  });

  const [activeOrder, setActiveOrder] = useState<ActiveOrderData | null>(null);
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);

  // Form States
  const [selectedCutId, setSelectedCutId] = useState('');
  const [selectedSizeId, setSelectedSizeId] = useState('');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formDistrict, setFormDistrict] = useState('');
  const [formReference, setFormReference] = useState('');

  const [feedback, setServerFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    loadMasterDataAndProfile();
  }, [API_BASE]);

  const loadMasterDataAndProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token') || '';

      // Load master data
      const resMaster = await fetch(`${API_BASE}/master-data`);
      if (resMaster.ok) {
        const mData = await resMaster.json();
        setCuts(mData.cuts || []);
        setSizes(mData.sizes || []);
      }

      // Load profile & pattern history for default customer "987654321" or authenticated user
      const identifier = '987654321';
      const resProfile = await fetch(`${API_BASE}/customers/${identifier}/profile-and-pattern`);
      if (resProfile.ok) {
        const pData = await resProfile.json();
        setProfile(pData.profile);
        setActiveOrder(pData.activeOrder);
        setCompletedOrders(pData.completedOrdersHistory || []);

        // Sync forms
        setFormName(pData.profile.customerName || 'Carlos Rivas');
        setFormPhone(pData.profile.customerPhone || '987654321');
        setFormAddress(pData.profile.deliveryAddress || 'Av. Petit Thouars 1850, Dpto 402');
        setFormDistrict(pData.profile.deliveryDistrict || 'Lince');
        setFormReference(pData.profile.deliveryReference || 'Frente al parque, portón negro');

        if (pData.profile.preferredCut) setSelectedCutId(pData.profile.preferredCut.id);
        if (pData.profile.preferredSize) setSelectedSizeId(pData.profile.preferredSize.id);
      }
    } catch (e) {
      console.error('Error al cargar datos del perfil:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async (type: 'sizing' | 'personal' | 'address') => {
    setServerFeedback(null);
    try {
      const identifier = profile.customerPhone || '987654321';

      let bodyPayload: any = {};
      if (type === 'sizing') {
        bodyPayload = { preferredCutId: selectedCutId, preferredSizeId: selectedSizeId };
      } else if (type === 'personal') {
        bodyPayload = { customerName: formName, customerPhone: formPhone };
      } else if (type === 'address') {
        bodyPayload = {
          deliveryAddress: formAddress,
          deliveryDistrict: formDistrict,
          deliveryReference: formReference,
        };
      }

      const res = await fetch(`${API_BASE}/customers/${identifier}/preferences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error al actualizar preferencias.');
      }

      setServerFeedback({
        type: 'success',
        text: '¡Preferencias actualizadas correctamente en tu perfil!',
      });

      await loadMasterDataAndProfile();
    } catch (err: any) {
      setServerFeedback({
        type: 'error',
        text: err.message || 'Error al actualizar información.',
      });
    }
  };

  const currentSelectedSizeObj = sizes.find((s) => s.id === selectedSizeId) || profile.preferredSize || sizes[2];

  return (
    <div className="min-h-screen bg-white text-[#121212] font-sans selection:bg-neutral-900 selection:text-white">
      {/* Top Banner */}
      <div className="bg-[#121212] text-white text-[11px] tracking-[0.15em] uppercase text-center py-2.5 px-4 font-semibold flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>Envíos garantizados antes del show • Lima 2026 • Algodón 24/1 Reactivo</span>
      </div>

      {/* Header */}
      <header className="border-b border-[#e8e8e8] bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <div>
            <span className="text-2xl font-extrabold tracking-[-0.04em] uppercase block leading-none">AMIAS</span>
            <span className="text-[10px] tracking-[0.25em] text-neutral-400 uppercase font-sans mt-1 block">Textile Studio Lima</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#121212] text-white flex items-center justify-center text-xs font-bold font-mono">
              CR
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              {profile.customerName || 'Carlos Rivas'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-10">
        {/* Banner Title */}
        <div className="border-b border-[#e8e8e8] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">
              PORTAL PRIVADO DEL CLIENTE
            </span>
            <h1 className="text-3xl font-bold uppercase tracking-tight text-[#121212] mt-0.5">
              Mi Perfil & Pedidos
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Gestiona tus órdenes activas en taller y tus medidas corporales guardadas.
            </p>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 border text-xs font-semibold flex items-center gap-2 rounded-2xl ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-red-50 border-red-300 text-red-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Main Grid: Sidebar Navigation + Content Tabs matching login_user_normal.html */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3 space-y-4">
            <div className="p-5 border border-[#e8e8e8] bg-[#fbfbfb] rounded-2xl space-y-2 shadow-sm">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block font-bold">
                CLIENTE AUTENTICADO
              </span>
              <strong className="text-sm font-bold text-neutral-900 block">{profile.customerName}</strong>
              <span className="text-xs text-neutral-500 block font-mono">{profile.email}</span>
              <span className="text-[11px] font-mono text-neutral-400 block">{profile.customerPhone}</span>
            </div>

            <nav className="border border-[#e8e8e8] rounded-2xl overflow-hidden divide-y divide-[#f0f0f0] text-xs uppercase tracking-wider font-semibold bg-white">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full p-4 text-left flex items-center justify-between transition ${
                  activeTab === 'orders'
                    ? 'text-[#121212] bg-neutral-100 font-bold border-l-4 border-[#121212]'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span>1. Pedidos en Confección</span>
                </div>
                <span className="text-[10px] bg-[#121212] text-white px-2 py-0.5 rounded font-mono">
                  {activeOrder ? '1' : '0'}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('sizing')}
                className={`w-full p-4 text-left flex items-center justify-between transition ${
                  activeTab === 'sizing'
                    ? 'text-[#121212] bg-neutral-100 font-bold border-l-4 border-[#121212]'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  <span>2. Tallas & Patronaje</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('personal')}
                className={`w-full p-4 text-left flex items-center justify-between transition ${
                  activeTab === 'personal'
                    ? 'text-[#121212] bg-neutral-100 font-bold border-l-4 border-[#121212]'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>3. Datos Personales</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('address')}
                className={`w-full p-4 text-left flex items-center justify-between transition ${
                  activeTab === 'address'
                    ? 'text-[#121212] bg-neutral-100 font-bold border-l-4 border-[#121212]'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>4. Dirección de Despacho</span>
                </div>
              </button>
            </nav>
          </aside>

          {/* Subpaneles de Perfil */}
          <section className="lg:col-span-9 space-y-6">
            {/* SUBTAB 1: PEDIDOS EN CONFECCIÓN CON TRACKER DE 4 ETAPAS */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                {activeOrder ? (
                  <div className="border border-[#e8e8e8] rounded-3xl p-6 lg:p-8 bg-white space-y-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#f0f0f0] pb-4 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-[#121212] font-mono">
                            {activeOrder.orderNumber}
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                            {activeOrder.status === 'CONFIRMED'
                              ? 'Confirmado'
                              : activeOrder.status === 'IN_CUTTING'
                              ? 'En Mesa de Corte'
                              : activeOrder.status === 'DTF_PRINTING'
                              ? 'Estampado DTF'
                              : 'Listo para Entrega'}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                          Concierto:{' '}
                          <strong>
                            {activeOrder.items[0]?.concertEventName || 'Coldplay Music of the Spheres (Estadio Nacional)'}
                          </strong>
                        </p>
                      </div>
                      <span className="text-lg font-bold text-[#121212] font-mono">
                        {formatCurrencyPEN(activeOrder.totalAmount)}
                      </span>
                    </div>

                    {/* TR-026 Tracker de 4 Etapas */}
                    <OrderTracker
                      currentStatus={activeOrder.status}
                      orderNumber={activeOrder.orderNumber}
                      updatedAt={activeOrder.createdAt}
                    />

                    {/* 3 Technical Spec Cards matching login_user_normal.html */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs font-sans">
                      <div className="p-4 bg-[#fbfbfb] border border-[#e8e8e8] rounded-2xl space-y-1">
                        <span className="text-neutral-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                          <Shirt className="w-3.5 h-3.5" /> Prenda & Corte
                        </span>
                        <strong className="text-neutral-900 block">
                          {activeOrder.items[0]?.cutName || 'Oversize Boxy'} ({activeOrder.items[0]?.grammageGsm || 240}g)
                        </strong>
                        <span className="text-neutral-500">
                          Negro Reactivo • Talla {activeOrder.items[0]?.sizeLabel || 'L'}
                        </span>
                      </div>

                      <div className="p-4 bg-[#fbfbfb] border border-[#e8e8e8] rounded-2xl space-y-1">
                        <span className="text-neutral-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                          <Printer className="w-3.5 h-3.5" /> Impresión DTF
                        </span>
                        <strong className="text-neutral-900 block">DTF Textil 300 DPI</strong>
                        <span className="text-neutral-500">Espalda A3 (30 × 42 cm)</span>
                      </div>

                      <div className="p-4 bg-[#fbfbfb] border border-[#e8e8e8] rounded-2xl space-y-1">
                        <span className="text-neutral-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Entrega Garantizada
                        </span>
                        <strong className="text-neutral-900 block">
                          {activeOrder.items[0]?.eventDate
                            ? new Date(activeOrder.items[0].eventDate).toLocaleDateString('es-PE')
                            : '24/10/2026'}
                        </strong>
                        <span className="text-neutral-500">Pre-show garantizado</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-neutral-300 rounded-3xl text-center text-xs text-neutral-500">
                    No tienes ningún pedido activo en confección en este momento.
                  </div>
                )}

                {/* Delivered Order History List */}
                <div className="border border-[#e8e8e8] p-6 lg:p-8 bg-white rounded-3xl space-y-4 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#121212]">
                    Historial de Compras Entregadas
                  </h3>
                  {completedOrders.length === 0 ? (
                    <p className="text-xs text-neutral-400 py-2">Aún no registras pedidos anteriores finalizados.</p>
                  ) : (
                    <div className="divide-y divide-[#f0f0f0] text-xs">
                      {completedOrders.map((o) => (
                        <div key={o.id} className="py-3 flex items-center justify-between">
                          <div>
                            <strong className="text-neutral-900 block">{o.items[0]?.productName}</strong>
                            <span className="text-neutral-400 text-[11px] font-mono">
                              Orden {o.orderNumber} • {new Date(o.createdAt).toLocaleDateString('es-PE')}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-neutral-900 block font-mono">
                              {formatCurrencyPEN(o.totalAmount)}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-bold uppercase">Entregado</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUBTAB 2: TALLAS & PATRONAJE COMPLETO (TR-027) */}
            {activeTab === 'sizing' && (
              <div className="border border-[#e8e8e8] p-6 lg:p-8 bg-white rounded-3xl space-y-6 shadow-sm">
                <div>
                  <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">
                    PATRONAJE TEXTIL ANATÓMICO
                  </span>
                  <h2 className="text-xl font-bold uppercase text-[#121212] mt-0.5">Medidas Guardadas</h2>
                  <p class="text-xs text-neutral-500 mt-1">
                    El personalizador aplicará estas medidas automáticamente al abrir o configurar un nuevo diseño.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-neutral-700">
                      Corte Habitual
                    </label>
                    <select
                      value={selectedCutId}
                      onChange={(e) => setSelectedCutId(e.target.value)}
                      className="w-full px-3.5 py-3 border border-[#cccccc] rounded-xl bg-white text-xs font-semibold focus:outline-none focus:border-[#121212]"
                    >
                      <option value="">-- Selecciona un Corte --</option>
                      {cuts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.grammageGsm}g)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-neutral-700">
                      Talla Base
                    </label>
                    <select
                      value={selectedSizeId}
                      onChange={(e) => setSelectedSizeId(e.target.value)}
                      className="w-full px-3.5 py-3 border border-[#cccccc] rounded-xl bg-white text-xs font-semibold focus:outline-none focus:border-[#121212]"
                    >
                      <option value="">-- Selecciona una Talla --</option>
                      {sizes.map((s) => (
                        <option key={s.id} value={s.id}>
                          Talla {s.label} ({s.chestCm} × {s.lengthCm} cm)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3-Column Reference Measurement Grid matching login_user_normal.html */}
                {currentSelectedSizeObj && (
                  <div className="p-5 bg-[#fafafa] border border-[#e8e8e8] rounded-2xl space-y-3 text-xs">
                    <span className="font-bold uppercase tracking-wider text-neutral-900 block">
                      Medidas de referencia de tu talla {currentSelectedSizeObj.label} seleccionada:
                    </span>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-white p-3 border border-[#e8e8e8] rounded-xl shadow-xs">
                        <span className="text-[10px] text-neutral-400 block uppercase font-bold">Ancho Pecho</span>
                        <strong className="text-base text-neutral-900 font-mono">
                          {currentSelectedSizeObj.chestCm} cm
                        </strong>
                      </div>
                      <div className="bg-white p-3 border border-[#e8e8e8] rounded-xl shadow-xs">
                        <span className="text-[10px] text-neutral-400 block uppercase font-bold">Largo Total</span>
                        <strong className="text-base text-neutral-900 font-mono">
                          {currentSelectedSizeObj.lengthCm} cm
                        </strong>
                      </div>
                      <div className="bg-white p-3 border border-[#e8e8e8] rounded-xl shadow-xs">
                        <span className="text-[10px] text-neutral-400 block uppercase font-bold">Caída Hombro</span>
                        <strong className="text-base text-neutral-900 font-mono">
                          {currentSelectedSizeObj.shoulderCm} cm
                        </strong>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleSavePreferences('sizing')}
                  className="btn-dawn-primary px-6 py-3 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Talla Predeterminada</span>
                </button>
              </div>
            )}

            {/* SUBTAB 3: DATOS PERSONALES */}
            {activeTab === 'personal' && (
              <div className="border border-[#e8e8e8] p-6 lg:p-8 bg-white rounded-3xl space-y-6 shadow-sm">
                <h2 className="text-xl font-bold uppercase text-[#121212]">Datos Personales</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="space-y-1">
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-700">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3.5 py-3 border border-[#cccccc] text-xs focus:outline-none focus:border-[#121212] rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-700">
                      WhatsApp de Contacto
                    </label>
                    <input
                      type="tel"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-3.5 py-3 border border-[#cccccc] text-xs focus:outline-none focus:border-[#121212] rounded-xl font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleSavePreferences('personal')}
                  className="btn-dawn-primary px-6 py-3 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Actualizar Datos</span>
                </button>
              </div>
            )}

            {/* SUBTAB 4: DIRECCIÓN DE DESPACHO */}
            {activeTab === 'address' && (
              <div className="border border-[#e8e8e8] p-6 lg:p-8 bg-white rounded-3xl space-y-6 shadow-sm">
                <h2 className="text-xl font-bold uppercase text-[#121212]">Dirección de Entrega</h2>
                <div className="space-y-4 text-xs font-sans">
                  <div className="space-y-1">
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-700">
                      Dirección y Distrito en Lima
                    </label>
                    <input
                      type="text"
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      placeholder="Av. Petit Thouars 1850, Dpto 402 - Lince"
                      className="w-full px-3.5 py-3 border border-[#cccccc] text-xs focus:outline-none focus:border-[#121212] rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-700">
                      Referencia de Despacho
                    </label>
                    <input
                      type="text"
                      value={formReference}
                      onChange={(e) => setFormReference(e.target.value)}
                      placeholder="Frente al parque, portón negro"
                      className="w-full px-3.5 py-3 border border-[#cccccc] text-xs focus:outline-none focus:border-[#121212] rounded-xl"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleSavePreferences('address')}
                  className="btn-dawn-primary px-6 py-3 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Dirección</span>
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
