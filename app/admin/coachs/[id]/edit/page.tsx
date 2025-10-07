'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import { ArrowLeft } from 'lucide-react'; 

export default function EditCoachPage() {
  const router = useRouter();
  const { id } = useParams();
  
  // 1. Adicionamos 'status' ao estado do formulário
  const [coach, setCoach] = useState({
    name: '',
    email: '',
    password: '',
    status: 'ativo', // Valor padrão
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchCoachData = async () => {
      try {
        const data = await fetchWithAuth(`users/${id}`);
        // 2. Preenchemos o estado com o status vindo da API
        setCoach({
          name: data.name,
          email: data.email,
          password: '',
          status: data.status,
        });
      } catch (err: any) {
        setError('Erro ao carregar os dados do coach');
      } finally {
        setLoading(false);
      }
    };
    fetchCoachData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCoach({ ...coach, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
  
    try {
      // 3. O 'status' já está no objeto 'coach', então ele será enviado automaticamente
      await fetchWithAuth(`users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ user: coach }),
      });
  
      alert('Dados atualizados com sucesso!');
      router.push('/admin/coachs');
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar os dados');
    }
  };
  
  if (loading) return <p>Carregando...</p>;

  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow rounded-md">
      <div className="border-b pb-4 mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-2">
          <ArrowLeft size={16} />
          Voltar para a lista de coaches
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Editar Coach</h1>
      </div>
      
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
        
        {/* 4. Adicionamos o dropdown de status */}
        <div>
          <select
            id="status"
            name="status"
            value={coach.status}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>

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