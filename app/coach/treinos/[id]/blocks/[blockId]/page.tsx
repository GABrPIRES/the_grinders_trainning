"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import {
  ArrowLeft, Calendar, Edit, Trash2,
  Dumbbell, Clock, AlertCircle, CheckCircle2,
  MoreVertical, Copy, Bot, Eye, X, Save, Loader2, Plus
} from "lucide-react";
import DuplicateWeekModal from "@/components/modals/DuplicateWeekModal";
import WeekAiReviewModal from "@/components/modals/WeekAiReviewModal";

interface Treino {
  id: string;
  name: string;
  status?: 'draft' | 'published' | 'in_progress' | 'completed';
  has_pending_ai_suggestions?: boolean;
}

interface Week {
  id: string;
  week_number: number;
  start_date: string;
  end_date: string;
  treinos: Treino[];
  feedback_enabled?: boolean;
  periodization_goal?: 'overload' | 'maintenance' | 'deload' | null;
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
  const [aiReviewWeek, setAiReviewWeek] = useState<{ id: string, number: number } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [addingWeek, setAddingWeek] = useState(false);
  const [editingWeek, setEditingWeek] = useState<Week | null>(null);
  const [editWeekNumber, setEditWeekNumber] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [savingWeek, setSavingWeek] = useState(false);

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

  const openEditWeek = (week: Week) => {
    setEditingWeek(week);
    setEditWeekNumber(String(week.week_number));
    setEditStartDate(week.start_date ? week.start_date.split('T')[0] : '');
    setEditEndDate(week.end_date ? week.end_date.split('T')[0] : '');
    setOpenMenuId(null);
  };

  const handleSaveWeek = async () => {
    if (!editingWeek) return;
    setSavingWeek(true);
    try {
      await fetchWithAuth(`weeks/${editingWeek.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          week: {
            week_number: parseInt(editWeekNumber, 10),
            start_date: editStartDate || null,
            end_date: editEndDate || null,
          },
        }),
      });
      // Recarrega o bloco para refletir os novos números
      const data = await fetchWithAuth(`training_blocks/${blockId}`);
      setBlock(data);
      setEditingWeek(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar semana.');
    } finally {
      setSavingWeek(false);
    }
  };

  const handleAddWeek = async () => {
    setAddingWeek(true);
    try {
      await fetchWithAuth(`training_blocks/${blockId}/weeks`, { method: 'POST' });
      const data = await fetchWithAuth(`training_blocks/${blockId}`);
      setBlock(data);
    } catch (err: any) {
      alert(err.message || 'Erro ao adicionar semana.');
    } finally {
      setAddingWeek(false);
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
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                           <h3 className="font-bold text-neutral-900">Semana {week.week_number}</h3>
                           <span className="text-xs text-neutral-400 font-mono">
                              ({formatDate(week.start_date)} - {formatDate(week.end_date)})
                           </span>
                           {week.periodization_goal === 'overload' && (
                             <span className="text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">Progressão</span>
                           )}
                           {week.periodization_goal === 'maintenance' && (
                             <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">Manter</span>
                           )}
                           {week.periodization_goal === 'deload' && (
                             <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">Deload</span>
                           )}
                        </div>

                        {week.treinos && week.treinos.length > 0 ? (() => {
                          const withAI = week.treinos.filter(t => t.status === 'draft' && t.has_pending_ai_suggestions);
                          const withoutAI = week.treinos.filter(t => t.status === 'draft' && !t.has_pending_ai_suggestions);
                          const published = week.treinos.filter(t => t.status === 'published' || t.status === 'in_progress' || t.status === 'completed');
                          const allOk = week.treinos.every(t => t.status !== 'draft');

                          return (
                            <div className="space-y-2">
                              {/* Status summary pills */}
                              <div className="flex flex-wrap gap-1.5">
                                {allOk && published.length > 0 && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                                    <CheckCircle2 size={9} /> {published.length} publicado{published.length > 1 ? 's' : ''}
                                  </span>
                                )}
                                {withAI.length > 0 && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setAiReviewWeek({ id: week.id, number: week.week_number }); }}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full hover:bg-amber-200 transition-colors"
                                  >
                                    <Bot size={9} /> {withAI.length} {withAI.length === 1 ? 'revisão' : 'revisões'} IA
                                  </button>
                                )}
                                {withoutAI.length > 0 && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-neutral-100 text-neutral-600 border border-neutral-300 px-2 py-0.5 rounded-full">
                                    <Eye size={9} /> {withoutAI.length} a publicar
                                  </span>
                                )}
                                {!allOk && published.length > 0 && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                                    <CheckCircle2 size={9} /> {published.length} publicado{published.length > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                              {/* Treino names */}
                              <div className="flex flex-wrap gap-1.5">
                                {week.treinos.map(treino => (
                                  <span key={treino.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-50 border border-neutral-100 rounded text-xs text-neutral-600">
                                    <Dumbbell size={9} /> {treino.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })() : (
                          <span className="text-xs text-neutral-400 italic flex items-center gap-1">
                            <AlertCircle size={12} /> Nenhum treino cadastrado
                          </span>
                        )}
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
                           <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-xl border border-neutral-100 z-20 overflow-hidden">
                              <button
                                onClick={(e) => { e.stopPropagation(); openEditWeek(week); }}
                                className="w-full text-left px-4 py-3 hover:bg-neutral-50 flex items-center gap-2 text-sm text-neutral-700"
                              >
                                 <Edit size={16} /> Editar Semana
                              </button>
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

      {/* BOTÃO ADICIONAR SEMANA */}
      <div className="mt-4">
        <button
          onClick={handleAddWeek}
          disabled={addingWeek}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-neutral-300 rounded-xl text-neutral-500 hover:border-red-400 hover:text-red-700 hover:bg-red-50 transition-all font-medium text-sm disabled:opacity-50"
        >
          {addingWeek ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          {addingWeek ? 'Adicionando...' : 'Adicionar Semana'}
        </button>
      </div>

      {/* MODAL DE EDIÇÃO DE SEMANA */}
      {editingWeek && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-5 border-b border-neutral-100 flex justify-between items-center">
              <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                <Edit size={18} className="text-red-700" /> Editar Semana {editingWeek.week_number}
              </h3>
              <button onClick={() => setEditingWeek(null)} className="text-neutral-400 hover:text-neutral-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-500 uppercase block mb-1">Número da Semana</label>
                <input
                  type="number"
                  min={1}
                  value={editWeekNumber}
                  onChange={(e) => setEditWeekNumber(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-500 uppercase block mb-1">Data de Início</label>
                <input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-500 uppercase block mb-1">Data de Fim</label>
                <input
                  type="date"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            </div>
            <div className="p-4 border-t border-neutral-100 flex gap-3">
              <button onClick={() => setEditingWeek(null)} className="flex-1 py-2.5 bg-neutral-100 text-neutral-700 font-bold rounded-xl hover:bg-neutral-200 transition-colors text-sm">
                Cancelar
              </button>
              <button
                onClick={handleSaveWeek}
                disabled={savingWeek || !editWeekNumber}
                className="flex-1 py-2.5 bg-red-700 text-white font-bold rounded-xl hover:bg-red-800 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {savingWeek ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {savingWeek ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PANORAMA IA */}
      {aiReviewWeek && (
        <WeekAiReviewModal
          weekId={aiReviewWeek.id}
          weekNumber={aiReviewWeek.number}
          onClose={() => setAiReviewWeek(null)}
          onApproved={async () => {
            setAiReviewWeek(null);
            const data = await fetchWithAuth(`training_blocks/${blockId}`);
            setBlock(data);
          }}
        />
      )}

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