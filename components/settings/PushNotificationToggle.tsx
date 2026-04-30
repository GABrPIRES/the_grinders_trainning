"use client";

import { useState } from "react";
import { usePushSubscription } from "@/hooks/usePushSubscription";
import { BellOff, Loader2, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export default function PushNotificationToggle() {
  const { status, subscribe, unsubscribe } = usePushSubscription();
  const [loading, setLoading] = useState(false);
  const { showToast, ToastEl } = useToast();

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (status === "active") {
        await unsubscribe();
        showToast("Notificações desativadas neste dispositivo.");
      } else {
        await subscribe();
        showToast("Notificações ativadas! Você receberá alertas mesmo com o app fechado.");
      }
    } catch (err: any) {
      console.error("[PushNotificationToggle]", err);
      if (Notification.permission === "denied") {
        showToast("Permissão bloqueada. Desbloqueie nas configurações do navegador.", "error");
      } else {
        showToast(err?.message || "Erro ao configurar notificações.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  if (status === "unsupported") {
    return (
      <p className="text-xs text-content-muted flex items-center gap-2">
        <Smartphone size={13} />
        Notificações push não são suportadas neste navegador.
      </p>
    );
  }

  if (status === "denied") {
    return (
      <p className="text-xs text-semantic-warning-text flex items-center gap-2">
        <BellOff size={13} />
        Notificações bloqueadas. Desbloqueie nas configurações do seu navegador.
      </p>
    );
  }

  const isActive = status === "active";
  const isLoading = loading || status === "loading";

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-bold text-content-primary text-sm">Notificações no celular</p>
          <p className="text-xs text-content-tertiary mt-0.5">
            {isActive
              ? "Ativo neste dispositivo — você receberá alertas mesmo com o app fechado."
              : "Receba notificações mesmo com o app fechado (requer o PWA instalado)."}
          </p>
        </div>
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 shrink-0 disabled:opacity-60 ${
            isActive ? "bg-brand" : "bg-surface-subtle border border-line"
          }`}
        >
          {isLoading ? (
            <Loader2 size={12} className="animate-spin text-content-muted mx-auto" />
          ) : (
            <div className={`bg-surface-elevated w-4 h-4 rounded-full shadow transform transition-transform duration-300 ${
              isActive ? "translate-x-6" : "translate-x-0"
            }`} />
          )}
        </button>
      </div>
      {ToastEl}
    </>
  );
}
