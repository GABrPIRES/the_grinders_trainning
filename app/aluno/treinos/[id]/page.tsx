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
  Info,
  AlertCircle,
  X,
  ChevronDown,
  Check,
  MessageSquare,
} from 'lucide-react';

function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let videoId: string | null = null;
    if (u.hostname === 'youtu.be') {
      videoId = u.pathname.slice(1).split('?')[0];
    } else if (u.pathname.startsWith('/shorts/')) {
      videoId = u.pathname.split('/shorts/')[1]?.split('?')[0] ?? null;
    } else {
      videoId = u.searchParams.get('v');
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&controls=0&rel=0&modestbranding=1` : null;
  } catch { return null; }
}

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
  coach_comment?: string | null;
  video_link?: string | null;
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

// ─── Video Player (clean embed + overlay unlock) ──────────────────────────────

function VideoPlayer({ src, iframeRef, title }: {
  src: string;
  iframeRef: (el: HTMLIFrameElement | null) => void;
  title: string;
}) {
  const [overlayActive, setOverlayActive] = useState(true);
  const [opaque, setOpaque] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setOpaque(false), 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative w-full h-full bg-black">
      <iframe
        ref={iframeRef}
        src={src}
        className="w-full h-full"
        allow="autoplay; encrypted-media"
        allowFullScreen
        title={title}
      />
      {overlayActive && (
        <div
          className={`absolute inset-0 cursor-pointer transition-colors duration-700 ${opaque ? 'bg-black' : 'bg-transparent'}`}
          onClick={() => setOverlayActive(false)}
        />
      )}
    </div>
  );
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
    draft:      { label: 'Rascunho',     cls: 'bg-surface-subtle text-content-secondary border border-line' },
    published:  { label: 'Disponível',   cls: 'bg-semantic-info-bg text-semantic-info-text border border-semantic-info-border' },
    in_progress:{ label: 'Em andamento', cls: 'bg-semantic-warning-bg text-semantic-warning-text border border-semantic-warning-border animate-pulse' },
    completed:  { label: 'Concluído',    cls: 'bg-semantic-success-bg text-semantic-success-text border border-semantic-success-border' },
  };
  const { label, cls } = map[status] ?? map.draft;
  return <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cls}`}>{label}</span>;
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function TreinoSkeleton() {
  return (
    <div className="max-w-3xl mx-auto p-4 pb-32 animate-pulse space-y-6">
      <div className="h-5 bg-surface-subtle rounded w-16"></div>
      <div className="pb-4 border-b border-line space-y-3">
        <div className="h-8 bg-surface-subtle rounded-lg w-2/3"></div>
        <div className="h-4 bg-surface-subtle rounded w-40"></div>
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-surface-elevated border border-line rounded-2xl overflow-hidden">
          <div className="bg-surface-subtle p-4">
            <div className="h-5 bg-surface-subtle rounded w-48"></div>
          </div>
          <div className="p-4 space-y-3">
            <div className="h-10 bg-surface-subtle rounded-lg"></div>
            <div className="h-10 bg-surface-subtle rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  );
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

  const [sectionLogs, setSectionLogs] = useState<Record<string, SectionLog>>({});
  const [observations, setObservations] = useState<Record<string, string>>({});
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const [feedbackWeekId, setFeedbackWeekId] = useState<string | null>(null);
  const [expandedExerciseIds, setExpandedExerciseIds] = useState<Set<string>>(new Set());
  const iframeRefs = useRef<Record<string, HTMLIFrameElement | null>>({});

  const toggleExercise = (id: string) => {
    setExpandedExerciseIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        iframeRefs.current[id]?.contentWindow?.postMessage(
          '{"event":"command","func":"pauseVideo","args":""}', '*'
        );
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExerciseDone = (ex: Exercise) => {
    const allDone = ex.sections.every((s) => sectionLogs[s.id]?.feito);
    const newValue = !allDone;
    ex.sections.forEach((sec) => handleSectionChange(sec.id, 'feito', newValue));
  };

  const timerDisplay = useTimer(treino?.started_at, id);

  const isActive = treino?.status === 'in_progress';
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

  // ── Actions ────────────────────────────────────────────────────────────────

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

  // Garante que todas as observações do aluno (campo textarea com debounce de
  // 1.5s) sejam persistidas ANTES de transicionar o status do treino. Sem isso,
  // clicar "Finalizar" ou "Cancelar" antes do debounce disparar fazia o aluno
  // perder o que tinha digitado.
  const flushPendingObservations = async () => {
    const pendingExIds = Object.keys(saveTimers.current)
      .filter((key) => key.startsWith('obs_'))
      .map((key) => key.replace('obs_', ''));

    if (pendingExIds.length === 0) return;

    pendingExIds.forEach((exId) => {
      clearTimeout(saveTimers.current[`obs_${exId}`]);
      delete saveTimers.current[`obs_${exId}`];
    });

    await Promise.all(
      pendingExIds.map((exId) =>
        treinoService.logExercicio(exId, observations[exId] ?? '').catch(() => {
          /* silencioso — não bloqueia a transição se o save falhar */
        })
      )
    );
  };

  const handleFinish = async () => {
    if (!treino) return;
    setFinishing(true);
    setError('');
    try {
      await flushPendingObservations();
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

  const executePause = async (force: boolean) => {
    if (!treino) return;
    setPausing(true);
    setError('');
    setShowPauseConfirm(false);
    try {
      await flushPendingObservations();
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
    const hasLocalData = Object.values(sectionLogs).some(
      (log) => log.feito || log.actual_load !== '' || log.actual_rpe !== '',
    );
    if (hasLocalData) {
      setShowPauseConfirm(true);
    } else {
      await executePause(false);
    }
  };

  // ── Section log ────────────────────────────────────────────────────────────

  const persistSectionLog = useCallback(
    async (sectionId: string, patch: Partial<SectionLog>) => {
      const current = sectionLogs[sectionId];
      if (!current) return;
      const merged = { ...current, ...patch };
      const payload = {
        feito: merged.feito,
        actual_load: merged.actual_load !== '' ? parseFloat(merged.actual_load) : null,
        actual_rpe: merged.actual_rpe !== '' ? parseFloat(merged.actual_rpe) : null,
      };
      try {
        await treinoService.logSection(sectionId, payload);
      } catch {
        // Silent
      }
    },
    [sectionLogs],
  );

  const handleSectionChange = (sectionId: string, field: keyof SectionLog, value: string | boolean) => {
    setSectionLogs((prev) => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], [field]: value },
    }));

    if (field === 'feito') {
      persistSectionLog(sectionId, { [field]: value as boolean });
    } else {
      if (saveTimers.current[sectionId]) clearTimeout(saveTimers.current[sectionId]);
      saveTimers.current[sectionId] = setTimeout(() => {
        persistSectionLog(sectionId, { [field]: value as string });
      }, 1500);
    }
  };

  const handleObservationChange = (exercicioId: string, value: string) => {
    setObservations((prev) => ({ ...prev, [exercicioId]: value }));
    const key = `obs_${exercicioId}`;
    if (saveTimers.current[key]) clearTimeout(saveTimers.current[key]);
    saveTimers.current[key] = setTimeout(async () => {
      try { await treinoService.logExercicio(exercicioId, value); } catch { /* Silent */ }
    }, 1500);
  };

  const computePR = (sec: Section, log: SectionLog) => {
    const load = log.actual_load !== '' ? parseFloat(log.actual_load) : sec.carga;
    const rpe = log.actual_rpe !== '' ? parseFloat(log.actual_rpe) : null;
    const reps = sec.reps;
    if (!load || !rpe || !reps || sec.load_unit === 'rir') return null;
    const pr = calculatePR({ carga: load, reps, rpe });
    return pr != null ? parseFloat(pr.toFixed(2)) : null;
  };

  // ── Input class ────────────────────────────────────────────────────────────

  const sectionInputClass = "border border-line-input bg-surface-app text-content-primary rounded-lg p-1.5 w-full text-center text-sm focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none transition-all";

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) return <TreinoSkeleton />;

  if (error && !treino) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <div className="flex items-start gap-3 bg-semantic-error-bg border border-semantic-error-border rounded-xl px-5 py-4">
          <AlertCircle size={18} className="text-semantic-error-text flex-shrink-0 mt-0.5" />
          <p className="text-sm text-semantic-error-text">{error}</p>
        </div>
      </div>
    );
  }

  if (!treino) return null;

  return (
    <div className="max-w-3xl mx-auto p-4 pb-32 text-content-primary">

      {/* Header */}
      <div className="mb-6 pb-4 border-b border-line">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-content-tertiary hover:text-content-primary mb-4 transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-2xl font-bold text-content-primary">{treino.name}</h1>
              <StatusBadge status={treino.status} />
            </div>
            <div className="flex items-center gap-2 text-content-tertiary text-sm">
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

          {isActive && (
            <div className="flex items-center gap-2 bg-semantic-warning-bg border border-semantic-warning-border text-semantic-warning-text px-4 py-2 rounded-xl font-mono text-lg font-bold flex-shrink-0">
              <Timer size={18} className="animate-pulse" />
              {timerDisplay}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 bg-semantic-error-bg border border-semantic-error-border rounded-lg px-3 py-2">
            <AlertCircle size={16} className="text-semantic-error-text flex-shrink-0 mt-0.5" />
            <p className="text-sm text-semantic-error-text">{error}</p>
          </div>
        )}
      </div>

      {/* Preview CTA */}
      {isPreview && (
        <div className="mb-6 bg-semantic-info-bg border border-semantic-info-border rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-semantic-info-text">Treino disponível</p>
            <p className="text-sm text-semantic-info-text/80 mt-0.5">Revise as prescrições abaixo e inicie quando estiver pronto.</p>
          </div>
          <button
            onClick={handleStart}
            disabled={starting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-content-on-brand font-bold px-6 py-3 rounded-lg shadow-sm transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            <Play size={18} />
            {starting ? 'Iniciando...' : 'Iniciar Treino'}
          </button>
        </div>
      )}

      {/* Completed summary */}
      {isCompleted && treino.finished_at && treino.started_at && (
        <div className="mb-6 bg-semantic-success-bg border border-semantic-success-border rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 size={24} className="text-semantic-success-text flex-shrink-0" />
          <div>
            <p className="font-bold text-semantic-success-text">Treino concluído!</p>
            <p className="text-sm text-semantic-success-text/80">
              Duração:{' '}
              {(() => {
                const secs = Math.floor(
                  (new Date(treino.finished_at!).getTime() - new Date(treino.started_at!).getTime()) / 1000,
                );
                const hh = Math.floor(secs / 3600);
                const mm = Math.floor((secs % 3600) / 60);
                const ss = secs % 60;
                return hh > 0 ? `${hh}h ${mm}min ${ss}s` : mm > 0 ? `${mm}min ${ss}s` : `${ss}s`;
              })()}
            </p>
          </div>
        </div>
      )}

      {/* Exercise list */}
      <div className="space-y-5">
        {treino.exercicios.map((ex, exIndex) => {
          const isExExpanded = expandedExerciseIds.has(ex.id);
          const totalSections = ex.sections.length;
          const isExDone = totalSections > 0 && ex.sections.every((s) => sectionLogs[s.id]?.feito);

          return (
            <div key={ex.id} className="bg-surface-elevated border border-line rounded-2xl shadow-sm overflow-hidden">

              {/* Exercise header */}
              <div className="flex items-center bg-surface-subtle">
                {/* Done button — works open or closed */}
                {(isEditable || isCompleted) && (
                  <button
                    onClick={() => handleExerciseDone(ex)}
                    disabled={!isEditable}
                    aria-label={isExDone ? 'Desmarcar exercício' : 'Marcar exercício como feito'}
                    className={`ml-3 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all border-2 ${
                      isExDone
                        ? 'bg-red-950/60 border-red-900/70'
                        : 'border-line-input bg-transparent hover:border-brand disabled:opacity-40'
                    }`}
                  >
                    {isExDone && <Check size={10} strokeWidth={3} className="text-red-600" />}
                  </button>
                )}
                {/* Expand/collapse button */}
                <button
                  onClick={() => toggleExercise(ex.id)}
                  className="flex-1 flex items-center justify-between p-4 text-left hover:bg-surface-subtle/80 transition-colors"
                >
                  <h2 className={`text-base font-bold truncate transition-colors ${isExDone ? 'text-red-900/60' : 'text-brand'}`}>
                    {exIndex + 1}. {ex.name}
                  </h2>
                  <ChevronDown
                    size={18}
                    className={`text-content-muted flex-shrink-0 ml-2 transition-transform duration-200 ${isExExpanded ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>

              {/* Expanded content */}
              {isExExpanded && (
                <>
                  {/* 1. Vídeo do coach */}
                  {ex.video_link && (() => {
                    const embedUrl = toEmbedUrl(ex.video_link);
                    return embedUrl ? (
                      <div className="border-t border-line aspect-video w-full">
                        <VideoPlayer
                          src={embedUrl}
                          iframeRef={(el) => { iframeRefs.current[ex.id] = el; }}
                          title={`Vídeo — ${ex.name}`}
                        />
                      </div>
                    ) : null;
                  })()}

                  {/* 2. Observação do coach */}
                  {ex.coach_comment && (
                    <div className="px-4 pt-3 pb-3 border-t border-line flex gap-2.5 items-start bg-surface-subtle/40">
                      <MessageSquare size={14} className="mt-0.5 text-content-muted flex-shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-content-muted uppercase mb-1">Observação do coach</p>
                        <p className="text-sm text-content-secondary leading-relaxed">{ex.coach_comment}</p>
                      </div>
                    </div>
                  )}

                  {/* Column headers — desktop only (prescrição apenas) */}
                  <div className="hidden md:flex items-center gap-3 text-[10px] font-bold text-content-muted uppercase tracking-wide px-4 py-2 border-t border-line">
                    <div className="flex-1 grid grid-cols-5 gap-2 text-center">
                      <span>Carga</span>
                      <span>Séries</span>
                      <span>Reps</span>
                      <span>Equip</span>
                      <span>RPE{isActive ? ' prev.' : ''}</span>
                    </div>
                  </div>

                  {/* 3+4. Sections (prescrição + card "Executado" embaixo) */}
                  <div className="divide-y divide-line">
                    {ex.sections.map((sec) => {
                      const log = sectionLogs[sec.id] ?? { actual_load: '', actual_rpe: '', feito: false };
                      const estimatedPR = computePR(sec, log);
                      const showExecutedCard = isEditable || isCompleted;

                      return (
                        <div
                          key={sec.id}
                          className={`p-4 transition-colors ${
                            log.feito ? 'bg-semantic-success-bg/40' : isEditable ? 'hover:bg-surface-subtle' : ''
                          }`}
                        >
                          <div className="min-w-0 space-y-3">
                            {/* Mobile: prescrição em 4 cols + equip */}
                            <div className="md:hidden space-y-2">
                              <div className="grid grid-cols-4 gap-2 text-center">
                                <div>
                                  <p className="text-[10px] font-bold text-content-muted uppercase mb-1">Carga</p>
                                  <p className="font-bold text-content-primary text-sm">
                                    {sec.carga ?? '—'}
                                    <span className="text-[10px] font-medium text-content-muted ml-0.5">{sec.load_unit || 'kg'}</span>
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-content-muted uppercase mb-1">Séries</p>
                                  <p className="font-bold text-content-primary text-sm">{sec.series ?? '—'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-content-muted uppercase mb-1">Reps</p>
                                  <p className="font-bold text-content-primary text-sm">{sec.reps ?? '—'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-content-muted uppercase mb-1">RPE</p>
                                  <p className="font-bold text-content-primary text-sm">{sec.rpe ?? '—'}</p>
                                </div>
                              </div>

                              {sec.equip && (
                                <p className="text-xs text-content-muted flex items-center gap-1">
                                  <Info size={10} /> {sec.equip}
                                </p>
                              )}
                            </div>

                            {/* Desktop: prescrição em 5 cols, alinhada com header */}
                            <div className="hidden md:grid grid-cols-5 items-center gap-2 text-center">
                              <div>
                                <span className="font-bold text-content-primary">{sec.carga ?? '—'}</span>
                                <span className="text-xs text-content-muted ml-1">{sec.load_unit || 'kg'}</span>
                              </div>
                              <span className="text-sm text-content-primary">{sec.series ?? '—'}</span>
                              <span className="text-sm text-content-primary">{sec.reps ?? '—'}</span>
                              <span className="text-xs text-content-tertiary">{sec.equip || '—'}</span>
                              <span className="text-sm text-content-primary">{sec.rpe ?? '—'}</span>
                            </div>

                            {/* Card "Executado" — responsivo, único para mobile e desktop */}
                            {showExecutedCard && (
                              <div className="border-t border-line/50 pt-3">
                                <p className="text-[10px] font-bold text-content-muted uppercase mb-2">Executado</p>
                                <div className="grid grid-cols-3 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-content-muted uppercase block">Carga Real</label>
                                    {isEditable ? (
                                      <input
                                        type="number" step="0.5"
                                        placeholder={sec.carga != null ? String(sec.carga) : '—'}
                                        value={log.actual_load}
                                        onChange={(e) => handleSectionChange(sec.id, 'actual_load', e.target.value)}
                                        className={sectionInputClass}
                                      />
                                    ) : (
                                      <p className="text-center font-bold text-content-primary text-sm pt-1">
                                        {log.actual_load || '—'}
                                        {log.actual_load && <span className="text-[10px] font-medium text-content-muted ml-0.5">{sec.load_unit || 'kg'}</span>}
                                      </p>
                                    )}
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-content-muted uppercase block">RPE Real</label>
                                    {isEditable ? (
                                      <input
                                        type="number" step="0.5" min="5" max="10"
                                        placeholder={sec.rpe != null ? String(sec.rpe) : '—'}
                                        value={log.actual_rpe}
                                        onChange={(e) => handleSectionChange(sec.id, 'actual_rpe', e.target.value)}
                                        className={sectionInputClass}
                                      />
                                    ) : (
                                      <p className="text-center font-bold text-content-primary text-sm pt-1">{log.actual_rpe || '—'}</p>
                                    )}
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-content-muted uppercase block">PR Est.</label>
                                    <p className="text-center font-bold text-brand text-sm pt-1">{estimatedPR ? `${estimatedPR}kg` : '—'}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 4. Suas observações (campo do aluno) */}
                  {(isEditable || isCompleted) && (
                    <div className="px-4 pt-3 pb-4 border-t border-line">
                      <label className="text-[10px] font-bold text-content-muted uppercase block mb-1">
                        Suas observações
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Anotações pessoais, dores, ajustes de técnica..."
                        value={observations[ex.id] ?? ''}
                        onChange={(e) => handleObservationChange(ex.id, e.target.value)}
                        disabled={!isEditable}
                        className="w-full text-sm border border-line-input rounded-lg p-2 resize-none focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none bg-surface-app text-content-primary placeholder:text-content-tertiary disabled:bg-surface-subtle disabled:text-content-tertiary transition-all"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom bar — treino ativo */}
      {isActive && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 bg-surface-elevated border-t border-line shadow-lg z-20">
          <div className="flex gap-3 max-w-md mx-auto">
            <button
              onClick={handlePause}
              disabled={pausing || finishing}
              className="flex items-center justify-center gap-2 border border-line text-content-secondary hover:border-line-input hover:text-content-primary font-bold px-4 py-4 rounded-2xl transition-colors disabled:opacity-50 whitespace-nowrap"
              aria-label="Cancelar treino"
            >
              <X size={18} />
              {pausing ? 'Cancelando...' : 'Cancelar'}
            </button>
            <button
              onClick={handleFinish}
              disabled={finishing || pausing}
              className="flex-1 flex items-center justify-center gap-2 bg-semantic-success-text hover:opacity-90 text-white font-bold py-4 rounded-2xl shadow-lg transition-all disabled:opacity-50 text-base active:scale-[0.98]"
            >
              <CheckCircle2 size={20} />
              {finishing ? 'Finalizando...' : 'Finalizar Treino'}
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmação de pausa */}
      {showPauseConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pause-modal-title"
        >
          <div className="bg-surface-elevated rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-sm w-full">
            <div className="flex items-center justify-between p-5 border-b border-line">
              <h2 id="pause-modal-title" className="text-lg font-bold text-content-primary flex items-center gap-2">
                <AlertCircle size={20} className="text-semantic-warning-text" />
                Cancelar treino?
              </h2>
              <button
                onClick={() => setShowPauseConfirm(false)}
                aria-label="Fechar"
                className="p-2 hover:bg-surface-subtle rounded-full transition-colors"
              >
                <X size={18} className="text-content-tertiary" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-content-secondary">
                Você já registrou dados neste treino. Ao cancelar, eles serão perdidos e o treino voltará para o estado disponível.
              </p>
            </div>
            <div className="p-5 border-t border-line flex gap-3">
              <button
                onClick={() => setShowPauseConfirm(false)}
                className="flex-1 border border-line-input text-content-primary font-bold py-3 rounded-lg hover:bg-surface-subtle transition-colors"
              >
                Continuar treino
              </button>
              <button
                onClick={() => executePause(true)}
                disabled={pausing}
                className="flex-1 bg-brand hover:bg-brand-hover text-content-on-brand font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {pausing ? 'Cancelando...' : 'Sim, cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weekly feedback modal */}
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
