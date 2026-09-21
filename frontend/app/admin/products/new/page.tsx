'use client';

import React, { useEffect, useState } from 'react';

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

export default function NewProductAdminPage() {
  const [events, setEvents] = useState<ConcertEvent[]>([]);
  const [cuts, setCuts] = useState<TextileCut[]>([]);
  const [sizes, setSizes] = useState<TextileSize[]>([]);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState<number | ''>('');
  const [concertEventId, setConcertEventId] = useState('');
  const [cutId, setCutId] = useState('');
  const [selectedSizeIds, setSelectedSizeIds] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [authToken, setAuthToken] = useState('');

  // UI States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    // Read auth token from localStorage or cookie if present
    const savedToken = localStorage.getItem('access_token') || '';
    setAuthToken(savedToken);

    async function loadMasterAndEvents() {
      try {
        setLoading(true);
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
        console.error('Error al cargar datos de maestros:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMasterAndEvents();
  }, [API_BASE]);

  const handleSizeToggle = (sizeId: string) => {
    setSelectedSizeIds((prev) =>
      prev.includes(sizeId) ? prev.filter((id) => id !== sizeId) : [...prev, sizeId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Client-side Validations
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'El nombre de la prenda no puede estar vacío.' });
      return;
    }
    if (!concertEventId) {
      setMessage({ type: 'error', text: 'Debes seleccionar una Gira / Concierto del selector maestro.' });
      return;
    }
    if (!cutId) {
      setMessage({ type: 'error', text: 'Debes seleccionar un Corte / Silueta textil del selector maestro.' });
      return;
    }
    if (selectedSizeIds.length === 0) {
      setMessage({ type: 'error', text: 'Debes seleccionar al menos una Talla activa para la prenda.' });
      return;
    }
    if (!basePrice || Number(basePrice) <= 0) {
      setMessage({ type: 'error', text: 'El precio base en PEN (S/) debe ser mayor a 0.' });
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          basePrice: Number(basePrice),
          concertEventId,
          cutId,
          sizeIds: selectedSizeIds,
          imageUrl: imageUrl.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al publicar la prenda.');
      }

      setMessage({ type: 'success', text: `¡Prenda '${data.product.name}' publicada exitosamente en el catálogo!` });

      // Reset Form
      setName('');
      setDescription('');
      setBasePrice('');
      setSelectedSizeIds([]);
      setImageUrl('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error inesperado al publicar.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#121212] font-sans">
      <!-- Admin Top Banner -->
      <div className="bg-[#121212] text-white text-xs uppercase tracking-widest py-3 px-6 flex items-center justify-between font-semibold">
        <span>PANEL ADMIN AMIAS — Publicación Restringida de Prendas (US-03)</span>
        <span className="text-[10px] text-neutral-400">Rol: ADMIN</span>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <div className="border-b border-[#e8e8e8] pb-4">
          <span className="text-[11px] uppercase tracking-widest font-bold text-neutral-400 block">TR-018</span>
          <h1 class="text-2xl font-bold uppercase tracking-tight text-[#121212]">Publicar Nueva Prenda en Catálogo</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Formulario restringido para la creación de prendas asociadas a giras oficiales y parámetros textiles maestros.
          </p>
        </div>

        {/* Auth Token Input Helper */}
        <div className="bg-neutral-50 border border-neutral-200 p-4 space-y-2 text-xs">
          <label className="font-bold uppercase tracking-wider block text-neutral-700">
            Token de Autenticación JWT (ADMIN):
          </label>
          <input
            type="text"
            value={authToken}
            onChange={(e) => {
              setAuthToken(e.target.value);
              localStorage.setItem('access_token', e.target.value);
            }}
            placeholder="Pega aquí el accessToken obtenido en /auth/login..."
            className="w-full px-3 py-2 border border-neutral-300 font-mono text-[11px] focus:outline-none focus:border-[#121212]"
          />
        </div>

        {/* Notification Feedback Message */}
        {message && (
          <div
            className={`p-4 border text-xs font-semibold rounded ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-red-50 border-red-300 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Publishing Form (TR-018) */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Garment Name & Base Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs uppercase tracking-wider font-bold text-neutral-700 block">
                Nombre de la Prenda *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Polo Oversize Boxy Spheres 2026"
                className="w-full px-3.5 py-3 border border-[#cccccc] text-xs focus:outline-none focus:border-[#121212]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider font-bold text-neutral-700 block">
                Precio Base en Soles (S/ PEN) *
              </label>
              <input
                type="number"
                step="0.50"
                min="1"
                required
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="55.00"
                className="w-full px-3.5 py-3 border border-[#cccccc] text-xs focus:outline-none focus:border-[#121212]"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider font-bold text-neutral-700 block">
              Descripción Corta (Opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. Confeccionado en tejido peinado reactivo 24/1 de 240g con caída de hombro caídos."
              className="w-full px-3.5 py-2.5 border border-[#cccccc] text-xs focus:outline-none focus:border-[#121212]"
            />
          </div>

          {/* Strict Selectors: Concert Event & Textile Cut */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Tour / Concert Event Selector */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider font-bold text-neutral-700 block">
                Gira / Concierto Asignado *
              </label>
              <select
                required
                value={concertEventId}
                onChange={(e) => setConcertEventId(e.target.value)}
                className="w-full px-3.5 py-3 border border-[#cccccc] text-xs focus:outline-none focus:border-[#121212] bg-white"
              >
                <option value="">-- Selecciona una Gira Maestro --</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name} ({event.venue})
                  </option>
                ))}
              </select>
            </div>

            {/* Textile Cut / Silhouette Selector */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider font-bold text-neutral-700 block">
                Corte / Silueta Textil *
              </label>
              <select
                required
                value={cutId}
                onChange={(e) => setCutId(e.target.value)}
                className="w-full px-3.5 py-3 border border-[#cccccc] text-xs focus:outline-none focus:border-[#121212] bg-white"
              >
                <option value="">-- Selecciona un Corte Maestro --</option>
                {cuts.map((cut) => (
                  <option key={cut.id} value={cut.id}>
                    {cut.name} ({cut.grammageGsm}g)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reactive Checkboxes: Sizes Selection */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-bold text-neutral-700 block">
              Tallas Activas Autorizadas * (Selecciona al menos una)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {sizes.map((size) => {
                const isSelected = selectedSizeIds.includes(size.id);
                return (
                  <label
                    key={size.id}
                    className={`flex items-center gap-2.5 p-3 border text-xs cursor-pointer transition select-none ${
                      isSelected
                        ? 'border-[#121212] bg-[#121212] text-white font-bold'
                        : 'border-[#e8e8e8] text-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSizeToggle(size.id)}
                      className="hidden"
                    />
                    <span>Talla {size.label}</span>
                    <span className="text-[10px] opacity-75">
                      ({size.chestCm}cm x {size.lengthCm}cm)
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider font-bold text-neutral-700 block">
              URL de Imagen (Opcional)
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-3 border border-[#cccccc] text-xs focus:outline-none focus:border-[#121212]"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-[#121212] hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-[0.15em] transition active:scale-95 disabled:opacity-50"
          >
            {submitting ? 'Publicando Prenda...' : 'Publicar Prenda en Catálogo →'}
          </button>
        </form>
      </main>
    </div>
  );
}
