"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Treino {
  id: string;
  name: string;
  durationTime: number;
  day: string;
  exerciciosCount: number;
}

export default function StudentWorkoutsPage() {
  const { id } = useParams(); // alunoId
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Treino[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTreinos = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/coach/treinos?alunoId=${id}`);
        const data = await res.json();

        const treinos = data.treinos.map((t: any) => ({
          id: t.id,
          name: t.name,
          durationTime: t.durationTime,
          day: new Date(t.day).toLocaleDateString("pt-BR"),
          exerciciosCount: t.exercicios.length,
        }));

        setWorkouts(treinos);
      } catch (err) {
        console.error("Erro ao carregar treinos:", err);
        setWorkouts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTreinos();
  }, [id]);

  return (
    <div className="max-w-4xl mx-auto p-6 text-neutral-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Treinos do Aluno</h1>
        <button
          onClick={() => router.push(`/coach/treinos/${id}/create`)}
          className="bg-red-700 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-800"
        >
          Criar treino
        </button>
      </div>

      <div className="mb-4 bg-white p-4 rounded border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-semibold">Pagamento:</span> Pago
          </div>
          <div>
            <span className="font-semibold">Vencimento:</span> 22/03/2025
          </div>
          <div>
            <span className="font-semibold">Plano:</span> Mensal - Plus
          </div>
          <div>
            <span className="font-semibold">Último treino:</span> 22/02/2025
          </div>
        </div>
      </div>

      {loading ? (
        <p>Carregando treinos...</p>
      ) : workouts.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhum treino encontrado.</p>
      ) : (
        <ul className="space-y-3">
          {workouts.map((treino) => (
            <li key={treino.id} className="bg-white border rounded p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-semibold text-lg">{treino.name}</h2>
                  <p className="text-sm text-neutral-600">
                    {treino.day} - {treino.durationTime} min - {treino.exerciciosCount} exercícios
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/coach/treinos/${id}/${treino.id}`)}
                  className="text-sm text-red-700 cursor-pointer hover:text-red-800"
                >
                  Ver treino
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
