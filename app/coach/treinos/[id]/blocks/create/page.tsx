"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { 
  ArrowLeft, Calendar, Hash, Save, Loader2, 
  TrendingUp, Info, AlertCircle 
} from "lucide-react";

export default function CreateBlockPage() {
  const { id } = useParams(); // ID do Aluno
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    title: "",
    start_date: "",
    weeks_duration: "4", // Padrão de 4 semanas (mesociclo comum)
    end_date: ""
  });

  // Cálculo automático da Data de Término
  useEffect(() => {
    if (form.start_date && form.weeks_duration) {
      const start = new Date(form.start_date);
      const weeks = parseInt(form.weeks_duration);
      
      if (!isNaN(start.getTime()) && !isNaN(weeks)) {
        // Data final = Data inicial + (semanas * 7 dias) - 1 dia (para fechar no domingo/sábado corretamente)
        const end = new Date(start);
        end.setDate(start.getDate() + (weeks * 7) - 1);
        
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

    setLoading(true);
    setError("");

    try {
      // POST para a rota aninhada que ajustamos
      await fetchWithAuth(`alunos/${id}/training_blocks`, {
        method: 'POST',
        body: JSON.stringify({
          training_block: {
            title: form.title,
            weeks_duration: parseInt(form.weeks_duration),
            start_date: form.start_date,
            end_date: form.end_date
          }
        })
      });

      // Sucesso! Volta para a lista de blocos
      router.push(`/coach/treinos/${id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao criar bloco. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  // Helper para mostrar data formatada
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return "-";
    // Ajuste de fuso para visualização correta
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 md:pb-0 text-neutral-800">
      
      {/* CABEÇALHO */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()} 
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-600"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Novo Bloco de Treino</h1>
          <p className="text-neutral-500 text-sm">Defina a estrutura do próximo ciclo de treinamento.</p>
        </div>
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
              <TrendingUp size={20} className="text-red-700"/> Objetivo do Ciclo
           </h2>
           <div className="space-y-4">
              <div>
                 <label className="block text-sm font-medium mb-1 text-neutral-600">Nome do Bloco</label>
                 <input 
                   name="title"
                   value={form.title}
                   onChange={handleChange}
                   placeholder="Ex: Hipertrofia - Fase 1, Força Base..."
                   className="w-full pl-4 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
                   required
                 />
              </div>
           </div>
        </div>

        {/* DURAÇÃO E DATAS */}
        <div>
           <h2 className="text-lg font-bold flex items-center gap-2 text-neutral-800 border-b border-neutral-100 pb-2 mb-4">
              <Calendar size={20} className="text-red-700"/> Duração e Cronograma
           </h2>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Duração em Semanas */}
              <div>
                 <label className="block text-sm font-medium mb-1 text-neutral-600 flex items-center gap-2">
                    <Hash size={16}/> Duração (Semanas)
                 </label>
                 <div className="relative">
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
                 <p className="text-xs text-neutral-400 mt-1">Geralmente entre 4 a 12 semanas.</p>
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
           <div className="mt-6 bg-neutral-50 p-4 rounded-xl border border-neutral-100 flex items-start gap-3">
              <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />
              <div>
                 <p className="text-sm text-neutral-700 font-medium">Previsão de Término</p>
                 <p className="text-xs text-neutral-500 mt-1">
                    Com base na duração selecionada, este bloco terminará em: 
                 </p>
                 <p className="text-lg font-bold text-neutral-900 mt-1">
                    {form.end_date ? formatDateDisplay(form.end_date) : "Selecione a data de início"}
                 </p>
                 {/* Input hidden para enviar o valor calculado, se necessário */}
                 <input type="hidden" name="end_date" value={form.end_date} />
              </div>
           </div>
        </div>

        {/* BOTÃO DE AÇÃO */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-red-700 text-white font-bold py-3 px-8 rounded-xl hover:bg-red-800 transition-colors shadow-md flex items-center gap-2 disabled:opacity-70 w-full md:w-auto justify-center"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {loading ? "Criando..." : "Criar Bloco"}
          </button>
        </div>

      </form>
    </div>
  );
}