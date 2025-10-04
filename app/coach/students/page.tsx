'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api'; // 1. Importamos nosso helper

// A API Rails retorna o Aluno com o User aninhado
type Student = {
  id: string; // ID do perfil Aluno
  user: {
    id: string; // ID do User
    name: string;
    email: string;
  }
};

export default function CoachStudentListPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        // 2. Chamamos o endpoint de alunos do Rails para o coach.
        // A API já filtra e retorna apenas os alunos do coach logado.
        // Adicionamos o parâmetro de busca que a API Rails espera.
        const data = await fetchWithAuth(`alunos?search=${search}`);
        
        setStudents(data);
      } catch (error) {
        console.error('Erro ao carregar alunos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [search]);

  return (
    <div className="max-w-4xl mx-auto bg-white shadow p-6 rounded-md">
      <h2 className="text-1xl font-bold mb-4 text-neutral-800 flex justify-between items-center">
        Meus Alunos
        <button
          onClick={() => router.push(`/coach/students/create`)}
          className="text-red-600 hover:text-red-800 p-2 rounded-md cursor-pointer border border-red-600"
        >
          Adicionar Aluno
        </button>
      </h2>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 text-neutral-500">
        <input
          type="text"
          placeholder="Buscar por nome ou e-mail"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full md:w-1/2"
        />
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-neutral-500 text-left">
              <th className="p-2 border">Nome</th>
              <th className="p-2 border">E-mail</th>
              <th className="p-2 border">ID do Aluno</th>
              <th className="p-2 border text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="text-neutral-800 hover:bg-gray-100">
                {/* 3. Acessamos os dados através de student.user */}
                <td className="p-2 border border-neutral-100">{student.user.name}</td>
                <td className="p-2 border border-neutral-100">{student.user.email}</td>
                <td className="p-2 border border-neutral-100 text-xs">{student.id}</td>
                <td className="p-2 border border-neutral-100 text-center">
                  <button
                    onClick={() => router.push(`/coach/students/${student.id}/edit`)}
                    className="text-red-600 cursor-pointer hover:text-red-800"
                  >
                    <Edit size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Paginação pode ser adicionada no futuro, adaptando a API Rails */}
    </div>
  );
}