'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit } from 'lucide-react'; // Ícone de lápis
import { useAuth } from '@/context/AuthContext';

type Student = {
  id: string;
  name: string;
  email: string;
};

export default function CoachStudentListPage() {
  const { user } = useAuth(); 
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        page: page.toString(),
        limit: limit.toString(),
      });

      const res = await fetch(`/api/coach/students?${params}`);
      const data = await res.json();

      setStudents(data.students);
      setTotal(data.total);
    } catch (error) {
      console.error('Erro ao carregar students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, page, limit]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-4xl mx-auto bg-white shadow p-6 rounded-md">
      <h2 className="text-1xl font-bold mb-4 text-neutral-800 flex justify-between items-center">
        Students cadastrados
        {/* Botão de editar na parte superior direita */}
        <button
          onClick={() => router.push(`/coach/students/create`)} // Ajuste para criar um coach, caso deseje
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
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border p-2 rounded w-full md:w-1/2"
        />

        <select
          value={limit}
          onChange={(e) => {
            setLimit(parseInt(e.target.value));
            setPage(1);
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
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="text-neutral-800 hover:bg-gray-100">
                <td className="p-2 border border-neutral-100">{student.name}</td>
                <td className="p-2 border border-neutral-100">{student.email}</td>
                <td className="p-2 border border-neutral-100 text-xs">{student.id}</td>
                <td className="p-2 border border-neutral-100 text-center">
                  {/* Botão de editar */}
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

      <div className="flex justify-between items-center mt-6 text-sm text-neutral-500">
        <button
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Anterior
        </button>

        <span>
          Página {page} de {totalPages || 1}
        </span>

        <button
          onClick={() => setPage((prev) => (prev < totalPages ? prev + 1 : prev))}
          disabled={page >= totalPages}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
