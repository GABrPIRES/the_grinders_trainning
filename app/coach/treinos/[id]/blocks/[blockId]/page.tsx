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
  
  // --- NOVA LÓGICA ---
  // Função para verificar se a data de hoje está no intervalo da semana
  const isCurrentWeek = (week: Week): boolean => {
    if (!week.start_date || !week.end_date) {
      return false;
    }
    const today = new Date();
    // Zera a hora para comparar apenas as datas
    today.setHours(0, 0, 0, 0);

    // Converte as datas da semana para objetos Date, considerando UTC
    const startDate = new Date(week.start_date + 'T00:00:00');
    const endDate = new Date(week.end_date + 'T00:00:00');

    return today >= startDate && today <= endDate;
  };
  // --- FIM DA NOVA LÓGICA ---

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
        {block.weeks.map(week => {
          // --- NOVA LÓGICA ---
          // Verifica se a semana atual é a vigente e define a classe CSS
          const isCurrent = isCurrentWeek(week);
          const weekClasses = isCurrent
            ? "bg-red-50 border-2 border-red-700 shadow-lg" // Classes de destaque
            : "bg-white border hover:shadow-md"; // Classes padrão
          // --- FIM DA NOVA LÓGICA ---

          return (
            <li 
              key={week.id}
              onClick={() => router.push(`/coach/treinos/${alunoId}/blocks/${blockId}/week/${week.id}`)}
              // A classe é aplicada dinamicamente aqui
              className={`rounded-lg p-4 transition-shadow cursor-pointer ${weekClasses}`}
            >
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-red-700">Semana {week.week_number}</h3>
                    {isCurrent && <span className="text-xs font-bold text-white bg-red-700 px-2 py-0.5 rounded-full">AGORA</span>}
                  </div>
                  <span className="text-xs text-neutral-500">
                    {formatDate(week.start_date)} - {formatDate(week.end_date)}
                  </span>
                </div>
                <span className="text-sm text-blue-600 font-semibold hover:underline">
                  Ver Treinos ({week.treinos.length})
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}