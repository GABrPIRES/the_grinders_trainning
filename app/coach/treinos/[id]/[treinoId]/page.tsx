"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { calculatePR } from "@/lib/calculatePR";

export default function ViewTreinoPage() {
  const { treinoId } = useParams();
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
  
    // Recalcular PR se os campos necessários estiverem preenchidos
    const { carga, reps, rpe } = section;
    if (carga && reps && rpe) {
      const pr = calculatePR({ carga, reps, rpe });
      if (pr !== null) section.pr = parseFloat(pr.toFixed(2));
    }
  
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

  if (loading) return <p className="p-6">Carregando treino...</p>;
  if (!treino) return <p className="p-6 text-red-600">Treino não encontrado.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 text-neutral-800">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold mb-2">{treino.name}</h1>
          <p className="text-sm text-neutral-600 mb-4">
            {new Date(treino.day).toLocaleDateString("pt-BR")} - {treino.durationTime} min
          </p>
        </div>
        <button
          onClick={() => setEditMode(!editMode)}
          className="p-2 border border-neutral-300 rounded cursor-pointer hover:bg-red-500 hover:text-white"
        >
          <Pencil size={20} />
        </button>
      </div>

      {Array.isArray(treino.exercicios) ? (
        treino.exercicios.map((ex: any, exIndex: number) => (
          <div key={ex.id} className="mb-6 bg-white border rounded p-4">
            <h2 className="text-lg font-semibold mb-2">
              {exIndex + 1}. {ex.name}
            </h2>
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
              <div key={sec.id} className="grid grid-cols-1 md:grid-cols-7 gap-2 text-sm mb-1">
                {editMode ? (
                  <>
                    <input
                      type="number"
                      className="border p-1 rounded"
                      value={sec.carga || ""}
                      onChange={(e) => handleChange(exIndex, secIndex, "carga", parseFloat(e.target.value))}
                    />
                    <input
                      type="number"
                      className="border p-1 rounded"
                      value={sec.series || ""}
                      onChange={(e) => handleChange(exIndex, secIndex, "series", parseInt(e.target.value))}
                    />
                    <input
                      type="number"
                      className="border p-1 rounded"
                      value={sec.reps || ""}
                      onChange={(e) => handleChange(exIndex, secIndex, "reps", parseInt(e.target.value))}
                    />
                    <input
                      type="text"
                      className="border p-1 rounded"
                      value={sec.equip || ""}
                      onChange={(e) => handleChange(exIndex, secIndex, "equip", e.target.value)}
                    />
                    <input
                      type="number"
                      className="border p-1 rounded"
                      value={sec.rpe || ""}
                      onChange={(e) => handleChange(exIndex, secIndex, "rpe", parseFloat(e.target.value))}
                    />
                    <input
                      type="number"
                      className="border p-1 rounded bg-gray-100"
                      value={sec.pr || ""}
                      readOnly
                    />
                    <input
                      type="checkbox"
                      checked={sec.feito || false}
                      onChange={(e) => handleChange(exIndex, secIndex, "feito", e.target.checked)}
                    />
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
          </div>
        ))
      ) : (
        <p className="text-sm text-red-600">Nenhum exercício encontrado.</p>
      )}

      {editMode && (
        <button
          onClick={handleSave}
          className="mt-4 bg-red-700 text-white py-2 px-4 rounded hover:bg-red-800"
        >
          Salvar alterações
        </button>
      )}
    </div>
  );
}


