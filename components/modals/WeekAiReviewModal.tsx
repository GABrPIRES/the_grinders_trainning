'use client';

import { useEffect, useState } from 'react';
import { X, Bot, CheckCircle2, AlertTriangle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';

interface SectionDiff {
  section_id: string;
  reps: number | null;
  series: number | null;
  load_unit: string | null;
  prescribed_load: number | null;
  suggested_load: number | null;
  suggestion_status: string | null;
  critical: boolean;
}

interface ExercicioDiff {
  exercicio_id: string;
  exercicio_name: string;
  sections: SectionDiff[];
}

interface TreinoData {
  treino_id: string;
  treino_name: string;
  treino_day: string | null;
  ai_observation: string | null;
  pending_count: number;
  exercicios: ExercicioDiff[];
}

interface WeekReview {
  week_id: string;
  week_number: number;
  periodization_goal: string | null;
  treinos: TreinoData[];
}

interface WeekAiReviewModalProps {
  weekId: string;
  weekNumber: number;
  onClose: () => void;
  onApproved: () => void;
}

// overrides: { treino_id: { section_id: string } }
type Overrides = Record<string, Record<string, string>>;

export default function WeekAiReviewModal({ weekId, weekNumber, onClose, onApproved }: WeekAiReviewModalProps) {
  const [review, setReview] = useState<WeekReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState('');
  const [overrides, setOverrides] = useState<Overrides>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchWithAuth(`coach/weeks/${weekId}/review`)
      .then(setReview)
      .catch((err: any) => setError(err.message || 'Erro ao carregar revisão.'))
      .finally(() => setLoading(false));
  }, [weekId]);

  const setOverride = (treinoId: string, sectionId: string, value: string) => {
    setOverrides((prev) => ({
      ...prev,
      [treinoId]: { ...(prev[treinoId] || {}), [sectionId]: value },
    }));
  };

  const getDisplayLoad = (treinoId: string, sec: SectionDiff) => {
    return overrides[treinoId]?.[sec.section_id] ?? (sec.suggested_load != null ? String(sec.suggested_load) : '');
  };

  const delta = (treinoId: string, sec: SectionDiff) => {
    const load = parseFloat(getDisplayLoad(treinoId, sec));
    if (!sec.prescribed_load || isNaN(load)) return null;
    return ((load - sec.prescribed_load) / sec.prescribed_load) * 100;
  };

  const handleApproveAll = async () => {
    if (!review) return;
    setApproving(true);
    setError('');
    try {
      const treinosPayload = review.treinos.map((t) => ({
        treino_id: t.treino_id,
        sections: Object.entries(overrides[t.treino_id] || {})
          .filter(([, v]) => v !== '' && !isNaN(parseFloat(v)))
          .map(([id, load]) => ({ id, load: parseFloat(load) })),
      }));

      await fetchWithAuth(`coach/weeks/${weekId}/approve_all`, {
        method: 'POST',
        body: JSON.stringify({ treinos: treinosPayload }),
      });

      onApproved();
    } catch (err: any) {
      setError(err.message || 'Erro ao aprovar. Tente novamente.');
    } finally {
      setApproving(false);
    }
  };

  const goalLabel: Record<string, string> = {
    overload: 'Progressão',
    maintenance: 'Manter',
    deload: 'Deload',
  };

  const totalPending = review?.treinos.reduce((sum, t) => sum + t.pending_count, 0) ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-3xl flex flex-col max-h-[95vh] overflow-hidden">

        {/* Header */}
        <div className="bg-neutral-900 text-white p-5 flex justify-between items-start flex-shrink-0">
          <div className="flex items-center gap-3">
            <Bot size={22} className="text-red-400" />
            <div>
              <h3 className="font-bold text-lg leading-tight">
                Revisão IA — Semana {weekNumber}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {review
                  ? `${review.treinos.length} treinos · ${totalPending} sugestões de carga${review.periodization_goal ? ` · ${goalLabel[review.periodization_goal] ?? review.periodization_goal}` : ''}`
                  : 'Carregando...'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-4">

          {loading && (
            <div className="flex items-center justify-center py-16 text-neutral-400">
              <Loader2 className="animate-spin mr-2" size={20} /> Carregando sugestões da IA...
            </div>
          )}

          {error && !loading && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
          )}

          {review && review.treinos.map((treino) => {
            const isCollapsed = collapsed[treino.treino_id];
            const hasSuggestions = treino.pending_count > 0;

            return (
              <div key={treino.treino_id} className="border border-neutral-200 rounded-xl overflow-hidden">

                {/* Treino header */}
                <button
                  className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50 hover:bg-neutral-100 transition-colors text-left"
                  onClick={() => setCollapsed((prev) => ({ ...prev, [treino.treino_id]: !prev[treino.treino_id] }))}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-neutral-800">{treino.treino_name}</span>
                    {hasSuggestions ? (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                        {treino.pending_count} sugestão{treino.pending_count !== 1 ? 'ões' : ''}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                        Cargas mantidas
                      </span>
                    )}
                  </div>
                  {isCollapsed ? <ChevronDown size={16} className="text-neutral-400" /> : <ChevronUp size={16} className="text-neutral-400" />}
                </button>

                {!isCollapsed && (
                  <div className="p-4 space-y-4">

                    {/* AI Observation */}
                    {treino.ai_observation && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-2">
                        <Bot size={15} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-800 leading-relaxed">{treino.ai_observation}</p>
                      </div>
                    )}

                    {/* Exercises */}
                    {treino.exercicios.map((ex) => {
                      const pendingSections = ex.sections.filter(s => s.suggestion_status === 'pending');
                      if (pendingSections.length === 0) return null;

                      return (
                        <div key={ex.exercicio_id}>
                          <p className="text-xs font-bold text-neutral-500 uppercase mb-2">{ex.exercicio_name}</p>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-[10px] font-bold text-neutral-400 uppercase text-center border-b border-neutral-100">
                                <th className="pb-1.5 text-left">Séries</th>
                                <th className="pb-1.5">Prescrita</th>
                                <th className="pb-1.5">Sugerida</th>
                                <th className="pb-1.5">Δ%</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                              {pendingSections.map((sec) => {
                                const pct = delta(treino.treino_id, sec);
                                return (
                                  <tr key={sec.section_id} className={sec.critical ? 'bg-yellow-50' : ''}>
                                    <td className="py-2 text-neutral-600 text-xs">
                                      {sec.series}×{sec.reps}
                                      {sec.critical && <AlertTriangle size={11} className="inline ml-1 text-yellow-600" />}
                                    </td>
                                    <td className="py-2 text-center text-xs font-medium text-neutral-700">
                                      {sec.prescribed_load ?? '—'}
                                      <span className="text-neutral-400 ml-0.5">{sec.load_unit || 'kg'}</span>
                                    </td>
                                    <td className="py-2 text-center">
                                      <input
                                        type="number"
                                        step="0.5"
                                        value={getDisplayLoad(treino.treino_id, sec)}
                                        onChange={(e) => setOverride(treino.treino_id, sec.section_id, e.target.value)}
                                        className="w-20 border border-line-input rounded-lg p-1 text-center text-xs focus:ring-2 focus:ring-brand-glow outline-none mx-auto block bg-surface-app text-content-primary"
                                      />
                                    </td>
                                    <td className="py-2 text-center">
                                      {pct != null ? (
                                        <span className={`text-xs font-bold ${pct > 0 ? 'text-green-700' : pct < 0 ? 'text-red-600' : 'text-neutral-400'}`}>
                                          {pct > 0 ? '+' : ''}{pct.toFixed(1)}%
                                        </span>
                                      ) : <span className="text-neutral-300 text-xs">—</span>}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      );
                    })}

                    {!hasSuggestions && (
                      <p className="text-xs text-neutral-400 italic">
                        A IA manteve todas as cargas prescritas para este treino.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {review && (
          <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex-shrink-0 space-y-2">
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              onClick={handleApproveAll}
              disabled={approving}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {approving
                ? <><Loader2 size={18} className="animate-spin" /> Publicando todos...</>
                : <><CheckCircle2 size={18} /> Aprovar e Publicar Todos os Treinos</>}
            </button>
            <p className="text-xs text-center text-neutral-400">
              Todos os {review.treinos.length} treinos serão publicados com as cargas acima.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
