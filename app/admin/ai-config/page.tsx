"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/hooks/useConfirm";
import { Sliders, Loader2, RotateCcw, Save, Info } from "lucide-react";

interface AiConfigValues {
  ai_system_prompt: string | null;
  ai_max_load_increase_pct: number | string | null;
  ai_critical_delta_pct: number | string | null;
  ai_sleep_threshold: number | string | null;
  ai_stress_threshold: number | string | null;
}

interface AiConfigResponse {
  current: AiConfigValues;
  defaults: {
    ai_system_prompt: string;
    ai_max_load_increase_pct: number;
    ai_critical_delta_pct: number;
    ai_sleep_threshold: number;
    ai_stress_threshold: number;
  };
  ranges: Record<string, { min: number; max: number }>;
  is_using_default: boolean;
}

const PARAM_LABELS: Record<string, string> = {
  ai_max_load_increase_pct: "Aumento máximo de carga (%)",
  ai_critical_delta_pct: "Delta crítico (%)",
  ai_sleep_threshold: "Threshold de sono (≤ valor)",
  ai_stress_threshold: "Threshold de estresse (≥ valor)",
};

export default function AdminAiConfigPage() {
  const { showToast, ToastEl } = useToast();
  const { showConfirm, ConfirmEl } = useConfirm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [data, setData] = useState<AiConfigResponse | null>(null);

  // Estado do formulário: strings para number inputs (null/empty = usar default)
  const [form, setForm] = useState<{
    ai_system_prompt: string;
    ai_max_load_increase_pct: string;
    ai_critical_delta_pct: string;
    ai_sleep_threshold: string;
    ai_stress_threshold: string;
  }>({
    ai_system_prompt: "",
    ai_max_load_increase_pct: "",
    ai_critical_delta_pct: "",
    ai_sleep_threshold: "",
    ai_stress_threshold: "",
  });

  const load = async () => {
    try {
      const d: AiConfigResponse = await fetchWithAuth("admin/ai_config");
      setData(d);
      setForm({
        ai_system_prompt: d.current.ai_system_prompt || "",
        ai_max_load_increase_pct: d.current.ai_max_load_increase_pct?.toString() || "",
        ai_critical_delta_pct: d.current.ai_critical_delta_pct?.toString() || "",
        ai_sleep_threshold: d.current.ai_sleep_threshold?.toString() || "",
        ai_stress_threshold: d.current.ai_stress_threshold?.toString() || "",
      });
    } catch {
      showToast("Erro ao carregar configuração.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const buildPayload = () => {
    const out: Partial<AiConfigValues> = {};
    out.ai_system_prompt = form.ai_system_prompt.trim() || null;
    (['ai_max_load_increase_pct', 'ai_critical_delta_pct', 'ai_sleep_threshold', 'ai_stress_threshold'] as const).forEach((k) => {
      const v = form[k].trim();
      out[k] = v === "" ? null : Number(v);
    });
    return out;
  };

  const handleSave = async () => {
    const ok = await showConfirm({
      message: "Esta mudança afeta TODA a aplicação como default. Coaches que estão usando o padrão receberão os novos valores no próximo run. Salvar?",
      confirmLabel: "Salvar",
    });
    if (!ok) return;
    setSaving(true);
    try {
      await fetchWithAuth("admin/ai_config", {
        method: "PATCH",
        body: JSON.stringify(buildPayload()),
      });
      await load();
      showToast("Configuração salva.");
    } catch (e: any) {
      showToast(e?.message || "Erro ao salvar.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const ok = await showConfirm({
      message: "Vai zerar o prompt e os 4 parâmetros. A aplicação voltará a usar os valores hard-coded do sistema. Resetar?",
      confirmLabel: "Resetar",
      danger: true,
    });
    if (!ok) return;
    setResetting(true);
    try {
      await fetchWithAuth("admin/ai_config/reset_to_default", { method: "POST" });
      await load();
      showToast("Configuração resetada para default.");
    } catch (e: any) {
      showToast(e?.message || "Erro ao resetar.", "error");
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="flex items-center gap-2 text-content-muted">
          <Loader2 className="animate-spin" size={18} /> Carregando…
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 pb-24 space-y-6">
      <ToastEl />
      <ConfirmEl />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-content-primary flex items-center gap-2">
            <Sliders size={22} className="text-brand" /> Configuração da IA
          </h1>
          <p className="text-sm text-content-tertiary mt-1">
            Edite o prompt e os parâmetros guardrail usados pela IA para sugerir cargas.
            Quando um campo está vazio, o sistema usa o valor padrão hard-coded.
          </p>
        </div>
        {!data.is_using_default && (
          <span className="text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full bg-semantic-warning-bg text-semantic-warning-text border border-semantic-warning-border shrink-0">
            Customizado
          </span>
        )}
      </div>

      {/* Card: System Prompt */}
      <section className="bg-surface-elevated border border-line rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-line bg-surface-page">
          <h2 className="font-bold text-content-primary">System Prompt</h2>
          <p className="text-xs text-content-tertiary mt-0.5">
            Texto enviado ao Gemini como instrução base. Vazio = usar o prompt padrão.
          </p>
        </div>
        <div className="p-6 space-y-3">
          <textarea
            rows={14}
            value={form.ai_system_prompt}
            placeholder={data.defaults.ai_system_prompt.slice(0, 400) + "…"}
            onChange={(e) => setForm({ ...form, ai_system_prompt: e.target.value })}
            className="w-full text-xs font-mono border border-line-input rounded-lg p-3 bg-surface-app text-content-primary focus:ring-2 focus:ring-brand-glow outline-none placeholder:text-content-tertiary"
          />
          <div className="flex items-start gap-2 text-xs text-content-tertiary">
            <Info size={14} className="text-content-muted shrink-0 mt-0.5" />
            <p>
              Placeholders disponíveis (substituídos antes de enviar ao Gemini):{" "}
              <code className="font-mono text-content-secondary">{"{{max_load_increase_pct}}"}</code>,{" "}
              <code className="font-mono text-content-secondary">{"{{critical_delta_pct}}"}</code>,{" "}
              <code className="font-mono text-content-secondary">{"{{sleep_threshold}}"}</code>,{" "}
              <code className="font-mono text-content-secondary">{"{{stress_threshold}}"}</code>.
            </p>
          </div>
        </div>
      </section>

      {/* Card: Parâmetros */}
      <section className="bg-surface-elevated border border-line rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-line bg-surface-page">
          <h2 className="font-bold text-content-primary">Parâmetros guardrail</h2>
          <p className="text-xs text-content-tertiary mt-0.5">
            Caps numéricos que a IA respeita. Vazio = usar o default hard-coded.
          </p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['ai_max_load_increase_pct', 'ai_critical_delta_pct', 'ai_sleep_threshold', 'ai_stress_threshold'] as const).map((k) => {
            const range = data.ranges[k];
            const dft = data.defaults[k];
            return (
              <div key={k}>
                <label className="text-xs font-bold text-content-secondary uppercase tracking-wide">
                  {PARAM_LABELS[k]}{" "}
                  <span className="font-normal normal-case text-content-muted">
                    (range {range.min}-{range.max}, default {dft})
                  </span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={range.min}
                  max={range.max}
                  value={form[k]}
                  placeholder={String(dft)}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  className="w-full mt-1 text-sm border border-line-input rounded-lg px-3 py-2 bg-surface-app text-content-primary focus:ring-2 focus:ring-brand-glow outline-none placeholder:text-content-tertiary"
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 sticky bottom-0 bg-surface-page py-4 border-t border-line">
        <button
          type="button"
          onClick={handleReset}
          disabled={resetting || data.is_using_default}
          className="text-sm text-content-secondary font-medium px-4 py-2 rounded-lg hover:bg-surface-subtle border border-line disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <RotateCcw size={15} /> Resetar tudo para default
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-brand text-content-on-brand font-bold py-2.5 px-6 rounded-xl hover:bg-brand-hover transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Salvar configuração
        </button>
      </div>
    </div>
  );
}
