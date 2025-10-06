'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';

export default function CreatePlanPage() {
  const [plan, setPlan] = useState({
    name: '',
    description: '',
    price: '',
    duration: '', // em dias
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPlan({ ...plan, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await fetchWithAuth('planos', {
        method: 'POST',
        body: JSON.stringify({
          // Enviamos os dados aninhados dentro de um objeto 'plano'
          plano: {
            name: plan.name,
            description: plan.description,
            price: parseFloat(plan.price),
            duration: parseInt(plan.duration, 10),
          },
        }),
      });

      alert('Plano criado com sucesso!');
      router.push('/coach/plans'); // Volta para a lista de planos
    } catch (err: any) {
      setError(err.message || 'Erro ao criar o plano.');
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow rounded-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Criar Novo Plano</h1>

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
            placeholder="Ex: Plano Mensal"
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
            placeholder="Ex: Acompanhamento semanal, 4 treinos por mês."
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
            placeholder="150.00"
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
            placeholder="30"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-red-700 text-white p-2 rounded cursor-pointer hover:bg-red-800"
        >
          Salvar Plano
        </button>
      </form>
    </div>
  );
}