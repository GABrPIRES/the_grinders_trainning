'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { ArrowLeft, Save, Dumbbell, Calendar } from 'lucide-react';
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
    } catch (error: any) { // Tipar como any para acessar .message
      console.error("Erro ao salvar:", error);
      // Mostra a mensagem de erro específica da API (ex: "O RPE deve ser...")
      alert(`Erro ao salvar: ${error.message || "Tente novamente."}`);
    }
  };

  if (loading) return <div className="p-6 text-center">Carregando treino...</div>;
  if (!treino) return <div className="p-6 text-center text-red-600">Treino não encontrado.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 text-neutral-800">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-4 transition-colors">
          <ArrowLeft size={16} />
          Voltar para o Programa
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-neutral-900">{treino.name}</h1>
                <div className="flex items-center gap-2 text-neutral-500 mt-1">
                    <Calendar size={16} />
                    <span>{new Date(treino.day).toLocaleDateString("pt-BR", { timeZone: 'UTC' })}</span>
                </div>
            </div>
            
            {Object.keys(changes).length > 0 && (
                <button 
                    onClick={handleSaveChanges} 
                    className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow-md flex items-center gap-2 hover:bg-green-700 transition-colors animate-pulse"
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
            <div key={ex.id} className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-lg font-bold mb-4 text-red-700 flex items-center gap-2">
                <Dumbbell size={20} />
                {exIndex + 1}. {ex.name}
            </h2>
            
            {/* Cabeçalho da Tabela */}
            <div className="grid grid-cols-7 gap-2 text-xs font-semibold text-neutral-500 mb-2 px-2 uppercase tracking-wide text-center">
                <span className="col-span-1">Carga</span>
                <span className="col-span-1">Séries</span>
                <span className="col-span-1">Reps</span>
                <span className="col-span-1">Equip</span>
                <span className="col-span-1">RPE Real</span>
                <span className="col-span-1">PR Est.</span>
                <span className="col-span-1">Feito</span>
            </div>

            {/* Linhas das Séries */}
            <div className="space-y-1">
                {ex.sections.map((sec, secIndex) => (
                    <div key={sec.id} className={`grid grid-cols-7 gap-2 text-sm items-center p-2 rounded-lg transition-colors ${sec.feito ? 'bg-green-50 border border-green-100' : 'bg-neutral-50 hover:bg-neutral-100'}`}>
                    
                    {/* Carga */}
                    <span className="font-medium text-center">
                        {sec.carga ?? '-'} <span className="text-xs text-neutral-400">{sec.load_unit || 'kg'}</span>
                    </span>
                    
                    {/* Séries */}
                    <span className="text-center">{sec.series ?? '-'}</span>
                    
                    {/* Reps */}
                    <span className="text-center">{sec.reps ?? '-'}</span>
                    
                    {/* Equip */}
                    <span className="text-center text-xs text-neutral-500 truncate">{sec.equip || '-'}</span>
                    
                    {/* RPE Input */}
                    <div className="flex justify-center">
                        <input
                            type="number"
                            step="0.5"
                            placeholder='-'
                            className="border border-neutral-300 p-1 rounded w-12 text-center text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                            value={sec.rpe ?? ''}
                            onChange={(e) => handleSectionChange(exIndex, secIndex, 'rpe', e.target.value)}
                        />
                    </div>
                    
                    {/* PR */}
                    <span className="text-center font-medium text-neutral-700">
                        {sec.pr ? `${sec.pr}kg` : '-'}
                    </span>
                    
                    {/* Checkbox Feito */}
                    <div className="flex justify-center">
                        <input
                        type="checkbox"
                        className="h-5 w-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer accent-red-600"
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