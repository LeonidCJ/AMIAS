import React from 'react';
import { XCircle, X } from 'lucide-react';

export interface ConfirmCancelOrderModalProps {
  orderNumber: string;
  isCancelling?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmCancelOrderModal: React.FC<ConfirmCancelOrderModalProps> = ({
  orderNumber,
  isCancelling = false,
  onConfirm,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white border-2 border-[#121212] rounded-3xl w-full max-w-md p-6 sm:p-8 relative space-y-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-950 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-2 text-center">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold uppercase text-[#121212]">
            ¿Cancelar Pedido {orderNumber}?
          </h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
            ¿Estás seguro de que deseas cancelar la orden{' '}
            <strong className="text-[#121212] font-bold">{orderNumber}</strong>? Esta acción
            cambiará su estado a <span className="font-bold text-red-600 uppercase">Cancelado</span> y la
            removerá de la cola activa de confección del taller.
          </p>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-dawn-secondary flex-1 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            Volver
          </button>
          <button
            type="button"
            disabled={isCancelling}
            onClick={onConfirm}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isCancelling ? 'Cancelando...' : 'Sí, Cancelar Pedido'}
          </button>
        </div>
      </div>
    </div>
  );
};
