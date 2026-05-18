"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/hooks/useConfirm";
import {
  ArrowLeft, Calendar, Hash, Save, Loader2,
  TrendingUp, Info, AlertCircle, Trash2,
} from "lucide-react";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function EditBlockSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-surface-subtle rounded-lg"></div>
        <div className="h-7 bg-surface-subtle rounded-lg w-48"></div>
      </div>
      <div className="bg-surface-elevated border border-line rounded-xl p-8 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-11 bg-surface-subtle rounded-lg"></div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function EditBlockPage() {
  const { id, blockId } = useParams();
  const router = useRouter();
  const { showToast, ToastEl } = useToast();
  const { showConfirm, ConfirmEl } = useConfirm();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    start_date: "",
    weeks_duration: "",
    end_date: "",
  });

  useEffect(() => {
    async function loadBlock() {
      try {
        const data = await fetchWithAuth(`training_blocks/${blockId}`);
        setForm({
          title: data.title || "",
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
      showToast("Por favor, verifique a data. O ano parece incorreto.", "warning");
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
            end_date: form.end_date,
          },
        }),
      });
      router.push(`/coach/treinos/${id}/blocks/${blockId}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao atualizar bloco.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = await showConfirm({
      message: "Tem certeza? Apagar o bloco excluirá todos os treinos vinculados a ele.",
      confirmLabel: "Excluir",
      danger: true,
    });
    if (!ok) return;
    try {
      await fetchWithAuth(`training_blocks/${blockId}`, { method: 'DELETE' });
      router.push(`/coach/treinos/${id}`);
    } catch (err: any) {
      showToast("Erro ao excluir: " + err.message, "error");
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

  if (loading) return (
    <div className="max-w-2xl mx-auto pb-20 md:pb-0 p-4 md:p-0">
      <EditBlockSkeleton />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pb-20 md:pb-0 text-content-primary">

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-surface-subtle rounded-lg transition-colors text-content-secondary"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-content-primary">Editar Bloco</h1>
            <p className="text-sm text-content-tertiary">Ajuste as configurações deste ciclo.</p>
          </div>
        </div>

        <button
          onClick={handleDelete}
          className="text-semantic-error-text text-sm font-bold flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-semantic-error-bg transition-colors"
        >
          <Trash2 size={15} /> Excluir Bloco
        </button>
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
            <TrendingUp size={18} className="text-brand" /> Objetivo
          </h2>
          <div>
            <label className={labelClass}>Nome do Bloco</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ex: Hipertrofia - Fase 1"
              className={inputClass}
              required
            />
          </div>
        </div>

        {/* Cronograma */}
        <div>
          <h2 className="text-base font-bold flex items-center gap-2 text-content-primary border-b border-line pb-3 mb-4">
            <Calendar size={18} className="text-brand" /> Cronograma
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
            </div>
            <div>
              <label className={labelClass}>Data de Início</label>
              <input
                type="date" onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                className={`${inputClass} cursor-pointer`}
                required
              />
            </div>
          </div>

          {/* Preview data final */}
          <div className="mt-6 bg-semantic-info-bg border border-semantic-info-border p-4 rounded-xl flex items-start gap-3">
            <Info className="text-semantic-info-text shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-sm text-semantic-info-text font-bold">Atenção ao alterar datas</p>
              <p className="text-xs text-semantic-info-text/80 mt-1 mb-2 leading-relaxed">
                Alterar a duração ou o início recalculará a data final automaticamente. O novo término previsto é:
              </p>
              <p className="text-lg font-bold text-semantic-info-text">
                {form.end_date ? formatDateDisplay(form.end_date) : "Data indefinida"}
              </p>
            </div>
          </div>
        </div>

        {/* Botão */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-brand text-content-on-brand font-bold py-3 px-8 rounded-xl hover:bg-brand-hover transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 w-full md:w-auto justify-center"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
      {ToastEl}
      {ConfirmEl}
    </div>
  );
}
