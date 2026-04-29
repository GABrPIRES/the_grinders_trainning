"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import {
  Bookmark, Trash2, Pencil, Search, X, Loader2,
  Check, AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface ExerciseModel {
  id: string;
  name: string;
  exercise_name: string;
  load?: number | null;
  load_unit?: string | null;
  series?: number | null;
  reps?: string | null;
  rpe?: number | null;
  coach_comment?: string | null;
  video_link?: string | null;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-surface-elevated border border-line rounded-xl p-4 h-16" />
      ))}
    </div>
  );
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────

function ConfirmDeleteModal({ model, onClose, onConfirm, deleting }: {
  model: ExerciseModel;
  onClose: () => void;
  onConfirm: () => void;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" role="dialog">
      <div className="bg-surface-elevated rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-sm w-full">
        <div className="flex items-center justify-between p-5 border-b border-line">
          <h2 className="text-base font-bold text-content-primary flex items-center gap-2">
            <AlertCircle size={18} className="text-red-500" /> Excluir modelo
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-surface-subtle rounded-full transition-colors">
            <X size={16} className="text-content-tertiary" />
          </button>
        </div>
        <div className="p-5">
          <p className="text-sm text-content-secondary">
            Tem certeza que deseja excluir o modelo{" "}
            <strong className="text-content-primary">{model.name}</strong>? Esta ação não pode ser desfeita.
          </p>
        </div>
        <div className="p-5 border-t border-line flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-line-input text-content-primary font-bold py-2.5 rounded-lg hover:bg-surface-subtle transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            {deleting ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModelModal({ model, onClose, onSaved }: {
  model: ExerciseModel;
  onClose: () => void;
  onSaved: (updated: ExerciseModel) => void;
}) {
  const [form, setForm] = useState<Partial<ExerciseModel>>({
    name: model.name,
    exercise_name: model.exercise_name,
    load: model.load ?? undefined,
    load_unit: model.load_unit ?? 'kg',
    series: model.series ?? undefined,
    reps: model.reps ?? '',
    rpe: model.rpe ?? undefined,
    coach_comment: model.coach_comment ?? '',
    video_link: model.video_link ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field: keyof ExerciseModel, value: string | number | null) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.name?.trim() || !form.exercise_name?.trim()) {
      setError('Nome e exercício são obrigatórios.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const updated: ExerciseModel = await fetchWithAuth(`coach/exercise_models/${model.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          exercise_model: {
            name: form.name?.trim(),
            exercise_name: form.exercise_name?.trim(),
            load: form.load || null,
            load_unit: form.load_unit || 'kg',
            series: form.series || null,
            reps: form.reps || null,
            rpe: form.rpe || null,
            coach_comment: form.coach_comment || null,
            video_link: form.video_link || null,
          },
        }),
      });
      onSaved(updated);
      onClose();
    } catch {
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" role="dialog">
      <div className="bg-surface-elevated rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-line flex-shrink-0">
          <h2 className="text-base font-bold text-content-primary flex items-center gap-2">
            <Pencil size={18} className="text-brand" /> Editar Modelo
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-surface-subtle rounded-full transition-colors">
            <X size={16} className="text-content-tertiary" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-content-muted uppercase block mb-1">Nome do modelo *</label>
              <input
                type="text"
                value={form.name ?? ''}
                onChange={e => set('name', e.target.value)}
                className="w-full border border-line-input rounded-lg px-3 py-2 text-sm bg-surface-app text-content-primary focus:ring-2 focus:ring-brand-glow outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-content-muted uppercase block mb-1">Exercício *</label>
              <input
                type="text"
                value={form.exercise_name ?? ''}
                onChange={e => set('exercise_name', e.target.value)}
                className="w-full border border-line-input rounded-lg px-3 py-2 text-sm bg-surface-app text-content-primary focus:ring-2 focus:ring-brand-glow outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-content-muted uppercase block mb-1">Carga</label>
              <input
                type="number"
                value={form.load ?? ''}
                onChange={e => set('load', e.target.value ? Number(e.target.value) : null)}
                className="w-full border border-line-input rounded-lg px-3 py-2 text-sm bg-surface-app text-content-primary focus:ring-2 focus:ring-brand-glow outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-content-muted uppercase block mb-1">Unidade</label>
              <select
                value={form.load_unit ?? 'kg'}
                onChange={e => set('load_unit', e.target.value)}
                className="w-full border border-line-input rounded-lg px-3 py-2 text-sm bg-surface-app text-content-primary focus:ring-2 focus:ring-brand-glow outline-none"
              >
                {['kg', 'lb', '%', 'rir'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-content-muted uppercase block mb-1">Séries</label>
              <input
                type="number"
                value={form.series ?? ''}
                onChange={e => set('series', e.target.value ? Number(e.target.value) : null)}
                className="w-full border border-line-input rounded-lg px-3 py-2 text-sm bg-surface-app text-content-primary focus:ring-2 focus:ring-brand-glow outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-content-muted uppercase block mb-1">Reps</label>
              <input
                type="text"
                value={form.reps ?? ''}
                onChange={e => set('reps', e.target.value)}
                className="w-full border border-line-input rounded-lg px-3 py-2 text-sm bg-surface-app text-content-primary focus:ring-2 focus:ring-brand-glow outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-content-muted uppercase block mb-1">RPE</label>
              <input
                type="number"
                step="0.5"
                value={form.rpe ?? ''}
                onChange={e => set('rpe', e.target.value ? Number(e.target.value) : null)}
                className="w-full border border-line-input rounded-lg px-3 py-2 text-sm bg-surface-app text-content-primary focus:ring-2 focus:ring-brand-glow outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-content-muted uppercase block mb-1">Link do vídeo</label>
              <input
                type="url"
                value={form.video_link ?? ''}
                onChange={e => set('video_link', e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full border border-line-input rounded-lg px-3 py-2 text-sm bg-surface-app text-content-primary focus:ring-2 focus:ring-brand-glow outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-content-muted uppercase block mb-1">Comentário do coach</label>
              <textarea
                rows={3}
                value={form.coach_comment ?? ''}
                onChange={e => set('coach_comment', e.target.value)}
                className="w-full border border-line-input rounded-lg px-3 py-2 text-sm bg-surface-app text-content-primary focus:ring-2 focus:ring-brand-glow outline-none resize-none"
              />
            </div>
          </div>
          {error && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle size={13} /> {error}
            </p>
          )}
        </div>

        <div className="p-5 border-t border-line flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 border border-line-input text-content-primary font-bold py-2.5 rounded-lg hover:bg-surface-subtle transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-brand hover:bg-brand-hover text-content-on-brand font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExerciseModelsPage() {
  const { showToast, ToastEl } = useToast();
  const [models, setModels] = useState<ExerciseModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingModel, setEditingModel] = useState<ExerciseModel | null>(null);
  const [deletingModel, setDeletingModel] = useState<ExerciseModel | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchWithAuth('coach/exercise_models')
      .then((data: ExerciseModel[]) => setModels(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deletingModel) return;
    setDeleting(true);
    try {
      await fetchWithAuth(`coach/exercise_models/${deletingModel.id}`, { method: 'DELETE' });
      setModels(prev => prev.filter(m => m.id !== deletingModel.id));
      setDeletingModel(null);
      showToast('Modelo excluído.');
    } catch {
      showToast('Erro ao excluir modelo.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleSaved = (updated: ExerciseModel) => {
    setModels(prev => prev.map(m => m.id === updated.id ? updated : m));
    showToast('Modelo atualizado com sucesso!');
  };

  const filtered = models.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.exercise_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Bookmark size={22} className="text-brand" />
        <div>
          <h1 className="text-xl font-bold text-content-primary">Modelos de Exercício</h1>
          <p className="text-sm text-content-secondary mt-0.5">Gerencie seus modelos salvos para usar em treinos.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
        <input
          type="text"
          placeholder="Buscar por nome ou exercício..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-line-input rounded-xl pl-9 pr-4 py-2.5 text-sm bg-surface-app text-content-primary focus:ring-2 focus:ring-brand-glow outline-none"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X size={14} className="text-content-muted hover:text-content-primary transition-colors" />
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <Skeleton />
      ) : filtered.length === 0 ? (
        <div className="bg-surface-elevated border border-line rounded-xl p-10 text-center text-content-muted">
          <Bookmark size={28} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            {models.length === 0
              ? 'Nenhum modelo salvo ainda. Salve modelos ao editar um treino.'
              : 'Nenhum modelo encontrado para essa busca.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(model => (
            <div
              key={model.id}
              className="bg-surface-elevated border border-line rounded-xl px-4 py-3 flex items-center gap-3"
            >
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-content-primary truncate">{model.name}</p>
                <p className="text-xs text-content-secondary truncate">{model.exercise_name}</p>
              </div>

              {/* Badges */}
              <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                {model.series && model.reps && (
                  <span className="text-[11px] bg-surface-subtle border border-line px-2 py-0.5 rounded-full text-content-secondary">
                    {model.series}×{model.reps}
                  </span>
                )}
                {model.load && (
                  <span className="text-[11px] bg-surface-subtle border border-line px-2 py-0.5 rounded-full text-content-secondary">
                    {model.load} {model.load_unit || 'kg'}
                  </span>
                )}
                {model.rpe && (
                  <span className="text-[11px] bg-surface-subtle border border-line px-2 py-0.5 rounded-full text-content-secondary">
                    RPE {model.rpe}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setEditingModel(model)}
                  className="p-2 rounded-lg hover:bg-surface-subtle transition-colors text-content-tertiary hover:text-content-primary"
                  title="Editar"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setDeletingModel(model)}
                  className="p-2 rounded-lg hover:bg-red-950/30 transition-colors text-content-tertiary hover:text-red-500"
                  title="Excluir"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Count */}
      {!loading && filtered.length > 0 && (
        <p className="text-xs text-content-muted mt-4 text-center">
          {filtered.length} {filtered.length === 1 ? 'modelo' : 'modelos'}
          {search ? ` encontrado${filtered.length !== 1 ? 's' : ''}` : ' no total'}
        </p>
      )}

      {/* Modals */}
      {editingModel && (
        <EditModelModal
          model={editingModel}
          onClose={() => setEditingModel(null)}
          onSaved={handleSaved}
        />
      )}
      {deletingModel && (
        <ConfirmDeleteModal
          model={deletingModel}
          onClose={() => setDeletingModel(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}

      {ToastEl}
    </div>
  );
}
