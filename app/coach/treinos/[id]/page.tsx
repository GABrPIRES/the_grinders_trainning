"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { 
  ArrowLeft, Plus, Calendar, MoreVertical, 
  TrendingUp, Clock, CheckCircle2, ChevronRight 
} from "lucide-react";

interface TrainingBlock {
  id: string;
  name: string; // ou 'title'
  objective: string;
  title: string;
  start_date: string;
  end_date: string;
  status?: 'active' | 'completed' | 'future'; // Vamos inferir isso se não vier da API
  weeks_count?: number;
}

interface Student {
  id: string;
  name: string;
  user?: { name: string };
}

export default function CoachStudentBlocksPage() {
  const { id } = useParams(); // ID do Aluno
  const router = useRouter();
  const [blocks, setBlocks] = useState<TrainingBlock[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Se 'id' é o ID da tabela 'alunos':
        const [studentData, blocksData] = await Promise.all([
          // Busca dados do aluno na rota de admin/alunos (ou cria uma rota coach/alunos/:id)
          // Se não tiver rota específica, use a que você tem acesso.
          // Se 'users/${id}' deu 404, é porque 'id' não é de user.
          fetchWithAuth(`alunos/${id}`), 
          
          // Busca os blocos na rota aninhada correta
          fetchWithAuth(`alunos/${id}/training_blocks`) 
        ]);

        setStudent(studentData);
        
        // Ordena os blocos por data (mais recente primeiro)
        const sortedBlocks = (Array.isArray(blocksData) ? blocksData : []).sort((a: any, b: any) => 
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        );
        
        setBlocks(sortedBlocks);
      } catch (error) {
        console.error("Erro ao carregar blocos:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const formatDate = (date: string) => {
    if (!date) return "--/--";
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' });
  };

  const getStatus = (block: TrainingBlock) => {
    const now = new Date();
    const start = new Date(block.start_date);
    const end = new Date(block.end_date);
    end.setHours(23, 59, 59); // Fim do dia

    if (now >= start && now <= end) return 'active';
    if (now > end) return 'completed';
    return 'future';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200"><TrendingUp size={12}/> Em Andamento</span>;
      case 'future':
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100"><Clock size={12}/> Futuro</span>;
      default:
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-500 border border-neutral-200"><CheckCircle2 size={12}/> Concluído</span>;
    }
  };

  if (loading) return <div className="p-12 text-center text-neutral-500 animate-pulse">Carregando periodização...</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/coach/treinos')} 
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Periodização</h1>
            <p className="text-sm text-neutral-500">
              Aluno: <span className="font-semibold text-neutral-800">{student?.name || student?.user?.name || "Carregando..."}</span>
            </p>
          </div>
        </div>

        <button 
          onClick={() => router.push(`/coach/treinos/${id}/blocks/create`)}
          className="bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-red-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <Plus size={20} /> Novo Bloco
        </button>
      </div>

      {/* LISTA DE BLOCOS */}
      {blocks.length === 0 ? (
        <div className="bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-2xl p-12 text-center flex flex-col items-center">
           <Calendar size={48} className="text-neutral-300 mb-4" />
           <h3 className="text-lg font-bold text-neutral-700">Nenhum bloco criado</h3>
           <p className="text-neutral-500 mb-6 max-w-md">
             Crie o primeiro bloco de treinamento para começar a prescrever os treinos deste aluno.
           </p>
           <button 
             onClick={() => router.push(`/coach/treinos/${id}/blocks/create`)}
             className="text-red-700 font-bold hover:underline"
           >
             Criar primeiro bloco
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {blocks.map((block) => {
            const status = getStatus(block);
            return (
              <div 
                key={block.id}
                onClick={() => router.push(`/coach/treinos/${id}/blocks/${block.id}`)}
                className={`
                  relative bg-white p-6 rounded-2xl border transition-all cursor-pointer group
                  ${status === 'active' 
                    ? 'border-red-200 shadow-md ring-1 ring-red-50' 
                    : 'border-neutral-200 shadow-sm hover:border-red-200 hover:shadow-md'
                  }
                `}
              >
                {/* Indicador Lateral de Status */}
                <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full bg-red-700 ${
                    status === 'active' ? 'bg-red-600' : status === 'future' ? 'bg-blue-400' : 'bg-neutral-300'
                }`}></div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pl-3">
                   
                   {/* Informações Principais */}
                   <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                         {getStatusBadge(status)}
                         <span className="text-xs text-neutral-400 font-mono uppercase tracking-wide">
                            {formatDate(block.start_date)} - {formatDate(block.end_date)}
                         </span>
                      </div>
                      <h3 className="text-xl font-bold text-neutral-900 group-hover:text-red-700 transition-colors">
                        {block.title}
                      </h3>
                      <p className="text-neutral-500 text-sm mt-1 line-clamp-1">
                        Objetivo: {block.objective || "Geral"}
                      </p>
                   </div>

                   {/* Ações / Indicadores */}
                   <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-neutral-100 pt-4 md:pt-0 mt-2 md:mt-0">
                      <div className="text-center md:text-right">
                         <p className="text-xs text-neutral-400 uppercase font-bold">Duração</p>
                         <p className="font-semibold text-neutral-800">
                            {/* Cálculo aproximado de semanas se não vier da API */}
                            {block.weeks_count || Math.round((new Date(block.end_date).getTime() - new Date(block.start_date).getTime()) / (7 * 24 * 60 * 60 * 1000))} Semanas
                         </p>
                      </div>
                      
                      <button className="p-2 rounded-full bg-neutral-50 group-hover:bg-red-50 text-neutral-400 group-hover:text-red-600 transition-colors">
                         <ChevronRight size={20} />
                      </button>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}