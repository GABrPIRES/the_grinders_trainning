"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Edit, Trash2, Plus, CreditCard, 
  Clock, FileText, CheckCircle2 
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';

interface Plan {
  id: string;
  name: string;
  price: number;
  duration: number; // em dias
  description: string;
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

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDelete = async (planId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este plano?')) {
      try {
        await fetchWithAuth(`planos/${planId}`, { method: 'DELETE' });
        fetchPlans(); // Recarrega a lista
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir o plano.');
      }
    }
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 md:pb-0 text-neutral-800">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Meus Planos</h1>
          <p className="text-neutral-500 text-sm">Crie e gerencie as opções de assinatura para seus alunos.</p>
        </div>
        <button
          onClick={() => router.push('/coach/plans/create')}
          className="bg-red-700 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-red-800 shadow-md flex items-center gap-2 w-full sm:w-auto justify-center transition-all"
        >
          <Plus size={20} /> Novo Plano
        </button>
      </div>

      {/* CONTEÚDO */}
      {loading ? (
        <div className="p-12 text-center text-neutral-500 animate-pulse">Carregando planos...</div>
      ) : plans.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-neutral-200 shadow-sm flex flex-col items-center">
           <CreditCard size={48} className="text-neutral-300 mb-4" />
           <h3 className="text-lg font-bold text-neutral-700">Nenhum plano criado</h3>
           <p className="text-neutral-500 text-sm mb-6">Comece criando um plano para vender sua consultoria.</p>
           <button
             onClick={() => router.push('/coach/plans/create')}
             className="text-red-700 font-bold hover:underline"
           >
             Criar primeiro plano
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className="bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Topo do Card */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-3 bg-neutral-50 rounded-xl group-hover:bg-red-50 group-hover:text-red-700 transition-colors text-neutral-500">
                      <CreditCard size={24} />
                   </div>
                   {/* Duração Badge */}
                   <span className="flex items-center gap-1 text-xs font-bold text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                      <Clock size={12} /> {plan.duration} dias
                   </span>
                </div>

                <h2 className="text-xl font-bold text-neutral-900 mb-1">{plan.name}</h2>
                <div className="flex items-baseline gap-1 mb-4">
                   <span className="text-3xl font-bold text-neutral-900">{formatMoney(plan.price)}</span>
                   <span className="text-sm text-neutral-500">/ período</span>
                </div>

                <div className="border-t border-neutral-100 pt-4">
                   <div className="flex items-start gap-2 text-sm text-neutral-600">
                      <FileText size={16} className="shrink-0 mt-0.5 text-neutral-400"/>
                      <p className="line-clamp-3">{plan.description || "Sem descrição definida."}</p>
                   </div>
                </div>
              </div>

              {/* Ações (Rodapé) */}
              <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
                 <button
                    onClick={() => router.push(`/coach/plans/${plan.id}`)}
                    className="text-sm font-bold text-neutral-600 hover:text-neutral-900 flex items-center gap-2 transition-colors"
                 >
                    <Edit size={16} /> Editar
                 </button>
                 <button
                    onClick={() => handleDelete(plan.id)}
                    className="text-sm font-bold text-red-600 hover:text-red-800 flex items-center gap-2 transition-colors"
                 >
                    <Trash2 size={16} /> Excluir
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}