'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Sparkles,
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
      <div className="bg-[#121212] text-white text-xs uppercase tracking-widest py-3 px-6 flex items-center justify-between font-semibold border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>PANEL ADMIN AMIAS — Publicación Restringida de Prendas (US-03)</span>
        </div>
        <span className="text-[10px] text-neutral-400 font-mono">Rol: ADMIN</span>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <div className="border-b border-[#e8e8e8] pb-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-widest font-bold text-neutral-400 block">
              TR-018 / TR-019
            </span>
            <h1 className="text-2xl font-bold uppercase tracking-tight text-[#121212] flex items-center gap-2 mt-1">
              <Package className="w-6 h-6 text-neutral-800" />
              Publicar Nueva Prenda en Catálogo
            </h1>
          </div>
        </div>

        {/* Auth Token Helper */}
        <div className="bg-neutral-50 border border-neutral-200 p-4 space-y-2 text-xs">
          <label className="font-bold uppercase tracking-wider block text-neutral-700">
            Token JWT de Autenticación (ADMIN):
          </label>
          <input
            type="text"
            value={authToken}
            onChange={(e) => {
              setAuthToken(e.target.value);
              localStorage.setItem('access_token', e.target.value);
            }}
            placeholder="Pega aquí el accessToken de /auth/login..."
            className="w-full px-3 py-2 border border-neutral-300 font-mono text-[11px] focus:outline-none focus:border-[#121212]"
          />
        </div>

        {/* Feedback Message */}
        {serverFeedback && (
          <div
            className={`p-4 border text-xs font-semibold flex items-center gap-2 rounded ${
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                className="w-full px-3.5 py-3 border border-[#cccccc] text-xs focus:outline-none focus:border-[#121212]"
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
                step="0.50"
                min="0.01"
                {...register('basePrice')}
                placeholder="55.00"
                className="w-full px-3.5 py-3 border border-[#cccccc] text-xs focus:outline-none focus:border-[#121212]"
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
              className="w-full px-3.5 py-2.5 border border-[#cccccc] text-xs focus:outline-none focus:border-[#121212]"
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
                className="w-full px-3.5 py-3 border border-[#cccccc] text-xs focus:outline-none focus:border-[#121212] bg-white"
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
                className="w-full px-3.5 py-3 border border-[#cccccc] text-xs focus:outline-none focus:border-[#121212] bg-white"
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
                    className={`flex items-center gap-2.5 p-3 border text-xs cursor-pointer transition select-none ${
                      isSelected
                        ? 'border-[#121212] bg-[#121212] text-white font-bold'
                        : 'border-[#e8e8e8] text-neutral-700 hover:border-neutral-400'
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
              className="w-full px-3.5 py-3 border border-[#cccccc] text-xs focus:outline-none focus:border-[#121212]"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#121212] hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Publicando Prenda...' : 'Publicar Prenda en Catálogo'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </main>
    </div>
  );
}
