'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api'; // Importamos nosso helper

export default function EditStudentPage() {
  const router = useRouter();
  const { id } = useParams(); // ID do perfil do aluno (vem da URL)
  
  const [student, setStudent] = useState({
    name: '',
    email: '',
    password: '',
    // Adicione aqui outros campos do Aluno que o coach pode editar
    phone_number: '',
    weight: '',
    objetivo: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchStudentData = async () => {
      try {
        // Busca os dados do aluno específico do coach logado
        const data = await fetchWithAuth(`alunos/${id}`);
        
        // Preenche o formulário com os dados recebidos
        setStudent({
          name: data.user.name,
          email: data.user.email,
          password: '', // Senha fica em branco por padrão
          phone_number: data.phone_number || '',
          weight: data.weight || '',
          objetivo: data.objetivo || ''
        });
      } catch (err: any) {
        setError('Erro ao carregar os dados do aluno');
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
  
    try {
      // Envia a requisição de atualização para a API Rails
      await fetchWithAuth(`alunos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ aluno: student }), // Enviamos o objeto aninhado
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
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Editar Aluno</h1>

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
          type="text"
          name="phone_number"
          value={student.phone_number}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Telefone"
        />
        <input
          type="text"
          name="weight"
          value={student.weight}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Peso (kg)"
        />
        <input
          type="text"
          name="objetivo"
          value={student.objetivo}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Objetivo"
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