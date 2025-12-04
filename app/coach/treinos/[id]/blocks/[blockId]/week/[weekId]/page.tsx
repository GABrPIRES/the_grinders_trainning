"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { 
  ArrowLeft, Calendar, Plus, Dumbbell, 
  MoreVertical, Edit, Trash2, Copy, X, Loader2,
  ChevronRight, User, Layers
} from "lucide-react";

// --- Interfaces ---
interface Treino {
  id: string;
  name: string;
  day?: string;
  description?: string;
}
interface Week {
  id: string;
  week_number: number;
  start_date: string;
  end_date: string;
  treinos: Treino[];
}
// Interfaces para o dropdown de destino
interface DropdownOption { id: string; label: string; }
interface BlockData { id: string; title: string; weeks: { id: string; week_number: number; start_date: string }[] }

export default function WeekDetailsPage() {
  const { id: currentAlunoId, blockId: currentBlockId, weekId: currentWeekId } = useParams();
  const router = useRouter();
  
  const [week, setWeek] = useState<Week | null>(null);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // --- Estados do Modal de Duplicação ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [sourceTreino, setSourceTreino] = useState<Treino | null>(null);

  // Dados para os Selects
  const [students, setStudents] = useState<DropdownOption[]>([]);
  const [blocks, setBlocks] = useState<DropdownOption[]>([]);
  const [weeks, setWeeks] = useState<DropdownOption[]>([]);

  // Seleções do Usuário
  const [targetAlunoId, setTargetAlunoId] = useState<string>("");
  const [targetBlockId, setTargetBlockId] = useState<string>("");
  const [targetWeekId, setTargetWeekId] = useState<string>("");
  
  const [newName, setNewName] = useState("");
  const [newDay, setNewDay] = useState("");

  // Loading states dos selects
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [loadingWeeks, setLoadingWeeks] = useState(false);

  // 1. Carrega a semana atual
  useEffect(() => {
    async function loadWeek() {
      try {
        const data = await fetchWithAuth(`weeks/${currentWeekId}`);
        setWeek(data);
      } catch (error) {
        console.error("Erro ao carregar semana:", error);
      } finally {
        setLoading(false);
      }
    }
    loadWeek();
  }, [currentWeekId]);

  // 2. Carrega lista de alunos (apenas uma vez, quando abre o modal ou a pág)
  useEffect(() => {
    async function loadStudents() {
      try {
        const data = await fetchWithAuth("alunos?limit=100"); // Pega todos
        const list = (data.alunos || []).map((a: any) => ({ id: a.id, label: a.user.name }));
        setStudents(list);
      } catch (err) { console.error(err); }
    }
    loadStudents();
  }, []);

  // 3. Efeito Cascata: Mudou Aluno -> Busca Blocos
  useEffect(() => {
    if (!targetAlunoId) { setBlocks([]); return; }
    async function loadBlocks() {
      setLoadingBlocks(true);
      try {
        const data = await fetchWithAuth(`alunos/${targetAlunoId}/training_blocks`);
        setBlocks(data.map((b: any) => ({ id: b.id, label: b.title })));
        
        // Se for o aluno atual, pré-seleciona o bloco atual
        if (targetAlunoId === currentAlunoId && data.some((b:any) => b.id === currentBlockId)) {
            setTargetBlockId(currentBlockId as string);
        } else {
            setTargetBlockId(""); // Reseta se mudou de aluno
        }
      } catch (err) { console.error(err); }
      finally { setLoadingBlocks(false); }
    }
    loadBlocks();
  }, [targetAlunoId, currentAlunoId, currentBlockId]);

  // 4. Efeito Cascata: Mudou Bloco -> Busca Semanas
  useEffect(() => {
    if (!targetBlockId) { setWeeks([]); return; }
    async function loadWeeks() {
      setLoadingWeeks(true);
      try {
        // Precisamos dos detalhes do bloco para pegar as semanas
        const data = await fetchWithAuth(`training_blocks/${targetBlockId}`);
        const sortedWeeks = (data.weeks || []).sort((a: any, b: any) => a.week_number - b.week_number);
        
        setWeeks(sortedWeeks.map((w: any) => ({ 
            id: w.id, 
            label: `Semana ${w.week_number} (${formatDateMini(w.start_date)})` 
        })));

        // Se for o bloco atual, pré-seleciona a semana atual
        if (targetBlockId === currentBlockId && sortedWeeks.some((w:any) => w.id === currentWeekId)) {
            setTargetWeekId(currentWeekId as string);
        } else if (sortedWeeks.length > 0) {
            setTargetWeekId(sortedWeeks[0].id); // Seleciona a primeira por padrão
        } else {
            setTargetWeekId("");
        }
      } catch (err) { console.error(err); }
      finally { setLoadingWeeks(false); }
    }
    loadWeeks();
  }, [targetBlockId, currentBlockId, currentWeekId]);


  // --- Handlers ---

  const handleDeleteTreino = async (treinoId: string) => {
    if (!confirm("Tem certeza que deseja excluir este treino?")) return;
    try {
      await fetchWithAuth(`treinos/${treinoId}`, { method: 'DELETE' });
      if (week) setWeek({ ...week, treinos: week.treinos.filter(t => t.id !== treinoId) });
    } catch (error) { alert("Erro ao excluir."); }
  };

  const openDuplicateModal = (treino: Treino) => {
    setSourceTreino(treino);
    setNewName(`${treino.name} (Cópia)`);
    setNewDay(treino.day ? new Date(treino.day).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    
    // Inicializa com o contexto ATUAL
    setTargetAlunoId(currentAlunoId as string);
    // Os useEffects vão cuidar de carregar blocos/semanas e setar os IDs atuais
    
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleConfirmDuplicate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceTreino || !targetWeekId) return;

    setDuplicating(true);
    try {
        await fetchWithAuth(`treinos/${sourceTreino.id}/duplicate`, {
            method: 'POST',
            body: JSON.stringify({
                duplication: {
                    week_id: targetWeekId,
                    name: newName,
                    day: newDay
                }
            })
        });
        
        alert("Treino duplicado com sucesso!");
        setIsModalOpen(false);

        // Se duplicou para a MESMA semana que estamos vendo, recarrega
        if (targetWeekId === currentWeekId) {
            window.location.reload();
        } else {
            // Se duplicou para outro lugar, pergunta se quer ir lá
            if(confirm("Treino enviado para outra semana. Deseja ir para lá agora?")) {
                // Precisamos descobrir a URL correta. Como é complexo montar a URL completa sem ter os dados do aluno/bloco de destino no state de forma fácil, 
                // vamos simplificar: se for outro aluno/bloco, o usuário navega manualmente.
                // Mas se for o mesmo aluno/bloco e só mudou a semana:
                if (targetAlunoId === currentAlunoId && targetBlockId === currentBlockId) {
                    router.push(`/coach/treinos/${targetAlunoId}/blocks/${targetBlockId}/week/${targetWeekId}`);
                }
            }
        }
    } catch (err: any) {
        alert("Erro ao duplicar: " + err.message);
    } finally {
        setDuplicating(false);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "--/--";
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' });
  };
  const formatDateMini = (date: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
  };

  if (loading) return <div className="p-12 text-center text-neutral-500 animate-pulse">Carregando treinos...</div>;
  if (!week) return <div className="p-12 text-center text-red-500">Semana não encontrada.</div>;

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-8 text-neutral-800" onClick={() => setOpenMenuId(null)}>
      
      {/* CABEÇALHO DA PÁGINA (Igual ao anterior) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(`/coach/treinos/${currentAlunoId}/blocks/${currentBlockId}`)} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500"><ArrowLeft size={24} /></button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Semana {week.week_number}</h1>
            <div className="flex items-center gap-2 text-sm text-neutral-500 mt-1"><Calendar size={14} /><span>{formatDate(week.start_date)} - {formatDate(week.end_date)}</span></div>
          </div>
        </div>
        <button onClick={() => router.push(`/coach/treinos/${currentAlunoId}/blocks/${currentBlockId}/week/${currentWeekId}/create`)} className="bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-red-800 transition-all shadow-md flex items-center gap-2 w-full md:w-auto justify-center"><Plus size={20} /> Novo Treino</button>
      </div>

      {/* LISTA DE TREINOS (Cards) */}
      {week.treinos && week.treinos.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
           {week.treinos.map((treino) => (
             <div key={treino.id} className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all group relative cursor-pointer" onClick={() => router.push(`/coach/treinos/${currentAlunoId}/${treino.id}`)}>
                <div className="flex justify-between items-start">
                   <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                         <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-100"><Dumbbell size={20} /></div>
                         <div>
                            <h3 className="text-lg font-bold text-neutral-900 group-hover:text-red-700 transition-colors">{treino.name}</h3>
                            <p className="text-xs text-neutral-500 font-medium uppercase tracking-wide">{treino.day ? formatDate(treino.day) : "Data não definida"}</p>
                         </div>
                      </div>
                      {treino.description && <p className="text-sm text-neutral-600 pl-14 line-clamp-2">{treino.description}</p>}
                   </div>
                   <div className="relative">
                      <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === treino.id ? null : treino.id); }} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-neutral-600 transition-colors z-10 relative"><MoreVertical size={20} /></button>
                      {openMenuId === treino.id && (
                         <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-xl border border-neutral-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                            <button onClick={(e) => { e.stopPropagation(); router.push(`/coach/treinos/${currentAlunoId}/${treino.id}`); }} className="w-full text-left px-4 py-3 hover:bg-neutral-50 flex items-center gap-2 text-sm text-neutral-700 font-medium"><Edit size={16} /> Editar Treino</button>
                            <button onClick={(e) => { e.stopPropagation(); openDuplicateModal(treino); }} className="w-full text-left px-4 py-3 hover:bg-neutral-50 flex items-center gap-2 text-sm text-neutral-700 font-medium"><Copy size={16} /> Duplicar</button>
                            <div className="h-px bg-neutral-100 my-0"></div>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteTreino(treino.id); }} className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-2 text-sm text-red-600 font-medium"><Trash2 size={16} /> Excluir</button>
                         </div>
                      )}
                   </div>
                </div>
             </div>
           ))}
        </div>
      ) : (
        <div className="bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-2xl p-12 text-center flex flex-col items-center">
           <Dumbbell size={48} className="text-neutral-300 mb-4" />
           <h3 className="text-lg font-bold text-neutral-700">Semana Vazia</h3>
           <button onClick={() => router.push(`/coach/treinos/${currentAlunoId}/blocks/${currentBlockId}/week/${currentWeekId}/create`)} className="text-red-700 font-bold hover:underline">Adicionar Treino Agora</button>
        </div>
      )}

      {/* MODAL DE DUPLICAÇÃO AVANÇADA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
            <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                
                <div className="p-5 border-b border-neutral-100 flex justify-between items-center bg-neutral-50 shrink-0">
                    <h3 className="font-bold text-lg text-neutral-900 flex items-center gap-2">
                        <Copy size={20} className="text-red-700"/> Duplicar Treino
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-red-600"><X size={20} /></button>
                </div>
                
                <form onSubmit={handleConfirmDuplicate} className="p-6 space-y-5 overflow-y-auto">
                    
                    {/* ORIGEM */}
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800 flex items-center gap-2">
                        <span className="font-bold shrink-0">Origem:</span> {sourceTreino?.name}
                    </div>

                    {/* DESTINO */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-neutral-400 uppercase border-b pb-1 mb-2">Destino da Cópia</h4>
                        
                        {/* Select Aluno */}
                        <div>
                            <label className="block text-sm font-bold text-neutral-700 mb-1 flex items-center gap-2"><User size={14}/> Aluno</label>
                            <select 
                                className="w-full border border-neutral-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-red-500 outline-none"
                                value={targetAlunoId}
                                onChange={(e) => setTargetAlunoId(e.target.value)}
                            >
                                <option value="">Selecione...</option>
                                {students.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                            </select>
                        </div>

                        {/* Select Bloco */}
                        <div>
                            <label className="block text-sm font-bold text-neutral-700 mb-1 flex items-center gap-2"><Layers size={14}/> Bloco</label>
                            <select 
                                className="w-full border border-neutral-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-red-500 outline-none disabled:bg-neutral-100 disabled:text-neutral-400"
                                value={targetBlockId}
                                onChange={(e) => setTargetBlockId(e.target.value)}
                                disabled={!targetAlunoId || loadingBlocks}
                            >
                                <option value="">{loadingBlocks ? "Carregando..." : "Selecione o Bloco"}</option>
                                {blocks.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                            </select>
                        </div>

                        {/* Select Semana */}
                        <div>
                            <label className="block text-sm font-bold text-neutral-700 mb-1 flex items-center gap-2"><Calendar size={14}/> Semana</label>
                            <select 
                                className="w-full border border-neutral-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-red-500 outline-none disabled:bg-neutral-100 disabled:text-neutral-400"
                                value={targetWeekId}
                                onChange={(e) => setTargetWeekId(e.target.value)}
                                disabled={!targetBlockId || loadingWeeks}
                            >
                                <option value="">{loadingWeeks ? "Carregando..." : "Selecione a Semana"}</option>
                                {weeks.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* DETALHES DO NOVO TREINO */}
                    <div className="space-y-4 pt-4 border-t border-neutral-100">
                        <h4 className="text-xs font-bold text-neutral-400 uppercase border-b pb-1 mb-2">Dados do Novo Treino</h4>
                        <div>
                            <label className="block text-sm font-bold text-neutral-600 mb-1">Nome</label>
                            <input 
                                type="text" 
                                className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-neutral-600 mb-1">Data</label>
                            <input 
                                type="date" 
                                className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                value={newDay}
                                onChange={(e) => setNewDay(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-neutral-100 text-neutral-700 font-bold rounded-xl hover:bg-neutral-200 transition-colors">Cancelar</button>
                        <button type="submit" disabled={duplicating || !targetWeekId} className="flex-1 py-3 bg-red-700 text-white font-bold rounded-xl hover:bg-red-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                            {duplicating ? <Loader2 className="animate-spin" size={20} /> : <Copy size={20} />}
                            {duplicating ? "Copiando..." : "Confirmar Cópia"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}