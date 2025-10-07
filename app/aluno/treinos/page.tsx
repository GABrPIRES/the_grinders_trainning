'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';

interface Treino {
  id: string;
  name: string;
  duration_time: number;
  day: string;
  exercicios: any[];
}

export default function AlunoTreinosPage() {
  const [workouts, setWorkouts] = useState<Treino[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTreinos = async () => {
      setLoading(true);
      try {
        const data = await fetchWithAuth('meus_treinos');
        setWorkouts(data);
      } catch (err) {
        console.error("Erro ao carregar treinos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTreinos();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 text-neutral-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Meus Treinos</h1>
      </div>

      {loading ? (
        <p>Carregando treinos...</p>
      ) : workouts.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-neutral-600">Você ainda não tem nenhum treino cadastrado.</p>
          <p className="text-sm text-neutral-500 mt-2">Peça para o seu coach montar o seu primeiro treino!</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {workouts.map((treino) => (
            <li key={treino.id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-semibold text-lg text-red-700">{treino.name}</h2>
                  <p className="text-sm text-neutral-600 mt-1">
                    {new Date(treino.day).toLocaleDateString("pt-BR", { timeZone: 'UTC' })} - 
                    {` ${treino.duration_time} min`} - 
                    {` ${treino.exercicios.length} exercícios`}
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/aluno/treinos/${treino.id}`)}
                  className="text-sm text-blue-600 font-semibold cursor-pointer hover:underline"
                >
                  Ver Detalhes
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}