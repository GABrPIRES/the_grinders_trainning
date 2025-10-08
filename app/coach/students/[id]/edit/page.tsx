'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';

// Tipos para os dados da API
interface Plan { id: string; name: string; }
interface Assinatura { plano_id: string; status: string; }

export default function EditStudentPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '',
    plano_id: '',
    status: 'ativo',
  });

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const [studentData, plansData] = await Promise.all([
          fetchWithAuth(`alunos/${id}`),
          fetchWithAuth('planos') // Busca os planos do coach logado
        ]);
        
        const activeSubscription = studentData.assinaturas?.find((a: Assinatura) => a.status === 'ativo');

        setFormData({
          name: studentData.user.name,
          email: studentData.user.email,
          password: '',
          phone_number: studentData.phone_number || '',
          plano_id: activeSubscription?.plano_id || '',
          status: studentData.user.status || 'ativo',
        });
        setPlans(plansData);
      } catch (err) {
        setError('Erro ao carregar os dados');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await fetchWithAuth(`alunos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ aluno: formData }),
      });
      alert('Dados atualizados com sucesso!');
      router.push('/coach/students');
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
          Voltar para a lista de alunos
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Editar Aluno</h1>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 text-neutral-500">
        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Nome"/>
        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Email"/>
        <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Telefone"/>
        <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Nova senha (deixe em branco)"/>
        
        <select name="plano_id" value={formData.plano_id} onChange={handleChange} className="w-full border p-2 rounded">
          <option value="">Nenhum plano</option>
          {plans.map((plan) => (<option key={plan.id} value={plan.id}>{plan.name}</option>))}
        </select>
        
        <select name="status" value={formData.status} onChange={handleChange} className="w-full border p-2 rounded">
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>

        <button type="submit" className="w-full bg-red-700 text-white p-2 rounded hover:bg-red-800">
          Atualizar Aluno
        </button>
      </form>
    </div>
  );
}