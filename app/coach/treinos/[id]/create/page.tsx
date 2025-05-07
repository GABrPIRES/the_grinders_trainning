"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { v4 as uuid } from "uuid";

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
  const { id } = useParams(); // alunoId
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [date, setDate] = useState("");

  const [exercises, setExercises] = useState([
    {
      id: uuid(),
      name: "",
      sections: [
        { id: uuid(), carga: undefined, series: undefined, reps: undefined, equip: "", rpe: undefined, pr: undefined, feito: false }
      ] as Section[],
    },
  ]);

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
  
    if (section.carga && section.series && section.rpe) {
      section.pr = parseFloat((section.carga * section.series * section.rpe).toFixed(2));
    }
  
    setExercises(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/coach/treinos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alunoId: id,
          name: title,
          durationTime: parseInt(duration),
          day: date,
          exercicios: exercises.map((ex) => ({
            name: ex.name,
            sections: ex.sections,
          })),
        }),
      });

      if (res.ok) {
        router.push(`/coach/treinos/${id}`);
      } else {
        console.error("Erro ao salvar treino");
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">Criar Treino</h1>
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
                <input
                  type="number"
                  placeholder="Carga"
                  className="text-neutral-600 border p-1 rounded"
                  value={section.carga !== undefined ? section.carga.toString() : ""}
                  onChange={(e) => handleSectionChange(exIndex, secIndex, "carga", e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Séries"
                  className="text-neutral-600 border p-1 rounded"
                  value={section.series !== undefined ? section.series.toString() : ""}
                  onChange={(e) => handleSectionChange(exIndex, secIndex, "series", e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Repetições"
                  className="text-neutral-600 border p-1 rounded"
                  value={section.reps !== undefined ? section.reps.toString() : ""}
                  onChange={(e) => handleSectionChange(exIndex, secIndex, "reps", e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Equip."
                  className="text-neutral-600 border p-1 rounded"
                  value={section.equip}
                  onChange={(e) => handleSectionChange(exIndex, secIndex, "equip", e.target.value)}
                />
                <input
                  type="number"
                  placeholder="RPE"
                  className="text-neutral-600 border p-1 rounded"
                  value={section.rpe !== undefined ? section.rpe.toString() : ""}
                  onChange={(e) => handleSectionChange(exIndex, secIndex, "rpe", e.target.value)}
                />
                <input
                  type="number"
                  placeholder="PR (auto)"
                  className="text-neutral-600 border p-1 rounded bg-gray-100"
                  value={section.pr !== undefined ? section.pr.toString() : ""}
                  readOnly
                />
                <label className="flex items-center gap-2">
                  <span className="text-neutral-600 text-xs">Feito</span>
                  <input
                    type="checkbox"
                    checked={section.feito}
                    onChange={(e) => handleSectionChange(exIndex, secIndex, "feito", e.target.checked)}
                  />
                </label>
              </div>
            ))}

            <button
              type="button"
              onClick={() => handleAddSection(exercise.id)}
              className="text-sm text-blue-600 hover:underline mt-2"
            >
              + Adicionar série
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddExercise}
          className="text-sm text-blue-600 hover:underline"
        >
          + Adicionar exercício
        </button>

        <button
          type="submit"
          className="w-full bg-red-700 text-white py-2 rounded hover:bg-red-800"
        >
          Finalizar Treino
        </button>
      </form>
    </div>
  );
}
