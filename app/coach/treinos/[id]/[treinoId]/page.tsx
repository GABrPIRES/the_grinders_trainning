"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViewTreinoPage() {
  const { treinoId } = useParams();
  const [treino, setTreino] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p className="p-6">Carregando treino...</p>;
  if (!treino) return <p className="p-6 text-red-600">Treino não encontrado.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 text-neutral-800">
      <h1 className="text-2xl font-bold mb-4">{treino.name}</h1>
      <p className="mb-4 text-sm text-neutral-600">
        {new Date(treino.day).toLocaleDateString("pt-BR")} - {treino.durationTime} min
      </p>

      {Array.isArray(treino.exercicios) ? (
        treino.exercicios.map((ex: any, index: number) => (
          <div key={ex.id} className="mb-6 bg-white border rounded p-4">
            <h2 className="text-lg font-semibold mb-2">
              {index + 1}. {ex.name}
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
            {ex.sections.map((sec: any) => (
              <div key={sec.id} className="grid grid-cols-1 md:grid-cols-7 gap-2 text-sm mb-1">
                <span>{sec.carga}</span>
                <span>{sec.series}</span>
                <span>{sec.reps}</span>
                <span>{sec.equip}</span>
                <span>{sec.rpe}</span>
                <span>{sec.pr}</span>
                <span>{sec.feito ? "✅" : "-"}</span>
              </div>
            ))}
          </div>
        ))
      ) : (
        <p className="text-sm text-red-600">Nenhum exercício encontrado.</p>
      )}
    </div>
  );
}

