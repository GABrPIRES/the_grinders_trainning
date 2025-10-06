'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash } from 'lucide-react';
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
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth('planos');
      setPlans(data);
    } catch (err: any) {
      setError('Erro ao carregar os planos.');
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
        alert('Plano excluído com sucesso!');
        fetchPlans(); // Recarrega a lista
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir o plano.');
      }
    }
  };

  if (loading) return <p className="text-neutral-800">Carregando planos...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto bg-white shadow p-6 rounded-md">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-neutral-800">Meus Planos</h1>
        <button
          onClick={() => router.push('/coach/plans/create')}
          className="bg-red-700 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-800"
        >
          Criar Novo Plano
        </button>
      </div>

      {plans.length === 0 ? (
        <p className="text-neutral-500">Nenhum plano cadastrado ainda.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="border rounded-lg p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <div>
                <h2 className="text-lg font-bold text-neutral-800">{plan.name}</h2>
                <p className="text-sm text-neutral-600 my-2">{plan.description}</p>
                <p className="text-2xl font-bold text-red-700">
                  R$ {plan.price.toFixed(2).replace('.', ',')}
                  <span className="text-sm font-normal text-neutral-500"> / {plan.duration} dias</span>
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 mt-4">
                <button
                  onClick={() => router.push(`/coach/plans/${plan.id}`)}
                  className="p-2 text-blue-600 hover:text-blue-800"
                  aria-label="Editar plano"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="p-2 text-red-600 hover:text-red-800"
                  aria-label="Excluir plano"
                >
                  <Trash size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}