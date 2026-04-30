"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, X, CheckCheck, BookOpen,
  CheckCircle2, AlertCircle, ClipboardList, Cpu,
  ChevronDown, ChevronUp, ArrowRight,
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

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}min ${s}s` : `${m}min`;
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string; expandable: boolean }> = {
  week_published:               { icon: BookOpen,      color: "text-semantic-success-text",  label: "Treinos publicados",    expandable: true },
  workout_completed:            { icon: CheckCircle2,  color: "text-semantic-info-text",     label: "Treino concluído",      expandable: true },
  workout_missed:               { icon: AlertCircle,   color: "text-semantic-warning-text",  label: "Treino não realizado",  expandable: true },
  feedback_form_available:      { icon: ClipboardList, color: "text-content-secondary",      label: "Formulário disponível", expandable: true },
  feedback_form_reminder:       { icon: ClipboardList, color: "text-semantic-warning-text",  label: "Lembrete de formulário",expandable: true },
  feedback_overdue_coach_alert: { icon: ClipboardList, color: "text-semantic-error-text",    label: "Formulário atrasado",   expandable: true },
  coach_review_pending:         { icon: Cpu,           color: "text-brand",                  label: "Revisão pendente",      expandable: true },
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

// ─── Expanded Detail Panels ────────────────────────────────────────────────────

function WorkoutCompletedDetail({ payload, onNavigate }: { payload: any; onNavigate: (route: string) => void }) {
  const exercicios: any[] = payload.exercicios || [];
  return (
    <div className="px-4 pt-3 pb-3 space-y-3">
      {payload.duration_seconds && (
        <p className="text-xs text-content-muted">
          Duração: <span className="font-bold text-content-secondary">{formatDuration(payload.duration_seconds)}</span>
        </p>
      )}
      {exercicios.length > 0 && (
        <div className="rounded-lg border border-line overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-surface-page text-content-muted">
                <th className="text-left px-3 py-1.5 font-bold">Exercício</th>
                <th className="text-center px-2 py-1.5 font-bold">Série</th>
                <th className="text-center px-2 py-1.5 font-bold">Reps</th>
                <th className="text-center px-2 py-1.5 font-bold">Carga</th>
                <th className="text-center px-2 py-1.5 font-bold">RPE</th>
                <th className="text-center px-2 py-1.5 font-bold">✓</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {exercicios.map((ex: any, ei: number) =>
                (ex.sections || []).map((s: any, si: number) => (
                  <tr key={`${ei}-${si}`} className="bg-surface-elevated">
                    {si === 0 && (
                      <td
                        className="px-3 py-2 text-content-primary font-bold truncate max-w-[80px] align-top"
                        rowSpan={ex.sections.length}
                      >
                        {ex.name}
                      </td>
                    )}
                    <td className="px-2 py-2 text-center text-content-muted">{si + 1}</td>
                    <td className="px-2 py-2 text-center text-content-secondary">{s.reps ?? "—"}</td>
                    <td className="px-2 py-2 text-center text-content-secondary">
                      {s.actual_load != null ? `${s.actual_load}${s.load_unit ? ` ${s.load_unit}` : ""}` : "—"}
                    </td>
                    <td className="px-2 py-2 text-center text-content-secondary">
                      {s.actual_rpe != null ? s.actual_rpe : "—"}
                    </td>
                    <td className="px-2 py-2 text-center">
                      {s.feito
                        ? <span className="text-semantic-success-text font-bold">✓</span>
                        : <span className="text-content-muted">—</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {payload.route && (
        <button
          onClick={() => onNavigate(payload.route)}
          className="flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
        >
          Ver treino <ArrowRight size={13} />
        </button>
      )}
    </div>
  );
}

function WorkoutMissedDetail({ payload, onNavigate }: { payload: any; onNavigate: (route: string) => void }) {
  return (
    <div className="px-4 pt-3 pb-3 space-y-2">
      <p className="text-xs text-content-muted">
        Treino: <span className="font-bold text-content-secondary">{payload.treino_name}</span>
      </p>
      {payload.route && (
        <button
          onClick={() => onNavigate(payload.route)}
          className="flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
        >
          Ver aluno <ArrowRight size={13} />
        </button>
      )}
    </div>
  );
}

function WeekPublishedDetail({ payload, onNavigate }: { payload: any; onNavigate: (route: string) => void }) {
  return (
    <div className="px-4 pt-3 pb-3 space-y-2">
      <p className="text-xs text-content-muted">
        Semana <span className="font-bold text-content-secondary">{payload.week_number}</span> do bloco{" "}
        <span className="font-bold text-content-secondary">"{payload.block_title}"</span>
      </p>
      {payload.route && (
        <button
          onClick={() => onNavigate(payload.route)}
          className="flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
        >
          Ver treinos <ArrowRight size={13} />
        </button>
      )}
    </div>
  );
}

function FeedbackDetail({ payload, onNavigate }: { payload: any; onNavigate: (route: string) => void }) {
  return (
    <div className="px-4 pt-3 pb-3">
      <button
        onClick={() => onNavigate("/aluno/treinos")}
        className="flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
      >
        Preencher formulário <ArrowRight size={13} />
      </button>
    </div>
  );
}

function FeedbackOverdueDetail({ payload, onNavigate }: { payload: any; onNavigate: (route: string) => void }) {
  return (
    <div className="px-4 pt-3 pb-3 space-y-2">
      <p className="text-xs text-content-muted">
        Aluno: <span className="font-bold text-content-secondary">{payload.aluno_name}</span>
      </p>
      {payload.route && (
        <button
          onClick={() => onNavigate(payload.route)}
          className="flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
        >
          Ver aluno <ArrowRight size={13} />
        </button>
      )}
    </div>
  );
}

function CoachReviewDetail({ onNavigate }: { onNavigate: (route: string) => void }) {
  return (
    <div className="px-4 pt-3 pb-3">
      <button
        onClick={() => onNavigate("/coach/treinos")}
        className="flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
      >
        Revisar sugestões da IA <ArrowRight size={13} />
      </button>
    </div>
  );
}

function NotificationDetail({
  n, onNavigate,
}: {
  n: AppNotification;
  onNavigate: (route: string) => void;
}) {
  switch (n.type) {
    case "workout_completed":
      return <WorkoutCompletedDetail payload={n.payload} onNavigate={onNavigate} />;
    case "workout_missed":
      return <WorkoutMissedDetail payload={n.payload} onNavigate={onNavigate} />;
    case "week_published":
      return <WeekPublishedDetail payload={n.payload} onNavigate={onNavigate} />;
    case "feedback_form_available":
    case "feedback_form_reminder":
      return <FeedbackDetail payload={n.payload} onNavigate={onNavigate} />;
    case "feedback_overdue_coach_alert":
      return <FeedbackOverdueDetail payload={n.payload} onNavigate={onNavigate} />;
    case "coach_review_pending":
      return <CoachReviewDetail onNavigate={onNavigate} />;
    default:
      return null;
  }
}

// ─── Item ─────────────────────────────────────────────────────────────────────

function NotificationItem({
  n, expanded, onToggle, onNavigate,
}: {
  n: AppNotification;
  expanded: boolean;
  onToggle: (id: string) => void;
  onNavigate: (id: string, route?: string) => void;
}) {
  const config = TYPE_CONFIG[n.type] ?? { icon: Bell, color: "text-content-secondary", label: "", expandable: false };
  const Icon = config.icon;
  const isUnread = !n.read_at;

  const handleNavigate = (route: string) => {
    onNavigate(n.id, route);
  };

  return (
    <div className={`border-b border-line last:border-0 ${isUnread ? "bg-brand/5" : ""}`}>
      {/* Header row */}
      <button
        onClick={() => onToggle(n.id)}
        className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-surface-subtle transition-colors"
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
        <div className="flex items-center gap-2 shrink-0">
          {isUnread && <span className="w-2 h-2 rounded-full bg-brand" />}
          {expanded ? <ChevronUp size={14} className="text-content-muted" /> : <ChevronDown size={14} className="text-content-muted" />}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-line bg-surface-page">
          <NotificationDetail n={n} onNavigate={handleNavigate} />
        </div>
      )}
    </div>
  );
}

// ─── Dropdown ─────────────────────────────────────────────────────────────────

type Tab = "unread" | "read" | "all";

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
  const [tab, setTab] = useState<Tab>("unread");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const handleToggle = (id: string) => {
    const isOpening = expandedId !== id;
    setExpandedId(isOpening ? id : null);
    if (isOpening) {
      const notif = notifications.find(n => n.id === id);
      if (notif && !notif.read_at) {
        onMarkRead(id);
        if (tab === "unread") setTab("read");
      }
    }
  };

  const handleNavigate = (id: string, route?: string) => {
    onMarkRead(id);
    if (route) router.push(route);
    onClose();
  };

  const filtered = notifications.filter(n => {
    if (tab === "unread") return !n.read_at;
    if (tab === "read") return !!n.read_at;
    return true;
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: "unread", label: "Não lidas" },
    { key: "read",   label: "Lidas" },
    { key: "all",    label: "Todas" },
  ];

  return (
    <>
      {/* Overlay mobile */}
      <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onClose} />

      <div
        ref={ref}
        className="
          fixed top-16 left-4 right-4 z-50
          md:absolute md:top-12 md:left-auto md:right-0 md:w-96
          bg-surface-elevated border border-line shadow-2xl
          rounded-2xl overflow-hidden flex flex-col
          max-h-[80vh] md:max-h-[520px]
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

        {/* Tabs */}
        <div className="flex border-b border-line bg-surface-page shrink-0">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 text-xs font-bold transition-colors ${
                tab === t.key
                  ? "text-brand border-b-2 border-brand"
                  : "text-content-muted hover:text-content-secondary"
              }`}
            >
              {t.label}
              {t.key === "unread" && unreadCount > 0 && (
                <span className="ml-1 text-[10px] bg-brand/10 text-brand px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="py-10 text-center">
              <div className="animate-spin w-5 h-5 border-2 border-brand border-t-transparent rounded-full mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center px-6">
              <Bell size={28} className="text-content-muted mx-auto mb-3 opacity-40" />
              <p className="text-sm text-content-muted">
                {tab === "unread"
                  ? "Nenhuma notificação não lida."
                  : tab === "read"
                  ? "Nenhuma notificação lida."
                  : "Nenhuma notificação por enquanto."}
              </p>
            </div>
          ) : (
            filtered.map(n => (
              <NotificationItem
                key={n.id}
                n={n}
                expanded={expandedId === n.id}
                onToggle={handleToggle}
                onNavigate={handleNavigate}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
