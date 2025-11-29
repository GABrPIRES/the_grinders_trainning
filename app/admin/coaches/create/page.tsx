'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api'; // 1. Importamos nosso helper
import { ArrowLeft } from 'lucide-react'; 

export default function AddCoachPage() {
  const [coach, setCoach] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCoach({ ...coach, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // 2. Usamos o fetchWithAuth para a chamada de API
      await fetchWithAuth('users', {
        method: 'POST',
        body: JSON.stringify({
          // 3. Enviamos os dados aninhados dentro de um objeto 'user'
          user: {
            ...coach,
            role: 'personal', // Definimos a role aqui
          },
        }),
      });

      alert('Coach adicionado com sucesso!');
      router.push('/admin/coachs');
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar coach');
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow rounded-md">
      <div className="border-b pb-4 mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-2">
          <ArrowLeft size={16} />
          Voltar para a lista de coaches
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Adicionar Novo Coach</h1>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* O formulário JSX permanece o mesmo */}
      <form onSubmit={handleSubmit} className="space-y-4 text-neutral-500">
        <input
          type="text"
          name="name"
          value={coach.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Nome"
          required
        />
        <input
          type="email"
          name="email"
          value={coach.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password"
          value={coach.password}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Senha"
          required
        />
        <button
          type="submit"
          className="w-full bg-red-700 text-white p-2 rounded cursor-pointer hover:bg-red-800"
        >
          Adicionar Coach
        </button>
      </form>
    </div>
  );
}