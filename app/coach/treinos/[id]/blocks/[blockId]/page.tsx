"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/hooks/useConfirm";
import {
  ArrowLeft, Calendar, Edit, Trash2,
  Dumbbell, Clock, AlertCircle, CheckCircle2,
  MoreVertical, Copy, Bot, Eye, X, Save, Loader2, Plus, User,
} from "lucide-react";
import DuplicateWeekModal from "@/components/modals/DuplicateWeekModal";
import WeekAiReviewModal from "@/components/modals/WeekAiReviewModal";

interface Treino {
  id: string;
  name: string;
  status?: 'draft' | 'published' | 'in_progress' | 'completed';
  has_pending_ai_suggestions?: boolean;
}

interface Week {
  id: string;
  week_number: number;
  start_date: string;
  end_date: string;
  treinos: Treino[];
  feedback_enabled?: boolean;
  periodization_goal?: 'overload' | 'maintenance' | 'deload' | null;
}

interface TrainingBlock {
  id: string;
  title: string;
  objective: string;
  start_date: string;
  end_date: string;
  weeks: Week[];
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function BlockDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="bg-surface-elevated border border-line rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-surface-subtle rounded-lg"></div>
          <div className="space-y-2">
            <div className="h-6 bg-surface-subtle rounded w-52"></div>
            <div className="h-4 bg-surface-subtle rounded w-36"></div>
          </div>
        </div>
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-surface-elevated border border-line rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-surface-subtle rounded-full"></div>
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-surface-subtle rounded w-32"></div>
              <div className="h-4 bg-surface-subtle rounded w-48"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function BlockDetailsPage() {
  const { id, blockId } = useParams();
  const router = useRouter();
  const { showToast, ToastEl } = useToast();
  const { showConfirm, ConfirmEl } = useConfirm();

  const [block, setBlock] = useState<TrainingBlock | null>(null);
  const [loading, setLoading] = useState(true);

  const [duplicateWeek, setDuplicateWeek] = useState<{ id: string; number: number } | null>(null);
  const [aiReviewWeek, setAiReviewWeek] = useState<{ id: string; number: number } | null>(null);

  // Duplicate block modal
  const [duplicatingBlock, setDuplicatingBlock] = useState(false);
  const [blockDupOpen, setBlockDupOpen] = useState(false);
  const [blockDupTitle, setBlockDupTitle] = useState("");
  const [blockDupAlunoId, setBlockDupAlunoId] = useState("");
  const [blockDupStudents, setBlockDupStudents] = useState<{ id: string; name: string }[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [addingWeek, setAddingWeek] = useState(false);
  const [editingWeek, setEditingWeek] = useState<Week | null>(null);
  const [editWeekNumber, setEditWeekNumber] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [savingWeek, setSavingWeek] = useState(false);

  useEffect(() => {
    async function loadBlock() {
      try {
        const data = await fetchWithAuth(`training_blocks/${blockId}`);
        setBlock(data);
      } catch (error) {
        console.error("Erro ao carregar bloco:", error);
      } finally {
        setLoading(false);
      }
    }
    loadBlock();
  }, [blockId]);

  const openBlockDupModal = async () => {
    setBlockDupTitle(`${block?.title || ''} (Cópia)`);
    setBlockDupAlunoId(id as string);
    if (blockDupStudents.length === 0) {
      try {
        const data = await fetchWithAuth("alunos?limit=100");
        setBlockDupStudents((data.alunos || []).map((a: any) => ({ id: a.id, name: a.user.name })));
      } catch (err) { console.error(err); }
    }
    setBlockDupOpen(true);
  };

  const handleDuplicateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDupAlunoId) return;
    setDuplicatingBlock(true);
    try {
      await fetchWithAuth(`training_blocks/${blockId}/duplicate`, {
        method: 'POST',
        body: JSON.stringify({ aluno_id: blockDupAlunoId, title: blockDupTitle }),
      });
      showToast("Bloco duplicado com sucesso!");
      setBlockDupOpen(false);
    } catch (err: any) {
      showToast("Erro ao duplicar bloco: " + (err.message || ""), "error");
    } finally {
      setDuplicatingBlock(false);
    }
  };

  const handleDelete = async () => {
    const ok = await showConfirm({
      message: "Tem certeza que deseja excluir este bloco? Isso apagará todas as semanas e treinos dele.",
      confirmLabel: "Excluir",
      danger: true,
    });
    if (!ok) return;
    try {
      await fetchWithAuth(`training_blocks/${blockId}`, { method: 'DELETE' });
      router.push(`/coach/treinos/${id}`);
    } catch (error) {
      showToast("Erro ao excluir.", "error");
    }
  };

  const openEditWeek = (week: Week) => {
    setEditingWeek(week);
    setEditWeekNumber(String(week.week_number));
    setEditStartDate(week.start_date ? week.start_date.split('T')[0] : '');
    setEditEndDate(week.end_date ? week.end_date.split('T')[0] : '');
    setOpenMenuId(null);
  };

  const handleSaveWeek = async () => {
    if (!editingWeek) return;
    setSavingWeek(true);
    try {
      await fetchWithAuth(`weeks/${editingWeek.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          week: {
            week_number: parseInt(editWeekNumber, 10),
            start_date: editStartDate || null,
            end_date: editEndDate || null,
          },
        }),
      });
      const data = await fetchWithAuth(`training_blocks/${blockId}`);
      setBlock(data);
      setEditingWeek(null);
    } catch (err: any) {
      showToast(err.message || 'Erro ao salvar semana.', "error");
    } finally {
      setSavingWeek(false);
    }
  };

  const handleAddWeek = async () => {
    setAddingWeek(true);
    try {
      await fetchWithAuth(`training_blocks/${blockId}/weeks`, { method: 'POST' });
      const data = await fetchWithAuth(`training_blocks/${blockId}`);
      setBlock(data);
    } catch (err: any) {
      showToast(err.message || 'Erro ao adicionar semana.', "error");
    } finally {
      setAddingWeek(false);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "--/--";
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' });
  };

  const isCurrentWeek = (start: string, end: string) => {
    const now = new Date();
    const s = new Date(start);
    const e = new Date(end);
    e.setHours(23, 59, 59);
    return now >= s && now <= e;
  };

  const modalInputClass =
    "w-full border border-line-input rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-glow outline-none bg-surface-app text-content-primary";

  if (loading) return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-8 p-4 md:p-0">
      <BlockDetailSkeleton />
    </div>
  );
  if (!block) return (
    <div className="p-12 text-center">
      <AlertCircle size={48} className="text-semantic-error-text mx-auto mb-4" />
      <p className="font-bold text-content-primary">Bloco não encontrado.</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-8 text-content-primary">

      {/* Cabeçalho */}
      <div className="bg-surface-elevated p-6 md:p-8 rounded-xl border border-line shadow-sm mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/coach/treinos/${id}`)}
              className="p-2 hover:bg-surface-subtle rounded-lg transition-colors text-content-secondary"
            >
              <ArrowLeft size={22} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-content-primary">{block.title}</h1>
              <div className="flex items-center gap-2 text-sm text-content-tertiary mt-1">
                <Calendar size={14} />
                <span>{formatDate(block.start_date)} — {formatDate(block.end_date)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto flex-wrap">
            <button
              onClick={openBlockDupModal}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-surface-elevated border border-line rounded-lg hover:bg-surface-subtle hover:text-brand transition-colors font-bold text-sm text-content-secondary"
            >
              <Copy size={15} /> Duplicar
            </button>
            <button
              onClick={() => router.push(`/coach/treinos/${id}/blocks/${blockId}/edit`)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-surface-elevated border border-line rounded-lg hover:bg-surface-subtle hover:text-content-primary transition-colors font-bold text-sm text-content-secondary"
            >
              <Edit size={15} /> Editar
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-semantic-error-bg text-semantic-error-text border border-semantic-error-border rounded-lg hover:bg-semantic-error-text hover:text-white transition-colors font-bold text-sm"
            >
              <Trash2 size={15} /> Excluir
            </button>
          </div>
        </div>

        {block.objective && (
          <div className="bg-surface-subtle p-4 rounded-xl border border-line text-sm text-content-secondary">
            <span className="font-bold text-content-muted uppercase text-xs block mb-1">Objetivo do Ciclo</span>
            {block.objective}
          </div>
        )}
      </div>

      {/* Lista de semanas */}
      <h2 className="text-lg font-bold text-content-primary mb-4 flex items-center gap-2 px-1">
        <Clock size={18} className="text-brand" /> Cronograma Semanal
      </h2>

      <div className="space-y-3">
        {block.weeks?.sort((a, b) => a.week_number - b.week_number).map((week) => {
          const active = isCurrentWeek(week.start_date, week.end_date);

          return (
            <div
              key={week.id}
              className={`
                group relative bg-surface-elevated p-5 rounded-xl border transition-all shadow-sm
                ${active ? 'border-brand/30 shadow-md' : 'border-line hover:border-brand/20 hover:shadow-md'}
              `}
            >
              <div className="flex items-start gap-4">
                {/* Número da semana (clicável) */}
                <div
                  onClick={() => router.push(`/coach/treinos/${id}/blocks/${blockId}/week/${week.id}`)}
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 cursor-pointer
                    ${active ? 'bg-brand text-content-on-brand' : 'bg-surface-subtle text-content-muted group-hover:bg-surface-page group-hover:text-brand'}
                  `}
                >
                  {week.week_number}
                </div>

                {/* Informações (clicável) */}
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => router.push(`/coach/treinos/${id}/blocks/${blockId}/week/${week.id}`)}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-bold text-content-primary">Semana {week.week_number}</h3>
                    <span className="text-xs text-content-muted font-mono">
                      ({formatDate(week.start_date)} — {formatDate(week.end_date)})
                    </span>
                    {week.periodization_goal === 'overload' && (
                      <span className="text-[10px] font-bold bg-semantic-success-bg text-semantic-success-text border border-semantic-success-border px-2 py-0.5 rounded-full">Progressão</span>
                    )}
                    {week.periodization_goal === 'maintenance' && (
                      <span className="text-[10px] font-bold bg-semantic-info-bg text-semantic-info-text border border-semantic-info-border px-2 py-0.5 rounded-full">Manter</span>
                    )}
                    {week.periodization_goal === 'deload' && (
                      <span className="text-[10px] font-bold bg-semantic-warning-bg text-semantic-warning-text border border-semantic-warning-border px-2 py-0.5 rounded-full">Deload</span>
                    )}
                  </div>

                  {week.treinos && week.treinos.length > 0 ? (() => {
                    const withAI    = week.treinos.filter(t => t.status === 'draft' && t.has_pending_ai_suggestions);
                    const withoutAI = week.treinos.filter(t => t.status === 'draft' && !t.has_pending_ai_suggestions);
                    const published = week.treinos.filter(t => t.status === 'published' || t.status === 'in_progress');
                    const completed = week.treinos.filter(t => t.status === 'completed');
                    const allOk     = week.treinos.every(t => t.status !== 'draft');

                    return (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          {completed.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-surface-subtle text-content-muted border border-line px-2 py-0.5 rounded-full">
                              <CheckCircle2 size={9} /> {completed.length} concluído{completed.length > 1 ? 's' : ''}
                            </span>
                          )}
                          {published.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-semantic-success-bg text-semantic-success-text border border-semantic-success-border px-2 py-0.5 rounded-full">
                              <CheckCircle2 size={9} /> {published.length} publicado{published.length > 1 ? 's' : ''}
                            </span>
                          )}
                          {withAI.length > 0 && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setAiReviewWeek({ id: week.id, number: week.week_number }); }}
                              className="inline-flex items-center gap-1 text-[10px] font-bold bg-semantic-warning-bg text-semantic-warning-text border border-semantic-warning-border px-2 py-0.5 rounded-full hover:opacity-80 transition-opacity"
                            >
                              <Bot size={9} /> {withAI.length} {withAI.length === 1 ? 'revisão' : 'revisões'} IA
                            </button>
                          )}
                          {withoutAI.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-surface-subtle text-content-muted border border-line px-2 py-0.5 rounded-full">
                              <Eye size={9} /> {withoutAI.length} a publicar
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {week.treinos.map(treino => (
                            <span key={treino.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-subtle border border-line rounded text-xs text-content-secondary">
                              <Dumbbell size={9} /> {treino.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })() : (
                    <span className="text-xs text-content-muted italic flex items-center gap-1">
                      <AlertCircle size={12} /> Nenhum treino cadastrado
                    </span>
                  )}
                </div>

                {/* Menu de ações */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === week.id ? null : week.id);
                    }}
                    className="p-2 hover:bg-surface-subtle rounded-lg text-content-muted hover:text-content-secondary transition-colors"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {openMenuId === week.id && (
                    <div className="absolute right-0 top-10 w-48 bg-surface-elevated rounded-xl shadow-xl border border-line z-20 overflow-hidden">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditWeek(week); }}
                        className="w-full text-left px-4 py-3 hover:bg-surface-subtle flex items-center gap-2 text-sm text-content-secondary font-medium"
                      >
                        <Edit size={15} /> Editar Semana
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDuplicateWeek({ id: week.id, number: week.week_number });
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-surface-subtle flex items-center gap-2 text-sm text-content-secondary font-medium"
                      >
                        <Copy size={15} /> Duplicar Semana
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botão Adicionar Semana */}
      <div className="mt-4">
        <button
          onClick={handleAddWeek}
          disabled={addingWeek}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-line rounded-xl text-content-muted hover:border-brand/40 hover:text-brand hover:bg-surface-subtle transition-all font-bold text-sm disabled:opacity-50"
        >
          {addingWeek ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          {addingWeek ? 'Adicionando...' : 'Adicionar Semana'}
        </button>
      </div>

      {/* Modal de Edição de Semana */}
      {editingWeek && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-week-title"
        >
          <div className="bg-surface-elevated rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-line">
            <div className="p-5 border-b border-line flex justify-between items-center">
              <h3 id="edit-week-title" className="font-bold text-content-primary flex items-center gap-2">
                <Edit size={16} className="text-brand" /> Editar Semana {editingWeek.week_number}
              </h3>
              <button onClick={() => setEditingWeek(null)} className="text-content-muted hover:text-content-secondary transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-content-muted uppercase block mb-1">Número da Semana</label>
                <input
                  type="number"
                  min={1}
                  value={editWeekNumber}
                  onChange={(e) => setEditWeekNumber(e.target.value)}
                  className={modalInputClass}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-content-muted uppercase block mb-1">Data de Início</label>
                <input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className={modalInputClass}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-content-muted uppercase block mb-1">Data de Fim</label>
                <input
                  type="date"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                  className={modalInputClass}
                />
              </div>
            </div>
            <div className="p-4 border-t border-line flex gap-3">
              <button
                onClick={() => setEditingWeek(null)}
                className="flex-1 py-2.5 bg-surface-subtle text-content-secondary font-bold rounded-xl hover:bg-surface-page transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveWeek}
                disabled={savingWeek || !editWeekNumber}
                className="flex-1 py-2.5 bg-brand text-content-on-brand font-bold rounded-xl hover:bg-brand-hover transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {savingWeek ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {savingWeek ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Panorama IA */}
      {aiReviewWeek && (
        <WeekAiReviewModal
          weekId={aiReviewWeek.id}
          weekNumber={aiReviewWeek.number}
          onClose={() => setAiReviewWeek(null)}
          onApproved={async () => {
            setAiReviewWeek(null);
            const data = await fetchWithAuth(`training_blocks/${blockId}`);
            setBlock(data);
          }}
        />
      )}

      {/* Modal de Duplicação de Semana */}
      {duplicateWeek && (
        <DuplicateWeekModal
          sourceWeekId={duplicateWeek.id}
          sourceWeekNumber={duplicateWeek.number}
          onClose={() => setDuplicateWeek(null)}
          onSuccess={() => {
            showToast("Semana duplicada com sucesso!");
            setDuplicateWeek(null);
          }}
        />
      )}

      {/* Modal de Duplicar Bloco */}
      {blockDupOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dup-block-title"
        >
          <div className="bg-surface-elevated rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-line">
            <div className="p-5 border-b border-line flex justify-between items-center">
              <h3 id="dup-block-title" className="font-bold text-content-primary flex items-center gap-2">
                <Copy size={16} className="text-brand" /> Duplicar Bloco
              </h3>
              <button onClick={() => setBlockDupOpen(false)} className="text-content-muted hover:text-content-secondary transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleDuplicateBlock} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-content-muted uppercase block mb-1">Aluno de Destino</label>
                <select
                  className="w-full border border-line-input rounded-lg px-3 py-2 bg-surface-app text-content-primary focus:ring-2 focus:ring-brand-glow outline-none text-sm"
                  value={blockDupAlunoId}
                  onChange={e => setBlockDupAlunoId(e.target.value)}
                  required
                >
                  <option value="">Selecione o aluno...</option>
                  {blockDupStudents.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}{s.id === id ? " (mesmo aluno)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-content-muted uppercase block mb-1">Título do Bloco</label>
                <input
                  type="text"
                  className="w-full border border-line-input rounded-lg px-3 py-2 bg-surface-app text-content-primary focus:ring-2 focus:ring-brand-glow outline-none text-sm"
                  value={blockDupTitle}
                  onChange={e => setBlockDupTitle(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-content-muted">
                Todas as semanas e treinos serão copiados para o aluno selecionado.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBlockDupOpen(false)}
                  className="flex-1 py-2.5 bg-surface-subtle text-content-secondary font-bold rounded-xl hover:bg-surface-page transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={duplicatingBlock || !blockDupAlunoId}
                  className="flex-1 py-2.5 bg-brand text-content-on-brand font-bold rounded-xl hover:bg-brand-hover transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {duplicatingBlock ? <Loader2 size={15} className="animate-spin" /> : <Copy size={15} />}
                  {duplicatingBlock ? 'Copiando...' : 'Duplicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {ToastEl}
      {ConfirmEl}
    </div>
  );
}
