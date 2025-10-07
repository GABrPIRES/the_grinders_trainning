'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { ArrowLeft, Save } from 'lucide-react';
import { calculatePR } from '@/lib/calculatePR'; // Usamos a função do frontend

interface Section {
  id: string;
  carga?: number;
  series?: number;
  reps?: number;
  equip?: string;
  rpe?: number;
  pr?: number;
  feito?: boolean;
}

interface Exercise {
  id: string;
  name: string;
  sections: Section[];
}

interface Treino {
  id: string;
  name: string;
  duration_time: number;
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
        // CORREÇÃO: Usamos null em vez de undefined
        sectionToUpdate.rpe = (value === '' || isNaN(parsedRpe)) ? null : parsedRpe;
      } else {
         sectionToUpdate[field] = value;
      }

      if (sectionToUpdate.carga && sectionToUpdate.reps && sectionToUpdate.rpe) {
        const pr = calculatePR({ carga: sectionToUpdate.carga, reps: sectionToUpdate.reps, rpe: sectionToUpdate.rpe });
        // CORREÇÃO: Usamos null em vez de undefined
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
      return fetchWithAuth(`sections/${sectionId}`, {
        method: 'PATCH',
        body: JSON.stringify({ section: updatedFields })
      });
    });

    try {
      await Promise.all(promises);
      alert("Alterações salvas com sucesso!");
      setChanges({});
      fetchTreinoData();
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
      alert("Houve um erro ao salvar. Tente novamente.");
    }
  };

  if (loading) return <p className="p-6">Carregando treino...</p>;
  if (!treino) return <p className="p-6 text-red-600">Treino não encontrado.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 text-neutral-800">
      <div className="flex justify-between items-center mb-6">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-2">
            <ArrowLeft size={16} />
            Voltar para a lista de treinos
          </button>
          <h1 className="text-2xl font-bold">{treino.name}</h1>
          <p className="text-sm text-neutral-600">
            {new Date(treino.day).toLocaleDateString("pt-BR", { timeZone: 'UTC' })} - {treino.duration_time} min
          </p>
        </div>
      </div>
      
      {Object.keys(changes).length > 0 && (
        <div className="sticky top-4 z-10 mb-4">
          <button 
            onClick={handleSaveChanges} 
            className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
          >
            <Save size={18} />
            Salvar Alterações Pendentes
          </button>
        </div>
      )}

      {treino.exercicios.map((ex, exIndex) => (
        <div key={ex.id} className="mb-6 bg-white border rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-3 text-red-700">{`${exIndex + 1}. ${ex.name}`}</h2>
          
          <div className="grid grid-cols-7 gap-2 text-xs font-medium text-neutral-500 mb-1 px-1">
            <span>Carga</span><span>Séries</span><span>Reps</span><span>Equip.</span><span>RPE</span><span>PR</span><span className="text-center">Feito</span>
          </div>

          {ex.sections.map((sec, secIndex) => (
            <div key={sec.id} className="grid grid-cols-7 gap-2 text-sm mb-1 items-center p-1 rounded hover:bg-gray-50">
              <span>{sec.carga ?? '-'}</span>
              <span>{sec.series ?? '-'}</span>
              <span>{sec.reps ?? '-'}</span>
              <span>{sec.equip ?? '-'}</span>
              <input
                type="number"
                step="0.5"
                placeholder='-'
                className="border p-1 rounded w-full text-center"
                value={sec.rpe || ''}
                onChange={(e) => handleSectionChange(exIndex, secIndex, 'rpe', e.target.value)}
              />
              <span>{sec.pr ?? '-'}</span>
              <div className="text-center">
                <input
                  type="checkbox"
                  className="h-5 w-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                  checked={sec.feito || false}
                  onChange={(e) => handleSectionChange(exIndex, secIndex, 'feito', e.target.checked)}
                />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}