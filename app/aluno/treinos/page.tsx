"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Dumbbell, ArrowRight, ChevronDown, ChevronUp, CheckCircle, ClipboardList } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from 'date-fns/locale';
import WeeklyFeedbackModal from "@/components/modals/WeeklyFeedbackModal";

interface Treino {
  id: string;
  name: string;
  day: string;
  status?: 'draft' | 'published' | 'in_progress' | 'completed';
}
interface Week {
  id: string;
  week_number: number;
  start_date: string;
  end_date: string;
  treinos: Treino[];
}
interface TrainingBlock {
  id: string;
  title: string;
  weeks_duration: number;
  start_date: string;
  end_date: string;
  weeks: Week[];
}

function TreinosSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 animate-pulse space-y-6 pb-24 md:pb-6">
      <div className="space-y-2">
        <div className="h-9 bg-surface-subtle rounded-lg w-48"></div>
        <div className="h-4 bg-surface-subtle rounded w-72"></div>
      </div>
      {[...Array(2)].map((_, i) => (
        <div key={i} className="border border-line rounded-xl overflow-hidden">
          <div className="p-5 flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-6 bg-surface-subtle rounded-lg w-48"></div>
              <div className="h-4 bg-surface-subtle rounded w-36"></div>
            </div>
            <div className="h-5 w-5 bg-surface-subtle rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MeusTreinosPage() {
  const [blocks, setBlocks] = useState<TrainingBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
  const [expandedWeekId, setExpandedWeekId] = useState<string | null>(null);
  const [pendingFeedbackWeekId, setPendingFeedbackWeekId] = useState<string | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [data, feedbackRes] = await Promise.all([
          fetchWithAuth('meus_treinos'),
          fetchWithAuth('weekly_feedbacks/pending').catch(() => null),
        ]);
        setBlocks(data || []);
        if (feedbackRes?.pending && feedbackRes?.week_id) {
          setPendingFeedbackWeekId(feedbackRes.week_id);
        }

        if (data && data.length > 0) {
          const todayStr = new Date().toISOString().split('T')[0];
          const activeBlock = data.find((b: TrainingBlock) =>
            b.start_date && b.end_date && todayStr >= b.start_date && todayStr <= b.end_date
          ) || data[0];
          setExpandedBlockId(activeBlock.id);

          const activeWeek = activeBlock.weeks.find((week: Week) => {
            if (!week.start_date || !week.end_date) return false;
            return todayStr >= week.start_date && todayStr <= week.end_date;
          });

          if (activeWeek) {
            setExpandedWeekId(activeWeek.id);
          } else if (activeBlock.weeks.length > 0) {
            setExpandedWeekId(activeBlock.weeks[0].id);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/D";
    return format(parseISO(dateString), 'dd/MM', { locale: ptBR });
  };

  const isCurrentDate = (start: string, end: string) => {
    if (!start || !end) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    return todayStr >= start && todayStr <= end;
  };

  if (loading) return <TreinosSkeleton />;

  if (blocks.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="bg-surface-elevated border border-line rounded-xl shadow-sm p-12 text-center flex flex-col items-center">
          <Dumbbell size={48} className="text-content-muted mb-4" />
          <h3 className="text-lg font-bold text-content-primary mb-1">Nenhum treino encontrado</h3>
          <p className="text-sm text-content-tertiary">Seu coach ainda não criou um bloco de treinos para você.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 text-content-primary space-y-8 pb-24 md:pb-6">
      <div>
        <h1 className="text-3xl font-bold text-content-primary">Meus Treinos</h1>
        <p className="text-sm text-content-tertiary mt-1">Selecione um bloco e uma semana para ver seus treinos.</p>
      </div>

      <div className="space-y-4">
        {blocks.map((block, index) => {
          const todayStr = new Date().toISOString().split('T')[0];
          const isCurrentBlock = block.start_date && block.end_date
            ? todayStr >= block.start_date && todayStr <= block.end_date
            : index === 0;
          const isExpanded = expandedBlockId === block.id;

          return (
            <div key={block.id} className="border border-line rounded-xl bg-surface-elevated shadow-sm overflow-hidden">
              {/* Cabeçalho do Bloco */}
              <button
                onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
                className={`w-full flex items-center justify-between p-5 text-left transition-colors ${isExpanded ? 'bg-surface-subtle border-b border-line' : 'hover:bg-surface-subtle'}`}
              >
                <div>
                  <h2 className="text-xl font-bold text-content-primary flex items-center gap-2">
                    {block.title}
                    {isCurrentBlock && (
                      <span className="bg-semantic-success-bg text-semantic-success-text border border-semantic-success-border text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                        Atual
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-content-tertiary mt-1">
                    {block.weeks_duration} Semanas • {formatDate(block.start_date)} a {formatDate(block.end_date)}
                  </p>
                </div>
                {isExpanded ? <ChevronUp className="text-content-muted flex-shrink-0" /> : <ChevronDown className="text-content-muted flex-shrink-0" />}
              </button>

              {/* Semanas */}
              {isExpanded && (
                <div className="p-4 space-y-3">
                  {block.weeks.map(week => {
                    const isCurrentWeek = isCurrentDate(week.start_date, week.end_date);
                    const isWeekExpanded = expandedWeekId === week.id;
                    const hasPendingFeedback = pendingFeedbackWeekId === week.id;

                    return (
                      <div
                        key={week.id}
                        className={`bg-surface-elevated border rounded-xl shadow-sm overflow-hidden transition-all ${
                          hasPendingFeedback
                            ? 'border-semantic-warning-border ring-1 ring-semantic-warning-border/50'
                            : isCurrentWeek
                            ? 'border-brand/30 ring-1 ring-brand/20'
                            : 'border-line'
                        }`}
                      >
                        <button
                          onClick={() => setExpandedWeekId(isWeekExpanded ? null : week.id)}
                          className="w-full flex items-center justify-between p-4 text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                              hasPendingFeedback
                                ? 'bg-semantic-warning-bg text-semantic-warning-text'
                                : isCurrentWeek
                                ? 'bg-brand-surface text-brand'
                                : 'bg-surface-subtle text-content-secondary'
                            }`}>
                              {week.week_number}
                            </div>
                            <div>
                              <p className={`font-bold ${
                                hasPendingFeedback
                                  ? 'text-semantic-warning-text'
                                  : isCurrentWeek
                                  ? 'text-brand'
                                  : 'text-content-primary'
                              }`}>
                                Semana {week.week_number}
                                {isCurrentWeek && !hasPendingFeedback && (
                                  <span className="ml-2 text-xs font-medium text-brand">(Atual)</span>
                                )}
                              </p>
                              <p className="text-xs text-content-tertiary">
                                {formatDate(week.start_date)} – {formatDate(week.end_date)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {hasPendingFeedback && (
                              <span className="text-[10px] font-bold bg-semantic-warning-bg text-semantic-warning-text border border-semantic-warning-border px-2 py-0.5 rounded-full">
                                Formulário pendente
                              </span>
                            )}
                            {isWeekExpanded
                              ? <ChevronUp size={18} className="text-content-muted" />
                              : <ChevronDown size={18} className="text-content-muted" />}
                          </div>
                        </button>

                        {/* Banner de formulário pendente */}
                        {hasPendingFeedback && (
                          <div className="mx-4 mb-3 bg-semantic-warning-bg border border-semantic-warning-border rounded-xl p-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <ClipboardList size={16} className="text-semantic-warning-text flex-shrink-0" />
                              <p className="text-xs font-bold text-semantic-warning-text">
                                Semana concluída! Preencha o formulário para gerar a próxima.
                              </p>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowFeedbackModal(true); }}
                              className="text-xs font-bold bg-brand hover:bg-brand-hover text-content-on-brand px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
                            >
                              Preencher
                            </button>
                          </div>
                        )}

                        {/* Treinos da Semana */}
                        {isWeekExpanded && (
                          <div className="px-4 pb-4 pt-0 border-t border-line">
                            {week.treinos.length > 0 ? (
                              <ul className="mt-3 space-y-2">
                                {week.treinos.map(treino => (
                                  <li key={treino.id}>
                                    <button
                                      onClick={() => router.push(`/aluno/treinos/${treino.id}`)}
                                      className="w-full flex items-center justify-between p-3 rounded-xl border border-line hover:bg-surface-subtle hover:border-brand/30 transition-all group active:scale-[0.98]"
                                    >
                                      <div className="flex items-center gap-3">
                                        <Dumbbell size={18} className="text-content-muted group-hover:text-brand transition-colors" />
                                        <div className="text-left">
                                          <p className="font-bold text-content-primary group-hover:text-brand text-sm">{treino.name}</p>
                                          <p className="text-xs text-content-tertiary">{formatDate(treino.day)}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {treino.status === 'in_progress' && (
                                          <span className="text-[10px] font-bold bg-semantic-warning-bg text-semantic-warning-text border border-semantic-warning-border px-2 py-0.5 rounded-full animate-pulse">
                                            Em andamento
                                          </span>
                                        )}
                                        {treino.status === 'completed' && (
                                          <CheckCircle size={16} className="text-semantic-success-text" />
                                        )}
                                        <ArrowRight size={16} className="text-content-muted group-hover:text-brand" />
                                      </div>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-content-muted py-4 text-center italic">Sem treinos cadastrados.</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showFeedbackModal && pendingFeedbackWeekId && (
        <WeeklyFeedbackModal
          weekId={pendingFeedbackWeekId}
          onClose={() => setShowFeedbackModal(false)}
          onSubmitted={() => {
            setShowFeedbackModal(false);
            setPendingFeedbackWeekId(null);
          }}
        />
      )}
    </div>
  );
}
