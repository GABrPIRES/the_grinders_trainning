'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { emailValidator } from '@/lib/validators/emailValidator';

export default function EditStudentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = useParams()
  const [student, setStudent] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudentData = async () => {
      const res = await fetch(`/api/coach/students/${id}`);
      const data = await res.json();
      if (res.ok) {
        setStudent({ name: data.name, email: data.email, password: '' });
        setLoading(false);
      } else {
        setError('Erro ao carregar os dados do coach');
      }
    };
    fetchStudentData();
  }, [id]);

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
      // Enviar a requisição de atualização
      const res = await fetch(`/api/coach/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student),
      });
  
      // Se a requisição for bem-sucedida
      if (res.ok) {
        alert('Dados atualizados com sucesso!');
        router.push('/coach/students');
      } else {
        const data = await res.json();
        console.log('Erro na API PUT:', data);  // Logando o erro da API
        setError(data.error || 'Erro ao atualizar os dados');
      }
    } catch (err) {
        console.error('Erro na requisição:', err);  // Logando o erro real
      setError('Erro na conexão');
    }
  };
  

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow rounded-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Editar Student</h1>

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