"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { 
  ArrowLeft, Calendar, Hash, Save, Loader2, 
  TrendingUp, Info, AlertCircle, Trash2 
} from "lucide-react";

export default function EditBlockPage() {
  const { id, blockId } = useParams(); // id = Aluno, blockId = Bloco
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    title: "",
    start_date: "",
    weeks_duration: "",
    end_date: ""
  });

  // Carrega os dados do bloco
  useEffect(() => {
    async function loadBlock() {
      try {
        const data = await fetchWithAuth(`training_blocks/${blockId}`);
        setForm({
          title: data.title || "",
          // Ajusta datas para o formato do input date (YYYY-MM-DD)
          start_date: data.start_date ? data.start_date.split('T')[0] : "",
          end_date: data.end_date ? data.end_date.split('T')[0] : "",
          weeks_duration: data.weeks_duration ? String(data.weeks_duration) : "",
        });
      } catch (err: any) {
        setError("Erro ao carregar bloco.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBlock();
  }, [blockId]);

  // Recálculo automático da Data de Término (Opcional, ajuda a manter consistência)
  useEffect(() => {
    if (form.start_date && form.weeks_duration) {
      const start = new Date(form.start_date);
      const weeks = parseInt(form.weeks_duration);
      
      if (!isNaN(start.getTime()) && !isNaN(weeks)) {
        const end = new Date(start);
        end.setDate(start.getDate() + (weeks * 7) - 1);
        
        // Só atualiza se a data calculada for diferente da atual para evitar loops, 
        // ou se o usuário estiver mudando ativamente os campos principais
        // Aqui optamos por atualizar o form.end_date para ajudar o coach
        setForm(prev => ({
          ...prev,
          end_date: end.toISOString().split('T')[0]
        }));
      }
    }
  }, [form.start_date, form.weeks_duration]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedDate = new Date(form.start_date);
    const year = selectedDate.getFullYear();
    
    if (year < 2024 || year > 2100) {
        alert("Por favor, verifique a data. O ano parece incorreto (ex: 0025).");
        return;
    }

    setSaving(true);
    setError("");

    try {
      await fetchWithAuth(`training_blocks/${blockId}`, {
        method: 'PUT',
        body: JSON.stringify({
          training_block: {
            title: form.title,
            weeks_duration: parseInt(form.weeks_duration),
            start_date: form.start_date,
            end_date: form.end_date
          }
        })
      });

      // Sucesso! Volta para os detalhes do bloco
      router.push(`/coach/treinos/${id}/blocks/${blockId}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao atualizar bloco.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza? Apagar o bloco excluirá todos os treinos vinculados a ele.")) return;
    
    try {
        await fetchWithAuth(`training_blocks/${blockId}`, { method: 'DELETE' });
        router.push(`/coach/treinos/${id}`);
    } catch (err: any) {
        alert("Erro ao excluir: " + err.message);
    }
  };

  // Helper para mostrar data formatada
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  if (loading) return <div className="p-12 text-center text-neutral-500 animate-pulse">Carregando dados...</div>;

  return (
    <div className="max-w-2xl mx-auto pb-20 md:pb-0 text-neutral-800">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
            <button 
            onClick={() => router.back()} 
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-600"
            >
            <ArrowLeft size={24} />
            </button>
            <div>
            <h1 className="text-2xl font-bold text-neutral-900">Editar Bloco</h1>
            <p className="text-neutral-500 text-sm">Ajuste as configurações deste ciclo.</p>
            </div>
        </div>
        
        <button 
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 text-sm font-bold flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
        >
            <Trash2 size={16} /> Excluir Bloco
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100 flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* FORMULÁRIO */}
      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-8">
        
        {/* IDENTIFICAÇÃO */}
        <div>
           <h2 className="text-lg font-bold flex items-center gap-2 text-neutral-800 border-b border-neutral-100 pb-2 mb-4">
              <TrendingUp size={20} className="text-red-700"/> Objetivo
           </h2>
           <div>
                <label className="block text-sm font-medium mb-1 text-neutral-600">Nome do Bloco</label>
                <input 
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Ex: Hipertrofia - Fase 1"
                className="w-full pl-4 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
                required
                />
           </div>
        </div>

        {/* DURAÇÃO E DATAS */}
        <div>
           <h2 className="text-lg font-bold flex items-center gap-2 text-neutral-800 border-b border-neutral-100 pb-2 mb-4">
              <Calendar size={20} className="text-red-700"/> Cronograma
           </h2>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Duração em Semanas */}
              <div>
                 <label className="block text-sm font-medium mb-1 text-neutral-600 flex items-center gap-2">
                    <Hash size={16}/> Duração (Semanas)
                 </label>
                 <input 
                    type="number"
                    name="weeks_duration"
                    value={form.weeks_duration}
                    onChange={handleChange}
                    min="1"
                    max="52"
                    className="w-full pl-4 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    required
                 />
              </div>

              {/* Data de Início */}
              <div>
                 <label className="block text-sm font-medium mb-1 text-neutral-600">Data de Início</label>
                 <input 
                   type="date"
                   name="start_date"
                   value={form.start_date}
                   onChange={handleChange}
                   className="w-full pl-4 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
                   required
                 />
              </div>
           </div>

           {/* Preview da Data Final */}
           <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
              <Info className="text-blue-600 shrink-0 mt-0.5" size={20} />
              <div>
                 <p className="text-sm text-blue-800 font-bold">Atenção ao alterar datas</p>
                 <p className="text-xs text-blue-600 mt-1 mb-2 leading-relaxed">
                    Alterar a duração ou o início recalculará a data final automaticamente.
                    O novo término previsto é:
                 </p>
                 <p className="text-lg font-bold text-blue-900">
                    {form.end_date ? formatDateDisplay(form.end_date) : "Data indefinida"}
                 </p>
              </div>
           </div>
        </div>

        {/* BOTÃO DE AÇÃO */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-red-700 text-white font-bold py-3 px-8 rounded-xl hover:bg-red-800 transition-colors shadow-md flex items-center gap-2 disabled:opacity-70 w-full md:w-auto justify-center"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>

      </form>
    </div>
  );
}