"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2, CreditCard, Clock, FileText, DollarSign, Trash2, AlertCircle } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-surface-subtle rounded-lg"></div>
        <div className="h-7 bg-surface-subtle rounded w-40"></div>
      </div>
      <div className="bg-surface-elevated border border-line rounded-2xl p-8 space-y-6">
        <div className="h-10 bg-surface-subtle rounded-lg"></div>
        <div className="grid grid-cols-2 gap-6">
          <div className="h-10 bg-surface-subtle rounded-lg"></div>
          <div className="h-10 bg-surface-subtle rounded-lg"></div>
        </div>
        <div className="h-32 bg-surface-subtle rounded-lg"></div>
      </div>
    </div>
  );
}

export default function EditPlanPage() {
  const router = useRouter();
  const { id } = useParams();
  const { showToast, ToastEl } = useToast();
  const { showConfirm, ConfirmEl } = useConfirm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState({ name: '', price: '', duration: '', description: '' });

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const data = await fetchWithAuth(`planos/${id}`);
        setPlan({ name: data.name, price: data.price, duration: data.duration, description: data.description || '' });
      } catch (err: any) {
        setError('Erro ao carregar o plano.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPlan({ ...plan, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await fetchWithAuth(`planos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ plano: { ...plan, price: parseFloat(plan.price as string), duration: parseInt(plan.duration as string) } }),
      });
      router.push('/coach/plans');
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar plano');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = await showConfirm({ message: 'Tem certeza que deseja excluir este plano?', confirmLabel: 'Excluir', danger: true });
    if (!ok) return;
    try {
      await fetchWithAuth(`planos/${id}`, { method: 'DELETE' });
      router.push('/coach/plans');
    } catch (err: any) {
      showToast(err.message || 'Erro ao excluir.', "error");
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-line-input rounded-lg focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none transition-all bg-surface-app text-content-primary placeholder:text-content-tertiary text-sm";

  if (loading) return <div className="max-w-2xl mx-auto pb-24 md:pb-6 text-content-primary"><Skeleton /></div>;

  return (
    <div className="max-w-2xl mx-auto pb-24 md:pb-6 text-content-primary">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-surface-subtle rounded-lg transition-colors text-content-secondary">
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-content-primary">Editar Plano</h1>
            <p className="text-sm text-content-tertiary">Altere as informações deste pacote.</p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="text-semantic-error-text hover:bg-semantic-error-bg p-2.5 rounded-xl transition-colors border border-transparent hover:border-semantic-error-border"
          title="Excluir Plano"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {error && (
        <div className="bg-semantic-error-bg text-semantic-error-text border border-semantic-error-border p-4 rounded-xl mb-6 text-sm flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface-elevated border border-line rounded-2xl shadow-sm p-6 md:p-8 space-y-6">

        <div>
          <label className="block text-xs font-bold text-content-muted uppercase mb-1.5 flex items-center gap-2">
            <CreditCard size={14} /> Nome do Plano
          </label>
          <input name="name" value={plan.name} onChange={handleChange} placeholder="Ex: Consultoria Mensal..." className={inputClass} required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-content-muted uppercase mb-1.5 flex items-center gap-2">
              <DollarSign size={14} /> Preço (R$)
            </label>
            <input type="number" name="price" value={plan.price} onChange={handleChange} step="0.01" placeholder="0,00" className={inputClass} required />
          </div>
          <div>
            <label className="block text-xs font-bold text-content-muted uppercase mb-1.5 flex items-center gap-2">
              <Clock size={14} /> Duração (Dias)
            </label>
            <input type="number" name="duration" value={plan.duration} onChange={handleChange} placeholder="30" className={inputClass} required />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-content-muted uppercase mb-1.5 flex items-center gap-2">
            <FileText size={14} /> Descrição / Benefícios
          </label>
          <textarea
            name="description" value={plan.description} onChange={handleChange}
            placeholder="Descreva o que está incluso..."
            className={`${inputClass} h-32 resize-none`}
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit" disabled={saving}
            className="bg-brand text-content-on-brand font-bold py-3 px-8 rounded-xl hover:bg-brand-hover transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 w-full md:w-auto justify-center"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
      {ToastEl}
      {ConfirmEl}
    </div>
  );
}
