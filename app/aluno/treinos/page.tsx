"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Dumbbell, Calendar, ArrowRight, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { format, parseISO, isWithinInterval } from "date-fns";
import { ptBR } from 'date-fns/locale';

// Interfaces
interface Treino {
  id: string;
  name: string;
  day: string;
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
  weeks_duration: number;
  start_date: string;
  end_date: string;
  weeks: Week[];
}

export default function MeusTreinosPage() {
  const [blocks, setBlocks] = useState<TrainingBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
  const [expandedWeekId, setExpandedWeekId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchWithAuth('meus_treinos'); 
        setBlocks(data || []);
        
        // Tenta expandir automaticamente o bloco e semana atuais
        if (data && data.length > 0) {
           const today = new Date();
           const activeBlock = data[0]; // O primeiro é o mais recente
           setExpandedBlockId(activeBlock.id);

           const activeWeek = activeBlock.weeks.find((week: Week) => {
              if (!week.start_date || !week.end_date) return false;
              const start = parseISO(week.start_date);
              const end = parseISO(week.end_date);
              // Ajusta o final do dia para cobrir até 23:59:59
              end.setHours(23, 59, 59, 999);
              return isWithinInterval(today, { start, end });
           });

           if (activeWeek) {
             setExpandedWeekId(activeWeek.id);
           } else if (activeBlock.weeks.length > 0) {
             // Se não achar pela data, expande a primeira semana por conveniência
             setExpandedWeekId(activeBlock.weeks[0].id);
           }
        }

      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/D";
    return format(parseISO(dateString), 'dd/MM', { locale: ptBR });
  };

  const isCurrentDate = (start: string, end: string) => {
    if (!start || !end) return false;
    const today = new Date();
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    endDate.setHours(23, 59, 59, 999);
    return isWithinInterval(today, { start: startDate, end: endDate });
  };

  if (loading) return <div className="p-8 text-center text-neutral-500 animate-pulse">Carregando seus treinos...</div>;

  if (blocks.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white p-12 rounded-xl shadow-sm text-center border border-neutral-200">
          <Dumbbell className="mx-auto h-16 w-16 text-neutral-300 mb-4" />
          <h2 className="text-2xl font-bold text-neutral-800">Nenhum treino encontrado</h2>
          <p className="text-neutral-600 mt-2">Seu coach ainda não criou um bloco de treinos para você.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 text-neutral-800 space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Meus Treinos</h1>
        <p className="text-neutral-500">Selecione um bloco e uma semana para ver seus treinos.</p>
      </div>

      <div className="space-y-4">
        {blocks.map((block, index) => {
          const isCurrentBlock = index === 0; // Assume que o primeiro é o atual pela ordem da API
          const isExpanded = expandedBlockId === block.id;

          return (
            <div key={block.id} className="border border-neutral-200 rounded-xl bg-white shadow-sm overflow-hidden">
              {/* Cabeçalho do Bloco (Clicável) */}
              <button 
                onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
                className={`w-full flex items-center justify-between p-5 text-left transition-colors ${isExpanded ? 'bg-neutral-50 border-b border-neutral-100' : 'hover:bg-neutral-50'}`}
              >
                <div>
                  <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                    {block.title}
                    {isCurrentBlock && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border border-green-200">
                        Atual
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-neutral-500 mt-1">
                    {block.weeks_duration} Semanas • {formatDate(block.start_date)} a {formatDate(block.end_date)}
                  </p>
                </div>
                {isExpanded ? <ChevronUp className="text-neutral-400" /> : <ChevronDown className="text-neutral-400" />}
              </button>

              {/* Lista de Semanas (Acordeão) */}
              {isExpanded && (
                <div className="p-4 bg-neutral-50/50 space-y-3">
                  {block.weeks.map(week => {
                    const isCurrentWeek = isCurrentDate(week.start_date, week.end_date);
                    const isWeekExpanded = expandedWeekId === week.id;

                    return (
                      <div key={week.id} className={`bg-white border rounded-lg transition-all ${isCurrentWeek ? 'border-red-200 shadow-sm ring-1 ring-red-100' : 'border-neutral-200'}`}>
                        <button 
                          onClick={() => setExpandedWeekId(isWeekExpanded ? null : week.id)}
                          className="w-full flex items-center justify-between p-4 text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isCurrentWeek ? 'bg-red-100 text-red-700' : 'bg-neutral-100 text-neutral-600'}`}>
                              {week.week_number}
                            </div>
                            <div>
                              <p className={`font-semibold ${isCurrentWeek ? 'text-red-900' : 'text-neutral-700'}`}>
                                Semana {week.week_number}
                                {isCurrentWeek && <span className="ml-2 text-xs font-normal text-red-600">(Atual)</span>}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {formatDate(week.start_date)} - {formatDate(week.end_date)}
                              </p>
                            </div>
                          </div>
                          {isWeekExpanded ? <ChevronUp size={18} className="text-neutral-400" /> : <ChevronDown size={18} className="text-neutral-400" />}
                        </button>

                        {/* Lista de Treinos da Semana */}
                        {isWeekExpanded && (
                          <div className="px-4 pb-4 pt-0 border-t border-neutral-100 mt-2">
                             {week.treinos.length > 0 ? (
                               <ul className="mt-3 space-y-2">
                                 {week.treinos.map(treino => (
                                   <li key={treino.id}>
                                     <button
                                       onClick={() => router.push(`/aluno/treinos/${treino.id}`)}
                                       className="w-full flex items-center justify-between p-3 rounded-md hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all group"
                                     >
                                       <div className="flex items-center gap-3">
                                          <Dumbbell size={18} className="text-neutral-400 group-hover:text-red-600 transition-colors" />
                                          <div className="text-left">
                                            <p className="font-medium text-neutral-800 group-hover:text-red-700">{treino.name}</p>
                                            <p className="text-xs text-neutral-500">{formatDate(treino.day)}</p>
                                          </div>
                                       </div>
                                       <ArrowRight size={16} className="text-neutral-300 group-hover:text-red-600" />
                                     </button>
                                   </li>
                                 ))}
                               </ul>
                             ) : (
                               <p className="text-sm text-neutral-400 py-4 text-center italic">Sem treinos cadastrados.</p>
                             )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}