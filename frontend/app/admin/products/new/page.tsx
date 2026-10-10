'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Check,
  AlertCircle,
  ShieldCheck,
  Package,
  Tag,
  Scissors,
  Maximize2,
  CheckSquare,
  Square,
  ArrowRight,
  ArrowLeft,
  LogOut,
} from 'lucide-react';

interface ConcertEvent {
  id: string;
  name: string;
  venue: string;
}

interface TextileCut {
  id: string;
  name: string;
  grammageGsm: number;
}

interface TextileSize {
  id: string;
  label: string;
  chestCm: number;
  lengthCm: number;
}

// Zod Validation Schema matching backend DTO & Value Object domain rules
const productSchema = z.object({
  name: z.string().min(1, 'El nombre de la prenda es obligatorio.'),
  description: z.string().optional(),
  basePrice: z
    .coerce
    .number({ invalid_type_error: 'El precio debe ser un número válido.' })
    .min(0.01, 'El precio base en Soles (S/) debe ser mayor a 0.'),
  concertEventId: z.string().min(1, 'Debes seleccionar una Gira / Concierto del selector maestro.'),
  cutId: z.string().min(1, 'Debes seleccionar un Corte / Silueta textil del selector maestro.'),
  sizeIds: z.array(z.string()).min(1, 'Debes seleccionar al menos una Talla activa para la prenda.'),
  imageUrl: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function NewProductAdminPage() {
  const router = useRouter();
  const [events, setEvents] = useState<ConcertEvent[]>([]);
  const [cuts, setCuts] = useState<TextileCut[]>([]);
  const [sizes, setSizes] = useState<TextileSize[]>([]);
  const [authToken, setAuthToken] = useState('');
  const [serverFeedback, setServerFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      basePrice: undefined,
      concertEventId: '',
      cutId: '',
      sizeIds: [],
      imageUrl: '',
    },
  });

  const selectedSizeIds = watch('sizeIds') || [];

  useEffect(() => {
    const savedToken = localStorage.getItem('access_token') || '';
    setAuthToken(savedToken);

    async function loadMasterAndEvents() {
      try {
        const [resEvents, resMaster] = await Promise.all([
          fetch(`${API_BASE}/concert-events`, {
            headers: savedToken ? { Authorization: `Bearer ${savedToken}` } : {},
          }),
          fetch(`${API_BASE}/master-data`, {
            headers: savedToken ? { Authorization: `Bearer ${savedToken}` } : {},
          }),
        ]);

        if (resEvents.ok) {
          const eventsData = await resEvents.json();
          setEvents(eventsData);
        }

        if (resMaster.ok) {
          const masterData = await resMaster.json();
          setCuts(masterData.cuts || []);
          setSizes(masterData.sizes || []);
        }
      } catch (err) {
        console.error('Error al cargar datos maestros:', err);
      }
    }

    loadMasterAndEvents();
  }, [API_BASE]);

  const handleSizeToggle = (sizeId: string) => {
    const current = [...selectedSizeIds];
    const updated = current.includes(sizeId)
      ? current.filter((id) => id !== sizeId)
      : [...current, sizeId];

    setValue('sizeIds', updated, { shouldValidate: true });
  };

  const handleLogoutAdmin = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    router.push('/login');
  };

  const onSubmit = async (data: ProductFormData) => {
    setServerFeedback(null);

    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: data.name.trim(),
          description: data.description?.trim() || undefined,
          basePrice: Number(data.basePrice),
          concertEventId: data.concertEventId,
          cutId: data.cutId,
          sizeIds: data.sizeIds,
          imageUrl: data.imageUrl?.trim() || undefined,
        }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || 'Error al publicar la prenda.');
      }

      setServerFeedback({
        type: 'success',
        text: `¡Prenda '${responseData.product.name}' publicada exitosamente en el catálogo!`,
      });

      reset();
    } catch (err: any) {
      setServerFeedback({
        type: 'error',
        text: err.message || 'Error inesperado al conectar con el servidor.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#121212] font-sans selection:bg-neutral-900 selection:text-white">
      {/* Top Admin Header */}
      <header className="border-b border-[#e8e8e8] bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <button onClick={() => router.push('/catalog')} className="text-left cursor-pointer">
            <span className="text-2xl font-extrabold tracking-[-0.04em] uppercase block leading-none">AMIAS</span>
            <span className="text-[10px] tracking-[0.25em] text-neutral-400 uppercase font-sans mt-1 block">Textile Studio Lima</span>
          </button>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-neutral-100 border border-neutral-200 rounded-full text-xs font-semibold text-neutral-600 uppercase">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Alta de Prendas (ADMIN)</span>
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

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Back Link */}
        <button
          onClick={() => router.push('/admin/production')}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-600 hover:text-neutral-950 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Consola de Taller</span>
        </button>

        <div className="border-b border-[#e8e8e8] pb-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-widest font-bold text-neutral-400 block">
              MÓDULO 2 — PUBLICACIÓN DE PRENDAS
            </span>
            <h1 className="text-2xl font-bold uppercase tracking-tight text-[#121212] flex items-center gap-2 mt-1">
              <Package className="w-6 h-6 text-neutral-800" />
              Publicar Nueva Prenda en Catálogo
            </h1>
          </div>
        </div>

        {/* Feedback Message */}
        {serverFeedback && (
          <div
            className={`p-4 border text-xs font-semibold flex items-center gap-2 rounded-2xl ${
              serverFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-red-50 border-red-300 text-red-800'
            }`}
          >
            {serverFeedback.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{serverFeedback.text}</span>
          </div>
        )}

        {/* Form managed with React Hook Form + Zod */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 border border-[#e8e8e8] p-8 rounded-2xl shadow-sm bg-white">
          {/* Garment Name & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs uppercase tracking-wider font-bold text-neutral-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-neutral-500" />
                Nombre de la Prenda *
              </label>
              <input
                type="text"
                {...register('name')}
                placeholder="Ej. Polo Boxy Oversize Spheres Tour 2026"
                className="w-full px-3.5 py-3 border border-[#cccccc] text-xs focus:outline-none focus:border-[#121212] rounded-xl"
              />
              {errors.name && (
                <p className="text-[11px] text-red-600 font-semibold">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider font-bold text-neutral-700 block">
                Precio Base (S/ PEN) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                {...register('basePrice')}
                placeholder="55.00"
                className="w-full px-3.5 py-3 border border-[#cccccc] text-xs focus:outline-none focus:border-[#121212] rounded-xl"
              />
              {errors.basePrice && (
                <p className="text-[11px] text-red-600 font-semibold">{errors.basePrice.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider font-bold text-neutral-700 block">
              Descripción Corta (Opcional)
            </label>
            <textarea
              rows={2}
              {...register('description')}
              placeholder="Ej. Confeccionado en tejido peinado reactivo 24/1 de 240g de máxima densidad."
              className="w-full px-3.5 py-2.5 border border-[#cccccc] text-xs focus:outline-none focus:border-[#121212] rounded-xl"
            />
          </div>

          {/* Strict Dropdown Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Tour / Concert Event Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider font-bold text-neutral-700 block">
                Gira / Concierto Asignado *
              </label>
              <select
                {...register('concertEventId')}
                className="w-full px-3.5 py-3 border border-[#cccccc] text-xs focus:outline-none focus:border-[#121212] bg-white rounded-xl"
              >
                <option value="">-- Selecciona una Gira Maestro --</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name} ({event.venue})
                  </option>
                ))}
              </select>
              {errors.concertEventId && (
                <p className="text-[11px] text-red-600 font-semibold">{errors.concertEventId.message}</p>
              )}
            </div>

            {/* Cut / Silhouette Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider font-bold text-neutral-700 flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-neutral-500" />
                Corte / Silueta Textil *
              </label>
              <select
                {...register('cutId')}
                className="w-full px-3.5 py-3 border border-[#cccccc] text-xs focus:outline-none focus:border-[#121212] bg-white rounded-xl"
              >
                <option value="">-- Selecciona un Corte Maestro --</option>
                {cuts.map((cut) => (
                  <option key={cut.id} value={cut.id}>
                    {cut.name} ({cut.grammageGsm}g)
                  </option>
                ))}
              </select>
              {errors.cutId && (
                <p className="text-[11px] text-red-600 font-semibold">{errors.cutId.message}</p>
              )}
            </div>
          </div>

          {/* Sizes Reactive Checkboxes */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-bold text-neutral-700 flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-neutral-500" />
              Tallas Activas Autorizadas * (Selecciona al menos una)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {sizes.map((size) => {
                const isSelected = selectedSizeIds.includes(size.id);
                return (
                  <div
                    key={size.id}
                    onClick={() => handleSizeToggle(size.id)}
                    className={`flex items-center gap-2.5 p-3 border text-xs cursor-pointer transition select-none rounded-xl ${
                      isSelected
                        ? 'border-[#121212] bg-[#121212] text-white font-bold'
                        : 'border-[#e8e8e8] text-neutral-700 hover:border-neutral-400 bg-neutral-50'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-white" />
                    ) : (
                      <Square className="w-4 h-4 text-neutral-400" />
                    )}
                    <span>Talla {size.label}</span>
                    <span className="text-[10px] opacity-75">
                      ({size.chestCm}cm x {size.lengthCm}cm)
                    </span>
                  </div>
                );
              })}
            </div>
            {errors.sizeIds && (
              <p className="text-[11px] text-red-600 font-semibold">{errors.sizeIds.message}</p>
            )}
          </div>

          {/* Image URL */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider font-bold text-neutral-700 block">
              URL de Imagen (Opcional)
            </label>
            <input
              type="text"
              {...register('imageUrl')}
              placeholder="https://..."
              className="w-full px-3.5 py-3 border border-[#cccccc] text-xs focus:outline-none focus:border-[#121212] rounded-xl"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-dawn-primary w-full py-4 text-xs font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <span>{isSubmitting ? 'Publicando Prenda...' : 'Publicar Prenda en Catálogo'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </main>
    </div>
  );
}
