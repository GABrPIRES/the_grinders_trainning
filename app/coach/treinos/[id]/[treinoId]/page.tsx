"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Pencil, Copy, Plus, Trash } from "lucide-react";
import { calculatePR } from "@/lib/calculatePR";
import { v4 as uuid } from "uuid";
import { fetchWithAuth } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

// Tipos atualizados para snake_case e com a flag 'isNew'
interface Section {
  id: string;
  isNew?: boolean; // Flag para novos itens
  carga?: number;
  series?: number;
  reps?: number;
  equip?: string;
  rpe?: number;
  pr?: number;
  feito?: boolean;
  _destroy?: boolean;
  [key: string]: string | number | boolean | undefined;
}

interface Exercise {
  id: string;
  isNew?: boolean; // Flag para novos itens
  name: string;
  sections: Section[];
  _destroy?: boolean;
}

interface Treino {
  id: string;
  name: string;
  day: string;
  aluno_id: string;
  exercicios: Exercise[];
}

export default function ViewTreinoPage() {
  const { id: alunoId, treinoId } = useParams();
  const router = useRouter();
  const [treino, setTreino] = useState<Treino | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState("");
  const [isDuplicateModalOpen, setDuplicateModalOpen] = useState(false);

  const fetchTreinoData = async () => {
    if (!treinoId) return;
    setLoading(true);
    try {
      const data = await fetchWithAuth(`treinos/${treinoId}`);
      setTreino(data);
    } catch (err: any) {
      setError("Erro ao buscar treino: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreinoData();
  }, [treinoId]);

  const handleChange = (exIndex: number, secIndex: number, field: string, value: any) => {
    if (!treino) return;
    const updated = { ...treino };
    const section = updated.exercicios[exIndex].sections[secIndex];
    
    if (field === 'feito') section[field] = value;
    else if (['carga', 'rpe'].includes(field)) section[field] = value === '' ? undefined : parseFloat(value);
    else if (['series', 'reps'].includes(field)) section[field] = value === '' ? undefined : parseInt(value, 10);
    else section[field] = value;

    const { carga, reps, rpe } = section;
    if (carga && reps && rpe) {
      const pr = calculatePR({ carga, reps, rpe });
      if (pr !== null) section.pr = parseFloat(pr.toFixed(2));
    }
    setTreino(updated);
  };

  const handleAddExercise = () => {
    if (!treino) return;
    const newExercise: Exercise = {
      id: uuid(),
      isNew: true, // Mar_ADD_EXERCISE)
      name: "Novo exercício",
      sections: [{ id: uuid(), isNew: true, carga: undefined, series: undefined, reps: undefined, equip: "", rpe: undefined, feito: false }],
    };
    setTreino({ ...treino, exercicios: [...treino.exercicios, newExercise] });
  };

  const handleAddSection = (exIndex: number) => {
    if (!treino) return;
    const updated = { ...treino };
    updated.exercicios[exIndex].sections.push({ id: uuid(), isNew: true, carga: undefined, series: undefined, reps: undefined, equip: "", rpe: undefined, feito: false });
    setTreino(updated);
  };
  
  const handleDeleteExercise = (exIndex: number) => {
    if (!treino) return;
    const updatedExercicios = treino.exercicios.map((ex, index) => 
      index === exIndex ? { ...ex, _destroy: true } : ex
    );
    setTreino({ ...treino, exercicios: updatedExercicios });
  };

  const handleDeleteSection = (exIndex: number, secIndex: number) => {
    if (!treino) return;
    const updatedExercicios = [...treino.exercicios];
    updatedExercicios[exIndex].sections = updatedExercicios[exIndex].sections.map((sec, index) => 
      index === secIndex ? { ...sec, _destroy: true } : sec
    );
    setTreino({ ...treino, exercicios: updatedExercicios });
  };

  const handleSave = async () => {
    if (!treino) return;
    try {
      const payload = {
        treino: {
          name: treino.name,
          day: new Date(treino.day).toISOString().split("T")[0],
          exercicios_attributes: treino.exercicios
            .map(ex => ({
            id: ex.isNew ? undefined : ex.id, // CORREÇÃO: Envia ID apenas se NÃO for novo
            name: ex.name,
            _destroy: ex._destroy,
            sections_attributes: ex.sections
              .map(sec => ({
              id: sec.isNew ? undefined : sec.id, // CORREÇÃO: Envia ID apenas se NÃO for novo
              _destroy: sec._destroy,
              carga: sec.carga, series: sec.series, reps: sec.reps, equip: sec.equip,
              rpe: sec.rpe, pr: sec.pr, feito: sec.feito
            }))
          }))
        }
      };

      await fetchWithAuth(`treinos/${treino.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      alert('Treino atualizado com sucesso!');
      setEditMode(false);
      fetchTreinoData(); // Recarrega os dados do servidor para obter os novos IDs

    } catch (err: any) {
      alert('Erro ao atualizar treino: ' + err.message);
    }
  };

  const handleDeleteTreino = async () => {
    if (!treino) return;
    if (!window.confirm("Tem certeza que deseja excluir este treino?")) return;
    try {
      await fetchWithAuth(`treinos/${treino.id}`, { method: 'DELETE' });
      alert("Treino deletado com sucesso.");
      router.push(`/coach/treinos/${alunoId}`);
    } catch (err: any) {
      alert("Erro ao deletar treino: " + err.message);
    }
  };

  if (loading) return <p className="p-6">Carregando treino...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!treino) return <p className="p-6 text-red-600">Treino não encontrado.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 text-neutral-800">
      <div className="border-b pb-4 mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-2">
          <ArrowLeft size={16} />
          Voltar para a lista de treinos
        </button>
      </div>
      <div className="flex justify-between items-start mb-4">
        <div className="w-full">
          {editMode ? (
            <div className="flex flex-col gap-2 mb-4">
              <input type="text" className="border p-2 rounded font-bold text-xl max-w-96" value={treino.name} onChange={(e) => setTreino({ ...treino, name: e.target.value })}/>
              <div className="flex gap-2">
                <input type="date" className="border p-2 rounded text-sm max-w-40" value={new Date(treino.day).toISOString().split("T")[0]} onChange={(e) => setTreino({ ...treino, day: e.target.value })}/>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-2">{treino.name}</h1>
            </>
          )}
        </div>
        <div className="flex gap-2 pt-1">
        <button onClick={() => setDuplicateModalOpen(true)} className="p-2 border border-neutral-300 rounded cursor-pointer hover:bg-neutral-100"><Copy size={18} /></button>
        <button onClick={() => setEditMode(!editMode)} className={`p-2 border rounded cursor-pointer transition-colors ${editMode ? 'bg-red-700 text-white border-red-700' : 'hover:bg-red-700 hover:text-white'}`}><Pencil size={18} /></button>
        </div>
      </div>

      {!editMode && (<button onClick={handleDeleteTreino} className="mb-6 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-800"><Trash className="inline mr-1" size={16} /> Deletar treino</button>)}

      {treino.exercicios.map((ex, exIndex) => {
        if (ex._destroy) return null;
        return (
          <div key={ex.id} className="mb-6 bg-white border rounded p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold w-full">{editMode ? (<input type="text" className="border p-1 rounded w-full" value={ex.name} onChange={(e) => { const updated = { ...treino }; updated.exercicios[exIndex].name = e.target.value; setTreino(updated); }}/>) : (`${exIndex + 1}. ${ex.name}`)}</h2>
              {editMode && (<button onClick={() => handleDeleteExercise(exIndex)} className="text-red-500 hover:text-red-700 ml-4"><Trash size={18} /></button>)}
            </div>
            <div className="grid grid-cols-7 gap-2 text-xs font-medium text-neutral-500 mb-1 px-1"><span>Carga</span><span>Séries</span><span>Reps</span><span>Equip.</span><span>RPE</span><span>PR</span><span>Feito</span></div>
            {ex.sections.map((sec, secIndex) => {
              if (sec._destroy) return null;
              return (
                <div key={sec.id} className="grid grid-cols-7 gap-2 text-sm mb-1 items-center relative pr-6">
                  {editMode ? (
                    <>
                      <input type="number" step="0.01" className="border p-1 rounded" value={sec.carga ?? ""} onChange={(e) => handleChange(exIndex, secIndex, "carga", e.target.value)} />
                      <input type="number" className="border p-1 rounded" value={sec.series ?? ""} onChange={(e) => handleChange(exIndex, secIndex, "series", e.target.value)} />
                      <input type="number" className="border p-1 rounded" value={sec.reps ?? ""} onChange={(e) => handleChange(exIndex, secIndex, "reps", e.target.value)} />
                      <input type="text" className="border p-1 rounded" value={sec.equip ?? ""} onChange={(e) => handleChange(exIndex, secIndex, "equip", e.target.value)} />
                      <input type="number" step="0.5" className="border p-1 rounded" value={sec.rpe ?? ""} onChange={(e) => handleChange(exIndex, secIndex, "rpe", e.target.value)} />
                      <input type="number" className="border p-1 rounded bg-gray-100" value={sec.pr ?? ""} readOnly />
                      <input type="checkbox" className="justify-self-center" checked={sec.feito || false} onChange={(e) => handleChange(exIndex, secIndex, "feito", e.target.checked)} />
                      <button onClick={() => handleDeleteSection(exIndex, secIndex)} className="absolute top-1 right-0 text-red-500 hover:text-red-700"><Trash size={14} /></button>
                    </>
                  ) : (
                    <>
                      <span className="p-1">{sec.carga ?? '-'}</span><span className="p-1">{sec.series ?? '-'}</span><span className="p-1">{sec.reps ?? '-'}</span><span className="p-1">{sec.equip ?? '-'}</span><span className="p-1">{sec.rpe ?? '-'}</span><span className="p-1">{sec.pr ?? '-'}</span><span className="p-1 justify-self-center">{sec.feito ? "✅" : "❌"}</span>
                    </>
                  )}
                </div>
              );
            })}
            {editMode && (<button onClick={() => handleAddSection(exIndex)} className="mt-2 text-sm text-blue-600 hover:underline"><Plus size={14} className="inline" /> Adicionar série</button>)}
          </div>
        )
      })}

      {editMode && (
        <div className="mt-6 flex gap-4">
          <button onClick={handleAddExercise} className="text-sm text-blue-600 hover:underline"><Plus size={14} className="inline" /> Adicionar exercício</button>
          <button onClick={handleSave} className="bg-red-700 text-white py-2 px-6 rounded hover:bg-red-800 ml-auto">Salvar Alterações</button>
        </div>
      )}

      {isDuplicateModalOpen && (
        <DuplicateTreinoModal
          alunoId={alunoId as string}
          sourceTreino={treino}
          onClose={() => setDuplicateModalOpen(false)}
          onSuccess={(newTreinoId) => {
            setDuplicateModalOpen(false);
            // Navega para o treino recém-criado
            router.push(`/coach/treinos/${alunoId}/${newTreinoId}`);
          }}
        />
      )}
    </div>
  );
}

interface Block { id: string; title: string; }
interface Week { id: string; week_number: number; start_date: string | null; end_date: string | null; }

function DuplicateTreinoModal({ alunoId, sourceTreino, onClose, onSuccess }: { alunoId: string; sourceTreino: Treino; onClose: () => void; onSuccess: (newTreinoId: string) => void; }) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string>('');
  const [weeks, setWeeks] = useState<Week[]>([]);
  
  const [formData, setFormData] = useState({
    name: `${sourceTreino.name} (Cópia)`,
    week_id: '',
    day: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Busca todos os blocos do aluno
  useEffect(() => {
    async function fetchBlocks() {
      try {
        setLoading(true);
        const data = await fetchWithAuth(`alunos/${alunoId}/training_blocks`);
        setBlocks(data);
      } catch (err) {
        setError('Erro ao carregar blocos de treino.');
      } finally {
        setLoading(false);
      }
    }
    fetchBlocks();
  }, [alunoId]);

  // Busca as semanas quando um bloco é selecionado
  useEffect(() => {
    if (!selectedBlockId) {
      setWeeks([]);
      setFormData(prev => ({...prev, week_id: ''}));
      return;
    }
    async function fetchWeeks() {
      try {
        setLoading(true);
        const data = await fetchWithAuth(`training_blocks/${selectedBlockId}`);
        setWeeks(data.weeks || []);
      } catch (err) {
        setError('Erro ao carregar semanas do bloco.');
      } finally {
        setLoading(false);
      }
    }
    fetchWeeks();
  }, [selectedBlockId]);

  const selectedWeek = weeks.find(w => w.id === formData.week_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { duplication: formData };
      const newTreino = await fetchWithAuth(`treinos/${sourceTreino.id}/duplicate`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      alert('Treino duplicado com sucesso!');
      onSuccess(newTreino.id);
    } catch (err: any) {
      setError(err.message || 'Falha ao duplicar o treino.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-800">
          x
        </button>
        <h2 className="text-xl font-bold mb-4">Duplicar Treino para...</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700">Novo Título do Treino</label>
            <input type="text" id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 w-full border p-2 rounded text-neutral-600" required />
          </div>

          <div>
            <label htmlFor="block" className="block text-sm font-medium text-neutral-700">Bloco de Destino</label>
            <select id="block" value={selectedBlockId} onChange={e => setSelectedBlockId(e.target.value)} className="mt-1 w-full border p-2 rounded text-neutral-600" required>
              <option value="">Selecione um bloco...</option>
              {blocks.map(block => <option key={block.id} value={block.id}>{block.title}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="week_id" className="block text-sm font-medium text-neutral-700">Semana de Destino</label>
            <select id="week_id" value={formData.week_id} onChange={e => setFormData({...formData, week_id: e.target.value})} className="mt-1 w-full border p-2 rounded text-neutral-600" disabled={!selectedBlockId || weeks.length === 0} required>
              <option value="">Selecione uma semana...</option>
              {weeks.map(week => <option key={week.id} value={week.id}>Semana {week.week_number}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="day" className="block text-sm font-medium text-neutral-700">Nova Data do Treino</label>
            <input type="date" id="day" value={formData.day} onChange={e => setFormData({...formData, day: e.target.value})} className="mt-1 w-full border p-2 rounded text-neutral-600"
              min={selectedWeek?.start_date ? new Date(selectedWeek.start_date).toISOString().split('T')[0] : ''}
              max={selectedWeek?.end_date ? new Date(selectedWeek.end_date).toISOString().split('T')[0] : ''}
              disabled={!formData.week_id}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="bg-neutral-200 text-neutral-800 px-4 py-2 rounded hover:bg-neutral-300">Cancelar</button>
            <button type="submit" disabled={loading} className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800 disabled:bg-red-400">
              {loading ? 'Duplicando...' : 'Duplicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}