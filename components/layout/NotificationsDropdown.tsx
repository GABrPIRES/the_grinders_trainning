"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, X, CheckCheck, BookOpen,
  CheckCircle2, AlertCircle, ClipboardList, Cpu,
} from "lucide-react";
import { AppNotification } from "@/hooks/useNotifications";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "agora";
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return `há ${d}d`;
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  week_published:             { icon: BookOpen,      color: "text-semantic-success-text",  label: "Treinos publicados" },
  workout_completed:          { icon: CheckCircle2,  color: "text-semantic-info-text",     label: "Treino concluído" },
  workout_missed:             { icon: AlertCircle,   color: "text-semantic-warning-text",  label: "Treino não realizado" },
  feedback_form_available:    { icon: ClipboardList, color: "text-content-secondary",      label: "Formulário disponível" },
  feedback_form_reminder:     { icon: ClipboardList, color: "text-semantic-warning-text",  label: "Lembrete de formulário" },
  feedback_overdue_coach_alert: { icon: ClipboardList, color: "text-semantic-error-text", label: "Formulário atrasado" },
  coach_review_pending:       { icon: Cpu,           color: "text-brand",                  label: "Revisão pendente" },
};

function notificationMessage(n: AppNotification): string {
  const p = n.payload;
  switch (n.type) {
    case "week_published":
      return `Semana ${p.week_number} de "${p.block_title}" publicada por ${p.coach_name}.`;
    case "workout_completed":
      return `${p.aluno_name} concluiu "${p.treino_name}".`;
    case "workout_missed":
      return `${p.aluno_name} não realizou "${p.treino_name}".`;
    case "feedback_form_available":
      return "Formulário semanal disponível para preenchimento.";
    case "feedback_form_reminder":
      return "Lembrete: preencha o formulário semanal.";
    case "feedback_overdue_coach_alert":
      return `${p.aluno_name} não preencheu o formulário semanal.`;
    case "coach_review_pending":
      return "Sugestões de IA prontas para revisão.";
    default:
      return p.message || "Nova notificação.";
  }
}

// ─── Item ─────────────────────────────────────────────────────────────────────

function NotificationItem({
  n, onRead,
}: {
  n: AppNotification;
  onRead: (id: string, route?: string) => void;
}) {
  const config = TYPE_CONFIG[n.type] ?? { icon: Bell, color: "text-content-secondary", label: "" };
  const Icon = config.icon;
  const isUnread = !n.read_at;

  return (
    <button
      onClick={() => onRead(n.id, n.payload?.route)}
      className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-surface-subtle transition-colors ${isUnread ? "bg-brand/5" : ""}`}
    >
      <div className={`mt-0.5 shrink-0 ${config.color}`}>
        <Icon size={17} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug text-content-primary ${isUnread ? "font-bold" : ""}`}>
          {notificationMessage(n)}
        </p>
        <p className="text-xs text-content-muted mt-0.5">{timeAgo(n.created_at)}</p>
      </div>
      {isUnread && (
        <span className="w-2 h-2 rounded-full bg-brand shrink-0 mt-1.5" />
      )}
    </button>
  );
}

// ─── Dropdown / Drawer ────────────────────────────────────────────────────────

interface Props {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}

export default function NotificationsDropdown({
  notifications, unreadCount, loading, onMarkRead, onMarkAllRead, onClose,
}: Props) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const handleRead = (id: string, route?: string) => {
    onMarkRead(id);
    if (route) router.push(route);
    onClose();
  };

  return (
    <>
      {/* Overlay mobile */}
      <div
        className="fixed inset-0 bg-black/40 z-40 md:hidden"
        onClick={onClose}
      />

      <div
        ref={ref}
        className="
          fixed bottom-0 left-0 right-0 z-50
          md:absolute md:bottom-auto md:left-auto md:right-0 md:top-12
          md:w-96 md:rounded-2xl
          bg-surface-elevated border border-line shadow-2xl
          rounded-t-2xl overflow-hidden flex flex-col
          max-h-[85vh] md:max-h-[520px]
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-surface-page shrink-0">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-brand" />
            <span className="font-bold text-sm text-content-primary">Notificações</span>
            {unreadCount > 0 && (
              <span className="bg-brand text-content-on-brand text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="flex items-center gap-1 text-xs text-content-secondary hover:text-content-primary px-2 py-1 rounded-lg hover:bg-surface-subtle transition-colors"
                title="Marcar todas como lidas"
              >
                <CheckCheck size={14} /> Lidas
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-surface-subtle rounded-full transition-colors text-content-muted"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Lista */}
        <div className="overflow-y-auto flex-1 divide-y divide-line">
          {loading ? (
            <div className="py-10 text-center">
              <div className="animate-spin w-5 h-5 border-2 border-brand border-t-transparent rounded-full mx-auto" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center px-6">
              <Bell size={28} className="text-content-muted mx-auto mb-3 opacity-40" />
              <p className="text-sm text-content-muted">Nenhuma notificação por enquanto.</p>
            </div>
          ) : (
            notifications.map(n => (
              <NotificationItem key={n.id} n={n} onRead={handleRead} />
            ))
          )}
        </div>
      </div>
    </>
  );
}
