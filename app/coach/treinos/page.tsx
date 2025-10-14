"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";

// Interface atualizada (sem treino_info)
interface Student {
  id: string;
  user: { name: string; email: string; };
  pagamento: { vencimento: string | null; status: string | null; };
  plano: { nome: string | null; };
  // A propriedade treino_info foi removida
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
        const params = new URLSearchParams({ search, page: page.toString(), limit: limit.toString() });
        const data = await fetchWithAuth(`alunos?${params}`);
        setStudents(data.alunos);
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-neutral-800">
      <h1 className="text-2xl font-bold mb-6">Selecionar Aluno para Gerenciar Treinos</h1>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar por nome ou email"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="border border-neutral-300 p-2 rounded w-full md:w-1/2"
        />
      </div>

      {loading ? (
        <p className="text-sm">Carregando alunos...</p>
      ) : (
        <ul className="space-y-3">
          {students.map((student) => (
            <li
              key={student.id}
              className="bg-white border border-neutral-300 rounded p-4 cursor-pointer hover:border-red-700 transition"
              onClick={() => setSelectedId((prev) => (prev === student.id ? null : student.id))}
            >
              <div className="flex justify-between items-center">
                <p className="font-semibold">{student.user.name}</p>
                <span className="text-sm text-neutral-500">{student.user.email}</span>
              </div>

              {selectedId === student.id && (
                <div className="mt-4 border-t pt-4 text-sm space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><span className="font-semibold">Plano:</span> {student.plano.nome || '-'}</div>
                    <div><span className="font-semibold">Status:</span> <span className={student.pagamento.status === 'ativo' ? 'text-green-600 font-bold' : 'text-orange-500 font-bold'}>{student.pagamento.status || '-'}</span></div>
                    <div><span className="font-semibold">Vencimento:</span> {formatDate(student.pagamento.vencimento)}</div>
                  </div>
                  
                  {/* AS LINHAS QUE CAUSAVAM O ERRO FORAM REMOVIDAS DAQUI
                  */}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Agora isso leva para a página de blocos do aluno
                      router.push(`/coach/treinos/${student.id}`);
                    }}
                    className="mt-3 bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
                  >
                    Gerenciar blocos de treino
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* --- CONTROLES DE PAGINAÇÃO --- */}
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