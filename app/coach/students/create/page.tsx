'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import Cleave from 'cleave.js/react';
import 'cleave.js/dist/addons/cleave-phone.br';

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
    planoId: '', // Novo campo para o ID do plano
  });
  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState('');
  const router = useRouter();

  // Busca os planos do coach logado para preencher o dropdown
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await fetchWithAuth('planos');
        setPlans(data);
      } catch (err) {
        console.error("Falha ao carregar planos:", err);
      }
    };
    fetchPlans();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await fetchWithAuth('alunos', {
        method: 'POST',
        body: JSON.stringify({
          aluno: {
            name: student.name,
            email: student.email,
            password: student.password,
            phone_number: student.phoneNumber,
            plano_id: student.planoId || null, // Envia null se nenhum plano for selecionado
          },
        }),
      });

      alert('Aluno adicionado com sucesso!');
      router.push('/coach/students');
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
        <input
          type="text" name="name" value={student.name} onChange={handleChange}
          className="w-full border p-2 rounded" placeholder="Nome" required
        />
        <input
          type="email" name="email" value={student.email} onChange={handleChange}
          className="w-full border p-2 rounded" placeholder="Email" required
        />
        <Cleave
          name="phoneNumber" value={student.phoneNumber} onChange={handleChange}
          className="w-full border p-2 rounded" placeholder="(11) 98888-7777"
          options={{ phone: true, phoneRegionCode: 'BR' }}
        />
        <input
          type="password" name="password" value={student.password} onChange={handleChange}
          className="w-full border p-2 rounded" placeholder="Senha" required
        />
        
        {/* Novo campo para selecionar o plano */}
        <select
          name="planoId"
          value={student.planoId}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="">Nenhum plano (apenas cadastro)</option>
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="w-full bg-red-700 text-white p-2 rounded cursor-pointer hover:bg-red-800"
        >
          Adicionar Aluno
        </button>
      </form>
    </div>
  );
}