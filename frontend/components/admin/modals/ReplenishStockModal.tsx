import React, { useEffect, useState } from 'react';
import { X, Layers } from 'lucide-react';

export interface ReplenishStockModalProps {
  authToken: string;
  apiBase: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const ReplenishStockModal: React.FC<ReplenishStockModalProps> = ({
  authToken,
  apiBase,
  onSuccess,
  onClose,
}) => {
  const [cuts, setCuts] = useState<{ id: string; name: string }[]>([]);
  const [colors, setColors] = useState<{ id: string; name: string }[]>([]);
  const [sizes, setSizes] = useState<{ id: string; label: string }[]>([]);

  const [selectedCutId, setSelectedCutId] = useState('');
  const [selectedColorId, setSelectedColorId] = useState('');
  const [selectedSizeId, setSelectedSizeId] = useState('');
  const [quantity, setQuantity] = useState(50);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadMasterData() {
      try {
        const res = await fetch(`${apiBase}/master-data`);
        if (res.ok) {
          const data = await res.json();
          setCuts(data.cuts || []);
          setColors(data.colors || []);
          setSizes(data.sizes || []);

          if (data.cuts?.[0]) setSelectedCutId(data.cuts[0].id);
          if (data.colors?.[0]) setSelectedColorId(data.colors[0].id);
          if (data.sizes?.[0]) setSelectedSizeId(data.sizes[0].id);
        }
      } catch (e) {
        console.error('Error al cargar datos maestros para reabastecimiento:', e);
      }
    }

    loadMasterData();
  }, [apiBase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCutId || !selectedColorId || !selectedSizeId || quantity <= 0) return;

    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/master-data/inventory/replenish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          cutId: selectedCutId,
          colorId: selectedColorId,
          sizeId: selectedSizeId,
          quantity: Number(quantity),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error al reabastecer stock de tela.');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error al reabastecer inventario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white border-2 border-[#121212] rounded-3xl w-full max-w-md p-6 sm:p-8 relative space-y-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-950 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-[#e8e8e8] pb-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold block">
            ENTRADA DE ALMACÉN
          </span>
          <h2 className="text-xl font-bold uppercase tracking-tight text-[#121212] flex items-center gap-2 mt-0.5">
            <Layers className="w-5 h-5 text-neutral-800" />
            Reabastecer Stock de Tela
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <div className="space-y-1">
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-700">
              1. Silueta / Corte *
            </label>
            <select
              value={selectedCutId}
              onChange={(e) => setSelectedCutId(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-[#cccccc] rounded-xl bg-white text-xs font-semibold focus:outline-none focus:border-[#121212]"
            >
              {cuts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-700">
                2. Color Reactivo *
              </label>
              <select
                value={selectedColorId}
                onChange={(e) => setSelectedColorId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#cccccc] rounded-xl bg-white text-xs font-semibold focus:outline-none focus:border-[#121212]"
              >
                {colors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-700">
                3. Talla *
              </label>
              <select
                value={selectedSizeId}
                onChange={(e) => setSelectedSizeId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#cccccc] rounded-xl bg-white text-xs font-semibold focus:outline-none focus:border-[#121212]"
              >
                {sizes.map((s) => (
                  <option key={s.id} value={s.id}>
                    Talla {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-700">
              Cantidad a Ingresar (Polos Base) *
            </label>
            <input
              type="number"
              required
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              placeholder="50"
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
              disabled={loading}
              className="btn-dawn-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Ingresando...' : 'Reabastecer Tela'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
