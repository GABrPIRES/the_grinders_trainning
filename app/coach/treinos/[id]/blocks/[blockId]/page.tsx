"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { ArrowLeft, Calendar, Edit, Dumbbell } from "lucide-react";

// Interfaces para os dados da API
interface Treino {
  id: string;
  name: string;
}

interface Week {
  id: string;
  week_number: number;
  start_date: string | null;
  end_date: string | null;
  treinos: Treino[];
}

interface TrainingBlock {
  id: string;
  title: string;
  weeks_duration: number;
  start_date: string | null;
  end_date: string | null;
  weeks: Week[];
}

export default function BlockDetailsPage() {
  const { id: alunoId, blockId } = useParams();
  const router = useRouter();

  const [block, setBlock] = useState<TrainingBlock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!blockId) return;
    const fetchBlockData = async () => {
      setLoading(true);
      try {
        const data = await fetchWithAuth(`training_blocks/${blockId}`);
        setBlock(data);
      } catch (err: any) {
        setError("Erro ao carregar o bloco de treino.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlockData();
  }, [blockId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/D';
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  if (loading) return <p className="p-6">Carregando dados do bloco...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!block) return <p className="p-6">Bloco de treino não encontrado.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 text-neutral-800">
      <div className="border-b pb-4 mb-6">
        <button onClick={() => router.push(`/coach/treinos/${alunoId}`)} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-2">
          <ArrowLeft size={16} />
          Voltar para todos os blocos
        </button>
      </div>

      <div className="flex justify-between items-start mb-6 bg-white p-4 rounded-lg border">
        <div>
          <h1 className="text-2xl font-bold">{block.title}</h1>
          <div className="flex items-center gap-4 text-sm text-neutral-600 mt-2">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(block.start_date)} - {formatDate(block.end_date)}
            </span>
            <span className="flex items-center gap-1">
              <Dumbbell size={14} />
              {block.weeks_duration} Semanas
            </span>
          </div>
        </div>
        <button 
          onClick={() => router.push(`/coach/treinos/${alunoId}/blocks/${blockId}/edit`)}
          className="p-2 border rounded cursor-pointer hover:bg-neutral-100"
          aria-label="Editar Bloco"
        >
          <Edit size={18} />
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-4">Semanas do Bloco</h2>
      <ul className="space-y-3">
        {block.weeks.map(week => (
          <li 
            key={week.id}
            // Futuramente, isso levará para a lista de treinos da semana
            onClick={() => alert(`Em breve: ver treinos da Semana ${week.week_number}`)}
            className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <h3 className="font-semibold text-lg text-red-700">Semana {week.week_number}</h3>
                <span className="text-xs text-neutral-500">
                  {formatDate(week.start_date)} - {formatDate(week.end_date)}
                </span>
              </div>
              <span className="text-sm text-blue-600 font-semibold hover:underline">
                Ver Treinos ({week.treinos.length})
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}