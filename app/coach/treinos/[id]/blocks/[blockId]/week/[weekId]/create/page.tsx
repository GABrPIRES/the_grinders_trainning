"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useConfirm } from "@/hooks/useConfirm";
import { v4 as uuid } from "uuid";
import { calculatePR } from "@/lib/calculatePR";
import { fetchWithAuth } from "@/lib/api";
import {
  ArrowLeft, Save, Loader2, Dumbbell, Calendar,
  Trash2, Plus, AlertCircle, X,
} from "lucide-react";

// --- Interfaces ---
interface Section {
  id: string;
  carga?: number | null;
  load_unit?: 'kg' | 'lb' | 'rir' | string | null;
  series?: number | null;
  reps?: number | null;
  equip?: string | null;
  rpe?: number | null;
  pr?: number | null;
  feito?: boolean | null;
  [key: string]: string | number | boolean | undefined | null;
}

interface WeekData {
  start_date: string | null;
  end_date: string | null;
}

export default function CreateWorkoutPage() {
  const { id: alunoId, blockId, weekId } = useParams();
  const router = useRouter();
  const { showConfirm, ConfirmEl } = useConfirm();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [weekData, setWeekData] = useState<WeekData | null>(null);

  const [exercises, setExercises] = useState([
    {
      id: uuid(),
      name: "",
      sections: [
        { id: uuid(), carga: undefined, load_unit: 'kg', series: undefined, reps: undefined, equip: "", rpe: undefined, pr: undefined, feito: false },
      ] as Section[],
    },
  ]);

  useEffect(() => {
    if (!weekId) return;
    const fetchWeek = async () => {
      try {
        const data = await fetchWithAuth(`weeks/${weekId}`);
        setWeekData({
          start_date: data.start_date ? new Date(data.start_date).toISOString().split('T')[0] : null,
          end_date: data.end_date ? new Date(data.end_date).toISOString().split('T')[0] : null,
        });
      } catch (err) {
        console.error("Erro ao buscar dados da semana:", err);
      }
    };
    fetchWeek();
  }, [weekId]);

  // --- Lógica de Manipulação ---
  const handleAddExercise = () =>
    setExercises(prev => [...prev, { id: uuid(), name: "", sections: [{ id: uuid(), carga: null, load_unit: 'kg', series: null, reps: null, equip: "", rpe: null, pr: null, feito: false }] }]);

  const handleRemoveExercise = async (index: number) => {
    const ok = await showConfirm({ message: "Remover este exercício?", confirmLabel: "Remover", danger: true });
    if (!ok) return;
    setExercises(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddSection = (exerciseId: string) =>
    setExercises(prev => prev.map(ex => ex.id === exerciseId
      ? { ...ex, sections: [...ex.sections, { id: uuid(), carga: null, load_unit: 'kg', series: null, reps: null, equip: "", rpe: null, pr: null, feito: false }] }
      : ex
    ));

  const handleRemoveSection = (exerciseIndex: number, sectionIndex: number) => {
    setExercises(prev => {
      const updated = [...prev];
      updated[exerciseIndex].sections = updated[exerciseIndex].sections.filter((_, i) => i !== sectionIndex);
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

      const newSections = [...updated[exerciseIndex].sections];
      newSections[sectionIndex] = section;
      updated[exerciseIndex] = { ...updated[exerciseIndex], sections: newSections };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        treino: {
          name: title,
          day: date,
          exercicios_attributes: exercises.map(ex => ({
            name: ex.name,
            sections_attributes: ex.sections.map(sec => ({
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
      await fetchWithAuth(`weeks/${weekId}/treinos`, { method: "POST", body: JSON.stringify(payload) });
      router.push(`/coach/treinos/${alunoId}/blocks/${blockId}/week/${weekId}`);
    } catch (err: any) {
      setError(err.message || "Erro ao criar o treino.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "border border-line-input rounded px-2 py-2 w-full text-sm focus:ring-2 focus:ring-brand-glow outline-none bg-surface-app text-content-primary";
  const labelClass = "text-[10px] uppercase font-bold text-content-muted mb-1 block";

  return (
    <div className="max-w-5xl mx-auto pb-32 md:pb-8 text-content-primary">

      {/* Cabeçalho */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-surface-subtle rounded-lg text-content-secondary transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-content-primary">Novo Treino</h1>
          <p className="text-sm text-content-tertiary hidden md:block">Adicione exercícios e configure as cargas.</p>
        </div>
      </div>

      {error && (
        <div className="bg-semantic-error-bg text-semantic-error-text border border-semantic-error-border p-4 rounded-xl mb-6 text-sm flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Info do Treino */}
        <div className="bg-surface-elevated p-5 rounded-xl border border-line shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
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
          <div>
            <label className="block text-sm font-bold mb-1 text-content-secondary flex items-center gap-2">
              <Calendar size={15} /> Data
            </label>
            <input
              type="date" onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
              className="w-full px-4 py-2.5 border border-line-input rounded-lg focus:ring-2 focus:ring-brand-glow outline-none transition-all bg-surface-app text-content-primary text-sm cursor-pointer"
              value={date}
              onChange={e => setDate(e.target.value)}
              min={weekData?.start_date || ""}
              max={weekData?.end_date || ""}
              disabled={!weekData}
              required
            />
          </div>
        </div>

        {/* Lista de exercícios */}
        <div className="space-y-6">
          {exercises.map((exercise, exIndex) => (
            <div key={exercise.id} className="bg-surface-elevated p-5 rounded-xl border border-line shadow-sm relative group">

              {/* Nome + Remover */}
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
                    <tr className="text-xs text-content-muted font-bold uppercase border-b border-line">
                      <th className="p-2 w-28">Carga</th>
                      <th className="p-2 w-16">Séries</th>
                      <th className="p-2 w-16">Reps</th>
                      <th className="p-2 w-20">RPE</th>
                      <th className="p-2">Equipamento</th>
                      <th className="p-2 w-20">1RM</th>
                      <th className="p-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {exercise.sections.map((section, secIndex) => (
                      <tr key={section.id} className="border-b border-line/50 last:border-0 hover:bg-surface-subtle/50">
                        <td className="p-2">
                          <div className="flex gap-1">
                            <input type="number" step="0.5" placeholder="0" className={inputClass} value={section.carga ?? ""} onChange={(e) => handleSectionChange(exIndex, secIndex, "carga", e.target.value)} />
                            <select className="border border-line-input rounded px-1 text-xs bg-surface-app text-content-primary focus:ring-2 focus:ring-brand-glow outline-none" value={section.load_unit || 'kg'} onChange={(e) => handleSectionChange(exIndex, secIndex, "load_unit", e.target.value)}>
                              <option value="kg">kg</option>
                              <option value="lb">lb</option>
                              <option value="rir">RIR</option>
                            </select>
                          </div>
                        </td>
                        <td className="p-2"><input type="number" placeholder="1" className={inputClass} value={section.series ?? ""} onChange={(e) => handleSectionChange(exIndex, secIndex, "series", e.target.value)} /></td>
                        <td className="p-2"><input type="number" placeholder="1" className={inputClass} value={section.reps ?? ""} onChange={(e) => handleSectionChange(exIndex, secIndex, "reps", e.target.value)} /></td>
                        <td className="p-2"><input type="number" step="0.5" placeholder="-" className={inputClass} value={section.rpe ?? ""} onChange={(e) => handleSectionChange(exIndex, secIndex, "rpe", e.target.value)} /></td>
                        <td className="p-2"><input type="text" placeholder="-" className={inputClass} value={section.equip ?? ""} onChange={(e) => handleSectionChange(exIndex, secIndex, "equip", e.target.value)} /></td>
                        <td className="p-2 text-center text-xs font-bold text-content-muted">{section.pr || "-"}</td>
                        <td className="p-2 text-center">
                          <button type="button" onClick={() => handleRemoveSection(exIndex, secIndex)} className="text-content-muted hover:text-semantic-error-text transition-colors">
                            <X size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile (cards) */}
              <div className="md:hidden space-y-3">
                {exercise.sections.map((section, secIndex) => (
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
                    {section.pr && (
                      <div className="mt-2 text-xs text-center text-content-muted font-bold bg-surface-page rounded py-1">
                        1RM Estimado: {section.pr}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleAddSection(exercise.id)}
                className="mt-4 text-sm font-bold text-brand hover:text-brand-hover flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-surface-subtle w-full md:w-auto justify-center"
              >
                <Plus size={15} /> Adicionar Série
              </button>
            </div>
          ))}
        </div>

        {/* Ações */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface-elevated border-t border-line md:static md:bg-transparent md:border-0 md:p-0 flex flex-col md:flex-row gap-3 z-10">
          <button
            type="button"
            onClick={handleAddExercise}
            className="flex-1 py-3 border-2 border-dashed border-line rounded-xl text-content-muted font-bold hover:border-brand/40 hover:text-brand transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Novo Exercício
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-brand text-content-on-brand font-bold rounded-xl hover:bg-brand-hover transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {loading ? "Salvando..." : "Finalizar Treino"}
          </button>
        </div>
      </form>
      {ConfirmEl}
    </div>
  );
}
