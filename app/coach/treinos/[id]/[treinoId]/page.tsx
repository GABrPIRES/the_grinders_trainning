"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { calculatePR } from "@/lib/calculatePR";
import { fetchWithAuth } from "@/lib/api";
import {
  ArrowLeft, Save, Loader2, Dumbbell, Calendar,
  Trash2, Plus, AlertCircle, X, FileText,
} from "lucide-react";

// --- Interfaces ---
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
  sections: Section[];
  isNew?: boolean;
  deleted?: boolean;
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
  const [exercises, setExercises] = useState<Exercise[]>([]);

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
        console.error("Erro ao carregar treino:", err);
        setError("Não foi possível carregar os dados do treino.");
      } finally {
        setLoading(false);
      }
    }
    loadWorkout();
  }, [treinoId]);

  // --- Manipulação ---

  const handleAddExercise = () =>
    setExercises(prev => [...prev, { id: uuid(), name: "", isNew: true, deleted: false, sections: [{ id: uuid(), isNew: true, deleted: false, carga: null, load_unit: 'kg', series: null, reps: null, equip: "", rpe: null, pr: null, feito: false }] }]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      alert("Treino atualizado com sucesso!");
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar o treino.");
      console.error("Erro na requisição:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este treino?")) return;
    try {
      await fetchWithAuth(`treinos/${treinoId}`, { method: 'DELETE' });
      router.back();
    } catch (err: any) {
      alert("Erro ao excluir.");
    }
  };

  const inputClass =
    "border border-line-input rounded px-2 py-2 w-full text-sm focus:ring-2 focus:ring-brand-glow outline-none bg-surface-app text-content-primary";
  const labelClass = "text-[10px] uppercase font-bold text-content-muted mb-1 block";

  const isActive = treinoStatus === 'in_progress' || treinoStatus === 'completed';

  if (loading) return (
    <div className="max-w-5xl mx-auto pb-32 md:pb-8 p-4 md:p-0">
      <EditTreinoSkeleton />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-32 md:pb-8 text-content-primary">

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-surface-subtle rounded-lg text-content-secondary transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-content-primary">Editar Treino</h1>
            <p className="text-sm text-content-tertiary hidden md:block">Gerencie os exercícios e cargas.</p>
          </div>
        </div>

        <button
          onClick={handleDelete}
          className="text-semantic-error-text hover:text-semantic-error-text flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-semantic-error-bg transition-colors font-bold text-sm"
        >
          <Trash2 size={15} /> Excluir Treino
        </button>
      </div>

      {error && (
        <div className="bg-semantic-error-bg text-semantic-error-text border border-semantic-error-border p-4 rounded-xl mb-6 text-sm flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={16} />
          <span>{error}</span>
        </div>
      )}

      {isActive && (
        <div className="bg-semantic-info-bg border border-semantic-info-border rounded-xl px-4 py-3 mb-4 text-sm text-semantic-info-text flex items-center gap-2">
          <FileText size={15} className="flex-shrink-0" />
          <span>
            {treinoStatus === 'completed' ? 'Treino concluído pelo aluno.' : 'Treino em andamento.'}
            {' '}As colunas <strong>Carga Real</strong> e <strong>RPE Real</strong> mostram o que o atleta registrou.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Info do treino */}
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

        {/* Lista de exercícios */}
        <div className="space-y-6 md:pb-0 pb-12">
          {exercises.map((exercise, exIndex) => {
            if (exercise.deleted) return null;
            return (
              <div key={exercise.id} className="bg-surface-elevated p-5 rounded-xl border border-line shadow-sm relative group">

                {/* Nome do exercício */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 mr-4">
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
                  <button
                    type="button"
                    onClick={() => handleRemoveExercise(exIndex)}
                    className="text-content-muted hover:text-semantic-error-text p-2 hover:bg-semantic-error-bg rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Desktop (tabela) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      {isActive && (
                        <tr>
                          <th colSpan={6} />
                          <th
                            colSpan={3}
                            className="text-center text-[9px] font-bold text-semantic-info-text uppercase tracking-wider bg-semantic-info-bg border-l-2 border-semantic-info-border px-2 py-1"
                          >
                            Dados do Aluno
                          </th>
                          <th />
                        </tr>
                      )}
                      <tr className="text-xs text-content-muted font-bold uppercase border-b border-line">
                        <th className="p-2 w-[18%]">Carga</th>
                        <th className="p-2 w-[9%]">Séries</th>
                        <th className="p-2 w-[9%]">Reps</th>
                        <th className="p-2 w-[9%]">RPE</th>
                        <th className="p-2 w-[18%]">Equipamento</th>
                        <th className="p-2 w-[9%]">PR</th>
                        {isActive && (
                          <>
                            <th className="p-2 w-[10%] text-semantic-info-text border-l-2 border-semantic-info-border">Carga Real</th>
                            <th className="p-2 w-[9%] text-semantic-info-text">RPE Real</th>
                            <th className="p-2 w-[7%] text-semantic-info-text">Feito</th>
                          </>
                        )}
                        <th className="p-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {exercise.sections.map((section, secIndex) => {
                        if (section.deleted) return null;
                        return (
                          <tr key={section.id} className="border-b border-line/50 last:border-0 hover:bg-surface-subtle/50">
                            <td className="p-2">
                              <div className="flex gap-1">
                                <input type="number" step="0.5" placeholder="0" className={inputClass} value={section.carga ?? ""} onChange={(e) => handleSectionChange(exIndex, secIndex, "carga", e.target.value)} />
                                <select className="border border-line-input rounded px-1 text-xs bg-surface-app text-content-primary focus:ring-2 focus:ring-brand-glow outline-none" value={section.load_unit || 'kg'} onChange={(e) => handleSectionChange(exIndex, secIndex, "load_unit", e.target.value)}>
                                  <option value="kg">kg</option>
                                  <option value="lb">lb</option>
                                  <option value="rir">RIR</option>
                                  <option value="%">%</option>
                                </select>
                              </div>
                            </td>
                            <td className="p-2"><input type="number" placeholder="1" className={inputClass} value={section.series ?? ""} onChange={(e) => handleSectionChange(exIndex, secIndex, "series", e.target.value)} /></td>
                            <td className="p-2"><input type="number" placeholder="1" className={inputClass} value={section.reps ?? ""} onChange={(e) => handleSectionChange(exIndex, secIndex, "reps", e.target.value)} /></td>
                            <td className="p-2"><input type="number" step="0.5" placeholder="-" className={inputClass} value={section.rpe ?? ""} onChange={(e) => handleSectionChange(exIndex, secIndex, "rpe", e.target.value)} /></td>
                            <td className="p-2"><input type="text" placeholder="-" className={inputClass} value={section.equip ?? ""} onChange={(e) => handleSectionChange(exIndex, secIndex, "equip", e.target.value)} /></td>
                            <td className="p-2 text-center text-xs font-bold text-content-muted">{section.pr || "-"}</td>
                            {isActive && (
                              <>
                                <td className="p-2 text-center text-sm font-bold text-semantic-info-text border-l-2 border-semantic-info-border/30">
                                  {section.actual_load != null ? `${section.actual_load}` : <span className="text-content-muted">—</span>}
                                </td>
                                <td className="p-2 text-center text-sm font-bold text-semantic-info-text">
                                  {section.actual_rpe != null ? section.actual_rpe : <span className="text-content-muted">—</span>}
                                </td>
                                <td className="p-2 text-center text-base">
                                  {section.feito ? '✅' : <span className="text-content-muted">⬜</span>}
                                </td>
                              </>
                            )}
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

                {/* Mobile (cards) */}
                <div className="md:hidden space-y-3">
                  {exercise.sections.map((section, secIndex) => {
                    if (section.deleted) return null;
                    return (
                      <div key={section.id} className="bg-surface-subtle p-3 rounded-lg border border-line relative">
                        <button
                          type="button"
                          onClick={() => handleRemoveSection(exIndex, secIndex)}
                          className="absolute top-2 right-2 text-content-muted hover:text-semantic-error-text p-1 transition-colors"
                        >
                          <X size={15} />
                        </button>

                        <div className="grid grid-cols-2 gap-3 pr-6">
                          <div>
                            <span className={labelClass}>Carga</span>
                            <div className="flex gap-1">
                              <input type="number" step="0.5" placeholder="0" className={inputClass} value={section.carga ?? ""} onChange={(e) => handleSectionChange(exIndex, secIndex, "carga", e.target.value)} />
                              <select className="border border-line-input rounded px-1 text-xs bg-surface-app h-[38px] text-content-primary" value={section.load_unit || 'kg'} onChange={(e) => handleSectionChange(exIndex, secIndex, "load_unit", e.target.value)}>
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
                              <input type="number" placeholder="1" className={inputClass} value={section.series ?? ""} onChange={(e) => handleSectionChange(exIndex, secIndex, "series", e.target.value)} />
                            </div>
                            <div>
                              <span className={labelClass}>Reps</span>
                              <input type="number" placeholder="1" className={inputClass} value={section.reps ?? ""} onChange={(e) => handleSectionChange(exIndex, secIndex, "reps", e.target.value)} />
                            </div>
                          </div>
                          <div>
                            <span className={labelClass}>RPE</span>
                            <input type="number" step="0.5" placeholder="-" className={inputClass} value={section.rpe ?? ""} onChange={(e) => handleSectionChange(exIndex, secIndex, "rpe", e.target.value)} />
                          </div>
                          <div>
                            <span className={labelClass}>Equip</span>
                            <input type="text" placeholder="-" className={inputClass} value={section.equip ?? ""} onChange={(e) => handleSectionChange(exIndex, secIndex, "equip", e.target.value)} />
                          </div>
                        </div>

                        {isActive && (
                          <div className="mt-2 pt-2 border-t border-semantic-info-border/30 flex gap-4 text-sm">
                            <span className="text-content-muted text-xs uppercase font-bold">Real:</span>
                            <span className="text-semantic-info-text font-bold">
                              {section.actual_load != null ? `${section.actual_load} ${section.load_unit || 'kg'}` : '—'}
                            </span>
                            <span className="text-semantic-info-text font-bold">
                              {section.actual_rpe != null ? `RPE ${section.actual_rpe}` : '—'}
                            </span>
                            <span>{section.feito ? '✅' : '⬜'}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => handleAddSection(exercise.id)}
                  className="mt-4 text-sm font-bold text-brand hover:text-brand-hover flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-surface-subtle w-full md:w-auto justify-center"
                >
                  <Plus size={15} /> Adicionar Série
                </button>
              </div>
            );
          })}
        </div>

        {/* Ações flutuantes */}
        <div className="fixed bottom-10 left-0 right-0 p-4 pb-8 bg-surface-elevated border-t border-line md:static md:bg-transparent md:border-0 md:p-0 flex flex-col md:flex-row gap-3 z-30 shadow-up md:shadow-none">
          <button
            type="button"
            onClick={handleAddExercise}
            className="w-full md:flex-1 py-3 border-2 border-dashed border-line rounded-xl text-content-muted font-bold hover:border-brand/40 hover:text-brand transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Novo Exercício
          </button>

          <button
            type="submit"
            disabled={saving}
            className="w-full md:flex-1 py-3 bg-brand text-content-on-brand font-bold rounded-xl hover:bg-brand-hover transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
