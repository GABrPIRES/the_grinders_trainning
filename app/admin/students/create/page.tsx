'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api'; // Importamos nosso helper
import Cleave from 'cleave.js/react';
import 'cleave.js/dist/addons/cleave-phone.br';

// Tipagem para o Coach, como recebido da nossa API Rails
interface Coach {
  id: string;
  name: string;
  email: string;
}

export default function AddStudentPage() {
  const [student, setStudent] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    personalId: '', // ID do coach selecionado
  });
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [error, setError] = useState('');
  const router = useRouter();

  // Busca a lista de coaches da API Rails quando o componente monta
  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const data = await fetchWithAuth('admin/coaches');
        setCoaches(data);
      } catch (err) {
        setError('Falha ao carregar a lista de coaches.');
      }
    };
    fetchCoaches();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    console.log(student);
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
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Adicionar Student</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 text-neutral-500">
        <input
          type="text"
          name="name"
          value={student.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Nome"
          required
        />
        <input
          type="email"
          name="email"
          value={student.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Email"
          required
        />
        <Cleave
          name="phoneNumber"
          value={student.phoneNumber}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="(11) 98888-7777"
          options={{
            phone: true,
            phoneRegionCode: 'BR',
          }}
        />
        <input
          type="password"
          name="password"
          value={student.password}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Senha"
          required
        />
        <select
          name="personalId"
          value={student.personalId}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Selecione um Coach</option>
          {coaches.map((coach) => (
            <option key={coach.id} value={coach.id}>
              {coach.name} ({coach.email})
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="w-full bg-red-700 text-white p-2 rounded cursor-pointer hover:bg-red-800"
        >
          Adicionar Student
        </button>
      </form>
    </div>
  );
}