"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/hooks/useConfirm";
import {
  ArrowLeft, Calendar, Plus, Dumbbell,
  MoreVertical, Edit, Trash2, Copy, X, Loader2,
  User, Layers, Bot, Eye, EyeOff, CheckCircle2, AlertTriangle, ClipboardCheck, ChevronRight,
} from "lucide-react";
import AiReviewModal from "@/components/modals/AiReviewModal";
import WeeklyFeedbackViewerModal from "@/components/modals/WeeklyFeedbackViewerModal";
import { coachReviewService } from "@/services/coachReviewService";
import {
  coachWeeklyFeedbackService,
  WeeklyFeedbackResponse,
} from "@/services/coachWeeklyFeedbackService";

// --- Interfaces ---
interface Treino {
  id: string;
  name: string;
  day?: string;
  description?: string;
  status?: 'draft' | 'published' | 'in_progress' | 'completed';
  has_pending_ai_suggestions?: boolean;
  has_ai_observation?: boolean;
}
type PeriodizationGoal = 'overload' | 'maintenance' | 'deload';

interface Week {
  id: string;
  week_number: number;
  start_date: string;
  end_date: string;
  periodization_goal: PeriodizationGoal | null;
  treinos: Treino[];
}
interface DropdownOption { id: string; label: string; }

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function WeekSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-16 bg-surface-subtle rounded-xl"></div>
      <div className="h-12 bg-surface-subtle rounded-xl"></div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-surface-elevated border border-line rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-surface-subtle rounded-full"></div>
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-surface-subtle rounded w-40"></div>
              <div className="h-4 bg-surface-subtle rounded w-24"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function WeekDetailsPage() {
  const { id: currentAlunoId, blockId: currentBlockId, weekId: currentWeekId } = useParams();
  const router = useRouter();
  const { showToast, ToastEl } = useToast();
  const { showConfirm, ConfirmEl } = useConfirm();

  const [week, setWeek] = useState<Week | null>(null);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [reviewTreino, setReviewTreino] = useState<Treino | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [savingGoal, setSavingGoal] = useState(false);
  const [feedback, setFeedback] = useState<WeeklyFeedbackResponse | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const handlePublishToggle = async (treino: Treino, e: React.MouseEvent) => {
    e.stopPropagation();

    // Treino em andamento ou concluído: confirmar porque o backend apaga os
    // dados registrados pelo aluno (feito, actual_load, actual_rpe, started/finished_at).
    if (treino.status === 'in_progress' || treino.status === 'completed') {
      const ok = await showConfirm({
        message: 'Os dados registrados pelo aluno serão perdidos. Deseja despublicar?',
        confirmLabel: 'Despublicar',
        cancelLabel: 'Cancelar',
        danger: true,
      });
      if (!ok) return;
    }

    setPublishingId(treino.id);
    try {
      const result = await coachReviewService.publishTreino(treino.id);
      setWeek((prev) =>
        prev
          ? { ...prev, treinos: prev.treinos.map((t) => t.id === treino.id ? { ...t, status: result.status } : t) }
          : prev
      );
    } catch (err: any) {
      showToast(err.message || "Erro ao alterar status.", "error");
    } finally {
      setPublishingId(null);
    }
  };

  const handleGoalChange = async (goal: PeriodizationGoal) => {
    if (!week) return;
    setSavingGoal(true);
    try {
      await fetchWithAuth(`weeks/${week.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ week: { periodization_goal: goal } }),
      });
      setWeek((prev) => prev ? { ...prev, periodization_goal: goal } : prev);
    } catch (err: any) {
      showToast(err.message || 'Erro ao salvar objetivo.', "error");
    } finally {
      setSavingGoal(false);
    }
  };

  // --- Estados do Modal de Duplicação ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [sourceTreino, setSourceTreino] = useState<Treino | null>(null);

  const [students, setStudents] = useState<DropdownOption[]>([]);
  const [blocks, setBlocks] = useState<DropdownOption[]>([]);
  const [weeks, setWeeks] = useState<DropdownOption[]>([]);

  const [targetAlunoId, setTargetAlunoId] = useState<string>("");
  const [targetBlockId, setTargetBlockId] = useState<string>("");
  const [targetWeekId, setTargetWeekId] = useState<string>("");

  const [newName, setNewName] = useState("");
  const [newDay, setNewDay] = useState("");

  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [loadingWeeks, setLoadingWeeks] = useState(false);

  useEffect(() => {
    async function loadWeek() {
      try {
        const data = await fetchWithAuth(`weeks/${currentWeekId}`);
        setWeek(data);
      } catch (error) {
        console.error("Erro ao carregar semana:", error);
      } finally {
        setLoading(false);
      }
    }
    loadWeek();
  }, [currentWeekId]);

  // Busca o feedback respondido pelo aluno desta semana (se houver).
  useEffect(() => {
    if (!currentWeekId) return;
    coachWeeklyFeedbackService
      .getByWeek(currentWeekId as string)
      .then((fb) => setFeedback(fb))
      .catch(() => setFeedback(null));
  }, [currentWeekId]);

  useEffect(() => {
    async function loadStudents() {
      try {
        const data = await fetchWithAuth("alunos?limit=100");
        const list = (data.alunos || []).map((a: any) => ({ id: a.id, label: a.user.name }));
        setStudents(list);
      } catch (err) { console.error(err); }
    }
    loadStudents();
  }, []);

  useEffect(() => {
    if (!targetAlunoId) { setBlocks([]); return; }
    async function loadBlocks() {
      setLoadingBlocks(true);
      try {
        const data = await fetchWithAuth(`alunos/${targetAlunoId}/training_blocks`);
        setBlocks(data.map((b: any) => ({ id: b.id, label: b.title })));
        if (targetAlunoId === currentAlunoId && data.some((b: any) => b.id === currentBlockId)) {
          setTargetBlockId(currentBlockId as string);
        } else {
          setTargetBlockId("");
        }
      } catch (err) { console.error(err); }
      finally { setLoadingBlocks(false); }
    }
    loadBlocks();
  }, [targetAlunoId, currentAlunoId, currentBlockId]);

  useEffect(() => {
    if (!targetBlockId) { setWeeks([]); return; }
    async function loadWeeks() {
      setLoadingWeeks(true);
      try {
        const data = await fetchWithAuth(`training_blocks/${targetBlockId}`);
        const sortedWeeks = (data.weeks || []).sort((a: any, b: any) => a.week_number - b.week_number);
        setWeeks(sortedWeeks.map((w: any) => ({
          id: w.id,
          label: `Semana ${w.week_number} (${formatDateMini(w.start_date)})`,
        })));
        if (targetBlockId === currentBlockId && sortedWeeks.some((w: any) => w.id === currentWeekId)) {
          setTargetWeekId(currentWeekId as string);
        } else if (sortedWeeks.length > 0) {
          setTargetWeekId(sortedWeeks[0].id);
        } else {
          setTargetWeekId("");
        }
      } catch (err) { console.error(err); }
      finally { setLoadingWeeks(false); }
    }
    loadWeeks();
  }, [targetBlockId, currentBlockId, currentWeekId]);

  // --- Handlers ---

  const handleDeleteTreino = async (treinoId: string) => {
    const ok = await showConfirm({ message: "Tem certeza que deseja excluir este treino?", confirmLabel: "Excluir", danger: true });
    if (!ok) return;
    try {
      await fetchWithAuth(`treinos/${treinoId}`, { method: 'DELETE' });
      if (week) setWeek({ ...week, treinos: week.treinos.filter(t => t.id !== treinoId) });
    } catch (error) { showToast("Erro ao excluir.", "error"); }
  };

  const openDuplicateModal = (treino: Treino) => {
    setSourceTreino(treino);
    setNewName(`${treino.name} (Cópia)`);
    setNewDay(treino.day ? new Date(treino.day).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setTargetAlunoId(currentAlunoId as string);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleConfirmDuplicate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceTreino || !targetWeekId) return;
    setDuplicating(true);
    try {
      await fetchWithAuth(`treinos/${sourceTreino.id}/duplicate`, {
        method: 'POST',
        body: JSON.stringify({
          duplication: { week_id: targetWeekId, name: newName, day: newDay },
        }),
      });
      showToast("Treino duplicado com sucesso!");
      setIsModalOpen(false);
      if (targetWeekId === currentWeekId) {
        window.location.reload();
      } else {
        const goThere = await showConfirm({ message: "Treino enviado para outra semana. Deseja ir para lá agora?" });
        if (goThere && targetAlunoId === currentAlunoId && targetBlockId === currentBlockId) {
          router.push(`/coach/treinos/${targetAlunoId}/blocks/${targetBlockId}/week/${targetWeekId}`);
        }
      }
    } catch (err: any) {
      showToast("Erro ao duplicar: " + err.message, "error");
    } finally {
      setDuplicating(false);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "--/--";
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' });
  };
  const formatDateMini = (date: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
  };

  const selectClass =
    "w-full border border-line-input rounded-lg px-3 py-2 bg-surface-app text-content-primary focus:ring-2 focus:ring-brand-glow outline-none text-sm disabled:bg-surface-subtle disabled:text-content-muted";

  if (loading) return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-8 p-4 md:p-0">
      <WeekSkeleton />
    </div>
  );
  if (!week) return (
    <div className="p-12 text-center">
      <p className="font-bold text-semantic-error-text">Semana não encontrada.</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-8 text-content-primary" onClick={() => setOpenMenuId(null)}>

      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/coach/treinos/${currentAlunoId}/blocks/${currentBlockId}`)}
            className="p-2 hover:bg-surface-subtle rounded-lg text-content-secondary transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-content-primary">Semana {week.week_number}</h1>
            <div className="flex items-center gap-2 text-sm text-content-tertiary mt-1">
              <Calendar size={14} />
              <span>{formatDate(week.start_date)} — {formatDate(week.end_date)}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => router.push(`/coach/treinos/${currentAlunoId}/blocks/${currentBlockId}/week/${currentWeekId}/create`)}
          className="bg-brand text-content-on-brand px-5 py-2.5 rounded-xl font-bold hover:bg-brand-hover transition-colors shadow-sm flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <Plus size={18} /> Novo Treino
        </button>
      </div>

      {/* Objetivo de Periodização */}
      <div className="mb-5 bg-surface-elevated border border-line rounded-xl p-4 shadow-sm">
        <p className="text-xs font-bold text-content-muted uppercase mb-3">Foco da Semana</p>
        <div className="flex flex-wrap gap-2">
          {([
            { value: 'overload',    label: 'Progressão de Carga', variant: 'success' },
            { value: 'maintenance', label: 'Manter',              variant: 'info'    },
            { value: 'deload',      label: 'Deload',              variant: 'warning' },
          ] as { value: PeriodizationGoal; label: string; variant: string }[]).map(({ value, label, variant }) => {
            const isActive = week.periodization_goal === value;
            const cls: Record<string, string> = {
              success: isActive
                ? 'bg-semantic-success-text text-white border-semantic-success-text'
                : 'bg-surface-elevated text-semantic-success-text border-semantic-success-border hover:bg-semantic-success-bg',
              info: isActive
                ? 'bg-semantic-info-text text-white border-semantic-info-text'
                : 'bg-surface-elevated text-semantic-info-text border-semantic-info-border hover:bg-semantic-info-bg',
              warning: isActive
                ? 'bg-semantic-warning-text text-white border-semantic-warning-text'
                : 'bg-surface-elevated text-semantic-warning-text border-semantic-warning-border hover:bg-semantic-warning-bg',
            };
            return (
              <button
                key={value}
                onClick={() => !isActive && handleGoalChange(value)}
                disabled={savingGoal}
                className={`px-4 py-2 rounded-xl border font-bold text-sm transition-colors disabled:opacity-50 ${cls[variant]}`}
              >
                {label}
              </button>
            );
          })}
          {savingGoal && <span className="text-xs text-content-muted self-center">Salvando...</span>}
          {!week.periodization_goal && (
            <span className="text-xs text-content-muted self-center italic">
              Nenhum foco definido — a IA usará "Manter" como padrão.
            </span>
          )}
        </div>
      </div>

      {/* Formulário respondido pelo aluno */}
      {feedback && (
        <button
          onClick={() => setShowFeedbackModal(true)}
          className="mb-5 w-full bg-surface-elevated border border-line rounded-xl p-4 flex items-center justify-between gap-3 hover:bg-surface-page transition-colors text-left shadow-sm"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-semantic-success-bg text-semantic-success-text rounded-lg border border-semantic-success-border shrink-0">
              <ClipboardCheck size={18} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-content-primary text-sm">Formulário respondido</p>
              <p className="text-xs text-content-tertiary truncate">
                Sono {feedback.sleep_level}/10 · Estresse {feedback.stress_level}/10 · Vontade {feedback.training_desire}/10
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-content-tertiary shrink-0" />
        </button>
      )}

      {/* Banner de status */}
      {week.treinos && week.treinos.length > 0 && (() => {
        const draftWithAI = week.treinos.filter((t) => t.status === 'draft' && t.has_pending_ai_suggestions);
        const draftWithoutAI = week.treinos.filter((t) => t.status === 'draft' && !t.has_pending_ai_suggestions);
        const allPublished = week.treinos.every((t) => t.status !== 'draft');
        if (allPublished) return (
          <div className="mb-5 flex items-center gap-2 bg-semantic-success-bg border border-semantic-success-border rounded-xl px-4 py-3 text-sm text-semantic-success-text font-bold">
            <CheckCircle2 size={16} /> Todos os treinos estão publicados.
          </div>
        );
        return (
          <div className="mb-5 flex flex-wrap gap-2">
            {draftWithAI.length > 0 && (
              <span className="flex items-center gap-1.5 bg-semantic-warning-bg border border-semantic-warning-border text-semantic-warning-text text-xs font-bold px-3 py-1.5 rounded-full">
                <Bot size={12} /> {draftWithAI.length} revisão{draftWithAI.length > 1 ? 'ões' : ''} de IA pendente{draftWithAI.length > 1 ? 's' : ''}
              </span>
            )}
            {draftWithoutAI.length > 0 && (
              <span className="flex items-center gap-1.5 bg-surface-subtle border border-line text-content-secondary text-xs font-bold px-3 py-1.5 rounded-full">
                <AlertTriangle size={12} className="text-content-muted" /> {draftWithoutAI.length} treino{draftWithoutAI.length > 1 ? 's' : ''} aguardando publicação
              </span>
            )}
          </div>
        );
      })()}

      {/* Lista de treinos */}
      {week.treinos && week.treinos.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {week.treinos.map((treino) => {
            const isDraft = treino.status === 'draft';
            const hasAI = treino.has_pending_ai_suggestions;
            const hasAIObs = treino.has_ai_observation;
            const isPublishing = publishingId === treino.id;
            const statusColors: Record<string, string> = {
              draft:       'border-line bg-surface-elevated',
              published:   'border-line bg-surface-elevated',
              in_progress: 'border-semantic-warning-border bg-semantic-warning-bg/10',
              completed:   'border-semantic-success-border bg-semantic-success-bg/10',
            };
            const cardBorder = statusColors[treino.status ?? 'published'];

            return (
              <div
                key={treino.id}
                className={`p-5 rounded-xl border shadow-sm hover:shadow-md transition-all group relative cursor-pointer ${cardBorder}`}
                onClick={() => router.push(`/coach/treinos/${currentAlunoId}/${treino.id}`)}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-surface-subtle text-brand flex items-center justify-center border border-line flex-shrink-0">
                        <Dumbbell size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <h3 className="text-base font-bold text-content-primary group-hover:text-brand transition-colors truncate">
                            {treino.name}
                          </h3>
                          {treino.status === 'draft' && !hasAI && !hasAIObs && (
                            <span className="text-[10px] font-bold bg-surface-subtle text-content-muted border border-line px-2 py-0.5 rounded-full whitespace-nowrap">Rascunho</span>
                          )}
                          {treino.status === 'draft' && hasAI && (
                            <span className="text-[10px] font-bold bg-semantic-warning-bg text-semantic-warning-text border border-semantic-warning-border px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                              <Bot size={9} /> Revisão IA
                            </span>
                          )}
                          {treino.status === 'draft' && !hasAI && hasAIObs && (
                            <span className="text-[10px] font-bold bg-semantic-info-bg text-semantic-info-text border border-semantic-info-border px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                              <Bot size={9} /> IA analisou
                            </span>
                          )}
                          {treino.status === 'published' && (
                            <span className="text-[10px] font-bold bg-semantic-success-bg text-semantic-success-text border border-semantic-success-border px-2 py-0.5 rounded-full whitespace-nowrap">Publicado</span>
                          )}
                          {treino.status === 'in_progress' && (
                            <span className="text-[10px] font-bold bg-semantic-warning-bg text-semantic-warning-text border border-semantic-warning-border px-2 py-0.5 rounded-full whitespace-nowrap">Em andamento</span>
                          )}
                          {treino.status === 'completed' && (
                            <span className="text-[10px] font-bold bg-semantic-success-bg text-semantic-success-text border border-semantic-success-border px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                              <CheckCircle2 size={9} /> Concluído
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-content-muted font-bold uppercase tracking-wide">
                          {treino.day ? formatDate(treino.day) : "Data não definida"}
                        </p>
                      </div>
                    </div>

                    {isDraft && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {hasAI ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); setReviewTreino(treino); }}
                            className="flex items-center gap-1.5 text-xs font-bold text-semantic-warning-text bg-semantic-warning-bg border border-semantic-warning-border px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity"
                          >
                            <Bot size={12} /> Revisar sugestões da IA
                          </button>
                        ) : hasAIObs ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); setReviewTreino(treino); }}
                            className="flex items-center gap-1.5 text-xs font-bold text-semantic-info-text bg-semantic-info-bg border border-semantic-info-border px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity"
                          >
                            <Bot size={12} /> Ver análise da IA
                          </button>
                        ) : (
                          <button
                            onClick={(e) => handlePublishToggle(treino, e)}
                            disabled={isPublishing}
                            className="flex items-center gap-1.5 text-xs font-bold text-semantic-success-text bg-semantic-success-bg border border-semantic-success-border px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
                          >
                            {isPublishing ? <Loader2 size={12} className="animate-spin" /> : <Eye size={12} />}
                            Publicar treino
                          </button>
                        )}
                      </div>
                    )}
                    {(treino.status === 'published' || treino.status === 'in_progress' || treino.status === 'completed') && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={(e) => handlePublishToggle(treino, e)}
                          disabled={isPublishing}
                          className="flex items-center gap-1.5 text-xs font-medium text-content-muted hover:text-content-secondary hover:bg-surface-subtle px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isPublishing ? <Loader2 size={12} className="animate-spin" /> : <EyeOff size={12} />}
                          Despublicar
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="relative flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === treino.id ? null : treino.id); }}
                      className="p-2 hover:bg-surface-subtle rounded-lg text-content-muted hover:text-content-secondary transition-colors z-10 relative"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {openMenuId === treino.id && (
                      <div className="absolute right-0 top-10 w-48 bg-surface-elevated rounded-xl shadow-xl border border-line z-20 overflow-hidden">
                        <button
                          onClick={(e) => { e.stopPropagation(); router.push(`/coach/treinos/${currentAlunoId}/${treino.id}`); }}
                          className="w-full text-left px-4 py-3 hover:bg-surface-subtle flex items-center gap-2 text-sm text-content-secondary font-bold"
                        >
                          <Edit size={15} /> Editar Treino
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); openDuplicateModal(treino); }}
                          className="w-full text-left px-4 py-3 hover:bg-surface-subtle flex items-center gap-2 text-sm text-content-secondary font-bold"
                        >
                          <Copy size={15} /> Duplicar
                        </button>
                        <div className="h-px bg-line" />
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteTreino(treino.id); }}
                          className="w-full text-left px-4 py-3 hover:bg-semantic-error-bg flex items-center gap-2 text-sm text-semantic-error-text font-bold"
                        >
                          <Trash2 size={15} /> Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-surface-subtle border-2 border-dashed border-line rounded-xl p-12 text-center flex flex-col items-center">
          <Dumbbell size={48} className="text-content-muted mb-4" />
          <h3 className="text-lg font-bold text-content-primary mb-2">Semana Vazia</h3>
          <button
            onClick={() => router.push(`/coach/treinos/${currentAlunoId}/blocks/${currentBlockId}/week/${currentWeekId}/create`)}
            className="text-brand font-bold hover:underline"
          >
            Adicionar Treino Agora
          </button>
        </div>
      )}

      {/* Modal de Revisão da IA */}
      {reviewTreino && (
        <AiReviewModal
          treinoId={reviewTreino.id}
          treinoName={reviewTreino.name}
          onClose={() => setReviewTreino(null)}
          onApproved={() => { setReviewTreino(null); window.location.reload(); }}
        />
      )}

      {/* Modal de Duplicação Avançada */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40"
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="duplicate-modal-title"
        >
          <div
            className="bg-surface-elevated rounded-t-2xl sm:rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-line"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 border-b border-line flex justify-between items-center bg-surface-page shrink-0">
              <h3 id="duplicate-modal-title" className="font-bold text-lg text-content-primary flex items-center gap-2">
                <Copy size={18} className="text-brand" /> Duplicar Treino
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-content-muted hover:text-content-secondary transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmDuplicate} className="p-6 space-y-5 overflow-y-auto">
              {/* Origem */}
              <div className="bg-semantic-info-bg border border-semantic-info-border p-3 rounded-lg text-sm text-semantic-info-text flex items-center gap-2">
                <span className="font-bold shrink-0">Origem:</span> {sourceTreino?.name}
              </div>

              {/* Destino */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-content-muted uppercase border-b border-line pb-1 mb-2">Destino da Cópia</h4>

                <div>
                  <label className="block text-sm font-bold text-content-secondary mb-1 flex items-center gap-2"><User size={13} /> Aluno</label>
                  <select className={selectClass} value={targetAlunoId} onChange={(e) => setTargetAlunoId(e.target.value)}>
                    <option value="">Selecione...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-content-secondary mb-1 flex items-center gap-2"><Layers size={13} /> Bloco</label>
                  <select className={selectClass} value={targetBlockId} onChange={(e) => setTargetBlockId(e.target.value)} disabled={!targetAlunoId || loadingBlocks}>
                    <option value="">{loadingBlocks ? "Carregando..." : "Selecione o Bloco"}</option>
                    {blocks.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-content-secondary mb-1 flex items-center gap-2"><Calendar size={13} /> Semana</label>
                  <select className={selectClass} value={targetWeekId} onChange={(e) => setTargetWeekId(e.target.value)} disabled={!targetBlockId || loadingWeeks}>
                    <option value="">{loadingWeeks ? "Carregando..." : "Selecione a Semana"}</option>
                    {weeks.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Dados do novo treino */}
              <div className="space-y-4 pt-4 border-t border-line">
                <h4 className="text-xs font-bold text-content-muted uppercase border-b border-line pb-1 mb-2">Dados do Novo Treino</h4>
                <div>
                  <label className="block text-sm font-bold text-content-secondary mb-1">Nome</label>
                  <input
                    type="text"
                    className="w-full border border-line-input rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-glow outline-none bg-surface-app text-content-primary text-sm"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-content-secondary mb-1">Data</label>
                  <input
                    type="date" onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
                    className="w-full border border-line-input rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-glow outline-none bg-surface-app text-content-primary text-sm cursor-pointer"
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Ações */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-surface-subtle text-content-secondary font-bold rounded-xl hover:bg-surface-page transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={duplicating || !targetWeekId}
                  className="flex-1 py-3 bg-brand text-content-on-brand font-bold rounded-xl hover:bg-brand-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {duplicating ? <Loader2 className="animate-spin" size={18} /> : <Copy size={18} />}
                  {duplicating ? "Copiando..." : "Confirmar Cópia"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFeedbackModal && feedback && (
        <WeeklyFeedbackViewerModal
          feedback={feedback}
          onClose={() => setShowFeedbackModal(false)}
          onDeleted={() => {
            setFeedback(null);
            setShowFeedbackModal(false);
          }}
        />
      )}

      {ToastEl}
      {ConfirmEl}
    </div>
  );
}
