import React from 'react';
import { Trash2, X } from 'lucide-react';

export interface ConfirmDeleteModalProps {
  title: string;
  itemName: string;
  description: string;
  confirmButtonText?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  title,
  itemName,
  description,
  confirmButtonText = 'Sí, Eliminar',
  isDeleting = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white border-2 border-[#121212] rounded-3xl w-full max-w-md p-6 sm:p-8 relative space-y-6 shadow-2xl">
        <button
          onClick={onCancel}
          className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-950 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-2 text-center">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <Trash2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold uppercase text-[#121212]">{title}</h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
            {description}{' '}
            <strong className="text-[#121212] font-bold">{itemName}</strong>? Esta acción no se
            puede deshacer.
          </p>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn-dawn-secondary flex-1 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isDeleting ? 'Eliminando...' : confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};
