"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { 
  ArrowLeft, Calendar, Plus, Dumbbell, 
  MoreVertical, Edit, Trash2, Copy, Clock, ChevronRight 
} from "lucide-react";

interface Treino {
  id: string;
  name: string;
  day?: string; // Pode ser "Segunda", "Treino A", ou uma data
  description?: string;
  sections_count?: number; // Se sua API retornar contagem de exercícios
}

interface Week {
  id: string;
  week_number: number;
  start_date: string;
  end_date: string;
  treinos: Treino[];
}

export default function WeekDetailsPage() {
  const { id, blockId, weekId } = useParams();
  const router = useRouter();
  
  const [week, setWeek] = useState<Week | null>(null);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    async function loadWeek() {
      try {
        // Busca a semana com os treinos inclusos
        const data = await fetchWithAuth(`weeks/${weekId}`);
        setWeek(data);
      } catch (error) {
        console.error("Erro ao carregar semana:", error);
      } finally {
        setLoading(false);
      }
    }
    loadWeek();
  }, [weekId]);

  const handleDeleteTreino = async (treinoId: string) => {
    if (!confirm("Tem certeza que deseja excluir este treino?")) return;
    try {
      await fetchWithAuth(`treinos/${treinoId}`, { method: 'DELETE' });
      // Atualiza a lista localmente
      if (week) {
        setWeek({
          ...week,
          treinos: week.treinos.filter(t => t.id !== treinoId)
        });
      }
    } catch (error) {
      alert("Erro ao excluir.");
    }
  };

  const handleDuplicateTreino = async (treinoId: string) => {
    try {
      // Supõe que existe uma rota de duplicação ou cria um novo com dados iguais
      // Se não tiver rota específica, pule essa parte ou implemente depois
      await fetchWithAuth(`treinos/${treinoId}/duplicate`, { method: 'POST' });
      window.location.reload(); // Recarrega para mostrar o novo
    } catch (error) {
      alert("Erro ao duplicar (Funcionalidade pode não estar implementada na API).");
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "--/--";
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' });
  };

  if (loading) return <div className="p-12 text-center text-neutral-500 animate-pulse">Carregando treinos...</div>;
  if (!week) return <div className="p-12 text-center text-red-500">Semana não encontrada.</div>;

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-8 text-neutral-800" onClick={() => setOpenMenuId(null)}>
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push(`/coach/treinos/${id}/blocks/${blockId}`)} 
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Semana {week.week_number}</h1>
            <div className="flex items-center gap-2 text-sm text-neutral-500 mt-1">
               <Calendar size={14} />
               <span>{formatDate(week.start_date)} - {formatDate(week.end_date)}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => router.push(`/coach/treinos/${id}/blocks/${blockId}/week/${weekId}/create`)}
          className="bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-red-800 transition-all shadow-md flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <Plus size={20} /> Novo Treino
        </button>
      </div>

      {/* LISTA DE TREINOS */}
      {week.treinos && week.treinos.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
           {week.treinos.map((treino) => (
             <div 
               key={treino.id}
               className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all group relative"
             >
                <div className="flex justify-between items-start">
                   {/* Info Principal */}
                   <div 
                     className="flex-1 cursor-pointer"
                     onClick={() => router.push(`/coach/treinos/${id}/${treino.id}`)} // Vai para a edição dos exercícios (Sections)
                   >
                      <div className="flex items-center gap-3 mb-2">
                         <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                            <Dumbbell size={20} />
                         </div>
                         <div>
                            <h3 className="text-lg font-bold text-neutral-900 group-hover:text-red-700 transition-colors">
                               {treino.name}
                            </h3>
                            <p className="text-xs text-neutral-500 font-medium uppercase tracking-wide">
                               {treino.day ? formatDate(treino.day) : "Dia não definido"}
                            </p>
                         </div>
                      </div>
                      
                      {treino.description && (
                        <p className="text-sm text-neutral-600 pl-14 line-clamp-2">
                           {treino.description}
                        </p>
                      )}
                   </div>

                   {/* Menu de Ações */}
                   <div className="relative">
                      <button 
                        onClick={(e) => {
                           e.stopPropagation();
                           setOpenMenuId(openMenuId === treino.id ? null : treino.id);
                        }}
                        className="p-2 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-neutral-600 transition-colors"
                      >
                         <MoreVertical size={20} />
                      </button>

                      {/* Dropdown */}
                      {openMenuId === treino.id && (
                         <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-xl border border-neutral-100 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                            <button 
                              onClick={(e) => { e.stopPropagation(); router.push(`/coach/treinos/${id}/${treino.id}`); }}
                              className="w-full text-left px-4 py-3 hover:bg-neutral-50 flex items-center gap-2 text-sm text-neutral-700"
                            >
                               <Edit size={16} /> Editar Treino
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDuplicateTreino(treino.id); }}
                              className="w-full text-left px-4 py-3 hover:bg-neutral-50 flex items-center gap-2 text-sm text-neutral-700"
                            >
                               <Copy size={16} /> Duplicar
                            </button>
                            <div className="h-px bg-neutral-100 my-0"></div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDeleteTreino(treino.id); }}
                              className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-2 text-sm text-red-600"
                            >
                               <Trash2 size={16} /> Excluir
                            </button>
                         </div>
                      )}
                   </div>
                </div>

                {/* Rodapé do Card (Opcional: Resumo) */}
                <div 
                   className="mt-4 pt-3 border-t border-neutral-50 flex justify-between items-center text-sm text-neutral-500 cursor-pointer"
                   onClick={() => router.push(`/coach/treinos/${id}/${treino.id}`)}
                >
                   <span className="flex items-center gap-1 hover:text-red-700 transition-colors">
                      Ver exercícios <ChevronRight size={16} />
                   </span>
                </div>
             </div>
           ))}
        </div>
      ) : (
        <div className="bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-2xl p-12 text-center flex flex-col items-center">
           <Dumbbell size={48} className="text-neutral-300 mb-4" />
           <h3 className="text-lg font-bold text-neutral-700">Semana Vazia</h3>
           <p className="text-neutral-500 mb-6">Nenhum treino planejado para esta semana ainda.</p>
           <button 
             onClick={() => router.push(`/coach/treinos/${id}/blocks/${blockId}/week/${weekId}/create`)}
             className="text-red-700 font-bold hover:underline"
           >
             Adicionar Treino Agora
           </button>
        </div>
      )}
    </div>
  );
}