'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';

type Student = {
  id: string;
  user: {
    name: string;
    email: string;
  };
};

export default function CoachStudentListPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // 1. Enviamos os parâmetros de paginação e busca
      const params = new URLSearchParams({
        search,
        page: page.toString(),
        limit: limit.toString(),
      });

      const data = await fetchWithAuth(`alunos?${params}`);

      // 2. A resposta da API agora é um objeto com 'alunos' e 'total'
      setStudents(data.alunos);
      setTotal(data.total);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
    } finally {
      setLoading(false);
    }
  };

  // 3. O useEffect agora depende de 'page' e 'limit'
  useEffect(() => {
    fetchStudents();
  }, [search, page, limit]);

  const totalPages = Math.ceil(total / limit);

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
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // Reseta para a primeira página ao buscar
          }}
          className="border p-2 rounded w-full md:w-1/2"
        />
        <select
          value={limit}
          onChange={(e) => {
            setLimit(parseInt(e.target.value));
            setPage(1); // Reseta para a primeira página ao mudar o limite
          }}
          className="p-2 border rounded w-full md:w-auto"
        >
          {[10, 20, 50].map((num) => (
            <option key={num} value={num}>
              {num} por página
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-neutral-500 text-left">
              <th className="p-2 border">Nome</th>
              <th className="p-2 border">E-mail</th>
              <th className="p-2 border text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="text-neutral-800 hover:bg-gray-100 text-sm">
                <td className="p-2 border border-neutral-100">{student.user.name}</td>
                <td className="p-2 border border-neutral-100">{student.user.email}</td>
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

      {/* 4. Controles de paginação */}
      <div className="flex justify-between items-center mt-6 text-sm text-neutral-500">
        <button
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page === 1 || loading}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Anterior
        </button>
        <span>
          Página {page} de {totalPages || 1}
        </span>
        <button
          onClick={() => setPage((prev) => (prev < totalPages ? prev + 1 : prev))}
          disabled={page >= totalPages || loading}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}