'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';

export default function CreatePaymentPage() {
  const router = useRouter();
  const { idAluno } = useParams();
  
  const [payment, setPayment] = useState({
    amount: '',
    due_date: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPayment({ ...payment, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await fetchWithAuth('pagamentos', {
        method: 'POST',
        body: JSON.stringify({
          pagamento: {
            aluno_id: idAluno,
            amount: parseFloat(payment.amount),
            due_date: payment.due_date,
            status: 'pendente', // Todo novo pagamento começa como pendente
          },
        }),
      });

      alert('Pagamento criado com sucesso!');
      router.push(`/coach/payments/${idAluno}`); // Volta para o histórico do aluno
    } catch (err: any) {
      setError(err.message || 'Erro ao criar o pagamento.');
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow rounded-md">
      <div className="flex flex-col border-b pb-4 mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-2 self-start">
            <ArrowLeft size={16} />
            Voltar para o histórico
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Criar Novo Pagamento</h1>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-neutral-700">Valor (R$)</label>
          <input
            id="amount"
            type="number"
            name="amount"
            step="0.01"
            value={payment.amount}
            onChange={handleChange}
            className="mt-1 w-full border p-2 rounded text-neutral-600"
            placeholder="150.00"
            required
          />
        </div>
        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-neutral-700">Data de Vencimento</label>
          <input
            id="due_date"
            type="date"
            name="due_date"
            value={payment.due_date}
            onChange={handleChange}
            className="mt-1 w-full border p-2 rounded text-neutral-600"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-red-700 text-white p-2 rounded cursor-pointer hover:bg-red-800"
        >
          Salvar Pagamento
        </button>
      </form>
    </div>
  );
}