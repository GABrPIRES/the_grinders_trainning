"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, CreditCard, Clock, FileText, DollarSign, AlertCircle } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';

export default function CreatePlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [plan, setPlan] = useState({ name: '', price: '', duration: '', description: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPlan({ ...plan, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await fetchWithAuth('planos', {
        method: 'POST',
        body: JSON.stringify({ plano: { ...plan, price: parseFloat(plan.price), duration: parseInt(plan.duration) } }),
      });
      router.push('/coach/plans');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar plano. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-line-input rounded-lg focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none transition-all bg-surface-app text-content-primary placeholder:text-content-tertiary text-sm";

  return (
    <div className="max-w-2xl mx-auto pb-24 md:pb-6 text-content-primary">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-surface-subtle rounded-lg transition-colors text-content-secondary">
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-content-primary">Novo Plano</h1>
          <p className="text-sm text-content-tertiary">Crie um pacote de consultoria para seus alunos.</p>
        </div>
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
            <CreditCard size={14} /> Nome do Pacote
          </label>
          <input name="name" value={plan.name} onChange={handleChange} placeholder="Ex: Consultoria Mensal, Trimestral..." className={inputClass} required />
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
            <div className="relative">
              <input type="number" name="duration" value={plan.duration} onChange={handleChange} placeholder="30" className={`${inputClass} pr-12`} required />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-content-muted text-xs font-bold">dias</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-content-muted uppercase mb-1.5 flex items-center gap-2">
            <FileText size={14} /> O que está incluso?
          </label>
          <textarea
            name="description" value={plan.description} onChange={handleChange}
            placeholder="Descreva os benefícios: Suporte 24h, Análise de vídeos, Ajustes semanais..."
            className={`${inputClass} h-32 resize-none`}
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit" disabled={loading}
            className="bg-brand text-content-on-brand font-bold py-3 px-8 rounded-xl hover:bg-brand-hover transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 w-full md:w-auto justify-center"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {loading ? 'Salvando...' : 'Criar Plano'}
          </button>
        </div>
      </form>
    </div>
  );
}
