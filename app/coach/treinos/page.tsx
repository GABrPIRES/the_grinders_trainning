"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Dumbbell,
  Calendar,
  Clock,
  ArrowRight
} from "lucide-react";

interface Student {
  id: string;
  user: { name: string; email: string; };
  pagamento: { vencimento: string | null; status: string | null; };
  plano: { nome: string | null; };
  treino_info: { proximo_treino: string | null; ultima_atualizacao: string | null; };
}

export default function CoachWorkoutsSelectionPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, page, limit]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ 
        search, 
        page: page.toString(), 
        limit: limit.toString() 
      });
      const data = await fetchWithAuth(`alunos?${params}`);
      setStudents(data.alunos);
      setTotal(data.total);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'short' });
  };

  // Badge simplificado para treino (foca se está ativo ou não)
  const getStatusIndicator = (status: string | null) => {
    if (status === 'ativo' || status === 'pago') {
        return <span className="w-2.5 h-2.5 rounded-full bg-green-500 block" title="Ativo"></span>;
    }
    return <span className="w-2.5 h-2.5 rounded-full bg-red-400 block" title="Inativo/Pendente"></span>;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-neutral-800 pb-20 md:pb-0">
      
      {/* CABEÇALHO */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Dumbbell className="text-red-700" /> Gerenciar Treinos
        </h1>
        <p className="text-neutral-500 text-sm">Selecione um aluno para editar ou criar planilhas.</p>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Busca */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input
            type="text"
            placeholder="Buscar aluno..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
          />
        </div>

        {/* Paginação */}
        <div className="flex flex-col sm:flex-row w-full md:w-auto items-center gap-4">
          <select
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            className="w-full sm:w-auto border border-neutral-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-white"
          >
            <option value="10">10 por pág</option>
            <option value="20">20 por pág</option>
            <option value="50">50 por pág</option>
          </select>
          
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-medium text-neutral-600 whitespace-nowrap">
              {page} / {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
              disabled={page >= totalPages}
              className="p-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      {loading ? (
        <div className="p-12 text-center text-neutral-500 animate-pulse">Carregando lista...</div>
      ) : students.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-neutral-200 text-center flex flex-col items-center shadow-sm">
          <User size={48} className="text-neutral-300 mb-4" />
          <h3 className="text-lg font-bold text-neutral-700">Nenhum aluno encontrado</h3>
        </div>
      ) : (
        <>
          {/* --- MOBILE (CARDS) --- */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {students.map((student) => (
              <div 
                key={student.id}
                onClick={() => router.push(`/coach/treinos/${student.id}`)}
                className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm active:scale-[0.98] transition-transform relative overflow-hidden"
              >
                {/* Indicador lateral colorido */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${student.pagamento.status === 'ativo' ? 'bg-green-500' : 'bg-red-400'}`}></div>

                <div className="flex justify-between items-start mb-4 pl-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center font-bold text-sm border border-neutral-200">
                       {getInitials(student.user.name)}
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900 text-lg">{student.user.name}</p>
                      <p className="text-xs text-neutral-500">{student.plano.nome || "Sem plano"}</p>
                    </div>
                  </div>
                  <ChevronRight className="text-neutral-300" />
                </div>

                <div className="space-y-2 pt-3 border-t border-neutral-100 pl-3">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-neutral-500 flex items-center gap-2"><Clock size={14}/> Última Atualização</span>
                      <span className="font-medium">
                        {student.treino_info.ultima_atualizacao ? formatDate(student.treino_info.ultima_atualizacao) : "—"}
                      </span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-neutral-500 flex items-center gap-2"><Calendar size={14}/> Próx. Treino</span>
                      <span className="font-medium text-red-700">
                        {student.treino_info.proximo_treino ? formatDate(student.treino_info.proximo_treino) : "—"}
                      </span>
                   </div>
                </div>
              </div>
            ))}
          </div>

          {/* --- DESKTOP (TABELA) --- */}
          <div className="hidden md:block bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-xs uppercase text-neutral-500 font-semibold tracking-wider">
                    <th className="px-6 py-4 w-10"></th> {/* Status Dot */}
                    <th className="px-6 py-4">Aluno</th>
                    <th className="px-6 py-4">Última Atualização</th>
                    <th className="px-6 py-4">Próximo Treino</th>
                    <th className="px-6 py-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {students.map((student) => (
                    <tr 
                      key={student.id} 
                      onClick={() => router.push(`/coach/treinos/${student.id}`)}
                      className="hover:bg-neutral-50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        {getStatusIndicator(student.pagamento.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center font-bold text-xs border border-neutral-200">
                            {getInitials(student.user.name)}
                          </div>
                          <div>
                            <p className="font-bold text-neutral-900 group-hover:text-red-700 transition-colors">
                              {student.user.name}
                            </p>
                            <p className="text-xs text-neutral-500">{student.plano.nome || "Sem plano"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                         {student.treino_info.ultima_atualizacao 
                           ? formatDate(student.treino_info.ultima_atualizacao) 
                           : <span className="text-neutral-400">-</span>
                         }
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-neutral-800">
                         {student.treino_info.proximo_treino 
                           ? formatDate(student.treino_info.proximo_treino) 
                           : <span className="text-neutral-400">-</span>
                         }
                      </td>
                      <td className="px-6 py-4 text-right">
                         <span className="inline-flex items-center gap-1 text-sm font-bold text-red-700 hover:text-red-800 hover:underline">
                            Abrir Planilha <ArrowRight size={16} />
                         </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      
      {!loading && students.length > 0 && (
          <p className="text-xs text-center text-neutral-400 hidden md:block">
            Mostrando {students.length} de {total} alunos.
          </p>
      )}
    </div>
  );
}