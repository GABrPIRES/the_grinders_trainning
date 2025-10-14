"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import { calculatePR } from "@/lib/calculatePR";
import { fetchWithAuth } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

interface Section {
  id: string;
  carga?: number;
  series?: number;
  reps?: number;
  equip?: string;
  rpe?: number;
  pr?: number;
  feito?: boolean;
  [key: string]: string | number | boolean | undefined;
}

export default function CreateWorkoutPage() {
  // ATUALIZADO: Pegamos todos os IDs da rota
  const { id: alunoId, blockId, weekId } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  const [exercises, setExercises] = useState([
    {
      id: uuid(),
      name: "",
      sections: [
        { id: uuid(), carga: undefined, series: undefined, reps: undefined, equip: "", rpe: undefined, pr: undefined, feito: false }
      ] as Section[],
    },
  ]);

  // Funções handleAddExercise, handleAddSection, handleExerciseChange, handleSectionChange
  // permanecem EXATAMENTE IGUAIS às que você já tinha.
  const handleAddExercise = () => {
    setExercises((prev) => [
      ...prev,
      {
        id: uuid(),
        name: "",
        sections: [
          { id: uuid(), carga: undefined, series: undefined, reps: undefined, equip: "", rpe: undefined, pr: undefined, feito: false }
        ] as Section[],
      },
    ]);
  };

  const handleAddSection = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sections: [
                ...ex.sections,
                {
                  id: uuid(),
                  carga: undefined,
                  series: undefined,
                  reps: undefined,
                  equip: "",
                  rpe: undefined,
                  pr: undefined,
                  feito: false,
                },
              ],
            }
          : ex
      )
    );
  };

  const handleExerciseChange = (index: number, value: string) => {
    const newExercises = [...exercises];
    newExercises[index].name = value;
    setExercises(newExercises);
  };

  const handleSectionChange = (exerciseIndex: number, sectionIndex: number, field: string, value: any) => {
    const updated = [...exercises];
    const section = updated[exerciseIndex].sections[sectionIndex] as Section;
  
    if (field === 'feito') {
      section[field] = value;
    } else if (field === 'carga' || field === 'rpe') {
      const parsed = parseFloat(value);
      section[field] = isNaN(parsed) ? undefined : parsed;
    } else if (field === 'series' || field === 'reps') {
      const parsed = parseInt(value);
      section[field] = isNaN(parsed) ? undefined : parsed;
    } else {
      section[field] = value;
    }
  
    if (section.carga && section.reps && section.rpe) {
      const pr = calculatePR({
        carga: section.carga!,
        reps: section.reps!,
        rpe: section.rpe!
      });
      if (pr !== null) {
        section.pr = parseFloat(pr.toFixed(2));
      }
    }
  
    setExercises(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const payload = {
        treino: {
          // ATUALIZADO: Não enviamos mais o aluno_id
          // aluno_id: id, (REMOVIDO)
          name: title,
          duration_time: parseInt(duration),
          day: date,
          exercicios_attributes: exercises.map((ex) => ({
            name: ex.name,
            sections_attributes: ex.sections.map(sec => ({
              carga: sec.carga,
              series: sec.series,
              reps: sec.reps,
              equip: sec.equip,
              rpe: sec.rpe,
              pr: sec.pr,
              feito: sec.feito
            })),
          })),
        },
      };

      // ATUALIZADO: Usamos a nova rota da API aninhada em 'weeks'
      await fetchWithAuth(`weeks/${weekId}/treinos`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      alert("Treino criado com sucesso!");
      // ATUALIZADO: Volta para a página de detalhes da semana
      router.push(`/coach/treinos/${alunoId}/blocks/${blockId}/week/${weekId}`);
    } catch (err: any) {
      setError(err.message || "Erro ao criar o treino.");
      console.error("Erro na requisição:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="border-b pb-4 mb-6">
        <button 
          // ATUALIZADO: Botão "Voltar" agora aponta para a página da semana
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-2"
        >
          <ArrowLeft size={16} />
          Voltar para a semana
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Criar Treino</h1>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      
      {/* O formulário abaixo é idêntico ao que você já tinha */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Título do treino"
            className="text-neutral-600 border p-2 rounded w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Duração (min)"
            className="text-neutral-600 border p-2 rounded w-full"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
          <input
            type="date"
            className="text-neutral-600 border p-2 rounded w-full"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {exercises.map((exercise, exIndex) => (
          <div key={exercise.id} className="bg-white border p-4 rounded shadow">
            <input
              type="text"
              placeholder="Nome do exercício"
              className="text-neutral-600 border p-2 rounded w-full mb-4"
              value={exercise.name}
              onChange={(e) => handleExerciseChange(exIndex, e.target.value)}
              required
            />

            {exercise.sections.map((section, secIndex) => (
              <div key={section.id} className="grid md:grid-cols-7 gap-2 mb-2 text-sm">
                <input type="number" placeholder="Carga" className="text-neutral-600 border p-1 rounded" value={section.carga !== undefined ? section.carga.toString() : ""} onChange={(e) => handleSectionChange(exIndex, secIndex, "carga", e.target.value)} />
                <input type="number" placeholder="Séries" className="text-neutral-600 border p-1 rounded" value={section.series !== undefined ? section.series.toString() : ""} onChange={(e) => handleSectionChange(exIndex, secIndex, "series", e.target.value)} />
                <input type="number" placeholder="Reps" className="text-neutral-600 border p-1 rounded" value={section.reps !== undefined ? section.reps.toString() : ""} onChange={(e) => handleSectionChange(exIndex, secIndex, "reps", e.target.value)} />
                <input type="text" placeholder="Equip." className="text-neutral-600 border p-1 rounded" value={section.equip} onChange={(e) => handleSectionChange(exIndex, secIndex, "equip", e.target.value)} />
                <input type="number" placeholder="RPE" className="text-neutral-600 border p-1 rounded" value={section.rpe !== undefined ? section.rpe.toString() : ""} onChange={(e) => handleSectionChange(exIndex, secIndex, "rpe", e.target.value)} />
                <input type="number" placeholder="PR (auto)" className="text-neutral-600 border p-1 rounded bg-gray-100" value={section.pr !== undefined ? section.pr.toString() : ""} readOnly />
                <label className="flex items-center gap-2"><span className="text-neutral-600 text-xs">Feito</span><input type="checkbox" checked={!!section.feito} onChange={(e) => handleSectionChange(exIndex, secIndex, "feito", e.target.checked)} /></label>
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