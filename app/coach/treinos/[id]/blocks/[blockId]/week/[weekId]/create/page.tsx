"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { ArrowLeft, Save, Loader2, Dumbbell, Calendar, AlertCircle } from "lucide-react";

interface WeekData {
  start_date: string | null;
  end_date: string | null;
}

export default function CreateWorkoutPage() {
  const { id: alunoId, blockId, weekId } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [weekData, setWeekData] = useState<WeekData | null>(null);

  useEffect(() => {
    if (!weekId) return;
    fetchWithAuth(`weeks/${weekId}`)
      .then((data: any) => {
        setWeekData({
          start_date: data.start_date ? new Date(data.start_date).toISOString().split("T")[0] : null,
          end_date:   data.end_date   ? new Date(data.end_date).toISOString().split("T")[0]   : null,
        });
      })
      .catch((err) => console.error("Erro ao buscar dados da semana:", err));
  }, [weekId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Cria o treino vazio (em rascunho) e redireciona pra tela de edição completa,
      // que tem todo o redesign: preview, modelos, observações, vídeo, etc.
      const treino = await fetchWithAuth(`weeks/${weekId}/treinos`, {
        method: "POST",
        body: JSON.stringify({
          treino: { name: title, day: date },
        }),
      });
      router.push(`/coach/treinos/${alunoId}/${treino.id}`);
    } catch (err: any) {
      setError(err.message || "Erro ao criar o treino.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-32 md:pb-8 text-content-primary">

      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-surface-subtle rounded-lg text-content-secondary transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-content-primary">Novo Treino</h1>
          <p className="text-sm text-content-tertiary hidden md:block">
            Defina o nome e a data — em seguida você adiciona os exercícios na tela de edição.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-semantic-error-bg text-semantic-error-text border border-semantic-error-border p-4 rounded-xl mb-6 text-sm flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="bg-surface-elevated p-5 rounded-xl border border-line shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-bold mb-1 text-content-secondary flex items-center gap-2">
              <Dumbbell size={15} /> Nome
            </label>
            <input
              type="text"
              placeholder="Ex: Treino A — Peito e Tríceps"
              className="w-full px-4 py-2.5 border border-line-input rounded-lg focus:ring-2 focus:ring-brand-glow outline-none transition-all bg-surface-app text-content-primary placeholder:text-content-tertiary text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-bold mb-1 text-content-secondary flex items-center gap-2">
              <Calendar size={15} /> Data
            </label>
            <input
              type="date"
              onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
              className="w-full px-4 py-2.5 border border-line-input rounded-lg focus:ring-2 focus:ring-brand-glow outline-none transition-all bg-surface-app text-content-primary text-sm cursor-pointer"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={weekData?.start_date || ""}
              max={weekData?.end_date || ""}
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-lg border border-line text-content-secondary hover:bg-surface-subtle font-bold text-sm transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !title.trim() || !date}
            className="px-5 py-2.5 rounded-lg bg-brand hover:bg-brand-hover text-content-on-brand font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={16} /> Criando...</>
            ) : (
              <><Save size={16} /> Criar e Editar</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
