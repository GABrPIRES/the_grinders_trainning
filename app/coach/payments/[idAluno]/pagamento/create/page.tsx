"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { ArrowLeft, Save, Loader2, Info, AlertCircle } from "lucide-react";

interface Plano { name: string; price: number; }
interface Aluno { id: string; user: { name: string }; plano?: Plano; }

export default function CreatePaymentPage() {
  const { idAluno } = useParams();
  const router = useRouter();
  const { showToast, ToastEl } = useToast();

  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ amount: "", due_date: "", status: "pendente" });

  useEffect(() => {
    const loadAluno = async () => {
      try {
        const data = await fetchWithAuth(`alunos/${idAluno}`);
        setAluno(data);
        if (data.plano?.price) setForm(f => ({ ...f, amount: data.plano.price.toString() }));
      } catch (err) {
        console.error("Erro ao carregar aluno:", err);
      } finally {
        setLoading(false);
      }
    };
    loadAluno();
  }, [idAluno]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchWithAuth('pagamentos', {
        method: 'POST',
        body: JSON.stringify({
          pagamento: {
            aluno_id: idAluno,
            amount: parseFloat(form.amount),
            due_date: form.due_date,
            status: form.status,
          },
        }),
      });
      router.push(`/coach/payments/${idAluno}`);
    } catch (err: any) {
      showToast("Erro ao criar pagamento: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const formatMoney = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const inputClass = "w-full px-4 py-2.5 border border-line-input rounded-lg focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none transition-all bg-surface-app text-content-primary text-sm";

  if (loading) return (
    <div className="max-w-lg mx-auto p-6 pb-24 animate-pulse space-y-4">
      <div className="h-8 bg-surface-subtle rounded w-40"></div>
      <div className="h-32 bg-surface-elevated border border-line rounded-xl"></div>
      <div className="space-y-3">
        <div className="h-10 bg-surface-subtle rounded-lg"></div>
        <div className="h-10 bg-surface-subtle rounded-lg"></div>
        <div className="h-10 bg-surface-subtle rounded-lg"></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto p-4 md:p-6 pb-24 md:pb-6 text-content-primary">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-surface-subtle rounded-lg transition-colors text-content-secondary">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-content-primary">Novo Pagamento</h1>
          {aluno && <p className="text-sm text-content-tertiary">{aluno.user.name}</p>}
        </div>
      </div>

      {/* Sugestão do plano */}
      {aluno?.plano ? (
        <div className="bg-semantic-info-bg border border-semantic-info-border p-4 rounded-xl mb-6 flex items-start gap-3">
          <Info className="shrink-0 mt-0.5 text-semantic-info-text" size={18} />
          <div className="text-sm text-semantic-info-text">
            <p className="font-bold mb-0.5">Sugestão de Plano</p>
            <p>
              Plano <strong>{aluno.plano.name}</strong> — valor sugerido: <strong>{formatMoney(aluno.plano.price)}</strong>
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-surface-subtle border border-line p-4 rounded-xl mb-6 flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5 text-content-muted" size={18} />
          <p className="text-sm text-content-tertiary">Aluno sem plano ativo. Insira o valor manualmente.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface-elevated border border-line rounded-xl shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-xs font-bold text-content-muted uppercase mb-1">Valor (R$)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted text-sm">R$</span>
            <input
              type="number" step="0.01" required
              className="w-full pl-9 pr-4 py-2.5 border border-line-input rounded-lg focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none transition-all bg-surface-app text-content-primary text-sm"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              placeholder="0,00"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-content-muted uppercase mb-1">Data de Vencimento</label>
          <input type="date" onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()} required className={`${inputClass} cursor-pointer`} value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
        </div>

        <div>
          <label className="block text-xs font-bold text-content-muted uppercase mb-1">Status Inicial</label>
          <select className={`${inputClass} cursor-pointer`} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="atrasado">Atrasado</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-brand text-content-on-brand py-3 rounded-xl font-bold hover:bg-brand-hover transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Salvando...' : 'Criar Pagamento'}
        </button>
      </form>
      {ToastEl}
    </div>
  );
}
