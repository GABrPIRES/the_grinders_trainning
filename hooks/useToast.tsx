"use client";

import { useState, useCallback, ReactElement } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, X } from "lucide-react";

type ToastType = "success" | "error" | "warning";

interface ToastState {
  message: string;
  type: ToastType;
}

const STYLES: Record<ToastType, { wrapper: string; icon: ReactElement }> = {
  success: {
    wrapper: "bg-green-900/90 border-green-700/60 text-green-200",
    icon: <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />,
  },
  error: {
    wrapper: "bg-red-900/90 border-red-700/60 text-red-200",
    icon: <AlertCircle size={16} className="text-red-400 flex-shrink-0" />,
  },
  warning: {
    wrapper: "bg-yellow-900/90 border-yellow-700/60 text-yellow-200",
    icon: <AlertTriangle size={16} className="text-yellow-400 flex-shrink-0" />,
  },
};

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const ToastEl = toast ? (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] border px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-sm font-medium max-w-sm text-center ${STYLES[toast.type].wrapper}`}
    >
      {STYLES[toast.type].icon}
      <span className="flex-1">{toast.message}</span>
      <button onClick={() => setToast(null)} className="ml-1 opacity-60 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </div>
  ) : null;

  return { showToast, ToastEl };
}
