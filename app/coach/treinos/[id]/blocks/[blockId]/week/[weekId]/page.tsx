"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { ArrowLeft, Edit, PlusCircle } from "lucide-react";

// Interfaces
interface Treino {
  id: string;
  name: string;
  duration_time: number;
  day: string;
  exercicios: any[];
}

interface Week {
  id: string;
  week_number: number;
  start_date: string | null;
  end_date: string | null;
  treinos: Treino[];
}

export default function WeekDetailsPage() {
  const { id: alunoId, blockId, weekId } = useParams();
  const router = useRouter();

  const [week, setWeek] = useState<Week | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWeekData = async () => {
    if (!weekId) return;
    setLoading(true);
    try {
      // Usamos a nova rota da API para buscar a semana
      const data = await fetchWithAuth(`weeks/${weekId}`);
      setWeek(data);
    } catch (err: any) {
      setError("Erro ao carregar os dados da semana.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeekData();
  }, [weekId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/D';
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  if (loading) return <p className="p-6">Carregando dados da semana...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!week) return <p className="p-6">Semana não encontrada.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 text-neutral-800">
      <div className="border-b pb-4 mb-6">
        <button 
          onClick={() => router.push(`/coach/treinos/${alunoId}/blocks/${blockId}`)} 
          className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-2"
        >
          <ArrowLeft size={16} />
          Voltar para as semanas do bloco
        </button>
      </div>

      <div className="flex justify-between items-start mb-6 bg-white p-4 rounded-lg border">
        <div>
          <h1 className="text-2xl font-bold">Semana {week.week_number}</h1>
          <p className="text-sm text-neutral-600 mt-1">
            Período: {formatDate(week.start_date)} - {formatDate(week.end_date)}
          </p>
        </div>
        <button 
          onClick={() => alert('Em breve: Editar datas da semana!')}
          className="p-2 border rounded cursor-pointer hover:bg-neutral-100"
          aria-label="Editar Semana"
        >
          <Edit size={18} />
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Treinos da Semana</h2>
        <button
          onClick={() => router.push(`/coach/treinos/${alunoId}/blocks/${blockId}/week/${weekId}/create`)}
          className="bg-red-700 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-800 flex items-center gap-2"
        >
          <PlusCircle size={18} />
          Adicionar Treino
        </button>
      </div>

      {week.treinos.length > 0 ? (
        <ul className="space-y-3">
          {week.treinos.map(treino => (
            <li 
              key={treino.id}
              onClick={() => router.push(`/coach/treinos/${alunoId}/${treino.id}`)}
              className="bg-white border rounded p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{treino.name}</h3>
                  <p className="text-sm text-neutral-600">
                  {formatDate(treino.day)} - {treino.exercicios?.length || 0} exercícios
                  </p>
                </div>
                <span className="text-sm text-red-700 hover:underline">Ver treino</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-neutral-500 bg-white p-6 rounded-lg border">
          Nenhum treino cadastrado para esta semana.
        </p>
      )}
    </div>
  );
}