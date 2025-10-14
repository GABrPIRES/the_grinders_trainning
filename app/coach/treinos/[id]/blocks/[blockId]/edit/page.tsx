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

export default function EditTrainingBlockPage() {
  const { id: alunoId, blockId } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    weeks_duration: "5",
    start_date: "",
    end_date: "",
  });

  // Estados para controlar a lógica das datas
  const [suggestedEndDate, setSuggestedEndDate] = useState("");
  const [minEndDate, setMinEndDate] = useState("");
  const [maxEndDate, setMaxEndDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1. Busca os dados do bloco ao carregar a página
  useEffect(() => {
    if (!blockId) return;
    const fetchBlock = async () => {
      try {
        setLoading(true);
        const data = await fetchWithAuth(`training_blocks/${blockId}`);
        setFormData({
          title: data.title,
          weeks_duration: data.weeks_duration.toString(),
          start_date: data.start_date ? formatDateInput(new Date(data.start_date)) : "",
          end_date: data.end_date ? formatDateInput(new Date(data.end_date)) : "",
        });
      } catch (err: any) {
        setError("Erro ao carregar dados do bloco.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlock();
  }, [blockId]);

  // 2. Lógica principal: recalcula as datas sempre que a data de início ou a duração mudam
  useEffect(() => {
    if (!formData.start_date || !formData.weeks_duration) {
      // Limpa os campos se a data de início ou duração não estiverem preenchidas
      setSuggestedEndDate("");
      setMinEndDate("");
      setMaxEndDate("");
      return;
    }

    try {
      const startDate = parseDateUTC(formData.start_date);
      const duration = parseInt(formData.weeks_duration, 10);

      if (isNaN(duration) || duration < 1) return;

      // Lógica da Semana 1: vai do início até o próximo domingo
      const endOfFirstWeek = getNextSunday(startDate);

      if (duration === 1) {
        // Bloco de apenas 1 semana
        setMinEndDate(formatDateInput(startDate)); // Pode terminar no mesmo dia que começou
        setMaxEndDate(formatDateInput(endOfFirstWeek)); // ...até o domingo
        setSuggestedEndDate(formatDateInput(endOfFirstWeek));
      } else {
        // Bloco com 2+ semanas
        // Adiciona as semanas restantes (duration - 1)
        const fullWeeksToAdd = (duration - 1) * 7;
        
        // A última semana começa na segunda-feira após o fim da primeira semana, mais as semanas cheias
        const startOfLastWeek = addDays(endOfFirstWeek, 1 + (fullWeeksToAdd - 7));
        
        // A data final sugerida é o domingo da última semana
        const suggestedEnd = addDays(startOfLastWeek, 6);

        setMinEndDate(formatDateInput(startOfLastWeek)); // Mínimo é a segunda da última semana
        setMaxEndDate(formatDateInput(suggestedEnd)); // Máximo é o domingo da última semana
        setSuggestedEndDate(formatDateInput(suggestedEnd)); // Sugestão é o domingo
      }

    } catch (e) {
      console.error("Erro ao calcular datas:", e);
    }
  }, [formData.start_date, formData.weeks_duration]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Se o usuário mudar a data de início ou a duração,
    // e a data final antiga estiver fora do novo intervalo,
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

      await fetchWithAuth(`training_blocks/${blockId}`, {
        method: "PATCH", // Usamos PATCH para atualizar
        body: JSON.stringify(payload),
      });

      alert("Bloco de treino atualizado com sucesso!");
      router.push(`/coach/treinos/${alunoId}/blocks/${blockId}`); // Volta para os detalhes do bloco
      router.refresh(); 
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar o bloco de treino.");
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !blockId) return <p className="p-6">Carregando...</p>;

  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow rounded-md text-neutral-800">
      <div className="border-b pb-4 mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-2">
          <ArrowLeft size={16} />
          Voltar para os detalhes do bloco
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Editar Bloco de Treino</h1>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-neutral-700">Título do Bloco</label>
          <input id="title" type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 w-full border p-2 rounded text-neutral-600" required />
        </div>
        <div>
          <label htmlFor="weeks_duration" className="block text-sm font-medium text-neutral-700">Duração (semanas)</label>
          <input id="weeks_duration" type="number" name="weeks_duration" value={formData.weeks_duration} onChange={handleChange} className="mt-1 w-full border p-2 rounded text-neutral-600" required />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-neutral-700">Data de Início</label>
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
                  min={minEndDate} // Restrição Mínima
                  max={maxEndDate} // Restrição Máxima
                  disabled={!formData.start_date} // Desabilita se não houver data de início
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
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  );
}