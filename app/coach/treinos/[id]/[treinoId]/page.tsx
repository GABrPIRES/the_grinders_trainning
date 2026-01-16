"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { calculatePR } from "@/lib/calculatePR";
import { fetchWithAuth } from "@/lib/api";
import { 
  ArrowLeft, Save, Loader2, Dumbbell, Calendar, 
  Trash2, Plus, AlertCircle, X, FileText 
} from "lucide-react";

// --- Interfaces Atualizadas ---
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
  isNew?: boolean;     // Se é novo (não salvo no banco)
  deleted?: boolean;   // Se foi marcado para deletar
  [key: string]: any;
}

interface Exercise {
  id: string; 
  name: string;
  sections: Section[];
  isNew?: boolean;
  deleted?: boolean; // Se foi marcado para deletar
}

export default function EditWorkoutPage() {
  const { id: alunoId, treinoId } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
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

        if (data.exercicios && Array.isArray(data.exercicios)) {
            const mappedExercises = data.exercicios.map((ex: any) => ({
                id: ex.id,
                name: ex.name,
                isNew: false, 
                deleted: false, // Inicialmente visível
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
                    isNew: false,
                    deleted: false
                }))
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

  // --- Lógica de Manipulação ---
  
  const handleAddExercise = () => setExercises(prev => [...prev, { id: uuid(), name: "", isNew: true, deleted: false, sections: [{ id: uuid(), isNew: true, deleted: false, carga: null, load_unit: 'kg', series: null, reps: null, equip: "", rpe: null, pr: null, feito: false }] }]);
  
  const handleRemoveExercise = (index: number) => {
      if (confirm("Remover este exercício?")) {
        setExercises(prev => {
            const updated = [...prev];
            // Se for novo (nunca salvo), pode remover do array direto
            if (updated[index].isNew) {
                return prev.filter((_, i) => i !== index);
            }
            // Se já existe no banco, marcamos como deletado para enviar _destroy
            updated[index].deleted = true;
            return updated;
        });
      }
  };

  const handleAddSection = (exerciseId: string) => setExercises(prev => prev.map(ex => ex.id === exerciseId ? { ...ex, sections: [...ex.sections, { id: uuid(), isNew: true, deleted: false, carga: null, load_unit: 'kg', series: null, reps: null, equip: "", rpe: null, pr: null, feito: false }] } : ex));
  
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
          exercicios_attributes: exercises.map(ex => {
            // Prepara o objeto do exercício
            const exPayload: any = {
                name: ex.name,
                // Manda ID se existir (não for novo)
                id: ex.isNew ? undefined : ex.id,
                // Se estiver marcado como deletado, manda _destroy
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
                    feito: sec.feito
                }))
            };
            return exPayload;
          }),
        },
      };
      
      await fetchWithAuth(`treinos/${treinoId}`, { method: "PUT", body: JSON.stringify(payload) });
      
      alert("Treino atualizado com sucesso!");
      // Importante: Recarregar para limpar os estados de 'deleted' e pegar os novos IDs
      window.location.reload(); 
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar o treino.");
      console.error("Erro na requisição:", err);
    } finally {
        setSaving(false);
    }
  };

  const handleDelete = async () => {
      if(!confirm("Tem certeza que deseja excluir este treino?")) return;
      try {
          await fetchWithAuth(`treinos/${treinoId}`, { method: 'DELETE' });
          router.back();
      } catch (err: any) {
          alert("Erro ao excluir.");
      }
  }

  // Styles
  const inputClass = "border border-neutral-300 rounded px-2 py-2 w-full text-sm focus:ring-2 focus:ring-red-500 outline-none";
  const labelClass = "text-[10px] uppercase font-bold text-neutral-400 mb-1 block";

  if (loading) return <div className="p-12 text-center text-neutral-500 animate-pulse">Carregando treino...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-32 md:pb-8 text-neutral-800">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-600 transition-colors">
            <ArrowLeft size={24} />
            </button>
            <div>
            <h1 className="text-2xl font-bold text-neutral-900">Editar Treino</h1>
            <p className="text-neutral-500 text-sm hidden md:block">Gerencie os exercícios e cargas.</p>
            </div>
        </div>
        
        <button 
            onClick={handleDelete} 
            className="text-red-600 hover:text-red-800 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
        >
            <Trash2 size={16} /> Excluir Treino
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100 flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* INFO DO TREINO */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3"> {/* 75% de largura no Desktop */}
             <label className="block text-sm font-medium mb-1 text-neutral-600 flex items-center gap-2"><Dumbbell size={16}/> Nome</label>
             <input type="text" placeholder="Ex: Leg Day" className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="md:col-span-1"> {/* 25% de largura no Desktop */}
             <label className="block text-sm font-medium mb-1 text-neutral-600 flex items-center gap-2"><Calendar size={16}/> Data</label>
             <input
                type="date"
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
             />
          </div>
        </div>

        {/* LISTA DE EXERCÍCIOS */}
        <div className="space-y-6">
            {exercises.map((exercise, exIndex) => {
              // Se foi deletado, não renderiza na tela (mas continua no state para ser enviado com _destroy)
              if (exercise.deleted) return null;

              return (
                <div key={exercise.id} className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm relative group">
                    
                    {/* Nome do Exercício */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 mr-4">
                            <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Exercício {exIndex + 1}</label>
                            <input 
                                type="text" 
                                placeholder="Nome do exercício..." 
                                className="w-full text-lg font-bold text-neutral-900 border-b-2 border-transparent hover:border-neutral-200 focus:border-red-500 outline-none transition-colors py-1" 
                                value={exercise.name} 
                                onChange={e => handleExerciseChange(exIndex, e.target.value)} 
                                required 
                            />
                        </div>
                        <button type="button" onClick={() => handleRemoveExercise(exIndex)} className="text-neutral-300 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors">
                            <Trash2 size={20} />
                        </button>
                    </div>

                    {/* SÉRIES: DESKTOP */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="text-xs text-neutral-400 font-bold uppercase border-b border-neutral-100">
                                    <th className="p-2 w-[25%]">Carga</th>
                                    <th className="p-2 w-[12%]">Séries</th>
                                    <th className="p-2 w-[12%]">Reps</th>
                                    <th className="p-2 w-[12%]">RPE</th>
                                    <th className="p-2 w-[25%]">Equipamento</th>
                                    <th className="p-2 w-[14%]">PR</th>
                                    <th className="p-2 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {exercise.sections.map((section, secIndex) => {
                                  if (section.deleted) return null;
                                  return (
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
                                  );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* SÉRIES: MOBILE */}
                    <div className="md:hidden space-y-3">
                        {exercise.sections.map((section, secIndex) => {
                            if (section.deleted) return null;
                            return (
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
                                </div>
                            );
                        })}
                    </div>
                    
                    <button type="button" onClick={() => handleAddSection(exercise.id)} className="mt-4 text-sm font-bold text-red-700 hover:text-red-800 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-red-50 w-full md:w-auto justify-center">
                        <Plus size={16} /> Adicionar Série
                    </button>
                </div>
              );
            })}
        </div>

        {/* AÇÕES FLUTUANTES */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-neutral-200 md:static md:bg-transparent md:border-0 md:p-0 flex flex-col md:flex-row gap-3 z-20 shadow-up md:shadow-none">
            <button type="button" onClick={handleAddExercise} className="flex-1 py-3 border-2 border-dashed border-neutral-300 rounded-xl text-neutral-500 font-bold hover:border-red-300 hover:text-red-700 transition-all flex items-center justify-center gap-2">
                <Plus size={20} /> Novo Exercício
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-3 bg-neutral-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70">
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
        </div>

      </form>
    </div>
  );
}