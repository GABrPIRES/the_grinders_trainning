'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';

export default function EditPlanPage() {
  const [plan, setPlan] = useState({
    name: '',
    description: '',
    price: '',
    duration: '', // em dias
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { id } = useParams(); // Pega o ID do plano da URL

  useEffect(() => {
    if (!id) return;
    const fetchPlanData = async () => {
      setLoading(true);
      try {
        const data = await fetchWithAuth(`planos/${id}`);
        setPlan({
          name: data.name,
          description: data.description || '',
          price: data.price.toString(),
          duration: data.duration.toString(),
        });
      } catch (err: any) {
        setError('Erro ao carregar o plano.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPlan({ ...plan, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await fetchWithAuth(`planos/${id}`, {
        method: 'PATCH', // Usamos PATCH para atualização
        body: JSON.stringify({
          plano: {
            name: plan.name,
            description: plan.description,
            price: parseFloat(plan.price),
            duration: parseInt(plan.duration, 10),
          },
        }),
      });

      alert('Plano atualizado com sucesso!');
      router.push('/coach/plans'); // Volta para a lista de planos
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar o plano.');
    }
  };

  if (loading) return <p className="text-neutral-800">Carregando...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow rounded-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Editar Plano</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-neutral-700">Nome do Plano</label>
          <input
            id="name"
            type="text"
            name="name"
            value={plan.name}
            onChange={handleChange}
            className="mt-1 w-full border p-2 rounded text-neutral-600"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-neutral-700">Descrição</label>
          <textarea
            id="description"
            name="description"
            value={plan.description}
            onChange={handleChange}
            className="mt-1 w-full border p-2 rounded text-neutral-600"
            rows={3}
          />
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-neutral-700">Preço (R$)</label>
          <input
            id="price"
            type="number"
            name="price"
            step="0.01"
            value={plan.price}
            onChange={handleChange}
            className="mt-1 w-full border p-2 rounded text-neutral-600"
            required
          />
        </div>
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-neutral-700">Duração (dias)</label>
          <input
            id="duration"
            type="number"
            name="duration"
            value={plan.duration}
            onChange={handleChange}
            className="mt-1 w-full border p-2 rounded text-neutral-600"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-red-700 text-white p-2 rounded cursor-pointer hover:bg-red-800"
        >
          Salvar Alterações
        </button>
      </form>
    </div>
  );
}