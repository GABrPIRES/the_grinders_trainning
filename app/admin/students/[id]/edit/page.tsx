'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api'; // Importamos nosso helper

export default function EditStudentPage() {
  const router = useRouter();
  const { id } = useParams(); // O id do aluno vem da URL
  
  const [studentData, setStudentData] = useState({
    name: '',
    email: '',
    password: '', // Apenas para a nova senha
    personal_id: '', // Para o dropdown de coaches
    phone_number: '',
    // Adicione outros campos do perfil do aluno aqui se quiser editá-los
  });

  const [coaches, setCoaches] = useState<{ id: string; name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // Busca os dados do aluno específico e a lista de todos os coaches em paralelo
        const [studentResult, coachesResult] = await Promise.all([
          fetchWithAuth(`admin/alunos/${id}`),
          fetchWithAuth('admin/coaches')
        ]);
        
        // Preenche o formulário com os dados do aluno
        setStudentData({
          name: studentResult.user.name,
          email: studentResult.user.email,
          password: '',
          personal_id: studentResult.personal_id,
          phone_number: studentResult.phone_number,
        });

        setCoaches(coachesResult);
      } catch (err: any) {
        setError('Erro ao carregar os dados');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setStudentData({ ...studentData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
  
    try {
      // Cria um objeto apenas com os dados a serem enviados,
      // incluindo a conversão para snake_case se necessário
      const payload = {
        aluno: {
          name: studentData.name,
          email: studentData.email,
          password: studentData.password,
          personal_id: studentData.personal_id,
          phone_number: studentData.phone_number
        }
      };

      await fetchWithAuth(`admin/alunos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
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
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Editar Student</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 text-neutral-500">
        <input
          type="text"
          name="name"
          value={studentData.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Nome"
        />
        <input
          type="email"
          name="email"
          value={studentData.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Email"
        />
        <input
          type="text"
          name="phone_number"
          value={studentData.phone_number}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Telefone"
        />
        <input
          type="password"
          name="password"
          value={studentData.password}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Nova senha (deixe em branco para não alterar)"
        />
        <select
          name="personal_id"
          value={studentData.personal_id}
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
          className="w-full bg-red-700 text-white p-2 rounded hover:bg-red-800"
        >
          Atualizar
        </button>
      </form>
    </div>
  );
}