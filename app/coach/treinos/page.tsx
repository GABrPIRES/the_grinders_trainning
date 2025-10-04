"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api"; // 1. Importamos nosso helper

// A API Rails retorna o Aluno com o User aninhado
interface Student {
  id: string; // ID do perfil Aluno
  user: {
    name: string;
    email: string;
  };
}

export default function CoachStudentsForWorkoutsPage() {
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
        // 2. Chamamos a API Rails para buscar os alunos do coach
        const data = await fetchWithAuth(`alunos?search=${search}`);
        
        setStudents(data);
        setTotal(data.length); // Paginação será ajustada no futuro
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
      <h1 className="text-2xl font-bold mb-6">Selecionar Aluno para Gerenciar Treinos</h1>

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
                  {index + 1} - {student.user.name}
                </p>
                <span className="text-sm text-neutral-500">{student.user.email}</span>
              </div>

              {selectedId === student.id && (
                <div className="mt-4 border-t pt-4 text-sm space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Dados estáticos por enquanto */}
                    <div>
                      <span className="font-semibold">Pagamento:</span> -
                    </div>
                    <div>
                      <span className="font-semibold">Vencimento:</span> -
                    </div>
                    <div>
                      <span className="font-semibold">Plano:</span> -
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold">Treino - Última atualização:</span> -
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // 3. A rota para ver os treinos do aluno já está correta
                      router.push(`/coach/treinos/${student.id}`);
                    }}
                    className="mt-3 bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
                  >
                    Gerenciar treinos
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Paginação removida temporariamente */}
    </div>
  );
}