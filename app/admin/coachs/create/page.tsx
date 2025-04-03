'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { emailValidator } from '@/lib/validators/emailValidator';

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

    // Limpar erro anterior
    setError('');

    try {
      // Validar e-mail
      const erroEmail = await emailValidator(coach.email);
      if (erroEmail) {
        setError(erroEmail); // Exibe erro no UI
        return;
      }

      // Enviar a requisição de criação
      const res = await fetch('/api/admin/coachs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coach),
      });

      if (res.ok) {
        alert('Coach adicionado com sucesso!');
        router.push('/admin/coachs');
      } else {
        const data = await res.json();
        setError(data.error || 'Erro ao adicionar coach');
      }
    } catch (err) {
      setError('Erro na conexão');
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow rounded-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Adicionar Coach</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 text-neutral-500">
        <input
          type="text"
          name="name"
          value={coach.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Nome"
        />
        <input
          type="email"
          name="email"
          value={coach.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Email"
        />
        <input
          type="password"
          name="password"
          value={coach.password}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Senha"
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
