'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { treinoService } from '@/services/treinoService';
import { calculatePR } from '@/lib/calculatePR';
import WeeklyFeedbackModal from '@/components/modals/WeeklyFeedbackModal';
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Timer,
  Dumbbell,
  Calendar,
  ChevronDown,
  Info,
  AlertCircle,
  X,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Section {
  id: string;
  carga?: number | null;
  load_unit?: string | null;
  series?: number | null;
  reps?: number | null;
  equip?: string | null;
  rpe?: number | null;
  pr?: number | null;
  feito?: boolean | null;
  actual_load?: number | null;
  actual_rpe?: number | null;
}

interface Exercise {
  id: string;
  name: string;
  observation?: string | null;
  sections: Section[];
}

interface Treino {
  id: string;
  name: string;
  day: string;
  status: 'draft' | 'published' | 'in_progress' | 'completed';
  started_at?: string | null;
  finished_at?: string | null;
  exercicios: Exercise[];
  feedback_submitted?: boolean;
}

interface SectionLog {
  actual_load: string;
  actual_rpe: string;
  feito: boolean;
}

// ─── Timer hook ───────────────────────────────────────────────────────────────

function useTimer(startedAt: string | null | undefined, treinoId: string) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!startedAt) return;

    const start = new Date(startedAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startedAt, treinoId]);

  const hh = String(Math.floor(elapsed / 3600)).padStart(2, '0');
  const mm = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Treino['status'] }) {
  const map = {
    draft: { label: 'Rascunho', cls: 'bg-neutral-100 text-neutral-600' },
    published: { label: 'Disponível', cls: 'bg-blue-50 text-blue-700' },
    in_progress: { label: 'Em andamento', cls: 'bg-amber-50 text-amber-700 animate-pulse' },
    completed: { label: 'Concluído', cls: 'bg-green-50 text-green-700' },
  };
  const { label, cls } = map[status] ?? map.draft;
  return <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cls}`}>{label}</span>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AlunoTreinoDetalhesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [treino, setTreino] = useState<Treino | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [showPauseConfirm, setShowPauseConfirm] = useState(false);
  const [error, setError] = useState('');

  // Per-section log state: sectionId → { actual_load, actual_rpe, feito }
  const [sectionLogs, setSectionLogs] = useState<Record<string, SectionLog>>({});
  // Per-exercicio observation state: exercicioId → observation string
  const [observations, setObservations] = useState<Record<string, string>>({});
  // Debounce refs
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Feedback modal
  const [feedbackWeekId, setFeedbackWeekId] = useState<string | null>(null);

  const timerDisplay = useTimer(treino?.started_at, id);

  const isActive = treino?.status === 'in_progress';
  // Edição liberada durante execução OU após conclusão enquanto o forms não foi enviado
  const isEditable = isActive || (treino?.status === 'completed' && !treino?.feedback_submitted);
  const isCompleted = treino?.status === 'completed';
  const isPreview = treino?.status === 'published';

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchTreino = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data: Treino = await fetchWithAuth(`meus_treinos/${id}`);
      setTreino(data);

      // Seed local logs from existing actual values
      const logs: Record<string, SectionLog> = {};
      const obs: Record<string, string> = {};
      data.exercicios.forEach((ex) => {
        obs[ex.id] = ex.observation ?? '';
        ex.sections.forEach((sec) => {
          logs[sec.id] = {
            actual_load: sec.actual_load != null ? String(sec.actual_load) : '',
            actual_rpe: sec.actual_rpe != null ? String(sec.actual_rpe) : '',
            feito: sec.feito ?? false,
          };
        });
      });
      setSectionLogs(logs);
      setObservations(obs);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar treino.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchTreino(); }, [fetchTreino]);

  // ── Start ──────────────────────────────────────────────────────────────────

  const handleStart = async () => {
    if (!treino) return;
    setStarting(true);
    setError('');
    try {
      await treinoService.start(treino.id);
      await fetchTreino();
    } catch (err: any) {
      setError(err.message || 'Erro ao iniciar treino.');
    } finally {
      setStarting(false);
    }
  };

  // ── Finish ─────────────────────────────────────────────────────────────────

  const handleFinish = async () => {
    if (!treino) return;
    setFinishing(true);
    setError('');
    try {
      const result = await treinoService.finish(treino.id);
      await fetchTreino();
      if (result?.feedback_form_available && result?.week_id) {
        setFeedbackWeekId(result.week_id);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao finalizar treino.');
    } finally {
      setFinishing(false);
    }
  };

  // ── Pause ──────────────────────────────────────────────────────────────────

  const executePause = async (force: boolean) => {
    if (!treino) return;
    setPausing(true);
    setError('');
    setShowPauseConfirm(false);
    try {
      await treinoService.pause(treino.id, force);
      await fetchTreino();
    } catch (err: any) {
      setError(err.message || 'Erro ao cancelar treino.');
    } finally {
      setPausing(false);
    }
  };

  const handlePause = async () => {
    if (!treino) return;
    // Check locally if there's any data entered in state
    const hasLocalData = Object.values(sectionLogs).some(
      (log) => log.feito || log.actual_load !== '' || log.actual_rpe !== '',
    );
    if (hasLocalData) {
      setShowPauseConfirm(true);
    } else {
      await executePause(false);
    }
  };

  // ── Section log (debounced for load/rpe, immediate for feito) ──────────────

  const persistSectionLog = useCallback(
    async (sectionId: string, patch: Partial<SectionLog>) => {
      const current = sectionLogs[sectionId];
      if (!current) return;
      const merged = { ...current, ...patch };
      const payload: { actual_load?: number | null; actual_rpe?: number | null; feito?: boolean } = {
        feito: merged.feito,
        actual_load: merged.actual_load !== '' ? parseFloat(merged.actual_load) : null,
        actual_rpe: merged.actual_rpe !== '' ? parseFloat(merged.actual_rpe) : null,
      };
      try {
        await treinoService.logSection(sectionId, payload);
      } catch {
        // Silent — user will see stale UI but no disruptive error
      }
    },
    [sectionLogs],
  );

  const handleSectionChange = (
    sectionId: string,
    field: keyof SectionLog,
    value: string | boolean,
  ) => {
    setSectionLogs((prev) => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], [field]: value },
    }));

    if (field === 'feito') {
      // Save immediately
      persistSectionLog(sectionId, { [field]: value as boolean });
    } else {
      // Debounce 1.5s for number inputs
      if (saveTimers.current[sectionId]) clearTimeout(saveTimers.current[sectionId]);
      saveTimers.current[sectionId] = setTimeout(() => {
        persistSectionLog(sectionId, { [field]: value as string });
      }, 1500);
    }
  };

  // ── Observation log (debounced) ────────────────────────────────────────────

  const handleObservationChange = (exercicioId: string, value: string) => {
    setObservations((prev) => ({ ...prev, [exercicioId]: value }));

    const key = `obs_${exercicioId}`;
    if (saveTimers.current[key]) clearTimeout(saveTimers.current[key]);
    saveTimers.current[key] = setTimeout(async () => {
      try {
        await treinoService.logExercicio(exercicioId, value);
      } catch {
        // Silent
      }
    }, 1500);
  };

  // ── PR calculation helper ──────────────────────────────────────────────────

  const computePR = (sec: Section, log: SectionLog) => {
    const load = log.actual_load !== '' ? parseFloat(log.actual_load) : sec.carga;
    const rpe = log.actual_rpe !== '' ? parseFloat(log.actual_rpe) : null;
    const reps = sec.reps;
    if (!load || !rpe || !reps || sec.load_unit === 'rir') return null;
    const pr = calculatePR({ carga: load, reps, rpe });
    return pr != null ? parseFloat(pr.toFixed(2)) : null;
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-8 text-center text-neutral-400 animate-pulse">
        <Dumbbell className="mx-auto mb-3" size={32} />
        Carregando treino...
      </div>
    );
  }

  if (error && !treino) {
    return (
      <div className="p-8 text-center text-red-600">
        <AlertCircle className="mx-auto mb-2" size={28} />
        {error}
      </div>
    );
  }

  if (!treino) return null;

  return (
    <div className="max-w-3xl mx-auto p-4 pb-32 text-neutral-800">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-6 pb-4 border-b border-neutral-200">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-neutral-900">{treino.name}</h1>
              <StatusBadge status={treino.status} />
            </div>
            <div className="flex items-center gap-2 text-neutral-500 text-sm">
              <Calendar size={14} />
              <span className="capitalize">
                {new Date(treino.day).toLocaleDateString('pt-BR', {
                  timeZone: 'UTC',
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </span>
            </div>
          </div>

          {/* Timer (active only) */}
          {isActive && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-xl font-mono text-lg font-bold">
              <Timer size={18} className="animate-pulse" />
              {timerDisplay}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </div>

      {/* ── Preview CTA ────────────────────────────────────────────────────── */}
      {isPreview && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-blue-800">Treino disponível</p>
            <p className="text-sm text-blue-600 mt-0.5">Revise as prescrições abaixo e inicie quando estiver pronto.</p>
          </div>
          <button
            onClick={handleStart}
            disabled={starting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            <Play size={18} />
            {starting ? 'Iniciando...' : 'Iniciar Treino'}
          </button>
        </div>
      )}

      {/* ── Completed summary ──────────────────────────────────────────────── */}
      {isCompleted && treino.finished_at && treino.started_at && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 size={24} className="text-green-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-green-800">Treino concluído!</p>
            <p className="text-sm text-green-600">
              Duração:{' '}
              {(() => {
                const secs = Math.floor(
                  (new Date(treino.finished_at!).getTime() - new Date(treino.started_at!).getTime()) / 1000,
                );
                const hh = Math.floor(secs / 3600);
                const mm = Math.floor((secs % 3600) / 60);
                const ss = secs % 60;
                return hh > 0
                  ? `${hh}h ${mm}min ${ss}s`
                  : mm > 0
                  ? `${mm}min ${ss}s`
                  : `${ss}s`;
              })()}
            </p>
          </div>
        </div>
      )}

      {/* ── Exercise list ─────────────────────────────────────────────────── */}
      <div className="space-y-5">
        {treino.exercicios.map((ex, exIndex) => (
          <div key={ex.id} className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">

            {/* Exercise header */}
            <div className="bg-neutral-50 border-b border-neutral-100 p-4">
              <h2 className="text-base font-bold text-red-700">
                {exIndex + 1}. {ex.name}
              </h2>

              {/* Observation textarea (editable or read-only after forms) */}
              {(isEditable || isCompleted) && (
                <div className="mt-3">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">
                    Observação do exercício
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Anotações, dores, ajustes de técnica..."
                    value={observations[ex.id] ?? ''}
                    onChange={(e) => handleObservationChange(ex.id, e.target.value)}
                    disabled={!isEditable}
                    className="w-full text-sm border border-neutral-200 rounded-lg p-2 resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none disabled:bg-neutral-50 disabled:text-neutral-500"
                  />
                </div>
              )}
            </div>

            {/* Column headers */}
            <div
              className={`hidden md:grid text-[10px] font-bold text-neutral-400 uppercase tracking-wide px-4 py-2 border-b border-neutral-100 text-center ${
                isEditable ? 'grid-cols-7' : 'grid-cols-6'
              }`}
            >
              <span>Carga</span>
              {isEditable && <span>Real</span>}
              <span>Séries</span>
              <span>Reps</span>
              <span>Equip</span>
              <span>RPE {isActive ? 'previsto' : ''}</span>
              <span>{isActive ? 'RPE Real' : 'PR Est.'}</span>
              <span>Feito</span>
            </div>

            {/* Sections */}
            <div className="divide-y divide-neutral-100">
              {ex.sections.map((sec) => {
                const log = sectionLogs[sec.id] ?? { actual_load: '', actual_rpe: '', feito: false };
                const estimatedPR = computePR(sec, log);

                return (
                  <div
                    key={sec.id}
                    className={`p-4 transition-colors ${
                      log.feito ? 'bg-green-50/60' : isEditable ? 'hover:bg-neutral-50' : ''
                    }`}
                  >
                    {/* Mobile layout */}
                    <div className="md:hidden space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg text-neutral-800">
                            {sec.carga ?? '—'}
                            <span className="text-xs font-normal text-neutral-400 ml-1">{sec.load_unit || 'kg'}</span>
                          </span>
                          <span className="text-sm text-neutral-500">{sec.series}×{sec.reps}</span>
                          {sec.rpe && <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">RPE {sec.rpe}</span>}
                        </div>
                        {isEditable ? (
                          <input
                            type="checkbox"
                            checked={log.feito}
                            onChange={(e) => handleSectionChange(sec.id, 'feito', e.target.checked)}
                            className="h-6 w-6 accent-red-600 rounded cursor-pointer"
                          />
                        ) : (
                          <span className={`text-lg ${log.feito ? '✅' : isCompleted ? '⬜' : ''}`}>
                            {log.feito ? '✅' : isCompleted ? '⬜' : ''}
                          </span>
                        )}
                      </div>

                      {sec.equip && (
                        <p className="text-xs text-neutral-400 flex items-center gap-1">
                          <Info size={10} /> {sec.equip}
                        </p>
                      )}

                      {isEditable && (
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Carga Real</label>
                            <input
                              type="number"
                              step="0.5"
                              placeholder={sec.carga != null ? String(sec.carga) : '—'}
                              value={log.actual_load}
                              onChange={(e) => handleSectionChange(sec.id, 'actual_load', e.target.value)}
                              className="w-full border border-neutral-300 rounded-lg p-2 text-center text-sm focus:ring-2 focus:ring-red-500 outline-none"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">RPE Real</label>
                            <input
                              type="number"
                              step="0.5"
                              min="5"
                              max="10"
                              placeholder={sec.rpe != null ? String(sec.rpe) : '—'}
                              value={log.actual_rpe}
                              onChange={(e) => handleSectionChange(sec.id, 'actual_rpe', e.target.value)}
                              className="w-full border border-neutral-300 rounded-lg p-2 text-center text-sm focus:ring-2 focus:ring-red-500 outline-none"
                            />
                          </div>
                          {estimatedPR != null && (
                            <div className="flex-1">
                              <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">PR Est.</label>
                              <p className="text-center font-bold text-red-700 text-sm pt-2">{estimatedPR}kg</p>
                            </div>
                          )}
                        </div>
                      )}

                      {isCompleted && (
                        <div className="flex gap-4 text-sm text-neutral-500">
                          {log.actual_load && (
                            <span>Real: <strong className="text-neutral-800">{log.actual_load}{sec.load_unit || 'kg'}</strong></span>
                          )}
                          {log.actual_rpe && (
                            <span>RPE: <strong className="text-neutral-800">{log.actual_rpe}</strong></span>
                          )}
                          {estimatedPR && (
                            <span>PR: <strong className="text-red-700">{estimatedPR}kg</strong></span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Desktop layout */}
                    <div
                      className={`hidden md:grid items-center gap-2 text-center ${
                        isEditable ? 'grid-cols-7' : 'grid-cols-6'
                      }`}
                    >
                      {/* Prescribed load */}
                      <div>
                        <span className="font-bold text-neutral-800">
                          {sec.carga ?? '—'}
                        </span>
                        <span className="text-xs text-neutral-400 ml-1">{sec.load_unit || 'kg'}</span>
                      </div>

                      {/* Actual load input (editable) */}
                      {isEditable && (
                        <input
                          type="number"
                          step="0.5"
                          placeholder={sec.carga != null ? String(sec.carga) : '—'}
                          value={log.actual_load}
                          onChange={(e) => handleSectionChange(sec.id, 'actual_load', e.target.value)}
                          className="border border-neutral-300 rounded-lg p-1.5 w-full text-center text-sm focus:ring-2 focus:ring-red-500 outline-none"
                        />
                      )}

                      <span className="text-sm">{sec.series ?? '—'}</span>
                      <span className="text-sm">{sec.reps ?? '—'}</span>
                      <span className="text-xs text-neutral-500">{sec.equip || '—'}</span>

                      {/* Prescribed RPE */}
                      <span className="text-sm">{sec.rpe ?? '—'}</span>

                      {/* Actual RPE (editable) or PR Est (read-only) */}
                      {isEditable ? (
                        <input
                          type="number"
                          step="0.5"
                          min="5"
                          max="10"
                          placeholder={sec.rpe != null ? String(sec.rpe) : '—'}
                          value={log.actual_rpe}
                          onChange={(e) => handleSectionChange(sec.id, 'actual_rpe', e.target.value)}
                          className="border border-neutral-300 rounded-lg p-1.5 w-full text-center text-sm focus:ring-2 focus:ring-red-500 outline-none"
                        />
                      ) : (
                        <span className="text-sm font-medium text-red-700">
                          {estimatedPR ? `${estimatedPR}kg` : '—'}
                        </span>
                      )}

                      {/* Feito checkbox */}
                      {isEditable ? (
                        <input
                          type="checkbox"
                          checked={log.feito}
                          onChange={(e) => handleSectionChange(sec.id, 'feito', e.target.checked)}
                          className="h-5 w-5 accent-red-600 rounded cursor-pointer mx-auto block"
                        />
                      ) : (
                        <span className="text-base mx-auto block">{log.feito ? '✅' : '⬜'}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Active treino bottom bar ───────────────────────────────────────── */}
      {isActive && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 bg-white border-t border-neutral-200 shadow-lg z-20">
          <div className="flex gap-3 max-w-md mx-auto">
            <button
              onClick={handlePause}
              disabled={pausing || finishing}
              className="flex items-center justify-center gap-2 border border-neutral-300 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 font-bold px-4 py-4 rounded-2xl transition-colors disabled:opacity-50 whitespace-nowrap"
              title="Cancelar início do treino"
            >
              <X size={18} />
              {pausing ? 'Cancelando...' : 'Cancelar'}
            </button>
            <button
              onClick={handleFinish}
              disabled={finishing || pausing}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-colors disabled:opacity-50 text-base"
            >
              <CheckCircle2 size={20} />
              {finishing ? 'Finalizando...' : 'Finalizar Treino'}
            </button>
          </div>
        </div>
      )}

      {/* ── Pause confirmation modal ───────────────────────────────────────── */}
      {showPauseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle size={24} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-neutral-900 text-base">Cancelar início do treino?</h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Você já registrou dados neste treino. Ao cancelar, eles serão perdidos e o treino voltará para o estado disponível.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPauseConfirm(false)}
                className="flex-1 border border-neutral-300 text-neutral-700 font-bold py-3 rounded-xl hover:bg-neutral-50 transition-colors"
              >
                Continuar treino
              </button>
              <button
                onClick={() => executePause(true)}
                disabled={pausing}
                className="flex-1 bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {pausing ? 'Cancelando...' : 'Sim, cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Weekly feedback modal ──────────────────────────────────────────── */}
      {feedbackWeekId && (
        <WeeklyFeedbackModal
          weekId={feedbackWeekId}
          onClose={() => setFeedbackWeekId(null)}
          onSubmitted={() => setFeedbackWeekId(null)}
        />
      )}
    </div>
  );
}
