"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { ArrowLeft, PlusCircle } from "lucide-react";

// Interfaces para os novos dados
interface TrainingBlock {
  id: string;
  title: string;
  weeks_duration: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

interface AlunoDetails {
  user: { name: string; };
}

export default function StudentTrainingBlocksPage() {
  const { id: alunoId } = useParams();
  const router = useRouter();
  
  const [blocks, setBlocks] = useState<TrainingBlock[]>([]);
  const [aluno, setAluno] = useState<AlunoDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!alunoId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Busca os blocos e os detalhes do aluno em paralelo
        const [alunoData, blocksData] = await Promise.all([
          fetchWithAuth(`alunos/${alunoId}`),
          fetchWithAuth(`alunos/${alunoId}/training_blocks`)
        ]);
        setAluno(alunoData);
        setBlocks(blocksData);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [alunoId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não definida';
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-neutral-800">
      <div className="border-b pb-4 mb-6">
        <button onClick={() => router.push('/coach/treinos')} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-2">
          <ArrowLeft size={16} />
          Voltar para seleção de alunos
        </button>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blocos de Treino: {aluno?.user.name || ''}</h1>
        <button
          // Este é o botão
          onClick={() => router.push(`/coach/treinos/${alunoId}/blocks/create`)} 
          className="bg-red-700 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-800 flex items-center gap-2"
        >
          <PlusCircle size={18}/>
          Novo Bloco
        </button>
      </div>

      {loading ? (
        <p>Carregando blocos de treino...</p>
      ) : blocks.length > 0 ? (
        <ul className="space-y-4">
          {blocks.map(block => (
            <li 
              key={block.id} 
              // Futuramente, esta rota levará para os detalhes do bloco
              onClick={() => alert(`Navegar para o bloco ${block.id} em breve!`)}
              className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-semibold text-lg text-red-700">{block.title}</h2>
                  <p className="text-sm text-neutral-600 mt-1">
                    Duração: {block.weeks_duration} semanas
                  </p>
                  <p className="text-xs text-neutral-500">
                    Período: {formatDate(block.start_date)} - {formatDate(block.end_date)}
                  </p>
                </div>
                <span className="text-sm text-blue-600 font-semibold hover:underline">
                  Gerenciar Semanas
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center bg-white p-8 rounded-lg border">
          <p className="text-neutral-600">Nenhum bloco de treino encontrado para este aluno.</p>
          <p className="text-sm text-neutral-500 mt-2">Clique em "Novo Bloco" para começar a montar o planejamento.</p>
        </div>
      )}
    </div>
  );
}