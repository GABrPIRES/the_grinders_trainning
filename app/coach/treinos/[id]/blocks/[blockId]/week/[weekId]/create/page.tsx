"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { calculatePR } from "@/lib/calculatePR";
import { fetchWithAuth } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

// Interfaces...
interface Section {
  id: string;
  carga?: number | null; // Permite null
  load_unit?: 'kg' | 'lb' | 'rir' | string | null; // Adicionado e permite null
  series?: number | null;
  reps?: number | null;
  equip?: string | null;
  rpe?: number | null;
  pr?: number | null;
  feito?: boolean | null;
  [key: string]: string | number | boolean | undefined | null; // Permite null
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
  const [weekData, setWeekData] = useState<WeekData | null>(null);

  const [exercises, setExercises] = useState([
    {
      id: uuid(),
      name: "",
      sections: [
        { id: uuid(), carga: undefined, series: undefined, reps: undefined, equip: "", rpe: undefined, pr: undefined, feito: false }
      ] as Section[],
    },
  ]);
  
  // NOVO USEEFFECT: Busca os dados da semana ao carregar
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
        setError("Não foi possível carregar os limites de data da semana.");
      }
    };
    fetchWeek();
  }, [weekId]);

  // ... (funções de handle* permanecem as mesmas) ...
  const handleAddExercise = () => setExercises(prev => [...prev, { id: uuid(), name: "", sections: [{ id: uuid(), carga: null, load_unit: 'kg', series: null, reps: null, equip: "", rpe: null, pr: null, feito: false }] }]);
  const handleAddSection = (exerciseId: string) => setExercises(prev => prev.map(ex => ex.id === exerciseId ? { ...ex, sections: [...ex.sections, { id: uuid(), carga: null, load_unit: 'kg', series: null, reps: null, equip: "", rpe: null, pr: null, feito: false }] } : ex));
  const handleExerciseChange = (index: number, value: string) => { const newExercises = [...exercises]; newExercises[index].name = value; setExercises(newExercises); };

  const handleSectionChange = (exerciseIndex: number, sectionIndex: number, field: string, value: any) => {
    setExercises(currentExercises => {
        const updated = [...currentExercises];
        // Criamos uma cópia da seção para modificar
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
            section[field as keyof Section] = value; // Inclui load_unit e equip
        }

        // Recalcula PR (verificação de load_unit já estava correta)
        if (section.carga && section.reps && section.rpe && section.load_unit !== 'rir') {
            const pr = calculatePR({ carga: section.carga!, reps: section.reps!, rpe: section.rpe! });
            section.pr = pr !== null ? parseFloat(pr.toFixed(2)) : null;
        } else {
            section.pr = null; // Limpa o PR
        }

        // Atualiza a seção dentro do exercício imutavelmente
        const newSections = [...updated[exerciseIndex].sections];
        newSections[sectionIndex] = section;
        updated[exerciseIndex] = { ...updated[exerciseIndex], sections: newSections };

        return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        treino: {
          name: title,
          // duration_time: parseInt(duration), // REMOVIDO
          day: date,
          exercicios_attributes: exercises.map(ex => ({
            name: ex.name,
            sections_attributes: ex.sections.map(sec => ({
              carga: sec.carga,
              load_unit: sec.load_unit || 'kg', // ADICIONADO load_unit
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
      alert("Treino criado com sucesso!");
      router.push(`/coach/treinos/${alunoId}/blocks/${blockId}/week/${weekId}`);
    } catch (err: any) {
      setError(err.message || "Erro ao criar o treino.");
      console.error("Erro na requisição:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="border-b pb-4 mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-2">
          <ArrowLeft size={16} />
          Voltar para a semana
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Criar Treino</h1>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <input type="text" placeholder="Título do treino" className="text-neutral-600 border p-2 rounded w-full" value={title} onChange={e => setTitle(e.target.value)} required />
          <input
            type="date"
            className="text-neutral-600 border p-2 rounded w-full"
            value={date}
            onChange={e => setDate(e.target.value)}
            min={weekData?.start_date || ""}
            max={weekData?.end_date || ""}
            disabled={!weekData}
            required
          />
        </div>

        {exercises.map((exercise, exIndex) => (
          <div key={exercise.id} className="bg-white border p-4 rounded shadow">
            <input type="text" placeholder="Nome do exercício" className="text-neutral-600 border p-2 rounded w-full mb-4" value={exercise.name} onChange={e => handleExerciseChange(exIndex, e.target.value)} required />
            {/* Loop de Seções */}
            {exercise.sections.map((section, secIndex) => (
              <div key={section.id} className="grid grid-cols-8 gap-2 mb-2 text-sm items-center">
                <div className="col-span-2 flex gap-1">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Carga"
                    className="text-neutral-600 border p-1 rounded w-2/3"
                    value={section.carga ?? ""}
                    onChange={(e) => handleSectionChange(exIndex, secIndex, "carga", e.target.value)}
                  />
                  <select
                    className="text-neutral-600 border p-1 rounded w-1/2 text-xs"
                    value={section.load_unit || 'kg'} // Default kg
                    onChange={(e) => handleSectionChange(exIndex, secIndex, "load_unit", e.target.value)}
                  >
                    <option value="kg">kg</option>
                    <option value="lb">lb</option>
                    <option value="rir">rir</option>
                  </select>
                </div>
                {/* Inputs restantes (1 coluna cada) */}
                <input type="number" placeholder="Sér" className="col-span-1 text-neutral-600 border p-1 rounded" value={section.series ?? ""} onChange={(e) => handleSectionChange(exIndex, secIndex, "series", e.target.value)} />
                <input type="number" placeholder="Rep" className="col-span-1 text-neutral-600 border p-1 rounded" value={section.reps ?? ""} onChange={(e) => handleSectionChange(exIndex, secIndex, "reps", e.target.value)} />
                <input type="text" placeholder="Equip" className="col-span-1 text-neutral-600 border p-1 rounded" value={section.equip ?? ""} onChange={(e) => handleSectionChange(exIndex, secIndex, "equip", e.target.value)} />
                <input type="number" step="0.5" placeholder="RPE" className="col-span-1 text-neutral-600 border p-1 rounded" value={section.rpe ?? ""} onChange={(e) => handleSectionChange(exIndex, secIndex, "rpe", e.target.value)} />
                <input
                    type="number"
                    placeholder="PR"
                    className={`col-span-1 text-neutral-600 border p-1 rounded ${section.load_unit === 'rir' ? 'bg-gray-200' : 'bg-gray-100'}`}
                    value={section.pr ?? ""}
                    readOnly
                    disabled={section.load_unit === 'rir'}
                />
                <label className="col-span-1 flex items-center justify-center gap-1"> {/* Centraliza Checkbox */}
                    <span className="text-neutral-600 text-xs">Feito</span>
                    <input type="checkbox" checked={!!section.feito} onChange={(e) => handleSectionChange(exIndex, secIndex, "feito", e.target.checked)} />
                </label>
              </div>
            ))}
            <button type="button" onClick={() => handleAddSection(exercise.id)} className="text-sm text-blue-600 hover:underline mt-2">+ Adicionar série</button>
          </div>
        ))}

        <button type="button" onClick={handleAddExercise} className="text-sm text-blue-600 hover:underline">+ Adicionar exercício</button>
        <button type="submit" className="w-full bg-red-700 text-white py-2 rounded hover:bg-red-800">Finalizar Treino</button>
      </form>
    </div>
  );
}