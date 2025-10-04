'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api'; // 1. Importamos nosso helper
import Cleave from 'cleave.js/react';
import 'cleave.js/dist/addons/cleave-phone.br';

export default function AddStudentPage() {
  const [student, setStudent] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // 2. Usamos o fetchWithAuth para chamar a API Rails
      await fetchWithAuth('alunos', {
        method: 'POST',
        body: JSON.stringify({
          // 3. Enviamos os dados no formato que a API espera
          aluno: {
            name: student.name,
            email: student.email,
            password: student.password,
            phone_number: student.phoneNumber, // Convertido para snake_case
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
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Adicionar Aluno</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* O formulário JSX permanece o mesmo, mas com 'phoneNumber' */}
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