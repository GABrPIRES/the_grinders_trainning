"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import {
  ArrowLeft, Calendar, Hash, Save, Loader2,
  TrendingUp, Info, AlertCircle,
} from "lucide-react";

interface ExistingBlock {
  title: string;
  start_date: string;
  end_date: string;
}

export default function CreateBlockPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [existingBlocks, setExistingBlocks] = useState<ExistingBlock[]>([]);

  const [form, setForm] = useState({
    title: "",
    start_date: "",
    weeks_duration: "4",
    end_date: "",
  });

  useEffect(() => {
    if (!id) return;
    fetchWithAuth(`alunos/${id}/training_blocks`)
      .then((data) => setExistingBlocks(data || []))
      .catch(() => {});
  }, [id]);

  // Cálculo automático da Data de Término
  useEffect(() => {
    if (form.start_date && form.weeks_duration) {
      const start = new Date(form.start_date);
      const weeks = parseInt(form.weeks_duration);
      if (!isNaN(start.getTime()) && !isNaN(weeks)) {
        const end = new Date(start);
        end.setDate(start.getDate() + weeks * 7 - 1);
        setForm(prev => ({ ...prev, end_date: end.toISOString().split('T')[0] }));
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
      alert("Por favor, verifique a data. O ano parece incorreto.");
      return;
    }

    // Validação de sobreposição de datas
    if (form.start_date && form.end_date && existingBlocks.length > 0) {
      const newStart = new Date(form.start_date);
      const newEnd = new Date(form.end_date);
      const overlap = existingBlocks.find((block) => {
        const bStart = new Date(block.start_date);
        const bEnd = new Date(block.end_date);
        return newStart <= bEnd && bStart <= newEnd;
      });
      if (overlap) {
        setError(`Este período se sobrepõe com o bloco "${overlap.title}". Escolha uma data de início diferente.`);
        return;
      }
    }

    setLoading(true);
    setError("");
    try {
      await fetchWithAuth(`alunos/${id}/training_blocks`, {
        method: 'POST',
        body: JSON.stringify({
          training_block: {
            title: form.title,
            weeks_duration: parseInt(form.weeks_duration),
            start_date: form.start_date,
            end_date: form.end_date,
          },
        }),
      });
      router.push(`/coach/treinos/${id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao criar bloco. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const inputClass =
    "w-full px-4 py-2.5 border border-line-input rounded-lg focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none transition-all text-content-primary bg-surface-app placeholder:text-content-tertiary text-sm";
  const labelClass = "block text-sm font-medium mb-1 text-content-secondary";

  return (
    <div className="max-w-2xl mx-auto pb-20 md:pb-0 text-content-primary">

      {/* Cabeçalho */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-surface-subtle rounded-lg transition-colors text-content-secondary"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-content-primary">Novo Bloco de Treino</h1>
          <p className="text-sm text-content-tertiary">Defina a estrutura do próximo ciclo de treinamento.</p>
        </div>
      </div>

      {error && (
        <div className="bg-semantic-error-bg text-semantic-error-text border border-semantic-error-border p-4 rounded-xl mb-6 text-sm flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface-elevated p-6 md:p-8 rounded-xl border border-line shadow-sm space-y-8">

        {/* Identificação */}
        <div>
          <h2 className="text-base font-bold flex items-center gap-2 text-content-primary border-b border-line pb-3 mb-4">
            <TrendingUp size={18} className="text-brand" /> Objetivo do Ciclo
          </h2>
          <div>
            <label className={labelClass}>Nome do Bloco</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ex: Hipertrofia - Fase 1, Força Base..."
              className={inputClass}
              required
            />
          </div>
        </div>

        {/* Duração e Datas */}
        <div>
          <h2 className="text-base font-bold flex items-center gap-2 text-content-primary border-b border-line pb-3 mb-4">
            <Calendar size={18} className="text-brand" /> Duração e Cronograma
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`${labelClass} flex items-center gap-2`}>
                <Hash size={14} /> Duração (Semanas)
              </label>
              <input
                type="number"
                name="weeks_duration"
                value={form.weeks_duration}
                onChange={handleChange}
                min="1"
                max="52"
                className={inputClass}
                required
              />
              <p className="text-xs text-content-muted mt-1.5">Geralmente entre 4 a 12 semanas.</p>
            </div>
            <div>
              <label className={labelClass}>Data de Início</label>
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Preview da Data Final */}
          <div className="mt-6 bg-semantic-info-bg border border-semantic-info-border p-4 rounded-xl flex items-start gap-3">
            <Info className="text-semantic-info-text shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-sm text-semantic-info-text font-bold">Previsão de Término</p>
              <p className="text-xs text-semantic-info-text/80 mt-1">
                Com base na duração selecionada, este bloco terminará em:
              </p>
              <p className="text-lg font-bold text-semantic-info-text mt-1">
                {form.end_date ? formatDateDisplay(form.end_date) : "Selecione a data de início"}
              </p>
              <input type="hidden" name="end_date" value={form.end_date} />
            </div>
          </div>
        </div>

        {/* Botão */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-brand text-content-on-brand font-bold py-3 px-8 rounded-xl hover:bg-brand-hover transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 w-full md:w-auto justify-center"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {loading ? "Criando..." : "Criar Bloco"}
          </button>
        </div>
      </form>
    </div>
  );
}
