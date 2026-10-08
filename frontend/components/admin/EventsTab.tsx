import React from 'react';
import { Plus, Trash2, MapPin, Calendar, Users } from 'lucide-react';

export interface ConcertEventItem {
  id: string;
  name: string;
  venue: string;
  capacity: number;
  rate: number;
  eventDate: string;
}

export interface EventsTabProps {
  events: ConcertEventItem[];
  onOpenCreateModal: () => void;
  onSelectDeleteEvent: (event: ConcertEventItem) => void;
}

export const EventsTab: React.FC<EventsTabProps> = ({
  events,
  onOpenCreateModal,
  onSelectDeleteEvent,
}) => {
  return (
    <div className="space-y-6 font-sans">
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
            onClick={onOpenCreateModal}
            className="btn-dawn-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nuevo Concierto</span>
          </button>
        </div>

        {/* Concert Events List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.length === 0 ? (
            <p className="col-span-full py-8 text-center text-xs text-neutral-400">
              No hay conciertos registrados en el sistema.
            </p>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="p-5 border border-[#e8e8e8] bg-[#fafafa] rounded-2xl space-y-3 hover:border-neutral-900 transition flex flex-col justify-between shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <strong className="text-sm font-bold text-[#121212] block">
                    {event.name}
                  </strong>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold uppercase rounded-full border border-emerald-300">
                      Activo
                    </span>

                    <button
                      onClick={() => onSelectDeleteEvent(event)}
                      title="Quitar Concierto"
                      className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs font-mono text-neutral-600 space-y-1.5 pt-1">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Recinto: <strong className="text-neutral-900">{event.venue}</strong></span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Fecha Show: <strong className="text-neutral-900">{new Date(event.eventDate).toLocaleDateString('es-PE')}</strong></span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Aforo: <strong className="text-neutral-900">{event.capacity.toLocaleString()} personas</strong></span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
