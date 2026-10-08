import React, { useState } from 'react';
import { X } from 'lucide-react';

export interface CreateEventModalProps {
  authToken: string;
  apiBase: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  authToken,
  apiBase,
  onSuccess,
  onClose,
}) => {
  const [newEventName, setNewEventName] = useState('');
  const [newEventVenue, setNewEventVenue] = useState('Estadio Nacional');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventCapacity, setNewEventCapacity] = useState(45000);
  const [creatingEvent, setCreatingEvent] = useState(false);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName.trim() || !newEventDate) return;

    try {
      setCreatingEvent(true);
      const res = await fetch(`${apiBase}/concert-events`, {
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

      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error al crear evento.');
    } finally {
      setCreatingEvent(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white border-2 border-[#121212] rounded-3xl w-full max-w-lg p-6 sm:p-8 relative space-y-6 shadow-2xl">
        <button
          onClick={onClose}
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
              className="w-full px-3.5 py-2.5 border border-[#cccccc] rounded-xl text-xs focus:outline-none focus:border-[#121212]"
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
                className="w-full px-3.5 py-2.5 border border-[#cccccc] rounded-xl bg-white text-xs font-semibold focus:outline-none focus:border-[#121212]"
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
                className="w-full px-3.5 py-2.5 border border-[#cccccc] rounded-xl text-xs font-mono focus:outline-none focus:border-[#121212]"
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
              className="w-full px-3.5 py-2.5 border border-[#cccccc] rounded-xl text-xs font-mono focus:outline-none focus:border-[#121212]"
            />
          </div>

          <div className="pt-4 border-t border-[#f0f0f0] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-dawn-secondary px-5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creatingEvent}
              className="btn-dawn-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {creatingEvent ? 'Guardando...' : 'Crear Concierto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
