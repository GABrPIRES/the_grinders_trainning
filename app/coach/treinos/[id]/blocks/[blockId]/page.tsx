"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { 
  ArrowLeft, Calendar, Edit, Trash2, 
  ChevronRight, Dumbbell, Clock, AlertCircle, CheckCircle2,
  MoreVertical, Copy 
} from "lucide-react";
import DuplicateWeekModal from "@/components/modals/DuplicateWeekModal";

interface Treino {
  id: string;
  name: string;
}

interface Week {
  id: string;
  week_number: number;
  start_date: string;
  end_date: string;
  treinos: Treino[];
}

interface TrainingBlock {
  id: string;
  title: string;
  objective: string; // ou 'description' se for o caso
  start_date: string;
  end_date: string;
  weeks: Week[];
}

export default function BlockDetailsPage() {
  const { id, blockId } = useParams(); // id = Aluno, blockId = Bloco
  const router = useRouter();
  
  const [block, setBlock] = useState<TrainingBlock | null>(null);
  const [loading, setLoading] = useState(true);

  const [duplicateWeek, setDuplicateWeek] = useState<{ id: string, number: number } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null); // Para o dropdown

  useEffect(() => {
    async function loadBlock() {
      try {
        // Busca o bloco específico (a API já deve trazer as semanas e treinos no include)
        const data = await fetchWithAuth(`training_blocks/${blockId}`);
        setBlock(data);
      } catch (error) {
        console.error("Erro ao carregar bloco:", error);
      } finally {
        setLoading(false);
      }
    }
    loadBlock();
  }, [blockId]);

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este bloco? Isso apagará todas as semanas e treinos dele.")) return;
    
    try {
      await fetchWithAuth(`training_blocks/${blockId}`, { method: 'DELETE' });
      router.push(`/coach/treinos/${id}`);
    } catch (error) {
      alert("Erro ao excluir.");
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "--/--";
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' });
  };

  const isCurrentWeek = (start: string, end: string) => {
    const now = new Date();
    const s = new Date(start);
    const e = new Date(end);
    e.setHours(23, 59, 59);
    return now >= s && now <= e;
  };

  if (loading) return <div className="p-12 text-center text-neutral-500 animate-pulse">Carregando detalhes...</div>;
  if (!block) return <div className="p-12 text-center text-red-500">Bloco não encontrado.</div>;

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-8 text-neutral-800">
      
      {/* CABEÇALHO */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
           <div className="flex items-center gap-3">
              <button 
                onClick={() => router.push(`/coach/treinos/${id}`)} 
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">{block.title}</h1>
                <div className="flex items-center gap-2 text-sm text-neutral-500 mt-1">
                   <Calendar size={14} />
                   <span>{formatDate(block.start_date)} - {formatDate(block.end_date)}</span>
                </div>
              </div>
           </div>

           <div className="flex gap-2 w-full md:w-auto">
              <button 
                onClick={() => router.push(`/coach/treinos/${id}/blocks/${blockId}/edit`)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors font-medium text-sm"
              >
                <Edit size={16} /> Editar
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-100 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
              >
                <Trash2 size={16} /> Excluir
              </button>
           </div>
        </div>

        {/* Info Extra */}
        {block.objective && (
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 text-sm text-neutral-700">
             <span className="font-bold text-neutral-900 uppercase text-xs block mb-1">Objetivo do Ciclo</span>
             {block.objective}
          </div>
        )}
      </div>

      {/* LISTA DE SEMANAS */}
      <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2 px-1">
         <Clock size={20} className="text-red-700"/> Cronograma Semanal
      </h2>

      <div className="space-y-4">
         {block.weeks?.sort((a,b) => a.week_number - b.week_number).map((week) => {
            const active = isCurrentWeek(week.start_date, week.end_date);
            
            return (
              <div 
                key={week.id}
                // REMOVA O onClick DAQUI DO PAI PARA NÃO CONFLITAR COM O DROPDOWN
                // Vamos mover o clique para uma área específica ou deixar o card clicável exceto o botão
                className={`
                   group relative bg-white p-5 rounded-xl border transition-all
                   ${active ? 'border-red-500 shadow-md ring-1 ring-red-100' : 'border-neutral-200 shadow-sm hover:border-red-300 hover:shadow-md'}
                `}
              >
                 {/* ... (Badge de Semana Atual) */}

                 <div className="flex items-start gap-4">
                     {/* Número da Semana (Clicável para entrar) */}
                     <div 
                        onClick={() => router.push(`/coach/treinos/${id}/blocks/${blockId}/week/${week.id}`)}
                        className={`
                            w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 cursor-pointer
                            ${active ? 'bg-red-50 text-red-700' : 'bg-neutral-100 text-neutral-500 group-hover:bg-red-50 group-hover:text-red-600'}
                        `}
                     >
                        {week.week_number}
                     </div>

                     {/* Informações (Clicável para entrar) */}
                     <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => router.push(`/coach/treinos/${id}/blocks/${blockId}/week/${week.id}`)}
                     >
                        {/* ... (Conteúdo da semana: datas, resumo de treinos) */}
                        <div className="flex items-center gap-2 mb-1">
                           <h3 className="font-bold text-neutral-900">Semana {week.week_number}</h3>
                           <span className="text-xs text-neutral-400 font-mono">
                              ({formatDate(week.start_date)} - {formatDate(week.end_date)})
                           </span>
                        </div>
                        
                        {/* Resumo de Treinos (Mantém igual) */}
                        <div className="flex flex-wrap gap-2">
                           {week.treinos && week.treinos.length > 0 ? (
                              week.treinos.map(treino => (
                                 <span key={treino.id} className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-50 border border-neutral-100 rounded text-xs text-neutral-600">
                                    <Dumbbell size={10} /> {treino.name}
                                 </span>
                              ))
                           ) : (
                              <span className="text-xs text-neutral-400 italic flex items-center gap-1">
                                 <AlertCircle size={12}/> Nenhum treino cadastrado
                              </span>
                           )}
                        </div>
                     </div>

                     {/* Menu de Ações (Três Pontinhos) - NOVO */}
                     <div className="relative">
                        <button 
                           onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === week.id ? null : week.id);
                           }}
                           className="p-2 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-neutral-600 transition-colors"
                        >
                           <MoreVertical size={20} />
                        </button>

                        {openMenuId === week.id && (
                           <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-xl border border-neutral-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                              <button 
                                onClick={(e) => {
                                   e.stopPropagation();
                                   setDuplicateWeek({ id: week.id, number: week.week_number });
                                   setOpenMenuId(null);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-neutral-50 flex items-center gap-2 text-sm text-neutral-700"
                              >
                                 <Copy size={16} /> Duplicar Semana
                              </button>
                           </div>
                        )}
                     </div>
                 </div>
              </div>
            );
         })}
      </div>

      {/* MODAL DE DUPLICAÇÃO */}
      {duplicateWeek && (
        <DuplicateWeekModal
            sourceWeekId={duplicateWeek.id}
            sourceWeekNumber={duplicateWeek.number}
            onClose={() => setDuplicateWeek(null)}
            onSuccess={() => {
                alert("Semana duplicada com sucesso!");
                setDuplicateWeek(null);
                // Opcional: Recarregar se estiver na mesma tela
                // loadBlock(); 
            }}
        />
      )}
    </div>
  );
}