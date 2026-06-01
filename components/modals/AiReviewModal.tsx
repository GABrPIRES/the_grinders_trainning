'use client';

import { useEffect, useState } from 'react';
import { X, Bot, CheckCircle2, AlertTriangle, Loader2, MessageSquare } from 'lucide-react';
import {
  coachReviewService,
  TreinoReview,
  SectionDiff,
  SectionOverride,
} from '@/services/coachReviewService';

interface AiReviewModalProps {
  treinoId: string;
  treinoName: string;
  onClose: () => void;
  onApproved: () => void;
}

export default function AiReviewModal({ treinoId, treinoName, onClose, onApproved }: AiReviewModalProps) {
  const [review, setReview] = useState<TreinoReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState('');
  // overrides: section_id → edited load string
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    coachReviewService.reviewTreino(treinoId)
      .then(setReview)
      .catch((err) => setError(err.message || 'Erro ao carregar sugestões.'))
      .finally(() => setLoading(false));
  }, [treinoId]);

  const handleApprove = async () => {
    setApproving(true);
    setError('');
    try {
      const sectionOverrides: SectionOverride[] = Object.entries(overrides)
        .filter(([, v]) => v !== '' && !isNaN(parseFloat(v)))
        .map(([id, load]) => ({ id, load: parseFloat(load) }));

      await coachReviewService.approveTreino(treinoId, sectionOverrides);
      onApproved();
    } catch (err: any) {
      setError(err.message || 'Erro ao aprovar. Tente novamente.');
    } finally {
      setApproving(false);
    }
  };

  const hasPendingSuggestions = review?.exercicios.some((ex) =>
    ex.sections.some((s) => s.suggestion_status === 'pending'),
  );

  const getDisplayLoad = (sec: SectionDiff) => {
    const override = overrides[sec.section_id];
    if (override !== undefined) return override;
    if (sec.suggested_load != null) return String(sec.suggested_load);
    if (sec.prescribed_load != null) return String(sec.prescribed_load);
    return '';
  };

  const delta = (sec: SectionDiff) => {
    const load = parseFloat(getDisplayLoad(sec));
    if (!sec.prescribed_load || isNaN(load)) return null;
    return ((load - sec.prescribed_load) / sec.prescribed_load) * 100;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl flex flex-col max-h-[92vh] overflow-hidden">

        {/* Header */}
        <div className="bg-neutral-900 text-white p-5 flex justify-between items-start flex-shrink-0">
          <div className="flex items-center gap-3">
            <Bot size={22} className="text-red-400" />
            <div>
              <h3 className="font-bold text-lg leading-tight">Revisão IA — {treinoName}</h3>
              <p className="text-xs text-neutral-400 mt-0.5">Edite as cargas se necessário e aprove o treino.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">

          {loading && (
            <div className="flex items-center justify-center py-12 text-neutral-400">
              <Loader2 className="animate-spin mr-2" size={20} /> Carregando sugestões...
            </div>
          )}

          {error && !loading && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
          )}

          {review && (
            <>
              {/* AI observation */}
              {review.ai_observation && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                  <Bot size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800 leading-relaxed">{review.ai_observation}</p>
                </div>
              )}

              {/* Section diffs — sempre renderiza todos os exercícios para permitir ajuste rápido */}
              {review.exercicios.map((ex) => (
                <div key={ex.exercicio_id} className="border border-neutral-200 rounded-xl overflow-hidden">
                  <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-100">
                    <h4 className="font-bold text-sm text-neutral-800">{ex.exercicio_name}</h4>
                  </div>

                  {/* Observação do aluno na semana anterior (se houver) */}
                  {ex.previous_observation && (
                    <div className="mx-4 mt-3 bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex gap-2">
                      <MessageSquare size={14} className="text-amber-700 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-900 leading-snug">
                        <span className="font-bold">Aluno observou:</span> {ex.previous_observation}
                      </p>
                    </div>
                  )}

                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[10px] font-bold text-neutral-400 uppercase text-center border-b border-neutral-100">
                        <th className="py-2 px-3 text-left">Séries</th>
                        <th className="py-2 px-3">Atual</th>
                        <th className="py-2 px-3">Aluno fez</th>
                        <th className="py-2 px-3">Sugerida</th>
                        <th className="py-2 px-3">Δ%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                      {ex.sections.map((sec) => {
                        const pct = delta(sec);
                        const isCritical = sec.critical;
                        const hasChange = sec.suggested_load !== sec.prescribed_load;
                        const hasActual = sec.previous_actual_load != null || sec.previous_actual_rpe != null;

                        return (
                          <tr
                            key={sec.section_id}
                            className={`transition-colors ${isCritical ? 'bg-yellow-50' : hasChange ? 'bg-neutral-50/50' : ''}`}
                          >
                            <td className="py-2.5 px-3 text-neutral-600">
                              {sec.series}×{sec.reps}
                              {isCritical && (
                                <AlertTriangle size={12} className="inline ml-1.5 text-yellow-600" />
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center font-medium text-neutral-700">
                              {sec.prescribed_load ?? '—'}
                              <span className="text-xs text-neutral-400 ml-1">{sec.load_unit || 'kg'}</span>
                            </td>
                            <td className="py-2.5 px-3 text-center text-xs">
                              {sec.previous_feito === false ? (
                                <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                                  não feito
                                </span>
                              ) : hasActual ? (
                                <div className="flex flex-col leading-tight">
                                  <span className="font-bold text-neutral-700">
                                    {sec.previous_actual_load != null ? sec.previous_actual_load : '—'}
                                    <span className="text-neutral-400 ml-0.5">{sec.load_unit || 'kg'}</span>
                                  </span>
                                  {sec.previous_actual_rpe != null && (
                                    <span className="text-[10px] text-neutral-500">RPE {sec.previous_actual_rpe}</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-neutral-300">—</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="number"
                                step="0.5"
                                value={getDisplayLoad(sec)}
                                onChange={(e) =>
                                  setOverrides((prev) => ({ ...prev, [sec.section_id]: e.target.value }))
                                }
                                className="w-20 border border-line-input rounded-lg p-1.5 text-center text-sm focus:ring-2 focus:ring-brand-glow outline-none mx-auto block bg-surface-app text-content-primary"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {pct != null ? (
                                <span
                                  className={`text-xs font-bold ${
                                    pct > 0 ? 'text-green-700' : pct < 0 ? 'text-red-600' : 'text-neutral-400'
                                  }`}
                                >
                                  {pct > 0 ? '+' : ''}{pct.toFixed(1)}%
                                </span>
                              ) : (
                                <span className="text-neutral-300">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        {review && (
          <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex-shrink-0">
            {!hasPendingSuggestions && (
              <p className="text-xs text-center text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-3">
                A IA manteve as cargas prescritas. Ajuste o que quiser e publique.
              </p>
            )}
            {error && (
              <p className="text-xs text-red-600 mb-3">{error}</p>
            )}
            <button
              onClick={handleApprove}
              disabled={approving}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {approving ? (
                <><Loader2 size={18} className="animate-spin" /> Publicando...</>
              ) : (
                <><CheckCircle2 size={18} /> Aprovar e Publicar Treino</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
