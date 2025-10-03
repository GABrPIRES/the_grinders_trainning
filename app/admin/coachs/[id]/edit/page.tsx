'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';

export default function EditCoachPage() {
  const router = useRouter();
  const { id } = useParams();
  const [coach, setCoach] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchCoachData = async () => {
      try {
        const data = await fetchWithAuth(`users/${id}`); // Busca na API Rails
        setCoach({ name: data.name, email: data.email, password: '' });
      } catch (err: any) {
        setError('Erro ao carregar os dados do coach');
      } finally {
        setLoading(false);
      }
    };
    fetchCoachData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCoach({ ...coach, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
  
    try {
      await fetchWithAuth(`users/${id}`, {
        method: 'PATCH', // Usamos PATCH para atualização
        body: JSON.stringify({ user: coach }), // Aninhado em 'user'
      });
  
      alert('Dados atualizados com sucesso!');
      router.push('/admin/coachs');
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar os dados');
    }
  };
  
  if (loading) return <p>Carregando...</p>;

  // O formulário JSX permanece o mesmo
  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow rounded-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Editar Coach</h1>
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
          placeholder="Nova senha (deixe em branco para não alterar)"
        />
        <button
          type="submit"
          className="w-full bg-red-700 text-white p-2 rounded hover:bg-red-800"
        >
          Atualizar
        </button>
      </form>
    </div>
  );
}