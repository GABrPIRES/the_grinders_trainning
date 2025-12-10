"use client";

import { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { calculatePR } from '@/lib/calculatePR';
import { fetchWithAuth } from '@/lib/api';
import { 
  ArrowLeft, ArrowRight, Save, Trash2, Plus, 
  Loader2, AlertCircle, Calendar, Dumbbell, X, Check, FileSpreadsheet 
} from 'lucide-react';

// --- Interfaces (Mantidas) ---
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
    targetWeekExists: boolean;
    targetWeekStartDate: string | null;
    targetWeekEndDate: string | null;
}

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
    initialData: Omit<ParsedData, 'id' | 'targetWeekExists' | 'targetWeekStartDate' | 'targetWeekEndDate'>[];
    alunoId: string;
    targetBlockId: string;
    onSaveSuccess: () => void;
    onCancel: () => void;
}

// Styles Comuns
const inputClass = "w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all";
const labelClass = "text-[10px] uppercase font-bold text-neutral-400 mb-1 block";

export default function ImportPreviewCarousel({ initialData, alunoId, targetBlockId, onSaveSuccess, onCancel }: ImportPreviewCarouselProps) {
    
    const [editedData, setEditedData] = useState<ParsedData[]>([]);
    const [targetBlock, setTargetBlock] = useState<TargetBlock | null>(null);
    const [loadingBlock, setLoadingBlock] = useState(true);
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
  
    // 1. Carrega e Valida
    useEffect(() => {
      if (!targetBlockId) return;
      
      const fetchAndValidate = async () => {
        try {
          setLoadingBlock(true);
          const blockData = await fetchWithAuth(`training_blocks/${targetBlockId}`);
          setTargetBlock(blockData);
  
          const validatedData = initialData.map(planilha => {
            const matchingWeek = blockData.weeks.find((w: TargetBlockWeek) => w.week_number === planilha.week_number);
            
            return {
              ...planilha,
              id: uuid(),
              targetWeekExists: !!matchingWeek,
              targetWeekStartDate: matchingWeek?.start_date ? new Date(matchingWeek.start_date).toISOString().split('T')[0] : null,
              targetWeekEndDate: matchingWeek?.end_date ? new Date(matchingWeek.end_date).toISOString().split('T')[0] : null,
              treinos: planilha.treinos.map((treino, index) => {
                
                // --- LÓGICA DE SUGESTÃO DE DATA ---
                let suggestedDate = '';
                if (matchingWeek?.start_date) {
                    // Cria a data baseada no início da semana (em UTC para evitar problemas de fuso)
                    const dateObj = new Date(matchingWeek.start_date);
                    // Adiciona dias baseado na ordem do treino (Treino 0 = +0 dias, Treino 1 = +1 dia...)
                    dateObj.setUTCDate(dateObj.getUTCDate() + index);
                    
                    // Verifica se passou do fim da semana. Se passou, fixa no último dia (opcional, mas evita erros de validação)
                    if (matchingWeek.end_date) {
                        const endDateObj = new Date(matchingWeek.end_date);
                        if (dateObj > endDateObj) {
                             suggestedDate = matchingWeek.end_date; // Trava no último dia
                        } else {
                             suggestedDate = dateObj.toISOString().split('T')[0];
                        }
                    } else {
                        suggestedDate = dateObj.toISOString().split('T')[0];
                    }
                }
                // ----------------------------------

                return {
                    ...treino,
                    id: uuid(),
                    day: suggestedDate, // <--- AQUI: Preenche automaticamente!
                    exercicios: treino.exercicios.map(ex => ({
                    ...ex,
                    id: uuid(),
                    sections: ex.sections.map(sec => ({
                        ...sec,
                        id: uuid(),
                    }))
                    }))
                };
              })
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

    // --- Helpers de Edição (Mantidos) ---
    const updateEditedData = (path: (string | number)[], value: any) => {
        setEditedData(prevData => {
        const newData = JSON.parse(JSON.stringify(prevData)); 
        let currentLevel = newData;
        for (let i = 0; i < path.length - 1; i++) {
            currentLevel = currentLevel[path[i]];
        }
        currentLevel[path[path.length - 1]] = value;
        return newData;
        });
    };

    const handleSectionChange = (treinoIndex: number, exIndex: number, secIndex: number, field: keyof ParsedSection, value: any) => {
        setEditedData(prevData => {
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
  
    const handleToggleDestroy = (path: (string | number)[]) => {
        setEditedData(prevData => {
        const newData = JSON.parse(JSON.stringify(prevData));
        let currentLevel = newData;
        for (let i = 0; i < path.length - 1; i++) {
            currentLevel = currentLevel[path[i]];
        }
        const item = currentLevel[path[path.length - 1]];
        item._destroy = !item._destroy;
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
        
        const invalidWeeks = editedData.filter(d => !d.targetWeekExists);
        if (invalidWeeks.length > 0) {
        setSaveError(`Erro: A planilha (Semana ${invalidWeeks[0].week_number}) não corresponde a nenhuma semana no bloco de destino.`);
        setIsSaving(false);
        return;
        }
        
        const dataToSave = {
        target_block_id: targetBlockId,
        imported_data: editedData.map(block => ({
            ...block,
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
            body: JSON.stringify(dataToSave),
        });
        onSaveSuccess();
        } catch (err: any) {
        setSaveError(err.message || "Erro ao salvar. Verifique se todas as datas dos treinos estão preenchidas.");
        } finally {
        setIsSaving(false);
        }
    };

    if (loadingBlock) return <div className="p-12 text-center text-neutral-500 animate-pulse">Validando planilhas...</div>;
    
    const currentItem = editedData[currentIndex];
    if (!currentItem) return <div className="p-8 text-center text-red-500">Erro ao carregar dados.</div>;

    return (
        <form onSubmit={handleFinalSave} className="bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden flex flex-col h-[80vh] md:h-auto">
            
            {/* CABEÇALHO DO CARROSSEL */}
            <div className="bg-neutral-900 text-white p-4 flex items-center justify-between shrink-0">
                <button 
                    type="button" onClick={goToPrev} disabled={currentIndex === 0} 
                    className="p-2 hover:bg-white/10 rounded-full disabled:opacity-30 transition-colors"
                >
                    <ArrowLeft size={24}/>
                </button>
                
                <div className="text-center">
                    <h2 className="text-lg font-bold flex items-center justify-center gap-2">
                        <FileSpreadsheet size={20} className="text-red-400"/>
                        {currentItem.block_title}
                    </h2>
                    <p className="text-xs text-neutral-400">
                        Planilha {currentIndex + 1} de {editedData.length} • Semana {currentItem.week_number}
                    </p>
                </div>
                
                <button 
                    type="button" onClick={goToNext} disabled={currentIndex === editedData.length - 1} 
                    className="p-2 hover:bg-white/10 rounded-full disabled:opacity-30 transition-colors"
                >
                    <ArrowRight size={24}/>
                </button>
            </div>

            {/* CONTEÚDO ROLÁVEL */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6 custom-scrollbar">
                
                {/* Validação de Semana */}
                {!currentItem.targetWeekExists && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-6">
                        <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-2" />
                        <h3 className="text-red-800 font-bold">Semana Incompatível</h3>
                        <p className="text-sm text-red-600">O bloco selecionado não possui uma Semana {currentItem.week_number}.</p>
                    </div>
                )}

                {/* LISTA DE TREINOS */}
                <div className="space-y-6">
                    {currentItem.treinos.map((treino, treinoIndex) => (
                        <div 
                            key={treino.id} 
                            className={`bg-white rounded-xl border shadow-sm transition-all ${treino._destroy ? 'border-red-200 bg-red-50 opacity-60' : 'border-neutral-200'}`}
                        >
                            {/* Header do Treino */}
                            <div className="p-4 border-b border-neutral-100 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                <div className="flex-1 w-full">
                                    <div className="flex items-center justify-between mb-2 md:mb-0">
                                        <div className="flex items-center gap-2 w-full">
                                            <Dumbbell size={18} className="text-neutral-400 shrink-0"/>
                                            <input
                                                type="text"
                                                value={treino.name}
                                                onChange={e => updateEditedData([currentIndex, 'treinos', treinoIndex, 'name'], e.target.value)}
                                                className="font-bold text-neutral-900 bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-red-500 outline-none w-full transition-colors"
                                                disabled={treino._destroy}
                                                placeholder="Nome do Treino"
                                                required
                                            />
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => handleToggleDestroy([currentIndex, 'treinos', treinoIndex])} 
                                            className="md:hidden text-neutral-400 hover:text-red-500"
                                        >
                                            {treino._destroy ? <Plus size={20} className="rotate-45"/> : <Trash2 size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="w-full md:w-auto flex items-center gap-2">
                                    <Calendar size={18} className="text-neutral-400 shrink-0"/>
                                    <div className="flex-1">
                                        <input 
                                            type="date" 
                                            className={`w-full md:w-40 text-sm border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-red-500 outline-none ${!treino.day ? 'border-red-300 bg-red-50' : 'border-neutral-300'}`}
                                            value={treino.day || ''} 
                                            onChange={e => updateEditedData([currentIndex, 'treinos', treinoIndex, 'day'], e.target.value)}
                                            disabled={treino._destroy}
                                            required
                                            min={currentItem.targetWeekStartDate || ''}
                                            max={currentItem.targetWeekEndDate || ''}
                                        />
                                        {!treino.day && <p className="text-[10px] text-red-500 mt-0.5">Data obrigatória</p>}
                                    </div>
                                </div>

                                <button 
                                    type="button" 
                                    onClick={() => handleToggleDestroy([currentIndex, 'treinos', treinoIndex])} 
                                    className="hidden md:block text-neutral-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"
                                    title={treino._destroy ? "Restaurar" : "Excluir Treino"}
                                >
                                    {treino._destroy ? <Plus size={20} className="rotate-45 text-red-500"/> : <Trash2 size={20} />}
                                </button>
                            </div>

                            {/* Lista de Exercícios */}
                            {!treino._destroy && (
                                <div className="p-4 space-y-6">
                                    {treino.exercicios.map((ex, exIndex) => (
                                        <div key={ex.id} className={`relative pl-4 border-l-2 ${ex._destroy ? 'border-red-200 opacity-50' : 'border-neutral-200 hover:border-red-400'} transition-colors`}>
                                            
                                            {/* Header Exercício */}
                                            <div className="flex justify-between items-center mb-3">
                                                <input
                                                    type="text"
                                                    className="font-semibold text-neutral-800 bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-red-500 outline-none w-full text-sm"
                                                    value={ex.name}
                                                    onChange={(e) => updateEditedData([currentIndex, 'treinos', treinoIndex, 'exercicios', exIndex, 'name'], e.target.value)}
                                                    disabled={ex._destroy}
                                                    placeholder="Nome do exercício"
                                                    required
                                                />
                                                <button type="button" onClick={() => handleToggleDestroy([currentIndex, 'treinos', treinoIndex, 'exercicios', exIndex])} className="text-neutral-300 hover:text-red-500 p-1">
                                                    <X size={16} />
                                                </button>
                                            </div>

                                            {/* DESKTOP TABLE */}
                                            <div className="hidden md:block overflow-x-auto">
                                                <table className="w-full text-left border-collapse text-xs">
                                                    <thead>
                                                        <tr className="text-neutral-400 font-bold uppercase border-b border-neutral-100">
                                                            <th className="p-2 w-32">Carga</th>
                                                            <th className="p-2 w-16">Sér</th>
                                                            <th className="p-2 w-16">Rep</th>
                                                            <th className="p-2">Equip</th>
                                                            <th className="p-2 w-16">RPE</th>
                                                            <th className="p-2 w-16">1RM</th>
                                                            <th className="p-2 w-8"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {ex.sections.map((sec, secIndex) => (
                                                            <tr key={sec.id} className={`border-b border-neutral-50 hover:bg-neutral-50 ${sec._destroy ? 'opacity-40 bg-red-50' : ''}`}>
                                                                <td className="p-1">
                                                                    <div className="flex gap-1">
                                                                        <input type="number" step="0.5" className={`${inputClass} py-1`} value={sec.carga ?? ""} onChange={(e) => handleSectionChange(treinoIndex, exIndex, secIndex, "carga", e.target.value)} disabled={sec._destroy} />
                                                                        <select className="border border-neutral-300 rounded px-1 text-[10px] bg-white outline-none" value={sec.load_unit} onChange={(e) => handleSectionChange(treinoIndex, exIndex, secIndex, "load_unit", e.target.value)} disabled={sec._destroy}>
                                                                            <option value="kg">kg</option>
                                                                            <option value="lb">lb</option>
                                                                            <option value="rir">rir</option>
                                                                        </select>
                                                                    </div>
                                                                </td>
                                                                <td className="p-1"><input type="number" className={`${inputClass} py-1`} value={sec.series ?? ""} onChange={(e) => handleSectionChange(treinoIndex, exIndex, secIndex, "series", e.target.value)} disabled={sec._destroy} /></td>
                                                                <td className="p-1"><input type="number" className={`${inputClass} py-1`} value={sec.reps ?? ""} onChange={(e) => handleSectionChange(treinoIndex, exIndex, secIndex, "reps", e.target.value)} disabled={sec._destroy} /></td>
                                                                <td className="p-1"><input type="text" className={`${inputClass} py-1`} value={sec.equip ?? ""} onChange={(e) => handleSectionChange(treinoIndex, exIndex, secIndex, "equip", e.target.value)} disabled={sec._destroy} /></td>
                                                                <td className="p-1"><input type="number" step="0.5" className={`${inputClass} py-1`} value={sec.rpe ?? ""} onChange={(e) => handleSectionChange(treinoIndex, exIndex, secIndex, "rpe", e.target.value)} disabled={sec._destroy} /></td>
                                                                <td className="p-1 text-center text-neutral-400 font-mono">{sec.pr || "-"}</td>
                                                                <td className="p-1 text-center"><button type="button" onClick={() => handleToggleDestroy([currentIndex, 'treinos', treinoIndex, 'exercicios', exIndex, 'sections', secIndex])} className="text-neutral-300 hover:text-red-500"><X size={14}/></button></td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* MOBILE CARDS */}
                                            <div className="md:hidden space-y-3">
                                                {ex.sections.map((sec, secIndex) => (
                                                    <div key={sec.id} className={`bg-neutral-50 p-3 rounded-lg border border-neutral-200 relative ${sec._destroy ? 'opacity-50' : ''}`}>
                                                        <button type="button" onClick={() => handleToggleDestroy([currentIndex, 'treinos', treinoIndex, 'exercicios', exIndex, 'sections', secIndex])} className="absolute top-2 right-2 text-neutral-300 hover:text-red-500"><X size={16}/></button>
                                                        <div className="grid grid-cols-2 gap-3 pr-6">
                                                            <div>
                                                                <span className={labelClass}>Carga</span>
                                                                <div className="flex gap-1">
                                                                    <input type="number" step="0.5" className={`${inputClass} py-1`} value={sec.carga ?? ""} onChange={(e) => handleSectionChange(treinoIndex, exIndex, secIndex, "carga", e.target.value)} disabled={sec._destroy} />
                                                                    <select className="border border-neutral-300 rounded px-1 text-xs bg-white h-[34px]" value={sec.load_unit} onChange={(e) => handleSectionChange(treinoIndex, exIndex, secIndex, "load_unit", e.target.value)} disabled={sec._destroy}>
                                                                        <option value="kg">kg</option>
                                                                        <option value="lb">lb</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div><span className={labelClass}>Reps</span><input type="number" className={`${inputClass} py-1`} value={sec.reps ?? ""} onChange={(e) => handleSectionChange(treinoIndex, exIndex, secIndex, "reps", e.target.value)} disabled={sec._destroy} /></div>
                                                            <div><span className={labelClass}>Séries</span><input type="number" className={`${inputClass} py-1`} value={sec.series ?? ""} onChange={(e) => handleSectionChange(treinoIndex, exIndex, secIndex, "series", e.target.value)} disabled={sec._destroy} /></div>
                                                            <div><span className={labelClass}>RPE</span><input type="number" step="0.5" className={`${inputClass} py-1`} value={sec.rpe ?? ""} onChange={(e) => handleSectionChange(treinoIndex, exIndex, secIndex, "rpe", e.target.value)} disabled={sec._destroy} /></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            <button type="button" onClick={() => handleAddSection(treinoIndex, exIndex)} className="text-[10px] font-bold text-blue-600 hover:underline mt-2 flex items-center gap-1" disabled={ex._destroy}><Plus size={12}/> Nova Série</button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => handleAddExercise(treinoIndex)} className="w-full py-2 border border-dashed border-neutral-300 rounded-lg text-xs font-bold text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 flex items-center justify-center gap-1" disabled={treino._destroy}><Plus size={14}/> Novo Exercício</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* FOOTER */}
            <div className="bg-white p-4 border-t border-neutral-200 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                <div className="text-sm text-neutral-500 text-center sm:text-left">
                    {saveError && <span className="text-red-600 font-medium flex items-center gap-1 mb-2 sm:mb-0"><AlertCircle size={16}/> {saveError}</span>}
                    {!saveError && <span>Revise as datas antes de salvar.</span>}
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button type="button" onClick={onCancel} className="flex-1 sm:flex-none px-4 py-2.5 bg-neutral-100 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-200 transition-colors" disabled={isSaving}>Cancelar</button>
                    <button type="submit" disabled={isSaving} className="flex-1 sm:flex-none px-6 py-2.5 bg-red-700 text-white font-bold rounded-lg hover:bg-red-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                        {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Check size={18}/>}
                        {isSaving ? 'Salvando...' : 'Confirmar Importação'}
                    </button>
                </div>
            </div>
        </form>
    );
}