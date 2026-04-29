"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { calculatePR } from "@/lib/calculatePR";
import { fetchWithAuth } from "@/lib/api";
import {
  ArrowLeft, Save, Loader2, Dumbbell, Calendar,
  Trash2, Plus, AlertCircle, X, FileText, Lock, CheckCircle2,
  Bookmark, FolderOpen, Eye, Pencil, MessageSquare, ChevronDown, Check, Search,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Section {
  id: string;
  carga?: number | null;
  load_unit?: 'kg' | 'lb' | 'rir' | '%' | string | null;
  series?: number | null;
  reps?: number | null;
  equip?: string | null;
  rpe?: number | null;
  pr?: number | null;
  feito?: boolean | null;
  actual_load?: number | null;
  actual_rpe?: number | null;
  isNew?: boolean;
  deleted?: boolean;
  [key: string]: any;
}

interface Exercise {
  id: string;
  name: string;
  coach_comment?: string;
  video_link?: string;
  sections: Section[];
  isNew?: boolean;
  deleted?: boolean;
}

interface ExerciseModel {
  id: string;
  name: string;
  exercise_name: string;
  load?: number | null;
  load_unit?: string;
  series?: number | null;
  reps?: string | null;
  rpe?: number | null;
  coach_comment?: string | null;
  video_link?: string | null;
}

type TreinoStatus = 'draft' | 'published' | 'in_progress' | 'completed';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function EditTreinoSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-surface-subtle rounded-lg"></div>
        <div className="h-7 bg-surface-subtle rounded w-40"></div>
      </div>
      <div className="bg-surface-elevated border border-line rounded-xl p-5 h-20"></div>
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-surface-elevated border border-line rounded-xl p-5 space-y-4">
          <div className="h-6 bg-surface-subtle rounded w-36"></div>
          <div className="space-y-2">
            <div className="h-10 bg-surface-subtle rounded"></div>
            <div className="h-10 bg-surface-subtle rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Read-only exercise table (in_progress / completed) ───────────────────────

function ReadOnlyExercise({ exercise, showStudentData }: { exercise: Exercise; showStudentData: boolean }) {
  const visibleSections = exercise.sections.filter(s => !s.deleted);
  return (
    <div className="bg-surface-elevated border border-line rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-line flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-surface-subtle text-brand flex items-center justify-center border border-line flex-shrink-0">
          <Dumbbell size={15} />
        </div>
        <h3 className="font-bold text-content-primary">{exercise.name}</h3>
      </div>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            {showStudentData && (
              <tr>
                <th colSpan={6} className="bg-surface-page border-b border-line px-3 py-1.5">
                  <span className="text-[10px] font-bold text-content-muted uppercase tracking-wide">Prescrito</span>
                </th>
                <th colSpan={3} className="bg-semantic-info-bg border-b border-semantic-info-border border-l-2 border-l-semantic-info-border px-3 py-1.5 text-center">
                  <span className="text-[10px] font-bold text-semantic-info-text uppercase tracking-wide">Realizado pelo Aluno</span>
                </th>
              </tr>
            )}
            <tr className="bg-surface-page border-b border-line text-xs text-content-muted font-bold uppercase">
              {showStudentData ? (
                <>
                  <th className="px-3 py-2 w-[18%]">Carga</th>
                  <th className="px-3 py-2 w-[7%]">Sér.</th>
                  <th className="px-3 py-2 w-[7%]">Reps</th>
                  <th className="px-3 py-2 w-[7%]">RPE</th>
                  <th className="px-3 py-2 w-[18%]">Equipamento</th>
                  <th className="px-3 py-2 w-[8%]">1RM Est.</th>
                  <th className="px-3 py-2 w-[14%] text-semantic-info-text border-l-2 border-semantic-info-border">Carga Real</th>
                  <th className="px-3 py-2 w-[10%] text-semantic-info-text">RPE Real</th>
                  <th className="px-3 py-2 w-[11%] text-semantic-info-text text-center">Feito</th>
                </>
              ) : (
                <>
                  <th className="px-3 py-2 w-[25%]">Carga</th>
                  <th className="px-3 py-2 w-[10%]">Sér.</th>
                  <th className="px-3 py-2 w-[10%]">Reps</th>
                  <th className="px-3 py-2 w-[10%]">RPE</th>
                  <th className="px-3 py-2 w-[30%]">Equipamento</th>
                  <th className="px-3 py-2 w-[15%]">1RM Est.</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visibleSections.map(sec => (
              <tr key={sec.id} className="hover:bg-surface-subtle/50">
                <td className="px-3 py-3 font-bold text-content-primary text-sm">
                  {sec.carga != null ? `${sec.carga} ${sec.load_unit || 'kg'}` : '—'}
                </td>
                <td className="px-3 py-3 text-sm text-content-secondary">{sec.series ?? '—'}</td>
                <td className="px-3 py-3 text-sm text-content-secondary">{sec.reps ?? '—'}</td>
                <td className="px-3 py-3 text-sm text-content-secondary">{sec.rpe ?? '—'}</td>
                <td className="px-3 py-3 text-sm text-content-secondary">{sec.equip || '—'}</td>
                <td className="px-3 py-3 text-xs font-bold text-content-muted">{sec.pr || '—'}</td>
                {showStudentData && (
                  <>
                    <td className="px-3 py-3 font-bold text-semantic-info-text text-sm border-l-2 border-semantic-info-border/30">
                      {sec.actual_load != null ? `${sec.actual_load} ${sec.load_unit || 'kg'}` : <span className="text-content-muted font-medium">—</span>}
                    </td>
                    <td className="px-3 py-3 font-bold text-semantic-info-text text-sm">
                      {sec.actual_rpe != null ? sec.actual_rpe : <span className="text-content-muted font-medium">—</span>}
                    </td>
                    <td className="px-3 py-3 text-center text-base">
                      {sec.feito ? '✅' : <span className="text-content-muted">⬜</span>}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="md:hidden divide-y divide-line">
        {visibleSections.map((sec) => (
          <div key={sec.id} className="px-4 py-3 space-y-2">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-[10px] font-bold text-content-muted uppercase mb-0.5">Carga</p>
                <p className="font-bold text-content-primary">{sec.carga != null ? `${sec.carga} ${sec.load_unit || 'kg'}` : '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-content-muted uppercase mb-0.5">Sér. × Reps</p>
                <p className="font-bold text-content-primary">{sec.series ?? '—'} × {sec.reps ?? '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-content-muted uppercase mb-0.5">RPE</p>
                <p className="font-bold text-content-primary">{sec.rpe ?? '—'}</p>
              </div>
            </div>
            {showStudentData && (
              <div className="mt-2 pt-2 border-t border-semantic-info-border/40 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-[10px] font-bold text-semantic-info-text uppercase mb-0.5">Carga Real</p>
                  <p className="font-bold text-semantic-info-text">
                    {sec.actual_load != null ? `${sec.actual_load} ${sec.load_unit || 'kg'}` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-semantic-info-text uppercase mb-0.5">RPE Real</p>
                  <p className="font-bold text-semantic-info-text">{sec.actual_rpe ?? '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-semantic-info-text uppercase mb-0.5">Feito</p>
                  <p className="text-base">{sec.feito ? '✅' : '⬜'}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Preview Exercise (como o aluno vê) ───────────────────────────────────────

function PreviewExercise({ exercise, index }: { exercise: Exercise; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [overlayActive, setOverlayActive] = useState(true);
  const [overlayOpaque, setOverlayOpaque] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const embedUrl = exercise.video_link ? toEmbedUrl(exercise.video_link) : null;
  const visibleSections = exercise.sections.filter(s => !s.deleted);

  useEffect(() => {
    if (!expanded) return;
    const t = setTimeout(() => setOverlayOpaque(false), 1000);
    return () => clearTimeout(t);
  }, [expanded]);

  const handleToggle = () => {
    if (expanded) {
      iframeRef.current?.contentWindow?.postMessage(
        '{"event":"command","func":"pauseVideo","args":""}', '*'
      );
      setOverlayActive(true);
      setOverlayOpaque(true);
    }
    setExpanded(prev => !prev);
  };

  return (
    <div className="bg-surface-elevated border border-line rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center bg-surface-subtle">
        <div className="ml-3 w-6 h-6 rounded-full flex-shrink-0 border-2 border-line-input bg-transparent" />
        <button
          onClick={handleToggle}
          className="flex-1 flex items-center justify-between p-4 text-left hover:bg-surface-subtle/80 transition-colors"
        >
          <h2 className="text-base font-bold text-brand truncate">{index + 1}. {exercise.name}</h2>
          <ChevronDown size={18} className={`text-content-muted ml-2 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {expanded && (
        <>
          {embedUrl && (
            <div className="border-t border-line aspect-video w-full relative">
              <iframe
                ref={iframeRef}
                src={embedUrl}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title={`Vídeo — ${exercise.name}`}
              />
              {overlayActive && (
                <div
                  className={`absolute inset-0 cursor-pointer transition-colors duration-700 ${overlayOpaque ? 'bg-black' : 'bg-transparent'}`}
                  onClick={() => setOverlayActive(false)}
                />
              )}
            </div>
          )}

          {exercise.coach_comment && (
            <div className="px-4 pt-3 pb-3 border-t border-line flex gap-2.5 items-start bg-surface-subtle/40">
              <MessageSquare size={14} className="mt-0.5 text-content-muted flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-content-muted uppercase mb-1">Observação do coach</p>
                <p className="text-sm text-content-secondary leading-relaxed">{exercise.coach_comment}</p>
              </div>
            </div>
          )}

          <div className="hidden md:flex items-center text-[10px] font-bold text-content-muted uppercase tracking-wide px-4 py-2 border-t border-line">
            <div className={`flex-1 grid gap-2 text-center grid-cols-5`}>
              <span>Carga</span><span>Séries</span><span>Reps</span><span>Equip</span><span>RPE</span>
            </div>
          </div>

          <div className="divide-y divide-line">
            {visibleSections.map((sec) => (
              <div key={sec.id} className="p-4">
                <div className="hidden md:grid grid-cols-5 gap-2 text-center items-center">
                  <span className="font-bold text-content-primary text-sm">{sec.carga ?? '—'}<span className="text-xs text-content-muted ml-1">{sec.load_unit || 'kg'}</span></span>
                  <span className="text-sm text-content-primary">{sec.series ?? '—'}</span>
                  <span className="text-sm text-content-primary">{sec.reps ?? '—'}</span>
                  <span className="text-xs text-content-tertiary">{sec.equip || '—'}</span>
                  <span className="text-sm text-content-primary">{sec.rpe ?? '—'}</span>
                </div>
                <div className="md:hidden grid grid-cols-4 gap-2 text-center">
                  <div><p className="text-[10px] font-bold text-content-muted uppercase mb-1">Carga</p><p className="font-bold text-sm">{sec.carga ?? '—'}<span className="text-[10px] text-content-muted ml-0.5">{sec.load_unit || 'kg'}</span></p></div>
                  <div><p className="text-[10px] font-bold text-content-muted uppercase mb-1">Séries</p><p className="font-bold text-sm">{sec.series ?? '—'}</p></div>
                  <div><p className="text-[10px] font-bold text-content-muted uppercase mb-1">Reps</p><p className="font-bold text-sm">{sec.reps ?? '—'}</p></div>
                  <div><p className="text-[10px] font-bold text-content-muted uppercase mb-1">RPE</p><p className="font-bold text-sm">{sec.rpe ?? '—'}</p></div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 pt-3 pb-4 border-t border-line">
            <label className="text-[10px] font-bold text-content-muted uppercase block mb-1">Suas observações</label>
            <div className="w-full text-sm border border-line-input rounded-lg p-2 bg-surface-subtle text-content-tertiary italic min-h-[48px] flex items-center">
              Campo de anotações pessoais do aluno (visível durante o treino)
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Save Model Modal ─────────────────────────────────────────────────────────

function SaveModelModal({ exercise, onClose, onSaved }: {
  exercise: Exercise;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [mode, setMode] = useState<'new' | 'update'>('new');
  const [name, setName] = useState('');
  const [models, setModels] = useState<ExerciseModel[]>([]);
  const [search, setSearch] = useState('');
  const [selectedModel, setSelectedModel] = useState<ExerciseModel | null>(null);
  const [loadingModels, setLoadingModels] = useState(false);
  const [saving, setSaving] = useState(false);
  const firstSection = exercise.sections.filter(s => !s.deleted)[0];

  useEffect(() => {
    if (mode === 'update' && models.length === 0) {
      setLoadingModels(true);
      fetchWithAuth('coach/exercise_models')
        .then((data: ExerciseModel[]) => setModels(data))
        .catch(() => {})
        .finally(() => setLoadingModels(false));
    }
  }, [mode]);

  const filtered = models.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.exercise_name.toLowerCase().includes(search.toLowerCase())
  );

  const buildPayload = (modelName: string) => ({
    exercise_model: {
      name: modelName,
      exercise_name: exercise.name,
      load: firstSection?.carga ?? null,
      load_unit: firstSection?.load_unit || 'kg',
      series: firstSection?.series ?? null,
      reps: firstSection?.reps != null ? String(firstSection.reps) : null,
      rpe: firstSection?.rpe ?? null,
      coach_comment: exercise.coach_comment || null,
      video_link: exercise.video_link || null,
    },
  });

  const handleSave = async () => {
    if (mode === 'new' && !name.trim()) return;
    if (mode === 'update' && !selectedModel) return;
    setSaving(true);
    try {
      if (mode === 'new') {
        await fetchWithAuth('coach/exercise_models', {
          method: 'POST',
          body: JSON.stringify(buildPayload(name.trim())),
        });
      } else {
        await fetchWithAuth(`coach/exercise_models/${selectedModel!.id}`, {
          method: 'PATCH',
          body: JSON.stringify(buildPayload(selectedModel!.name)),
        });
      }
      onSaved();
      onClose();
    } catch {
      alert('Erro ao salvar modelo.');
    } finally {
      setSaving(false);
    }
  };

  const canSave = mode === 'new' ? name.trim().length > 0 : selectedModel !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" role="dialog">
      <div className="bg-surface-elevated rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-sm w-full">
        <div className="flex items-center justify-between p-5 border-b border-line">
          <h2 className="text-base font-bold text-content-primary flex items-center gap-2">
            <Bookmark size={18} className="text-brand" /> Salvar como Modelo
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-surface-subtle rounded-full transition-colors">
            <X size={16} className="text-content-tertiary" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* Toggle mode */}
          <div className="p-1 bg-surface-subtle rounded-xl flex gap-1 border border-line">
            {([['new', 'Salvar como novo'], ['update', 'Atualizar existente']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setMode(key); setSelectedModel(null); setSearch(''); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  mode === key
                    ? 'bg-surface-elevated text-content-primary shadow-sm'
                    : 'text-content-muted hover:text-content-secondary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === 'new' ? (
            <div>
              <label className="text-[10px] font-bold text-content-muted uppercase block mb-1">Nome do modelo</label>
              <input
                type="text"
                autoFocus
                placeholder="Ex: Agachamento — Base 4×6"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                className="w-full border border-line-input rounded-lg px-3 py-2 text-sm bg-surface-app text-content-primary focus:ring-2 focus:ring-brand-glow outline-none"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-content-muted uppercase block">Escolha o modelo</label>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
                <input
                  type="text"
                  placeholder="Buscar modelo..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full border border-line-input rounded-lg pl-8 pr-3 py-2 text-sm bg-surface-app text-content-primary focus:ring-2 focus:ring-brand-glow outline-none"
                />
              </div>
              <div className="max-h-44 overflow-y-auto space-y-1">
                {loadingModels ? (
                  <p className="text-xs text-content-muted text-center py-4">Carregando...</p>
                ) : filtered.length === 0 ? (
                  <p className="text-xs text-content-muted text-center py-4">Nenhum modelo encontrado.</p>
                ) : filtered.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedModel?.id === m.id
                        ? 'bg-brand/10 border border-brand/30 text-content-primary'
                        : 'hover:bg-surface-subtle text-content-secondary'
                    }`}
                  >
                    <span className="font-medium text-content-primary">{m.name}</span>
                    <span className="text-content-muted text-xs ml-1">— {m.exercise_name}</span>
                  </button>
                ))}
              </div>
              {selectedModel && (
                <p className="text-xs text-content-muted">
                  Os dados de <strong className="text-content-primary">{exercise.name}</strong> vão sobrescrever o modelo <strong className="text-content-primary">{selectedModel.name}</strong>.
                </p>
              )}
            </div>
          )}
        </div>
        <div className="p-5 border-t border-line flex gap-3">
          <button onClick={onClose} className="flex-1 border border-line-input text-content-primary font-bold py-2.5 rounded-lg hover:bg-surface-subtle transition-colors text-sm">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !canSave}
            className="flex-1 bg-brand hover:bg-brand-hover text-content-on-brand font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Bookmark size={15} />}
            {saving ? 'Salvando...' : mode === 'new' ? 'Salvar' : 'Atualizar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Import Model Modal ───────────────────────────────────────────────────────

function ImportModelModal({ onClose, onImport }: {
  onClose: () => void;
  onImport: (model: ExerciseModel) => void;
}) {
  const [models, setModels] = useState<ExerciseModel[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth('coach/exercise_models')
      .then((data: ExerciseModel[]) => setModels(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = models.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.exercise_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" role="dialog">
      <div className="bg-surface-elevated rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-line flex-shrink-0">
          <h2 className="text-base font-bold text-content-primary flex items-center gap-2">
            <FolderOpen size={18} className="text-brand" /> Importar Modelo
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-surface-subtle rounded-full transition-colors">
            <X size={16} className="text-content-tertiary" />
          </button>
        </div>

        <div className="p-4 border-b border-line flex-shrink-0">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
            <input
              type="text"
              placeholder="Buscar por nome ou exercício..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-line-input rounded-lg text-sm bg-surface-app text-content-primary focus:ring-2 focus:ring-brand-glow outline-none"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="p-8 text-center text-content-muted text-sm">Carregando modelos...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-content-muted text-sm">
              {models.length === 0 ? 'Nenhum modelo salvo ainda.' : 'Nenhum resultado encontrado.'}
            </div>
          ) : (
            <div className="divide-y divide-line">
              {filtered.map(model => (
                <button
                  key={model.id}
                  onClick={() => { onImport(model); onClose(); }}
                  className="w-full text-left px-5 py-4 hover:bg-surface-subtle transition-colors"
                >
                  <p className="font-bold text-content-primary text-sm">{model.name}</p>
                  <p className="text-xs text-content-muted mt-0.5">{model.exercise_name}</p>
                  <div className="flex gap-3 mt-1.5 text-xs text-content-tertiary">
                    {model.load != null && <span>{model.load}{model.load_unit || 'kg'}</span>}
                    {model.series != null && <span>{model.series} séries</span>}
                    {model.reps != null && <span>× {model.reps} reps</span>}
                    {model.rpe != null && <span>RPE {model.rpe}</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function EditWorkoutPage() {
  const { id: alunoId, treinoId } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [treinoStatus, setTreinoStatus] = useState<TreinoStatus>('draft');
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [saveModelForExIndex, setSaveModelForExIndex] = useState<number | null>(null);
  const [importModelForExIndex, setImportModelForExIndex] = useState<number | null>(null);
  const [modelSavedToast, setModelSavedToast] = useState(false);

  useEffect(() => {
    async function loadWorkout() {
      try {
        const data = await fetchWithAuth(`treinos/${treinoId}`);
        setTitle(data.name || "");
        setDate(data.day ? data.day.split('T')[0] : "");
        setDescription(data.description || "");
        setTreinoStatus(data.status || 'draft');

        if (data.exercicios && Array.isArray(data.exercicios)) {
          const mappedExercises = data.exercicios.map((ex: any) => ({
            id: ex.id,
            name: ex.name,
            coach_comment: ex.coach_comment || '',
            video_link: ex.video_link || '',
            isNew: false,
            deleted: false,
            sections: ex.sections.map((sec: any) => ({
              id: sec.id,
              carga: sec.carga,
              load_unit: sec.load_unit || 'kg',
              series: sec.series,
              reps: sec.reps,
              equip: sec.equip,
              rpe: sec.rpe,
              pr: sec.pr,
              feito: sec.feito,
              actual_load: sec.actual_load,
              actual_rpe: sec.actual_rpe,
              isNew: false,
              deleted: false,
            })),
          }));
          setExercises(mappedExercises);
        }
      } catch (err) {
        setError("Não foi possível carregar os dados do treino.");
      } finally {
        setLoading(false);
      }
    }
    loadWorkout();
  }, [treinoId]);

  // Status flags
  const isDraft = treinoStatus === 'draft';
  const isPublished = treinoStatus === 'published';
  const isLocked = treinoStatus === 'in_progress' || treinoStatus === 'completed';

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleAddExercise = () =>
    setExercises(prev => [...prev, {
      id: uuid(), name: "", coach_comment: "", video_link: "",
      isNew: true, deleted: false,
      sections: [{ id: uuid(), isNew: true, deleted: false, carga: null, load_unit: 'kg', series: null, reps: null, equip: "", rpe: null, pr: null, feito: false }],
    }]);

  const handleRemoveExercise = (index: number) => {
    if (confirm("Remover este exercício?")) {
      setExercises(prev => {
        const updated = [...prev];
        if (updated[index].isNew) return prev.filter((_, i) => i !== index);
        updated[index].deleted = true;
        return updated;
      });
    }
  };

  const handleAddSection = (exerciseId: string) =>
    setExercises(prev => prev.map(ex => ex.id === exerciseId
      ? { ...ex, sections: [...ex.sections, { id: uuid(), isNew: true, deleted: false, carga: null, load_unit: 'kg', series: null, reps: null, equip: "", rpe: null, pr: null, feito: false }] }
      : ex
    ));

  const handleRemoveSection = (exerciseIndex: number, sectionIndex: number) => {
    setExercises(prev => {
      const updated = [...prev];
      const section = updated[exerciseIndex].sections[sectionIndex];
      if (section.isNew) {
        updated[exerciseIndex].sections = updated[exerciseIndex].sections.filter((_, i) => i !== sectionIndex);
      } else {
        updated[exerciseIndex].sections[sectionIndex].deleted = true;
      }
      return updated;
    });
  };

  const handleExerciseChange = (index: number, value: string) => {
    const newExercises = [...exercises];
    newExercises[index].name = value;
    setExercises(newExercises);
  };

  const handleExerciseFieldChange = (index: number, field: 'coach_comment' | 'video_link', value: string) => {
    setExercises(prev => prev.map((ex, i) => i === index ? { ...ex, [field]: value } : ex));
  };

  const handleSectionChange = (exerciseIndex: number, sectionIndex: number, field: string, value: any) => {
    setExercises(currentExercises => {
      const updated = [...currentExercises];
      const section: Section = { ...updated[exerciseIndex].sections[sectionIndex] };

      if (field === 'feito') {
        section.feito = value;
      } else if (['carga', 'rpe'].includes(field)) {
        const parsed = parseFloat(value);
        section[field as keyof Section] = (value === '' || isNaN(parsed)) ? null : parsed;
      } else if (['series', 'reps'].includes(field)) {
        const parsed = parseInt(value, 10);
        section[field as keyof Section] = (value === '' || isNaN(parsed)) ? null : parsed;
      } else {
        section[field as keyof Section] = value;
      }

      if (section.carga && section.reps && section.rpe && section.load_unit !== 'rir') {
        const pr = calculatePR({ carga: section.carga!, reps: section.reps!, rpe: section.rpe! });
        section.pr = pr !== null ? parseFloat(pr.toFixed(2)) : null;
      } else {
        section.pr = null;
      }

      updated[exerciseIndex].sections[sectionIndex] = section;
      return updated;
    });
  };

  const handleImportModel = (exIndex: number, model: ExerciseModel) => {
    setExercises(prev => prev.map((ex, i) => {
      if (i !== exIndex) return ex;
      return {
        ...ex,
        name: model.exercise_name,
        coach_comment: model.coach_comment || '',
        video_link: model.video_link || '',
        sections: [{
          id: uuid(),
          isNew: true,
          deleted: false,
          carga: model.load ?? null,
          load_unit: model.load_unit || 'kg',
          series: model.series ?? null,
          reps: model.reps != null ? parseInt(model.reps, 10) : null,
          equip: '',
          rpe: model.rpe ?? null,
          pr: null,
          feito: false,
        }],
      };
    }));
  };

  const handleUnpublish = async () => {
    if (!confirm(
      "Despublicar este treino?\n\nOs dados registrados pelo aluno (cargas reais, RPEs e marcações) serão apagados."
    )) return;
    setUnpublishing(true);
    try {
      await fetchWithAuth(`coach/treinos/${treinoId}/publish`, { method: 'POST' });
      window.location.reload();
    } catch (err: any) {
      alert("Erro ao despublicar: " + (err.message || ""));
    } finally {
      setUnpublishing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isPublished) {
      if (!confirm(
        "Este treino está publicado para o aluno.\n\nSalvar irá despublicar o treino e apagar todos os dados registrados pelo aluno (cargas reais, RPEs e marcações).\n\nDeseja continuar?"
      )) return;
    }

    setError("");
    setSaving(true);
    try {
      const payload = {
        treino: {
          name: title,
          day: date,
          exercicios_attributes: exercises.map(ex => ({
            name: ex.name,
            id: ex.isNew ? undefined : ex.id,
            _destroy: ex.deleted ? true : undefined,
            sections_attributes: ex.sections.map(sec => ({
              id: sec.isNew ? undefined : sec.id,
              _destroy: sec.deleted ? true : undefined,
              carga: sec.carga,
              load_unit: sec.load_unit || 'kg',
              series: sec.series,
              reps: sec.reps,
              equip: sec.equip,
              rpe: sec.rpe,
              pr: sec.pr,
              feito: sec.feito,
            })),
          })),
        },
      };
      await fetchWithAuth(`treinos/${treinoId}`, { method: "PUT", body: JSON.stringify(payload) });

      // Persistir coach_comment e video_link para exercícios existentes
      const toUpdate = exercises.filter(ex => !ex.isNew && !ex.deleted);
      await Promise.all(toUpdate.map(ex =>
        fetchWithAuth(`coach/exercicios/${ex.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ exercicio: { coach_comment: ex.coach_comment || null, video_link: ex.video_link || null } }),
        })
      ));

      if (isPublished) {
        await fetchWithAuth(`coach/treinos/${treinoId}/publish`, { method: 'POST' });
      }

      alert("Treino atualizado com sucesso!");
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar o treino.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este treino?")) return;
    try {
      await fetchWithAuth(`treinos/${treinoId}`, { method: 'DELETE' });
      router.back();
    } catch {
      alert("Erro ao excluir.");
    }
  };

  const inputClass =
    "border border-line-input rounded px-2 py-2 w-full text-sm focus:ring-2 focus:ring-brand-glow outline-none bg-surface-app text-content-primary";
  const labelClass = "text-[10px] uppercase font-bold text-content-muted mb-1 block";

  if (loading) return (
    <div className="max-w-5xl mx-auto pb-32 md:pb-8 p-4 md:p-0">
      <EditTreinoSkeleton />
    </div>
  );

  // ─── VIEW: Treino em andamento ou concluído (Read-only) ───────────────────

  if (isLocked) {
    const isCompleted = treinoStatus === 'completed';
    return (
      <div className="max-w-5xl mx-auto pb-24 md:pb-8 text-content-primary">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-surface-subtle rounded-lg text-content-secondary transition-colors">
              <ArrowLeft size={22} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-content-primary">{title || "Treino"}</h1>
              <p className="text-sm text-content-tertiary hidden md:block">
                {date ? new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'long', year: 'numeric' }) : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUnpublish}
              disabled={unpublishing}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-semantic-warning-border bg-semantic-warning-bg text-semantic-warning-text hover:opacity-80 transition-opacity font-bold text-sm disabled:opacity-50"
            >
              {unpublishing ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
              Despublicar
            </button>
            <button
              onClick={handleDelete}
              className="text-semantic-error-text flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-semantic-error-bg transition-colors font-bold text-sm"
            >
              <Trash2 size={15} /> Excluir
            </button>
          </div>
        </div>

        <div className={`flex items-start gap-3 rounded-xl px-4 py-3 mb-6 text-sm font-bold border ${
          isCompleted
            ? 'bg-semantic-success-bg border-semantic-success-border text-semantic-success-text'
            : 'bg-semantic-warning-bg border-semantic-warning-border text-semantic-warning-text'
        }`}>
          <Lock size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <p>{isCompleted ? 'Treino concluído pelo aluno.' : 'Treino em andamento.'}</p>
            <p className="font-medium mt-0.5 text-xs opacity-80">
              Para editar, despublique o treino na lista de treinos da semana. Os dados registrados pelo aluno serão perdidos.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {exercises.filter(ex => !ex.deleted).map(ex => (
            <ReadOnlyExercise key={ex.id} exercise={ex} showStudentData={true} />
          ))}
        </div>
      </div>
    );
  }

  // ─── VIEW: Treino editável (draft ou published) ───────────────────────────

  const visibleExercises = exercises.filter(ex => !ex.deleted);

  return (
    <div className="max-w-5xl mx-auto pb-32 md:pb-8 text-content-primary">

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-surface-subtle rounded-lg text-content-secondary transition-colors">
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-content-primary">Editar Treino</h1>
            <p className="text-sm text-content-tertiary hidden md:block">Gerencie os exercícios e cargas.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Edit / Preview */}
          <div className="p-1 bg-surface-subtle rounded-xl flex gap-1 border border-line">
            {([
              { key: 'edit',    label: 'Editar',   icon: Pencil },
              { key: 'preview', label: 'Preview',  icon: Eye },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                className={`relative px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-1.5 ${
                  viewMode === key
                    ? 'bg-brand text-content-on-brand shadow-sm'
                    : 'text-content-muted hover:text-content-primary'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={handleDelete}
            className="text-semantic-error-text flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-semantic-error-bg transition-colors font-bold text-sm"
          >
            <Trash2 size={15} /> Excluir
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-semantic-error-bg text-semantic-error-text border border-semantic-error-border p-4 rounded-xl mb-6 text-sm flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={16} />
          <span>{error}</span>
        </div>
      )}

      {isPublished && viewMode === 'edit' && (
        <div className="bg-semantic-warning-bg border border-semantic-warning-border rounded-xl px-4 py-3 mb-4 text-sm text-semantic-warning-text flex items-center gap-2">
          <FileText size={15} className="flex-shrink-0" />
          <span>
            <strong>Treino publicado.</strong> Salvar alterações irá despublicar o treino e apagar os dados registrados pelo aluno.
          </span>
        </div>
      )}

      {/* ── PREVIEW MODE ─────────────────────────────────────────────────── */}
      {viewMode === 'preview' && (
        <div className="space-y-5">
          <div className="flex items-center gap-2 bg-surface-subtle border border-line rounded-xl px-4 py-2.5 text-sm text-content-secondary mb-2">
            <Eye size={14} className="flex-shrink-0" />
            Visualização como o aluno verá o treino. Volte para <strong className="text-content-primary">Editar</strong> para fazer alterações.
          </div>
          {visibleExercises.map((ex, i) => (
            <PreviewExercise key={ex.id} exercise={ex} index={i} />
          ))}
        </div>
      )}

      {/* ── EDIT MODE ────────────────────────────────────────────────────── */}
      {viewMode === 'edit' && (
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Info */}
          <div className="bg-surface-elevated p-5 rounded-xl border border-line shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-bold mb-1 text-content-secondary flex items-center gap-2">
                <Dumbbell size={15} /> Nome
              </label>
              <input
                type="text"
                placeholder="Ex: Leg Day"
                className="w-full px-4 py-2.5 border border-line-input rounded-lg focus:ring-2 focus:ring-brand-glow outline-none transition-all bg-surface-app text-content-primary placeholder:text-content-tertiary text-sm"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-bold mb-1 text-content-secondary flex items-center gap-2">
                <Calendar size={15} /> Data
              </label>
              <input
                type="date"
                className="w-full px-4 py-2.5 border border-line-input rounded-lg focus:ring-2 focus:ring-brand-glow outline-none transition-all bg-surface-app text-content-primary text-sm"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Exercícios */}
          <div className="space-y-6 md:pb-0 pb-12">
            {exercises.map((exercise, exIndex) => {
              if (exercise.deleted) return null;
              return (
                <div key={exercise.id} className="bg-surface-elevated p-5 rounded-xl border border-line shadow-sm">

                  {/* Nome + ações */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 mr-2">
                      <label className="block text-xs font-bold text-content-muted uppercase mb-1">Exercício {exIndex + 1}</label>
                      <input
                        type="text"
                        placeholder="Nome do exercício..."
                        className="w-full text-lg font-bold text-content-primary border-b-2 border-transparent hover:border-line focus:border-brand outline-none transition-colors py-1 placeholder:text-content-muted"
                        value={exercise.name}
                        onChange={e => handleExerciseChange(exIndex, e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        title="Importar modelo"
                        onClick={() => setImportModelForExIndex(exIndex)}
                        className="text-content-muted hover:text-brand p-2 hover:bg-surface-subtle rounded-lg transition-colors"
                      >
                        <FolderOpen size={17} />
                      </button>
                      <button
                        type="button"
                        title="Salvar como modelo"
                        onClick={() => setSaveModelForExIndex(exIndex)}
                        className="text-content-muted hover:text-brand p-2 hover:bg-surface-subtle rounded-lg transition-colors"
                      >
                        <Bookmark size={17} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(exIndex)}
                        className="text-content-muted hover:text-semantic-error-text p-2 hover:bg-semantic-error-bg rounded-lg transition-colors"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>

                  {/* Campos adicionais: comentário + link */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className={labelClass}>Observação para o aluno (opcional)</label>
                      <textarea
                        rows={2}
                        placeholder="Ex: Mantenha o tronco neutro. Se doer o joelho, reduza ADM."
                        value={exercise.coach_comment || ''}
                        onChange={e => handleExerciseFieldChange(exIndex, 'coach_comment', e.target.value)}
                        className="w-full text-sm border border-line-input rounded-lg p-2 resize-none bg-surface-app text-content-primary focus:ring-2 focus:ring-brand-glow outline-none placeholder:text-content-tertiary"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Link de vídeo YouTube (opcional)</label>
                      <input
                        type="url"
                        placeholder="https://youtube.com/watch?v=..."
                        value={exercise.video_link || ''}
                        onChange={e => handleExerciseFieldChange(exIndex, 'video_link', e.target.value)}
                        className="w-full text-sm border border-line-input rounded-lg px-3 py-2 bg-surface-app text-content-primary focus:ring-2 focus:ring-brand-glow outline-none placeholder:text-content-tertiary"
                      />
                      {exercise.video_link && !toEmbedUrl(exercise.video_link) && (
                        <p className="text-[10px] text-semantic-error-text mt-1 flex items-center gap-1">
                          <AlertCircle size={10} /> URL inválida — use o formato youtube.com/watch?v=... ou youtu.be/...
                        </p>
                      )}
                      {exercise.video_link && toEmbedUrl(exercise.video_link) && (
                        <p className="text-[10px] text-semantic-success-text mt-1 flex items-center gap-1">
                          <CheckCircle2 size={10} /> Vídeo válido — visível no Preview
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[560px]">
                      <thead>
                        <tr className="text-xs text-content-muted font-bold uppercase border-b border-line">
                          <th className="p-2 w-[20%]">Carga</th>
                          <th className="p-2 w-[9%]">Séries</th>
                          <th className="p-2 w-[9%]">Reps</th>
                          <th className="p-2 w-[9%]">RPE</th>
                          <th className="p-2 w-[22%]">Equipamento</th>
                          <th className="p-2 w-[9%]">1RM Est.</th>
                          <th className="p-2 w-8"></th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {exercise.sections.map((section, secIndex) => {
                          if (section.deleted) return null;
                          return (
                            <tr key={section.id} className="border-b border-line/50 last:border-0 hover:bg-surface-subtle/50">
                              <td className="p-2">
                                <div className="flex gap-1">
                                  <input type="number" step="0.5" placeholder="0" className={inputClass} value={section.carga ?? ""} onChange={e => handleSectionChange(exIndex, secIndex, "carga", e.target.value)} />
                                  <select className="border border-line-input rounded px-1 text-xs bg-surface-app text-content-primary focus:ring-2 focus:ring-brand-glow outline-none" value={section.load_unit || 'kg'} onChange={e => handleSectionChange(exIndex, secIndex, "load_unit", e.target.value)}>
                                    <option value="kg">kg</option>
                                    <option value="lb">lb</option>
                                    <option value="rir">RIR</option>
                                    <option value="%">%</option>
                                  </select>
                                </div>
                              </td>
                              <td className="p-2"><input type="number" placeholder="1" className={inputClass} value={section.series ?? ""} onChange={e => handleSectionChange(exIndex, secIndex, "series", e.target.value)} /></td>
                              <td className="p-2"><input type="number" placeholder="1" className={inputClass} value={section.reps ?? ""} onChange={e => handleSectionChange(exIndex, secIndex, "reps", e.target.value)} /></td>
                              <td className="p-2"><input type="number" step="0.5" placeholder="-" className={inputClass} value={section.rpe ?? ""} onChange={e => handleSectionChange(exIndex, secIndex, "rpe", e.target.value)} /></td>
                              <td className="p-2"><input type="text" placeholder="-" className={inputClass} value={section.equip ?? ""} onChange={e => handleSectionChange(exIndex, secIndex, "equip", e.target.value)} /></td>
                              <td className="p-2 text-center text-xs font-bold text-content-muted">{section.pr || "—"}</td>
                              <td className="p-2 text-center">
                                <button type="button" onClick={() => handleRemoveSection(exIndex, secIndex)} className="text-content-muted hover:text-semantic-error-text transition-colors">
                                  <X size={15} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="md:hidden space-y-3">
                    {exercise.sections.map((section, secIndex) => {
                      if (section.deleted) return null;
                      return (
                        <div key={section.id} className="bg-surface-subtle p-3 rounded-lg border border-line relative">
                          <button type="button" onClick={() => handleRemoveSection(exIndex, secIndex)} className="absolute top-2 right-2 text-content-muted hover:text-semantic-error-text p-1 transition-colors">
                            <X size={15} />
                          </button>
                          <div className="grid grid-cols-2 gap-3 pr-6">
                            <div>
                              <span className={labelClass}>Carga</span>
                              <div className="flex gap-1">
                                <input type="number" step="0.5" placeholder="0" className={inputClass} value={section.carga ?? ""} onChange={e => handleSectionChange(exIndex, secIndex, "carga", e.target.value)} />
                                <select className="border border-line-input rounded px-1 text-xs bg-surface-app h-[38px] text-content-primary" value={section.load_unit || 'kg'} onChange={e => handleSectionChange(exIndex, secIndex, "load_unit", e.target.value)}>
                                  <option value="kg">kg</option>
                                  <option value="lb">lb</option>
                                  <option value="rir">RIR</option>
                                  <option value="%">%</option>
                                </select>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className={labelClass}>Séries</span>
                                <input type="number" placeholder="1" className={inputClass} value={section.series ?? ""} onChange={e => handleSectionChange(exIndex, secIndex, "series", e.target.value)} />
                              </div>
                              <div>
                                <span className={labelClass}>Reps</span>
                                <input type="number" placeholder="1" className={inputClass} value={section.reps ?? ""} onChange={e => handleSectionChange(exIndex, secIndex, "reps", e.target.value)} />
                              </div>
                            </div>
                            <div>
                              <span className={labelClass}>RPE</span>
                              <input type="number" step="0.5" placeholder="-" className={inputClass} value={section.rpe ?? ""} onChange={e => handleSectionChange(exIndex, secIndex, "rpe", e.target.value)} />
                            </div>
                            <div>
                              <span className={labelClass}>Equip</span>
                              <input type="text" placeholder="-" className={inputClass} value={section.equip ?? ""} onChange={e => handleSectionChange(exIndex, secIndex, "equip", e.target.value)} />
                            </div>
                          </div>
                          {section.pr && (
                            <div className="mt-2 text-xs text-center text-content-muted font-bold bg-surface-page rounded py-1">
                              1RM Estimado: {section.pr}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button type="button" onClick={() => handleAddSection(exercise.id)} className="mt-4 text-sm font-bold text-brand hover:text-brand-hover flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-surface-subtle w-full md:w-auto justify-center">
                    <Plus size={15} /> Adicionar Série
                  </button>
                </div>
              );
            })}
          </div>

          {/* Ações */}
          <div className="fixed bottom-10 left-0 right-0 p-4 pb-8 bg-surface-elevated border-t border-line md:static md:bg-transparent md:border-0 md:p-0 flex flex-col md:flex-row gap-3 z-30 shadow-up md:shadow-none">
            <button type="button" onClick={handleAddExercise} className="w-full md:flex-1 py-3 border-2 border-dashed border-line rounded-xl text-content-muted font-bold hover:border-brand/40 hover:text-brand transition-all flex items-center justify-center gap-2">
              <Plus size={18} /> Novo Exercício
            </button>
            <button type="submit" disabled={saving} className="w-full md:flex-1 py-3 bg-brand text-content-on-brand font-bold rounded-xl hover:bg-brand-hover transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? "Salvando..." : isPublished ? "Salvar e Despublicar" : "Salvar Alterações"}
            </button>
          </div>
        </form>
      )}

      {/* Modais */}
      {saveModelForExIndex !== null && (
        <SaveModelModal
          exercise={exercises.filter(ex => !ex.deleted)[saveModelForExIndex]}
          onClose={() => setSaveModelForExIndex(null)}
          onSaved={() => { setModelSavedToast(true); setTimeout(() => setModelSavedToast(false), 3000); }}
        />
      )}

      {importModelForExIndex !== null && (
        <ImportModelModal
          onClose={() => setImportModelForExIndex(null)}
          onImport={(model) => {
            const visIndex = exercises.filter(ex => !ex.deleted).findIndex((_, i) => i === importModelForExIndex);
            const actualIndex = exercises.findIndex(ex => ex === exercises.filter(ex => !ex.deleted)[importModelForExIndex]);
            handleImportModel(actualIndex, model);
          }}
        />
      )}

      {/* Toast: modelo salvo */}
      {modelSavedToast && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-surface-elevated border border-semantic-success-border text-semantic-success-text px-5 py-3 rounded-xl shadow-lg text-sm font-bold flex items-center gap-2">
          <CheckCircle2 size={16} /> Modelo salvo com sucesso!
        </div>
      )}
    </div>
  );
}
