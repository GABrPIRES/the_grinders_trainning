'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { ArrowLeft, Save, Dumbbell, Calendar, Info } from 'lucide-react';
import { calculatePR } from '@/lib/calculatePR';

interface Section {
  id: string;
  carga?: number | null;
  load_unit?: 'kg' | 'lb' | 'rir' | string | null;
  series?: number | null;
  reps?: number | null;
  equip?: string | null;
  rpe?: number | null;
  pr?: number | null;
  feito?: boolean | null;
}

interface Exercise {
  id: string;
  name: string;
  sections: Section[];
}

interface Treino {
  id: string;
  name: string;
  day: string;
  exercicios: Exercise[];
}

export default function AlunoTreinoDetalhesPage() {
  const { id } = useParams();
  const router = useRouter();
  const [treino, setTreino] = useState<Treino | null>(null);
  const [loading, setLoading] = useState(true);
  const [changes, setChanges] = useState<Record<string, Partial<Section>>>({});

  const fetchTreinoData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await fetchWithAuth(`meus_treinos/${id}`);
      setTreino(data);
    } catch (err) {
      console.error("Erro ao buscar treino:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreinoData();
  }, [id]);

  const handleSectionChange = (exIndex: number, secIndex: number, field: keyof Section, value: any) => {
    if (!treino) return;

    setTreino(currentTreino => {
      if (!currentTreino) return null;
      const newExercicios = JSON.parse(JSON.stringify(currentTreino.exercicios));
      const sectionToUpdate = newExercicios[exIndex].sections[secIndex];

      if (field === 'feito') {
        sectionToUpdate.feito = Boolean(value);
      } else if (field === 'rpe') {
        const parsedRpe = parseFloat(value);
        sectionToUpdate.rpe = (value === '' || isNaN(parsedRpe)) ? null : parsedRpe;
      } else {
         sectionToUpdate[field] = value;
      }

      if (sectionToUpdate.carga && sectionToUpdate.reps && sectionToUpdate.rpe && sectionToUpdate.load_unit !== 'rir') {
        const pr = calculatePR({ carga: sectionToUpdate.carga, reps: sectionToUpdate.reps, rpe: sectionToUpdate.rpe });
        sectionToUpdate.pr = pr !== null ? parseFloat(pr.toFixed(2)) : null;
      } else {
        sectionToUpdate.pr = null;
      }
      
      setChanges(prev => ({
        ...prev,
        [sectionToUpdate.id]: {
          ...prev[sectionToUpdate.id],
          feito: sectionToUpdate.feito,
          rpe: sectionToUpdate.rpe,
          pr: sectionToUpdate.pr
        }
      }));

      return { ...currentTreino, exercicios: newExercicios };
    });
  };

  const handleSaveChanges = async () => {
    const promises = Object.entries(changes).map(([sectionId, updatedFields]) => {
      const payload = {
        feito: updatedFields.feito,
        rpe: updatedFields.rpe,
        pr: updatedFields.pr
      };
      return fetchWithAuth(`sections/${sectionId}`, {
        method: 'PATCH',
        body: JSON.stringify({ section: payload })
      });
    });

    try {
      await Promise.all(promises);
      alert("Alterações salvas com sucesso!");
      setChanges({});
      fetchTreinoData(); 
    } catch (error: any) { 
      console.error("Erro ao salvar:", error);
      alert(`Erro ao salvar: ${error.message || "Tente novamente."}`);
    }
  };

  if (loading) return <div className="p-6 text-center animate-pulse">Carregando treino...</div>;
  if (!treino) return <div className="p-6 text-center text-red-600">Treino não encontrado.</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 text-neutral-800 pb-24">
      {/* Header */}
      <div className="mb-6 md:mb-8 top-0 z-10 pt-2 pb-4 border-b border-gray-200 md:static md:bg-transparent md:border-none md:p-0">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-4 transition-colors">
          <ArrowLeft size={16} />
          Voltar
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">{treino.name}</h1>
                <div className="flex items-center gap-2 text-neutral-500 mt-1 text-sm md:text-base">
                    <Calendar size={16} />
                    <span className="capitalize">{new Date(treino.day).toLocaleDateString("pt-BR", { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </div>
            </div>
            
            {Object.keys(changes).length > 0 && (
                <button 
                    onClick={handleSaveChanges} 
                    className="w-full md:w-auto bg-green-600 text-white font-bold py-3 md:py-2 px-6 rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-green-700 transition-colors animate-pulse order-first md:order-last mb-2 md:mb-0"
                >
                    <Save size={18} />
                    Salvar Alterações
                </button>
            )}
        </div>
      </div>

      {/* Lista de Exercícios */}
      <div className="space-y-6">
        {treino.exercicios.map((ex, exIndex) => (
            <div key={ex.id} className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
                {/* Título do Exercício */}
                <div className="bg-neutral-50 p-4 border-b border-neutral-100">
                    <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">
                        <Dumbbell size={20} />
                        <span className="line-clamp-1">{exIndex + 1}. {ex.name}</span>
                    </h2>
                </div>
            
                {/* Cabeçalho da Tabela (Visível APENAS no Desktop) */}
                <div className="hidden md:grid grid-cols-7 gap-2 text-xs font-semibold text-neutral-500 py-3 px-4 uppercase tracking-wide text-center border-b border-neutral-100 bg-white">
                    <span className="col-span-1">Carga</span>
                    <span className="col-span-1">Séries</span>
                    <span className="col-span-1">Reps</span>
                    <span className="col-span-1">Equip</span>
                    <span className="col-span-1">RPE Real</span>
                    <span className="col-span-1">PR Est.</span>
                    <span className="col-span-1">Feito</span>
                </div>

                {/* Linhas das Séries */}
                <div className="divide-y divide-neutral-100">
                    {ex.sections.map((sec, secIndex) => (
                        <div 
                            key={sec.id} 
                            // MOBILE: Grid de 3 colunas | DESKTOP: Grid de 7 colunas
                            className={`
                                grid grid-cols-3 md:grid-cols-7 gap-y-4 gap-x-2 md:gap-2 items-center 
                                p-4 md:p-2 transition-colors
                                ${sec.feito ? 'bg-green-50/50' : 'hover:bg-neutral-50'}
                            `}
                        >
                        
                            {/* Carga */}
                            <div className="flex flex-col md:block items-center justify-center">
                                <span className="md:hidden text-[10px] font-bold text-neutral-400 uppercase mb-1">Carga</span>
                                <span className="font-bold text-lg md:text-sm text-neutral-800">
                                    {sec.carga ?? '-'} <span className="text-xs text-neutral-400 font-normal">{sec.load_unit || 'kg'}</span>
                                </span>
                            </div>
                            
                            {/* Séries */}
                            <div className="flex flex-col md:block items-center justify-center">
                                <span className="md:hidden text-[10px] font-bold text-neutral-400 uppercase mb-1">Séries</span>
                                <span className="text-sm">{sec.series ?? '-'}</span>
                            </div>
                            
                            {/* Reps */}
                            <div className="flex flex-col md:block items-center justify-center">
                                <span className="md:hidden text-[10px] font-bold text-neutral-400 uppercase mb-1">Reps</span>
                                <span className="text-sm">{sec.reps ?? '-'}</span>
                            </div>
                            
                            {/* Equip (No mobile ocupa a linha inteira se tiver texto grande, ou fica oculto se vazio) */}
                            <div className="col-span-3 md:col-span-1 flex md:block items-center justify-center md:text-center text-xs text-neutral-500 py-1 md:py-0 bg-neutral-50 md:bg-transparent rounded md:rounded-none order-last md:order-none">
                                {sec.equip ? (
                                    <span className="flex items-center gap-1"><Info size={10} className="md:hidden"/> {sec.equip}</span>
                                ) : (
                                    <span className="hidden md:inline">-</span>
                                )}
                            </div>
                            
                            {/* RPE Input */}
                            <div className="flex flex-col md:block items-center justify-center">
                                <span className="md:hidden text-[10px] font-bold text-neutral-400 uppercase mb-1">RPE Real</span>
                                <input
                                    type="number"
                                    step="0.5"
                                    placeholder='-'
                                    className="border border-neutral-300 p-2 md:p-1 rounded-lg w-16 md:w-12 text-center text-base md:text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none bg-white"
                                    value={sec.rpe ?? ''}
                                    onChange={(e) => handleSectionChange(exIndex, secIndex, 'rpe', e.target.value)}
                                />
                            </div>
                            
                            {/* PR */}
                            <div className="flex flex-col md:block items-center justify-center">
                                <span className="md:hidden text-[10px] font-bold text-neutral-400 uppercase mb-1">PR Est.</span>
                                <span className="font-medium text-neutral-700 text-sm">
                                    {sec.pr ? `${sec.pr}kg` : '-'}
                                </span>
                            </div>
                            
                            {/* Checkbox Feito */}
                            <div className="flex flex-col md:block items-center justify-center">
                                <span className="md:hidden text-[10px] font-bold text-neutral-400 uppercase mb-1">Feito?</span>
                                <input
                                    type="checkbox"
                                    className="h-6 w-6 md:h-5 md:w-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer accent-red-600"
                                    checked={!!sec.feito}
                                    onChange={(e) => handleSectionChange(exIndex, secIndex, 'feito', e.target.checked)}
                                />
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}