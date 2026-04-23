"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Plus, CreditCard, Clock, FileText } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';

interface Plan {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
}

function PlansSkeleton() {
  return (
    <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-surface-elevated border border-line rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-surface-subtle rounded-xl"></div>
            <div className="h-6 bg-surface-subtle rounded-full w-20"></div>
          </div>
          <div className="h-6 bg-surface-subtle rounded w-36"></div>
          <div className="h-8 bg-surface-subtle rounded w-28"></div>
          <div className="h-4 bg-surface-subtle rounded w-full"></div>
          <div className="h-4 bg-surface-subtle rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
}

export default function CoachPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth('planos');
      setPlans(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleDelete = async (planId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este plano?')) return;
    try {
      await fetchWithAuth(`planos/${planId}`, { method: 'DELETE' });
      fetchPlans();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir o plano.');
    }
  };

  const formatMoney = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 md:pb-6 text-content-primary">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-content-primary">Meus Planos</h1>
          <p className="text-sm text-content-tertiary mt-0.5">Crie e gerencie as opções de assinatura para seus alunos.</p>
        </div>
        <button
          onClick={() => router.push('/coach/plans/create')}
          className="bg-brand text-content-on-brand px-5 py-2.5 rounded-xl font-bold hover:bg-brand-hover shadow-sm flex items-center gap-2 w-full sm:w-auto justify-center transition-colors"
        >
          <Plus size={18} /> Novo Plano
        </button>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <PlansSkeleton />
      ) : plans.length === 0 ? (
        <div className="bg-surface-elevated border-2 border-dashed border-line rounded-2xl p-12 text-center flex flex-col items-center shadow-sm">
          <CreditCard size={48} className="text-content-muted mb-4" />
          <h3 className="text-lg font-bold text-content-primary mb-1">Nenhum plano criado</h3>
          <p className="text-sm text-content-tertiary mb-6">Comece criando um plano para vender sua consultoria.</p>
          <button onClick={() => router.push('/coach/plans/create')} className="text-brand font-bold hover:underline">
            Criar primeiro plano
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div
              key={plan.id}
              className="bg-surface-elevated border border-line rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-surface-subtle rounded-xl text-content-muted group-hover:bg-surface-page group-hover:text-brand transition-colors">
                    <CreditCard size={22} />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-content-muted bg-surface-subtle px-2.5 py-1 rounded-full border border-line">
                    <Clock size={11} /> {plan.duration} dias
                  </span>
                </div>

                <h2 className="text-xl font-bold text-content-primary mb-1">{plan.name}</h2>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-content-primary">{formatMoney(plan.price)}</span>
                  <span className="text-sm text-content-tertiary">/ período</span>
                </div>

                <div className="border-t border-line pt-4">
                  <div className="flex items-start gap-2 text-sm text-content-tertiary">
                    <FileText size={15} className="shrink-0 mt-0.5 text-content-muted" />
                    <p className="line-clamp-3">{plan.description || "Sem descrição definida."}</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-surface-page border-t border-line flex items-center justify-between">
                <button
                  onClick={() => router.push(`/coach/plans/${plan.id}`)}
                  className="text-sm font-bold text-content-secondary hover:text-content-primary flex items-center gap-2 transition-colors"
                >
                  <Edit size={15} /> Editar
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="text-sm font-bold text-semantic-error-text hover:opacity-70 flex items-center gap-2 transition-opacity"
                >
                  <Trash2 size={15} /> Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
