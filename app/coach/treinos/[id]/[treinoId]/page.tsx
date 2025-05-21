"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Pencil, Copy, Plus } from "lucide-react";
import { calculatePR } from "@/lib/calculatePR";
import { v4 as uuid } from "uuid";
import { Trash } from "lucide-react";

export default function ViewTreinoPage() {
  const { treinoId } = useParams();
  const router = useRouter();
  const [treino, setTreino] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchTreino = async () => {
      if (!treinoId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/coach/treinos?treinoId=${treinoId}`);
        const data = await res.json();
        setTreino(data);
      } catch (err) {
        console.error("Erro ao buscar treino:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTreino();
  }, [treinoId]);

  const handleChange = (exIndex: number, secIndex: number, field: string, value: any) => {
    const updated = { ...treino };
    const section = updated.exercicios[exIndex].sections[secIndex];
    section[field] = value;

    const { carga, reps, rpe } = section;
    if (carga && reps && rpe) {
      const pr = calculatePR({ carga, reps, rpe });
      if (pr !== null) section.pr = parseFloat(pr.toFixed(2));
    }

    setTreino(updated);
  };

  const handleAddExercise = () => {
    const newExercise = {
      id: uuid(),
      name: "Novo exercício",
      sections: [
        {
          id: uuid(),
          carga: 0,
          series: 0,
          reps: 0,
          equip: "",
          rpe: 0,
          pr: 0,
          feito: false,
        },
      ],
    };
    setTreino((prev: any) => ({
      ...prev,
      exercicios: [...prev.exercicios, newExercise],
    }));
  };

  const handleAddSection = (exIndex: number) => {
    const updated = { ...treino };
    updated.exercicios[exIndex].sections.push({
      id: uuid(),
      carga: 0,
      series: 0,
      reps: 0,
      equip: "",
      rpe: 0,
      pr: 0,
      feito: false,
    });
    setTreino(updated);
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/coach/treinos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(treino),
      });

      if (res.ok) {
        alert('Treino atualizado com sucesso!');
        setEditMode(false);
      } else {
        alert('Erro ao atualizar treino.');
      }
    } catch (err) {
      console.error('Erro ao salvar treino:', err);
      alert('Erro na requisição.');
    }
  };

  const handleDuplicate = async () => {
    try {
      const payload = {
        alunoId: treino.alunoId,
        name: treino.name + " (Cópia)",
        durationTime: treino.durationTime,
        day: new Date().toISOString().split("T")[0],
        exercicios: treino.exercicios.map((ex: any) => ({
          name: ex.name,
          sections: ex.sections.map((sec: any) => ({
            carga: sec.carga,
            series: sec.series,
            reps: sec.reps,
            equip: sec.equip,
            rpe: sec.rpe,
            pr: sec.pr,
            feito: false,
          }))
        }))
      };

      const res = await fetch('/api/coach/treinos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.treino?.id) {
        router.push(`/coach/treinos/view?treinoId=${data.treino.id}`);
      } else {
        alert('Erro ao duplicar treino.');
      }
    } catch (err) {
      console.error('Erro ao duplicar treino:', err);
      alert('Erro na requisição.');
    }
  };

  const handleDeleteExercise = (exIndex: number) => {
    const updated = { ...treino };
    updated.exercicios.splice(exIndex, 1);
    setTreino(updated);
  };

  const handleDeleteSection = (exIndex: number, secIndex: number) => {
    const updated = { ...treino };
    updated.exercicios[exIndex].sections.splice(secIndex, 1);
    setTreino(updated);
  };

  const handleDeleteTreino = async () => {
    const confirmDelete = confirm("Tem certeza que deseja excluir este treino?");
    if (!confirmDelete) return;
    try {
      const res = await fetch(`/api/coach/treinos?treinoId=${treino.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        alert("Treino deletado com sucesso.");
        router.push(`/coach/treinos/${treino.alunoId}`);
      } else {
        alert("Erro ao deletar treino.");
      }
    } catch (err) {
      console.error("Erro ao deletar treino:", err);
      alert("Erro ao deletar treino.");
    }
  };

  if (loading) return <p className="p-6">Carregando treino...</p>;
  if (!treino) return <p className="p-6 text-red-600">Treino não encontrado.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 text-neutral-800">
      <div className="flex justify-between items-start">
        <div className="w-full">
          {editMode ? (
            <div className="flex flex-col gap-2 mb-4">
              <input
                type="text"
                className="border p-2 rounded font-bold text-xl max-w-96"
                value={treino.name}
                onChange={(e) => setTreino({ ...treino, name: e.target.value })}
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  className="border p-2 rounded text-sm max-w-32"
                  value={treino.day?.split("T")[0] || ""}
                  onChange={(e) => setTreino({ ...treino, day: e.target.value })}
                />
                <input
                  type="number"
                  className="border p-2 rounded text-sm max-w-32"
                  value={treino.durationTime}
                  onChange={(e) => setTreino({ ...treino, durationTime: parseInt(e.target.value) })}
                  placeholder="Duração (min)"
                />
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-2">{treino.name}</h1>
              <p className="text-sm text-neutral-600 mb-4">
                {new Date(treino.day).toLocaleDateString("pt-BR")} - {treino.durationTime} min
              </p>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDuplicate}
            className="p-2 border border-neutral-300 rounded cursor-pointer hover:bg-neutral-100"
          >
            <Copy size={18} />
          </button>
          <button
            onClick={() => setEditMode(!editMode)}
            className="p-2 border border-neutral-300 rounded cursor-pointer hover:bg-red-500 hover:text-white"
          >
            <Pencil size={20} />
          </button>
        </div>
      </div>

      {!editMode && (
        <button
          onClick={handleDeleteTreino}
          className="mt-4 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-800"
        >
          <Trash className="inline mr-1" size={16} /> Deletar treino
        </button>
      )}

      {Array.isArray(treino.exercicios) ? (
        treino.exercicios.map((ex: any, exIndex: number) => (
          <div key={ex.id} className="mb-6 bg-white border rounded p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold mb-2">
                {editMode ? (
                  <input
                    type="text"
                    className="border p-1 rounded w-full"
                    value={ex.name}
                    onChange={(e) => {
                      const updated = { ...treino };
                      updated.exercicios[exIndex].name = e.target.value;
                      setTreino(updated);
                    }}
                  />
                ) : (
                  `${exIndex + 1}. ${ex.name}`
                )}
              </h2>
              {editMode && (
                <button
                  onClick={() => handleDeleteExercise(exIndex)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash size={18} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-2 text-xs font-medium text-neutral-500 mb-1">
              <span>Carga</span>
              <span>Séries</span>
              <span>Reps</span>
              <span>Equip.</span>
              <span>RPE</span>
              <span>PR</span>
              <span>Feito</span>
            </div>

            {ex.sections.map((sec: any, secIndex: number) => (
              <div key={sec.id} className="grid grid-cols-1 md:grid-cols-7 gap-2 text-sm mb-1 relative">
                {editMode ? (
                  <>
                    <input type="number" className="border p-1 rounded" value={sec.carga || ""} onChange={(e) => handleChange(exIndex, secIndex, "carga", parseFloat(e.target.value))} />
                    <input type="number" className="border p-1 rounded" value={sec.series || ""} onChange={(e) => handleChange(exIndex, secIndex, "series", parseInt(e.target.value))} />
                    <input type="number" className="border p-1 rounded" value={sec.reps || ""} onChange={(e) => handleChange(exIndex, secIndex, "reps", parseInt(e.target.value))} />
                    <input type="text" className="border p-1 rounded" value={sec.equip || ""} onChange={(e) => handleChange(exIndex, secIndex, "equip", e.target.value)} />
                    <input type="number" className="border p-1 rounded" value={sec.rpe || ""} onChange={(e) => handleChange(exIndex, secIndex, "rpe", parseFloat(e.target.value))} />
                    <input type="number" className="border p-1 rounded bg-gray-100" value={sec.pr || ""} readOnly />
                    <input type="checkbox" checked={sec.feito || false} onChange={(e) => handleChange(exIndex, secIndex, "feito", e.target.checked)} />
                    <button onClick={() => handleDeleteSection(exIndex, secIndex)} className="absolute -top-1 -right-1 text-red-500 hover:text-red-700">
                      <Trash size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <span>{sec.carga}</span>
                    <span>{sec.series}</span>
                    <span>{sec.reps}</span>
                    <span>{sec.equip}</span>
                    <span>{sec.rpe}</span>
                    <span>{sec.pr}</span>
                    <span>{sec.feito ? "✅" : "-"}</span>
                  </>
                )}
              </div>
            ))}

            {editMode && (
              <button
                onClick={() => handleAddSection(exIndex)}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                + Adicionar série
              </button>
            )}
          </div>
        ))
      ) : (
        <p className="text-sm text-red-600">Nenhum exercício encontrado.</p>
      )
      }

      {editMode && (
        <>
          <button
            onClick={handleAddExercise}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            + Adicionar exercício
          </button>

          <button
            onClick={handleSave}
            className="mt-4 bg-red-700 text-white py-2 px-4 rounded hover:bg-red-800 ml-4"
          >
            Salvar alterações
          </button>
        </>
      )}
    </div>
  );
}


