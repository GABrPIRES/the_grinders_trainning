"use client";

import { AlertCircle, X } from "lucide-react";

interface ConfirmModalProps {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-surface-elevated rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-sm w-full">
        <div className="flex items-center justify-between p-5 border-b border-line">
          <h2 className="text-base font-bold text-content-primary flex items-center gap-2">
            <AlertCircle size={18} className={danger ? "text-red-500" : "text-brand"} />
            Confirmar ação
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-surface-subtle rounded-full transition-colors"
          >
            <X size={16} className="text-content-tertiary" />
          </button>
        </div>
        <div className="p-5">
          <p className="text-sm text-content-secondary">{message}</p>
        </div>
        <div className="p-5 border-t border-line flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-line-input text-content-primary font-bold py-2.5 rounded-lg hover:bg-surface-subtle transition-colors text-sm"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 font-bold py-2.5 rounded-lg transition-colors text-sm ${
              danger
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-brand hover:bg-brand-hover text-content-on-brand"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
