"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api";
import { X, Copy, Loader2, User, Calendar, Hash, ChevronRight } from "lucide-react";

interface Student {
  id: string;
  user: { name: string };
}

interface Block {
  id: string;
  title: string;
}

interface Week {
  id: string;
  week_number: number;
  start_date: string;
  end_date: string;
}

interface DuplicateWeekModalProps {
  sourceWeekId: string;
  sourceWeekNumber: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DuplicateWeekModal({ sourceWeekId, sourceWeekNumber, onClose, onSuccess }: DuplicateWeekModalProps) {
  // Dados para os Selects
  const [students, setStudents] = useState<Student[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);

  // Seleções do Usuário
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedBlockId, setSelectedBlockId] = useState("");
  const [targetWeekId, setTargetWeekId] = useState("");

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // 1. Carrega Alunos ao abrir
  useEffect(() => {
    const loadStudents = async () => {
      setLoadingData(true);
      try {
        // Trazemos um limite alto para garantir que todos apareçam
        const data = await fetchWithAuth("alunos?limit=100");
        setStudents(data.alunos || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingData(false);
      }
    };
    loadStudents();
  }, []);

  // 2. Carrega Blocos quando escolhe Aluno
  useEffect(() => {
    if (!selectedStudentId) {
        setBlocks([]); 
        setWeeks([]);
        return;
    }
    const loadBlocks = async () => {
      setLoadingData(true);
      try {
        const data = await fetchWithAuth(`alunos/${selectedStudentId}/training_blocks`);
        setBlocks(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingData(false);
      }
    };
    loadBlocks();
  }, [selectedStudentId]);

  // 3. Carrega Semanas quando escolhe Bloco
  useEffect(() => {
    if (!selectedBlockId) {
        setWeeks([]);
        return;
    }
    const loadWeeks = async () => {
      setLoadingData(true);
      try {
        const data = await fetchWithAuth(`training_blocks/${selectedBlockId}`);
        // Ordena semanas
        const sortedWeeks = (data.weeks || []).sort((a: Week, b: Week) => a.week_number - b.week_number);
        setWeeks(sortedWeeks);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingData(false);
      }
    };
    loadWeeks();
  }, [selectedBlockId]);

  const handleDuplicate = async () => {
    if (!targetWeekId) return;
    setLoading(true);
    try {
      await fetchWithAuth(`weeks/${sourceWeekId}/duplicate`, {
        method: "POST",
        body: JSON.stringify({ target_week_id: targetWeekId }),
      });
      onSuccess();
    } catch (error: any) {
      alert("Erro ao duplicar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "S/D";
    return new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-neutral-900 text-white p-5 flex justify-between items-center">
          <div>
             <h3 className="font-bold text-lg flex items-center gap-2">
                <Copy size={18} className="text-red-500" /> Duplicar Semana {sourceWeekNumber}
             </h3>
             <p className="text-xs text-neutral-400 mt-1">Copie todos os treinos para outra semana.</p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
            
            {/* Passo 1: Aluno */}
            <div>
                <label className="text-xs font-bold text-neutral-500 uppercase mb-2 block">1. Para qual Aluno?</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18}/>
                    <select 
                        className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl appearance-none bg-white focus:ring-2 focus:ring-red-500 outline-none text-neutral-800"
                        value={selectedStudentId}
                        onChange={(e) => { setSelectedStudentId(e.target.value); setSelectedBlockId(""); setTargetWeekId(""); }}
                    >
                        <option value="">Selecione o aluno...</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.user.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Passo 2: Bloco */}
            <div className={!selectedStudentId ? 'opacity-50 pointer-events-none' : ''}>
                <label className="text-xs font-bold text-neutral-500 uppercase mb-2 block">2. Qual Bloco?</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18}/>
                    <select 
                        className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl appearance-none bg-white focus:ring-2 focus:ring-red-500 outline-none text-neutral-800"
                        value={selectedBlockId}
                        onChange={(e) => { setSelectedBlockId(e.target.value); setTargetWeekId(""); }}
                        disabled={!selectedStudentId}
                    >
                        <option value="">Selecione o bloco...</option>
                        {blocks.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                    </select>
                </div>
            </div>

            {/* Passo 3: Semana */}
            <div className={!selectedBlockId ? 'opacity-50 pointer-events-none' : ''}>
                <label className="text-xs font-bold text-neutral-500 uppercase mb-2 block">3. Semana de Destino</label>
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar border border-neutral-200 rounded-xl p-2">
                    {loadingData && weeks.length === 0 ? (
                        <div className="p-4 text-center"><Loader2 className="animate-spin mx-auto text-neutral-400" size={20}/></div>
                    ) : weeks.length === 0 ? (
                         <p className="text-xs text-center p-2 text-neutral-400">Nenhuma semana encontrada.</p>
                    ) : (
                        weeks.map(w => (
                            <button
                                key={w.id}
                                onClick={() => setTargetWeekId(w.id)}
                                className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-all ${
                                    targetWeekId === w.id 
                                        ? 'bg-red-50 border border-red-200 text-red-800' 
                                        : 'hover:bg-neutral-50 border border-transparent text-neutral-600'
                                }`}
                            >
                                <span className="font-bold flex items-center gap-2">
                                    <Hash size={14}/> Semana {w.week_number}
                                </span>
                                <span className="text-xs text-neutral-400 font-mono">
                                    {formatDate(w.start_date)} - {formatDate(w.end_date)}
                                </span>
                            </button>
                        ))
                    )}
                </div>
                {targetWeekId && (
                    <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                        ⚠️ Atenção: Isso irá adicionar os treinos à semana selecionada.
                    </p>
                )}
            </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-neutral-100 bg-neutral-50 flex justify-end gap-3">
            <button 
                onClick={onClose} 
                className="px-5 py-2.5 text-sm font-bold text-neutral-600 hover:bg-neutral-200 rounded-lg transition-colors"
            >
                Cancelar
            </button>
            <button 
                onClick={handleDuplicate} 
                disabled={!targetWeekId || loading}
                className="px-6 py-2.5 text-sm font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Copy size={16} />}
                Confirmar Cópia
            </button>
        </div>

      </div>
    </div>
  );
}