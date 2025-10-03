'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api'; // 1. Importamos nosso helper

type Student = {
  id: string;
  name: string;
  email: string;
  user: { // 2. Adicionamos o objeto 'user' para corresponder à resposta da API Rails
    id: string;
    name: string;
    email: string;
  }
};

export default function AdminStudentListPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  // Paginação será implementada no futuro
  // const [limit, setLimit] = useState(10);
  // const [page, setPage] = useState(1);
  // const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search });

      // 3. Chamamos o endpoint de admin da nossa API Rails
      const data = await fetchWithAuth(`admin/alunos?${params}`);

      setStudents(data);
      // setTotal(data.total); // Paginação futura
    } catch (error) {
      console.error('Erro ao carregar students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search]); // Dependência apenas da busca por enquanto

  // const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-4xl mx-auto bg-white shadow p-6 rounded-md">
      <h2 className="text-1xl font-bold mb-4 text-neutral-800 flex justify-between items-center">
        Students cadastrados
        <button
          onClick={() => router.push(`/admin/students/create`)}
          className="text-red-600 hover:text-red-800 p-2 rounded-md cursor-pointer border border-red-600"
        >
          Adicionar Student
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
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="text-neutral-800 hover:bg-gray-100">
                {/* 4. Acessamos os dados através de student.user */}
                <td className="p-2 border border-neutral-100">{student.user.name}</td>
                <td className="p-2 border border-neutral-100">{student.user.email}</td>
                <td className="p-2 border border-neutral-100 text-xs">{student.id}</td>
                <td className="p-2 border border-neutral-100 text-center">
                  <button
                    onClick={() => router.push(`/admin/students/${student.id}/edit`)}
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
      {/* Lógica de paginação removida temporariamente */}
    </div>
  );
}