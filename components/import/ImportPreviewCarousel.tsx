// components/import/ImportPreviewCarousel.tsx
"use client";

import { useState, useEffect } from 'react'; // Importe useEffect
import { v4 as uuid } from 'uuid';
import { calculatePR } from '@/lib/calculatePR';
import { fetchWithAuth } from '@/lib/api';
import { ArrowLeft, ArrowRight, Save, Trash, Plus, Loader, AlertCircle } from 'lucide-react';

export interface ParsedSection {
    id?: string; 
    carga: number | null;
    load_unit: 'kg' | 'lb' | 'rir' | string;
    series: number | null;
    reps: number | null;
    equip: string | null;
    rpe: number | null;
    pr: number | null;
    feito: boolean;
    _destroy?: boolean;
  }
  export interface ParsedExercicio {
    id?: string;
    name: string;
    sections: ParsedSection[];
    _destroy?: boolean;
  }
  export interface ParsedTreino {
    id: string;
    name: string;
    day?: string; 
    exercicios: ParsedExercicio[];
    _destroy?: boolean;
  }
  export interface ParsedData {
    id: string;
    block_title: string;
    total_weeks: number;
    week_number: number;
    treinos: ParsedTreino[];
    // Novos campos para validação
    targetWeekExists: boolean;
    targetWeekStartDate: string | null;
    targetWeekEndDate: string | null;
  }
  
  // Interface para o Bloco de Destino
  interface TargetBlockWeek {
    id: string;
    week_number: number;
    start_date: string | null;
    end_date: string | null;
  }
  interface TargetBlock {
    id: string;
    title: string;
    weeks: TargetBlockWeek[];
  }
  
  interface ImportPreviewCarouselProps {
    initialData: Omit<ParsedData, 'id' | 'targetWeekExists' | 'targetWeekStartDate' | 'targetWeekEndDate'>[]; // Recebe dados "crus"
    alunoId: string;
    targetBlockId: string; // Agora é obrigatório
    onSaveSuccess: () => void;
    onCancel: () => void;
  }
  
  // --- Componente Principal ---
  export default function ImportPreviewCarousel({ initialData, alunoId, targetBlockId, onSaveSuccess, onCancel }: ImportPreviewCarouselProps) {
    
    const [editedData, setEditedData] = useState<ParsedData[]>([]);
    const [targetBlock, setTargetBlock] = useState<TargetBlock | null>(null);
    const [loadingBlock, setLoadingBlock] = useState(true);
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
  
    // Efeito para buscar o bloco de destino e validar as semanas
    useEffect(() => {
      if (!targetBlockId) return;
      
      const fetchAndValidate = async () => {
        try {
          setLoadingBlock(true);
          const blockData = await fetchWithAuth(`training_blocks/${targetBlockId}`);
          setTargetBlock(blockData);
  
          // Agora, validamos os dados da planilha contra o bloco
          const validatedData = initialData.map(planilha => {
            const matchingWeek = blockData.weeks.find((w: TargetBlockWeek) => w.week_number === planilha.week_number);
            
            return {
              ...planilha,
              id: uuid(),
              targetWeekExists: !!matchingWeek,
              targetWeekStartDate: matchingWeek?.start_date || null,
              targetWeekEndDate: matchingWeek?.end_date || null,
              treinos: planilha.treinos.map(treino => ({
                ...treino,
                id: uuid(),
                day: '', // Data em branco por padrão
                exercicios: treino.exercicios.map(ex => ({
                  ...ex,
                  id: uuid(),
                  sections: ex.sections.map(sec => ({
                    ...sec,
                    id: uuid(),
                  }))
                }))
              }))
            };
          });
          
          setEditedData(validatedData);
  
        } catch (e) {
          setSaveError("Erro ao buscar dados do bloco de destino.");
        } finally {
          setLoadingBlock(false);
        }
      };
      
      fetchAndValidate();
    }, [initialData, targetBlockId]);

  // --- Funções de Edição ---

  // Função genérica para atualizar qualquer campo no estado
  const updateEditedData = (path: (string | number)[], value: any) => {
    setEditedData(prevData => {
      // Usamos JSON.parse/stringify para uma cópia profunda fácil
      const newData = JSON.parse(JSON.stringify(prevData)); 
      
      let currentLevel = newData;
      for (let i = 0; i < path.length - 1; i++) {
        currentLevel = currentLevel[path[i]];
      }
      currentLevel[path[path.length - 1]] = value;
      
      return newData;
    });
  };

  // Handler de Seção (com lógica de PR)
  const handleSectionChange = (treinoIndex: number, exIndex: number, secIndex: number, field: keyof ParsedSection, value: any) => {
    setEditedData(prevData => {
      // Cópia profunda para segurança
      const newData = JSON.parse(JSON.stringify(prevData));
      const section = newData[currentIndex].treinos[treinoIndex].exercicios[exIndex].sections[secIndex];

      switch (field) {
        case 'carga': case 'rpe':
          section[field] = (value === '' || isNaN(parseFloat(value))) ? null : parseFloat(value);
          break;
        case 'series': case 'reps':
          section[field] = (value === '' || isNaN(parseInt(value, 10))) ? null : parseInt(value, 10);
          break;
        case 'feito':
          section.feito = Boolean(value);
          break;
        case 'load_unit': case 'equip':
          section[field] = value || null;
          break;
        default: break;
      }

      if (section.carga && section.reps && section.rpe && section.load_unit !== 'rir') {
        const pr = calculatePR({ carga: section.carga!, reps: section.reps!, rpe: section.rpe! });
        section.pr = pr !== null ? parseFloat(pr.toFixed(2)) : null;
      } else {
        section.pr = null;
      }
      
      return newData;
    });
  };
  
  // Handlers para Adicionar/Deletar
  const handleToggleDestroy = (path: (string | number)[]) => {
     setEditedData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      
      let currentLevel = newData;
      for (let i = 0; i < path.length - 1; i++) {
        currentLevel = currentLevel[path[i]];
      }
      const item = currentLevel[path[path.length - 1]];
      item._destroy = !item._destroy; // Alterna a marcação
      
      return newData;
    });
  };

  const handleAddSection = (treinoIndex: number, exIndex: number) => {
    setEditedData(prevData => {
      const newData = [...prevData];
      newData[currentIndex].treinos[treinoIndex].exercicios[exIndex].sections.push({
          id: uuid(), carga: null, load_unit: 'kg', series: null, reps: null, equip: "", rpe: null, pr: null, feito: false
      });
      return newData;
    });
  };

  const handleAddExercise = (treinoIndex: number) => {
     setEditedData(prevData => {
      const newData = [...prevData];
      newData[currentIndex].treinos[treinoIndex].exercicios.push({
          id: uuid(), name: "Novo Exercício",
          sections: [{ id: uuid(), carga: null, load_unit: 'kg', series: null, reps: null, equip: "", rpe: null, pr: null, feito: false }]
      });
      return newData;
     });
  };


  // --- Navegação e Salvamento ---
  const goToNext = () => setCurrentIndex(prev => Math.min(prev + 1, editedData.length - 1));
  const goToPrev = () => setCurrentIndex(prev => Math.max(0, prev - 1));

  const handleFinalSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    
    // Verifica se alguma planilha é inválida (semana não encontrada)
    const invalidWeeks = editedData.filter(d => !d.targetWeekExists);
    if (invalidWeeks.length > 0) {
      setSaveError(`Erro: A planilha '${invalidWeeks[0].block_title}' (Semana ${invalidWeeks[0].week_number}) não corresponde a nenhuma semana no bloco de destino.`);
      setIsSaving(false);
      return;
    }
    
    const dataToSave = {
      target_block_id: targetBlockId, // ID do Bloco
      imported_data: editedData.map(block => ({ // Array de Semanas/Treinos
        ...block,
        // Filtra itens deletados
        treinos: (block.treinos || []).filter(t => !t._destroy).map(treino => ({
          ...treino,
          exercicios: (treino.exercicios || []).filter(ex => !ex._destroy).map(ex => ({
            ...ex,
            sections: (ex.sections || []).filter(sec => !sec._destroy)
          }))
        }))
      }))
    };
    
    try {
      await fetchWithAuth(`alunos/${alunoId}/finalize_import`, {
        method: 'POST',
        body: JSON.stringify(dataToSave), // Envia o ID do bloco E os dados
      });
      
      alert("Treinos importados e salvos com sucesso!");
      onSaveSuccess();

    } catch (err: any) {
      setSaveError(err.message || "Erro ao salvar. Verifique se todas as datas dos treinos estão preenchidas.");
    } finally {
      setIsSaving(false);
    }
 };

 // --- Renderização ---
 if (loadingBlock) return <p className="p-6 text-center">Validando planilhas contra o bloco...</p>;
 
 const currentItem = editedData[currentIndex];
 if (!currentItem) return <p className="p-6 text-center text-red-600">Erro ao carregar dados da planilha.</p>;

 return (
   <form onSubmit={handleFinalSave} className="bg-white p-4 rounded-lg border shadow-sm mt-8 relative">
     <div className="flex justify-between items-center mb-4 border-b pb-4">
       <button type="button" onClick={goToPrev} disabled={currentIndex === 0} className="p-2 disabled:opacity-30"><ArrowLeft /></button>
       <div className="text-center">
         <h2 className="text-lg font-semibold">
           Revisando: {currentItem.block_title}
         </h2>
         <p className="text-sm text-neutral-500">
           Importando para: <span className="font-medium">{targetBlock?.title}</span> (Semana {currentItem.week_number})
         </p>
       </div>
       <button type="button" onClick={goToNext} disabled={currentIndex === editedData.length - 1} className="p-2 disabled:opacity-30"><ArrowRight /></button>
     </div>

     {/* --- VALIDAÇÃO DA SEMANA --- */}
     {!currentItem.targetWeekExists ? (
       <div className="text-center p-8 bg-red-50 border border-red-300 rounded-lg">
         <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
         <h3 className="mt-2 text-lg font-semibold text-red-800">Semana Incompatível</h3>
         <p className="mt-1 text-sm text-red-600">
           A planilha "{currentItem.block_title}" (Semana {currentItem.week_number}) não pode ser importada.
         </p>
         <p className="mt-1 text-sm text-red-600">
           O bloco de destino "{targetBlock?.title}" não possui uma "Semana {currentItem.week_number}".
         </p>
       </div>
     ) : (

        <div className="space-y-6 max-h-[60vh] overflow-y-auto p-4 bg-gray-50 rounded">
          {currentItem.treinos.map((treino, treinoIndex) => (
            <div key={treino.id} className={`border p-4 rounded ${treino._destroy ? 'bg-red-50 opacity-50' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-3">
              <input
                type="text"
                value={treino.name}
                onChange={e => updateEditedData([currentIndex, 'treinos', treinoIndex, 'name'], e.target.value)}
                className="font-bold text-red-700 border px-2 py-1 rounded w-full"
                disabled={treino._destroy}
                required
              />
              <button 
                type="button" 
                onClick={() => handleToggleDestroy([currentIndex, 'treinos', treinoIndex])} 
                className="ml-2 text-red-500 hover:text-red-700"
                aria-label="Deletar Treino"
              >
                <Trash size={18} />
              </button>
            </div>
            
            <div>
                  <label className="block text-sm font-medium text-neutral-700">Data do Treino (Obrigatório)</label>
                  <input 
                    type="date" 
                    className="text-neutral-600 border p-2 rounded w-full" 
                    value={treino.day || ''} 
                    onChange={e => updateEditedData([currentIndex, 'treinos', treinoIndex, 'day'], e.target.value)}
                    disabled={treino._destroy}
                    required
                    // VALIDAÇÃO DE DATA AUTOMÁTICA
                    min={currentItem.targetWeekStartDate || ''}
                    max={currentItem.targetWeekEndDate || ''}
                  />
                   {(currentItem.targetWeekStartDate || currentItem.targetWeekEndDate) && (
                      <p className="text-xs text-neutral-500 mt-1">
                        A data deve estar entre {currentItem.targetWeekStartDate} e {currentItem.targetWeekEndDate}.
                      </p>
                    )}
              </div>

            {/* Exercícios */}
            {treino.exercicios.map((ex, exIndex) => (
              <div key={ex.id} className={`mt-4 border-t pt-3 ${ex._destroy ? 'bg-red-50 opacity-50' : ''}`}>
                <div className="flex justify-between items-center mb-2">
                  <input
                    type="text"
                    placeholder="Nome do exercício"
                    className="text-neutral-600 border p-1 rounded w-full text-sm font-medium"
                    value={ex.name}
                    onChange={(e) => updateEditedData([currentIndex, 'treinos', treinoIndex, 'exercicios', exIndex, 'name'], e.target.value)}
                    disabled={ex._destroy}
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => handleToggleDestroy([currentIndex, 'treinos', treinoIndex, 'exercicios', exIndex])} 
                    className="ml-2 text-red-500 hover:text-red-700"
                    aria-label="Deletar Exercício"
                  >
                    <Trash size={16} />
                  </button>
                </div>
                 
                 <div className="grid grid-cols-10 gap-2 text-xs font-medium text-neutral-500 mb-1 px-1">
                    <span className="col-span-3">Carga</span>
                    <span className="col-span-1">Sér</span>
                    <span className="col-span-1">Rep</span>
                    <span className="col-span-1">Equip</span>
                    <span className="col-span-1">RPE</span>
                    <span className="col-span-1">PR</span>
                    <span className="col-span-2 text-center">Feito</span>
                 </div>
                {ex.sections.map((sec, secIndex) => (
                    <div key={sec.id} className={`grid grid-cols-10 gap-2 mb-1 text-sm items-center ${sec._destroy ? 'bg-red-50 opacity-50' : ''}`}>
                        <div className="col-span-3 flex gap-1">
                            <input type="number" step="0.01" className="text-neutral-600 border p-1 rounded w-2/3" value={sec.carga ?? ""} onChange={(e) => handleSectionChange(treinoIndex, exIndex, secIndex, "carga", e.target.value)} disabled={sec._destroy} />
                            <select className="text-neutral-600 border p-1 rounded w-1/3 text-xs" value={sec.load_unit || 'kg'} onChange={(e) => handleSectionChange(treinoIndex, exIndex, secIndex, "load_unit", e.target.value)} disabled={sec._destroy}>
                                <option value="kg">kg</option>
                                <option value="lb">lb</option>
                                <option value="rir">rir</option>
                            </select>
                        </div>
                        <input type="number" className="col-span-1 text-neutral-600 border p-1 rounded" value={sec.series ?? ""} onChange={(e) => handleSectionChange(treinoIndex, exIndex, secIndex, "series", e.target.value)} disabled={sec._destroy} />
                        <input type="number" className="col-span-1 text-neutral-600 border p-1 rounded" value={sec.reps ?? ""} onChange={(e) => handleSectionChange(treinoIndex, exIndex, secIndex, "reps", e.target.value)} disabled={sec._destroy} />
                        <input type="text" className="col-span-1 text-neutral-600 border p-1 rounded" value={sec.equip ?? ""} onChange={(e) => handleSectionChange(treinoIndex, exIndex, secIndex, "equip", e.target.value)} disabled={sec._destroy} />
                        <input type="number" step="0.5" className="col-span-1 text-neutral-600 border p-1 rounded" value={sec.rpe ?? ""} onChange={(e) => handleSectionChange(treinoIndex, exIndex, secIndex, "rpe", e.target.value)} disabled={sec._destroy} />
                        <input type="number" className={`col-span-1 text-neutral-600 border p-1 rounded ${sec.load_unit === 'rir' ? 'bg-gray-200' : 'bg-gray-100'}`} value={sec.pr ?? ""} readOnly disabled={sec.load_unit === 'rir' || sec._destroy} />
                        <label className="col-span-1 flex items-center justify-center gap-1">
                            <input type="checkbox" checked={!!sec.feito} onChange={(e) => handleSectionChange(treinoIndex, exIndex, secIndex, "feito", e.target.checked)} disabled={sec._destroy} />
                        </label>
                        <button type="button" onClick={() => handleToggleDestroy([currentIndex, 'treinos', treinoIndex, 'exercicios', exIndex, 'sections', secIndex])} className="col-span-1 text-red-500 hover:text-red-700 flex justify-center items-center"><Trash size={14} /></button>
                    </div>
                ))}
                <button type="button" onClick={() => handleAddSection(treinoIndex, exIndex)} className="text-xs text-blue-600 hover:underline mt-1" disabled={ex._destroy}>+ Série</button>
              </div>
            ))}
            <button type="button" onClick={() => handleAddExercise(treinoIndex)} className="text-sm text-blue-600 hover:underline mt-2" disabled={treino._destroy}>+ Exercício</button>
            </div>
          ))}
        </div>
      )}

      {/* Botões Finais */}
      {saveError && (
          <p className="mt-4 text-sm text-red-600 flex items-center justify-center gap-1">
             <AlertCircle size={16} /> {saveError}
          </p>
      )}
      <div className="flex justify-between items-center mt-6 border-t pt-4">
        <button type="button" onClick={onCancel} className="bg-neutral-200 text-neutral-800 px-4 py-2 rounded hover:bg-neutral-300 disabled:opacity-50" disabled={isSaving}>
          Cancelar Importação
        </button>
        <button
          type="submit" // MUDADO PARA "submit"
          disabled={isSaving}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-300 flex items-center gap-2"
        >
          <Save size={18} /> {isSaving ? 'Salvando...' : 'Salvar Importação'}
        </button>
      </div>
    </form>
  );
}