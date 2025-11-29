"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  CreditCard,
  Calendar,
  Clock
} from "lucide-react";

interface Student {
  id: string;
  user: { name: string; email: string; };
  pagamento: { vencimento: string | null; status: string | null; };
  plano: { nome: string | null; };
  treino_info: { proximo_treino: string | null; ultima_atualizacao: string | null; };
}

export default function CoachStudentsPage() {
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

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'ativo': 
      case 'pago':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">Em dia</span>;
      case 'atrasado':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">Atrasado</span>;
      case 'pendente':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">Pendente</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">Sem Plano</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-neutral-800 pb-20 md:pb-0">
      
      {/* CABEÇALHO RESPONSIVO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Meus Alunos</h1>
          <p className="text-neutral-500 text-sm">Gerencie o progresso e assinaturas.</p>
        </div>
        <button
          onClick={() => router.push("/coach/students/new")}
          className="w-full sm:w-auto bg-red-700 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-red-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Novo Aluno
        </button>
      </div>

      {/* BARRA DE FILTROS RESPONSIVA */}
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

        {/* Controles de Paginação */}
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

      {loading ? (
        <div className="p-12 text-center text-neutral-500 animate-pulse">Carregando lista de alunos...</div>
      ) : students.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-neutral-200 text-center flex flex-col items-center shadow-sm">
          <User size={48} className="text-neutral-300 mb-4" />
          <h3 className="text-lg font-bold text-neutral-700">Nenhum aluno encontrado</h3>
          <p className="text-neutral-500">Tente buscar por outro termo.</p>
        </div>
      ) : (
        <>
          {/* --- VISÃO MOBILE (CARDS) --- */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {students.map((student) => (
              <div 
                key={student.id}
                onClick={() => router.push(`/coach/students/${student.id}`)}
                className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm active:scale-[0.98] transition-transform"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                       {getInitials(student.user.name)}
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900 text-lg">{student.user.name}</p>
                      <p className="text-xs text-neutral-500">{student.user.email}</p>
                    </div>
                  </div>
                  {getStatusBadge(student.pagamento.status)}
                </div>

                <div className="space-y-3 pt-3 border-t border-neutral-100">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-neutral-500 flex items-center gap-2"><CreditCard size={14}/> Plano</span>
                      <span className="font-medium">{student.plano.nome || "—"}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-neutral-500 flex items-center gap-2"><Calendar size={14}/> Próx. Treino</span>
                      <span className="font-medium">
                        {student.treino_info.proximo_treino ? formatDate(student.treino_info.proximo_treino) : "—"}
                      </span>
                   </div>
                </div>
              </div>
            ))}
          </div>

          {/* --- VISÃO DESKTOP (TABELA) --- */}
          <div className="hidden md:block bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-xs uppercase text-neutral-500 font-semibold tracking-wider">
                    <th className="px-6 py-4">Aluno</th>
                    <th className="px-6 py-4">Status / Plano</th>
                    <th className="px-6 py-4">Próximo Treino</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {students.map((student) => (
                    <tr 
                      key={student.id} 
                      onClick={() => router.push(`/coach/students/${student.id}`)}
                      className="hover:bg-neutral-50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                            {getInitials(student.user.name)}
                          </div>
                          <div>
                            <p className="font-bold text-neutral-900 group-hover:text-red-700 transition-colors">
                              {student.user.name}
                            </p>
                            <p className="text-xs text-neutral-500">{student.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          {getStatusBadge(student.pagamento.status)}
                          <span className="text-xs text-neutral-500 font-medium flex items-center gap-1">
                            <CreditCard size={12}/> {student.plano.nome || "Sem plano"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2 text-sm text-neutral-700">
                            <Calendar size={16} className="text-neutral-400"/>
                            {student.treino_info.proximo_treino 
                              ? formatDate(student.treino_info.proximo_treino) 
                              : <span className="text-neutral-400 italic">Sem treino</span>
                            }
                         </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button 
                           onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/coach/students/${student.id}`);
                           }}
                           className="text-neutral-400 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-all"
                         >
                           <MoreHorizontal size={20} />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      
      {/* Resumo no rodapé */}
      {!loading && students.length > 0 && (
          <p className="text-xs text-center text-neutral-400 hidden md:block">
            Mostrando {students.length} de {total} alunos cadastrados.
          </p>
      )}
    </div>
  );
}