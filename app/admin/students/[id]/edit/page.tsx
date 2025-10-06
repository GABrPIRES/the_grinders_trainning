'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';

interface Coach { id: string; name: string; email: string; }
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
    personal_id: '',
    plano_id: '',
    status: 'ativo',
  });

  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [error, setError] = useState('');

  // Efeito para buscar os dados iniciais
  useEffect(() => {
    if (!id) return;
    const fetchInitialData = async () => {
      try {
        const [studentData, coachesData] = await Promise.all([
          fetchWithAuth(`admin/alunos/${id}`),
          fetchWithAuth('admin/coaches')
        ]);
        
        const activeSubscription = studentData.assinaturas.find((a: Assinatura) => a.status === 'ativo');

        setFormData({
          name: studentData.user.name,
          email: studentData.user.email,
          password: '',
          phone_number: studentData.phone_number || '',
          personal_id: studentData.personal_id || '',
          plano_id: activeSubscription?.plano_id || '',
          status: studentData.user.status || 'ativo',
        });
        setCoaches(coachesData);
      } catch (err) {
        setError('Erro ao carregar os dados iniciais.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id]);

  // Efeito separado para buscar os planos do coach selecionado
  useEffect(() => {
    const fetchPlansForCoach = async () => {
      if (!formData.personal_id) {
        setPlans([]);
        return;
      }
      setLoadingPlans(true);
      try {
        // CORREÇÃO AQUI: Chamada para o endpoint de admin
        const plansData = await fetchWithAuth(`admin/planos?personal_id=${formData.personal_id}`);
        setPlans(plansData);
      } catch (err) {
        console.error("Erro ao buscar planos do coach:", err);
        setPlans([]);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlansForCoach();
  }, [formData.personal_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newState = { ...prev, [name]: value };
      if (name === 'personal_id') {
        newState.plano_id = ''; // Reseta o plano se o coach mudar
      }
      return newState;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await fetchWithAuth(`admin/alunos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ aluno: formData }),
      });
      alert('Dados atualizados com sucesso!');
      router.push('/admin/students');
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar os dados');
    }
  };
  
  if (loading) return <p>Carregando...</p>;

  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow rounded-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Editar Aluno (Admin)</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 text-neutral-500">
        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Nome"/>
        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Email"/>
        <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Telefone"/>
        <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Nova senha (deixe em branco)"/>
        
        <select name="personal_id" value={formData.personal_id} onChange={handleChange} className="w-full border p-2 rounded" required>
          <option value="">Selecione um Coach</option>
          {coaches.map((coach) => (<option key={coach.id} value={coach.id}>{coach.name}</option>))}
        </select>

        <select name="plano_id" value={formData.plano_id} onChange={handleChange} className="w-full border p-2 rounded" disabled={!formData.personal_id || loadingPlans}>
          <option value="">{loadingPlans ? "Carregando planos..." : "Nenhum plano"}</option>
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