'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { emailValidator } from '@/lib/validators/emailValidator';

export default function AddStudentPage() {
  const [student, setStudent] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        <input
          type="password"
          name="password"
          value={student.password}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Senha"
        />
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
