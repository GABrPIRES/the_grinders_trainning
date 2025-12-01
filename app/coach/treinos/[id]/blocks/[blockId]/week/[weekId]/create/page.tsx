"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { calculatePR } from "@/lib/calculatePR";
import { fetchWithAuth } from "@/lib/api";
import { 
  ArrowLeft, Save, Loader2, Dumbbell, Calendar, 
  Trash2, Plus, AlertCircle, X 
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
        { id: uuid(), carga: undefined, load_unit: 'kg', series: undefined, reps: undefined, equip: "", rpe: undefined, pr: undefined, feito: false }
      ] as Section[],
    },
  ]);
  
  // Busca os dados da semana
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
  const handleAddExercise = () => setExercises(prev => [...prev, { id: uuid(), name: "", sections: [{ id: uuid(), carga: null, load_unit: 'kg', series: null, reps: null, equip: "", rpe: null, pr: null, feito: false }] }]);
  
  const handleRemoveExercise = (index: number) => {
      if (confirm("Remover este exercício?")) {
        setExercises(prev => prev.filter((_, i) => i !== index));
      }
  };

  const handleAddSection = (exerciseId: string) => setExercises(prev => prev.map(ex => ex.id === exerciseId ? { ...ex, sections: [...ex.sections, { id: uuid(), carga: null, load_unit: 'kg', series: null, reps: null, equip: "", rpe: null, pr: null, feito: false }] } : ex));
  
  const handleRemoveSection = (exerciseIndex: number, sectionIndex: number) => {
      setExercises(prev => {
          const updated = [...prev];
          updated[exerciseIndex].sections = updated[exerciseIndex].sections.filter((_, i) => i !== sectionIndex);
          return updated;
      });
  };

  const handleExerciseChange = (index: number, value: string) => { const newExercises = [...exercises]; newExercises[index].name = value; setExercises(newExercises); };

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
              feito: sec.feito
            }))
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

  // Styles
  const inputClass = "border border-neutral-300 rounded px-2 py-2 w-full text-sm focus:ring-2 focus:ring-red-500 outline-none";
  const labelClass = "text-[10px] uppercase font-bold text-neutral-400 mb-1 block";

  return (
    <div className="max-w-5xl mx-auto pb-32 md:pb-8 text-neutral-800">
      
      {/* CABEÇALHO */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-600">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Novo Treino</h1>
          <p className="text-neutral-500 text-sm hidden md:block">Adicione exercícios e configure as cargas.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100 flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* INFO DO TREINO */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
             <label className="block text-sm font-medium mb-1 text-neutral-600 flex items-center gap-2"><Dumbbell size={16}/> Nome</label>
             <input type="text" placeholder="Ex: Leg Day" className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div>
             <label className="block text-sm font-medium mb-1 text-neutral-600 flex items-center gap-2"><Calendar size={16}/> Data</label>
             <input
                type="date"
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
                value={date}
                onChange={e => setDate(e.target.value)}
                min={weekData?.start_date || ""}
                max={weekData?.end_date || ""}
                disabled={!weekData}
                required
             />
          </div>
        </div>

        {/* LISTA DE EXERCÍCIOS */}
        <div className="space-y-6">
            {exercises.map((exercise, exIndex) => (
            <div key={exercise.id} className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm relative group">
                
                {/* Nome do Exercício + Remover */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 mr-4">
                        <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Exercício {exIndex + 1}</label>
                        <input 
                            type="text" 
                            placeholder="Nome do exercício..." 
                            className="w-full text-lg font-bold text-neutral-900 border-b-2 border-transparent hover:border-neutral-200 focus:border-red-500 outline-none transition-colors py-1 placeholder-neutral-300" 
                            value={exercise.name} 
                            onChange={e => handleExerciseChange(exIndex, e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="button" onClick={() => handleRemoveExercise(exIndex)} className="text-neutral-300 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors">
                        <Trash2 size={20} />
                    </button>
                </div>

                {/* SÉRIES: VERSÃO DESKTOP (TABELA) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="text-xs text-neutral-400 font-bold uppercase border-b border-neutral-100">
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
                            <tr key={section.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50">
                                <td className="p-2">
                                    <div className="flex gap-1">
                                        <input type="number" step="0.5" placeholder="0" className={inputClass} value={section.carga ?? ""} onChange={(e) => handleSectionChange(exIndex, secIndex, "carga", e.target.value)} />
                                        <select className="border border-neutral-300 rounded px-1 text-xs bg-white focus:ring-2 focus:ring-red-500 outline-none" value={section.load_unit || 'kg'} onChange={(e) => handleSectionChange(exIndex, secIndex, "load_unit", e.target.value)}>
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
                                <td className="p-2 text-center text-xs font-mono text-neutral-500">{section.pr || "-"}</td>
                                <td className="p-2 text-center">
                                    <button type="button" onClick={() => handleRemoveSection(exIndex, secIndex)} className="text-neutral-300 hover:text-red-500 transition-colors"><X size={16}/></button>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* SÉRIES: VERSÃO MOBILE (CARDS EMPILHADOS) */}
                <div className="md:hidden space-y-3">
                    {exercise.sections.map((section, secIndex) => (
                        <div key={section.id} className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 relative">
                            <button 
                                type="button" 
                                onClick={() => handleRemoveSection(exIndex, secIndex)} 
                                className="absolute top-2 right-2 text-neutral-300 hover:text-red-500 p-1"
                            >
                                <X size={16}/>
                            </button>
                            
                            <div className="grid grid-cols-2 gap-3 pr-6">
                                <div>
                                    <span className={labelClass}>Carga</span>
                                    <div className="flex gap-1">
                                        <input type="number" step="0.5" placeholder="0" className={inputClass} value={section.carga ?? ""} onChange={(e) => handleSectionChange(exIndex, secIndex, "carga", e.target.value)} />
                                        <select className="border border-neutral-300 rounded px-1 text-xs bg-white h-[38px]" value={section.load_unit || 'kg'} onChange={(e) => handleSectionChange(exIndex, secIndex, "load_unit", e.target.value)}>
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
                                <div className="mt-2 text-xs text-center text-neutral-500 font-mono bg-neutral-100 rounded py-1">
                                    1RM Estimado: {section.pr}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                
                <button type="button" onClick={() => handleAddSection(exercise.id)} className="mt-4 text-sm font-bold text-red-700 hover:text-red-800 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-red-50 w-full md:w-auto justify-center">
                    <Plus size={16} /> Adicionar Série
                </button>
            </div>
            ))}
        </div>

        {/* AÇÕES FLUTUANTES NO MOBILE / FIXAS NO DESKTOP */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-neutral-200 md:static md:bg-transparent md:border-0 md:p-0 flex flex-col md:flex-row gap-3 z-10">
            <button type="button" onClick={handleAddExercise} className="flex-1 py-3 border-2 border-dashed border-neutral-300 rounded-xl text-neutral-500 font-bold hover:border-red-300 hover:text-red-700 transition-all flex items-center justify-center gap-2">
                <Plus size={20} /> Novo Exercício
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-red-700 text-white font-bold rounded-xl hover:bg-red-800 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70">
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {loading ? "Salvando..." : "Finalizar Treino"}
            </button>
        </div>

      </form>
    </div>
  );
}