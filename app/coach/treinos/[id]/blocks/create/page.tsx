"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

// --- Funções Auxiliares de Data ---

/** Adiciona dias a uma data (considerando UTC) */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/** Retorna o próximo domingo a partir de uma data */
function getNextSunday(date: Date): Date {
  const result = new Date(date);
  const day = result.getUTCDay(); // 0 (Dom) - 6 (Sáb)
  if (day !== 0) {
    result.setUTCDate(result.getUTCDate() + (7 - day));
  }
  return result;
}

/** Converte uma string YYYY-MM-DD para um objeto Date em UTC */
function parseDateUTC(dateString: string): Date {
  // Adicionamos T00:00:00 para garantir que seja interpretado como UTC
  return new Date(dateString + "T00:00:00");
}

/** Formata um objeto Date para uma string YYYY-MM-DD */
function formatDateInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

/** Formata uma string de data YYYY-MM-DD para DD/MM/YYYY */
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/D';
  // Adiciona T00:00:00 para garantir que seja UTC e evitar problemas de fuso
  return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

// --- Componente Principal ---

export default function CreateTrainingBlockPage() {
  const { id: alunoId } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    weeks_duration: "5", // Valor padrão
    start_date: "",
    end_date: "",
  });
  
  // Estados para controlar a lógica das datas
  const [suggestedEndDate, setSuggestedEndDate] = useState("");
  const [minEndDate, setMinEndDate] = useState("");
  const [maxEndDate, setMaxEndDate] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Lógica principal: recalcula as datas sempre que a data de início ou a duração mudam
  useEffect(() => {
    if (!formData.start_date || !formData.weeks_duration) {
      setSuggestedEndDate("");
      setMinEndDate("");
      setMaxEndDate("");
      // Limpa a data final se os campos principais estiverem vazios
      setFormData(prev => ({ ...prev, end_date: "" }));
      return;
    }

    try {
      const startDate = parseDateUTC(formData.start_date);
      const duration = parseInt(formData.weeks_duration, 10);

      if (isNaN(duration) || duration < 1) return;

      const endOfFirstWeek = getNextSunday(startDate);

      if (duration === 1) {
        setMinEndDate(formatDateInput(startDate));
        setMaxEndDate(formatDateInput(endOfFirstWeek));
        setSuggestedEndDate(formatDateInput(endOfFirstWeek));
      } else {
        const fullWeeksToAdd = (duration - 1) * 7;
        const startOfLastWeek = addDays(endOfFirstWeek, 1 + (fullWeeksToAdd - 7));
        const suggestedEnd = addDays(startOfLastWeek, 6);

        setMinEndDate(formatDateInput(startOfLastWeek));
        setMaxEndDate(formatDateInput(suggestedEnd));
        setSuggestedEndDate(formatDateInput(suggestedEnd));
      }

    } catch (e) {
      console.error("Erro ao calcular datas:", e);
    }
  }, [formData.start_date, formData.weeks_duration]);

  // Atualiza o state do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Se o usuário mudar a data de início ou a duração,
    // atualizamos a data final para a nova data sugerida.
    if (name === 'start_date' || name === 'weeks_duration') {
      if (suggestedEndDate) {
        setFormData(prev => ({ ...prev, end_date: suggestedEndDate }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        training_block: {
          title: formData.title,
          weeks_duration: parseInt(formData.weeks_duration, 10),
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
        },
      };

      await fetchWithAuth(`alunos/${alunoId}/training_blocks`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      alert("Bloco de treino criado com sucesso!");
      router.push(`/coach/treinos/${alunoId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erro ao criar o bloco de treino.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow rounded-md text-neutral-800">
      <div className="border-b pb-4 mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-2">
          <ArrowLeft size={16} />
          Voltar para os blocos
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Criar Novo Bloco de Treino</h1>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-neutral-700">Título do Bloco</label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 w-full border p-2 rounded text-neutral-600"
            placeholder="Ex: Bloco de Hipertrofia (Janeiro)"
            required
          />
        </div>
        <div>
          <label htmlFor="weeks_duration" className="block text-sm font-medium text-neutral-700">Duração (semanas)</label>
          <input
            id="weeks_duration"
            type="number"
            name="weeks_duration"
            value={formData.weeks_duration}
            onChange={handleChange}
            className="mt-1 w-full border p-2 rounded text-neutral-600"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-neutral-700">Data de Início </label>
                <input id="start_date" type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="mt-1 w-full border p-2 rounded text-neutral-600"/>
            </div>
            <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-neutral-700">Data Final</label>
                <input 
                  id="end_date" 
                  type="date" 
                  name="end_date" 
                  value={formData.end_date} 
                  onChange={handleChange} 
                  className="mt-1 w-full border p-2 rounded text-neutral-600"
                  min={minEndDate}
                  max={maxEndDate}
                  disabled={!formData.start_date}
                />
                {suggestedEndDate && (
                  <p className="text-xs text-neutral-500 mt-1">
                    Sugerido: {formatDate(suggestedEndDate)}.<br/>
                    A data final deve estar na última semana do bloco.
                  </p>
                )}
            </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-700 text-white p-2 rounded cursor-pointer hover:bg-red-800 disabled:bg-red-400"
        >
          {loading ? 'Salvando...' : 'Salvar Bloco'}
        </button>
      </form>
    </div>
  );
}