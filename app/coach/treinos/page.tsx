"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface Student {
  id: string;
  name: string;
  email: string;
}

export default function CoachStudentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
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
        console.error("Erro ao buscar alunos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [search, page, limit]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-4xl mx-auto p-6 text-neutral-800">
      <h1 className="text-2xl font-bold mb-6">Alunos</h1>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar por nome ou email"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border border-neutral-300 p-2 rounded w-full md:w-1/2"
        />

        <select
          value={limit}
          onChange={(e) => {
            setLimit(parseInt(e.target.value));
            setPage(1);
          }}
          className="border border-neutral-300 p-2 rounded w-full md:w-auto"
        >
          {[10, 25, 50].map((n) => (
            <option key={n} value={n}>
              {n} por página
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm">Carregando alunos...</p>
      ) : (
        <ul className="space-y-3">
          {students.map((student, index) => (
            <li
              key={student.id}
              className="bg-white border border-neutral-300 rounded p-4 cursor-pointer hover:border-red-700 transition"
              onClick={() => setSelectedId((prev) => (prev === student.id ? null : student.id))}
            >
              <div className="flex justify-between items-center">
                <p className="font-semibold">
                  {index + 1} - {student.name}
                </p>
                <span className="text-sm text-neutral-500">{student.email}</span>
              </div>

              {selectedId === student.id && (
                <div className="mt-4 border-t pt-4 text-sm space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="font-semibold">Pagamento:</span> Pago
                    </div>
                    <div>
                      <span className="font-semibold">Vencimento:</span> 22/03/2025
                    </div>
                    <div>
                      <span className="font-semibold">Plano:</span> Mensal - Plus
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold">Treino - Última atualização:</span> 22/02/2025
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/coach/treinos/${student.id}`);
                    }}
                    className="mt-3 bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
                  >
                    Editar treino
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-between items-center mt-6 text-sm">
        <button
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page === 1}
          className="px-4 py-2 border rounded hover:bg-neutral-100 disabled:opacity-50"
        >
          Anterior
        </button>

        <span>
          Página {page} de {totalPages || 1}
        </span>

        <button
          onClick={() => setPage((prev) => (prev < totalPages ? prev + 1 : prev))}
          disabled={page >= totalPages}
          className="px-4 py-2 border rounded hover:bg-neutral-100 disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}