'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import Cleave from 'cleave.js/react';
import 'cleave.js/dist/addons/cleave-phone.br';

interface Coach {
  id: string;
  name: string;
  email: string;
}

interface Plan {
  id: string;
  name: string;
}

export default function AddStudentPage() {
  const [student, setStudent] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    personalId: '',
    planoId: '',
  });
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // 1. Busca apenas os coaches na inicialização
  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const coachesData = await fetchWithAuth('admin/coaches');
        setCoaches(coachesData);
      } catch (err) {
        setError('Falha ao carregar a lista de coaches.');
      }
    };
    fetchCoaches();
  }, []);

  // 2. Novo useEffect: Observa a seleção do coach
  useEffect(() => {
    const fetchPlansForCoach = async () => {
      // Se nenhum coach for selecionado, limpa a lista de planos
      if (!student.personalId) {
        setPlans([]);
        setStudent(prev => ({ ...prev, planoId: '' })); // Reseta a seleção do plano
        return;
      }

      setLoadingPlans(true);
      try {
        const plansData = await fetchWithAuth(`admin/planos?personal_id=${student.personalId}`);
        setPlans(plansData);
      } catch (err) {
        console.error("Erro ao buscar planos do coach:", err);
        setPlans([]);
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlansForCoach();
  }, [student.personalId]); // 3. Dispara sempre que o coach selecionado mudar

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await fetchWithAuth('admin/alunos', {
        method: 'POST',
        body: JSON.stringify({
          aluno: {
            name: student.name,
            email: student.email,
            password: student.password,
            phone_number: student.phoneNumber,
            personal_id: student.personalId,
            plano_id: student.planoId || null,
          },
        }),
      });

      alert('Aluno adicionado com sucesso!');
      router.push('/admin/students');
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar aluno');
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow rounded-md">
      <div className="border-b pb-4 mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-2">
          <ArrowLeft size={16} />
          Voltar para a lista de alunos
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Adicionar Novo Aluno</h1>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 text-neutral-500">
        {/* ... (campos de nome, email, telefone, senha) ... */}
        <input type="text" name="name" value={student.name} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Nome" required />
        <input type="email" name="email" value={student.email} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Email" required />
        <Cleave name="phoneNumber" value={student.phoneNumber} onChange={handleChange} className="w-full border p-2 rounded" placeholder="(11) 98888-7777" options={{ phone: true, phoneRegionCode: 'BR' }} />
        <input type="password" name="password" value={student.password} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Senha" required />

        <select name="personalId" value={student.personalId} onChange={handleChange} className="w-full border p-2 rounded" required >
          <option value="">Selecione um Coach</option>
          {coaches.map((coach) => (
            <option key={coach.id} value={coach.id}>
              {coach.name} ({coach.email})
            </option>
          ))}
        </select>

        {/* 4. Dropdown de planos agora é condicional */}
        <select
          name="planoId"
          value={student.planoId}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          disabled={!student.personalId || loadingPlans} // Desabilitado se nenhum coach for selecionado ou se estiver carregando
        >
          <option value="">
            {loadingPlans ? "Carregando planos..." : "Nenhum plano (apenas cadastro)"}
          </option>
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name}
            </option>
          ))}
        </select>

        <button type="submit" className="w-full bg-red-700 text-white p-2 rounded cursor-pointer hover:bg-red-800">
          Adicionar Aluno
        </button>
      </form>
    </div>
  );
}