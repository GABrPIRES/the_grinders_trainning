'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { emailValidator } from '@/lib/validators/emailValidator';
import 'cleave.js/dist/addons/cleave-phone.br';
import Cleave from 'cleave.js/react'

export default function AddStudentPage() {
  const [student, setStudent] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    personalId: '',
  });
  const [coaches, setCoaches] = useState<{ id: string; name: string, email: string }[]>([]);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Limpar erro anterior
    setError('');

    try {
      // Validar e-mail
      const erroEmail = await emailValidator(student.email);
      if (erroEmail) {
        setError(erroEmail); // Exibe erro no UI
        return;
      }

      // Enviar a requisição de criação
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student),
      });

      if (res.ok) {
        alert('student adicionado com sucesso!');
        router.push('/admin/students');
      } else {
        const data = await res.json();
        setError(data.error || 'Erro ao adicionar student');
      }
    } catch (err) {
      setError('Erro na conexão');
    }
  };

  useEffect(() => {
    const fetchCoaches = async () => {
      const res = await fetch('/api/admin/coachs?limit=100'); // pode ajustar o limit
      const data = await res.json();
      setCoaches(data.coachs); // 👈 use o nome correto vindo da API (Preciso terminar isso)
    };
    fetchCoaches();
  }, []);

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
        />
        <input
          type="email"
          name="email"
          value={student.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Email"
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
