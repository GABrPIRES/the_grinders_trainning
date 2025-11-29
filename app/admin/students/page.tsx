"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { 
  Search, Plus, MoreHorizontal, ChevronLeft, ChevronRight, 
  User, Shield, Mail, Calendar, CreditCard, Filter
} from "lucide-react";

interface Student {
  id: string;
  created_at: string;
  user: { name: string; email: string };
  // O aluno tem um coach (personal)
  personal?: {
    user: { name: string };
  };
  pagamento?: { status: string };
  plano?: { nome: string };
}

export default function AdminStudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Debounce na busca
  useEffect(() => {
    const timer = setTimeout(() => fetchStudents(), 500);
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
      // Busca na rota de Admin
      const data = await fetchWithAuth(`admin/alunos?${params}`); 
      
      const lista = Array.isArray(data) ? data : (data.alunos || []);
      const totalCount = data.total || lista.length;

      setStudents(lista);
      setTotal(totalCount);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (studentId: string) => {
    // Redireciona para a tela de edição do admin
    router.push(`/admin/students/${studentId}/edit`);
  };

  const totalPages = Math.ceil(total / limit);

  // Helpers Visuais
  const getInitials = (name: string) => name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "AL";
  
  const formatDate = (date: string) => {
      if (!date) return "-";
      return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'ativo': 
      case 'pago':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">Ativo</span>;
      case 'atrasado':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">Atrasado</span>;
      case 'pendente':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">Pendente</span>;
      default: 
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">Sem Status</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-neutral-800 pb-20 md:pb-0">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Gerenciar Alunos</h1>
          <p className="text-neutral-500 text-sm">Visão global de todos os alunos da plataforma.</p>
        </div>
        <button
          onClick={() => router.push("/admin/students/create")}
          className="bg-red-700 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-red-800 shadow-md flex items-center gap-2 w-full sm:w-auto justify-center transition-all"
        >
          <Plus size={20} /> Novo Aluno
        </button>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input
            type="text" placeholder="Buscar aluno por nome ou email..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none transition-all"
          />
        </div>
        
        {/* Paginação Compacta */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-between md:justify-end">
           <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="w-full sm:w-auto border border-neutral-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-white"
            >
              <option value="10">10 por pág</option>
              <option value="20">20 por pág</option>
              <option value="50">50 por pág</option>
            </select>

           <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500 hidden sm:block mr-2">
                  {students.length} de {total}
              </span>
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"><ChevronLeft size={18}/></button>
              <span className="text-sm font-bold min-w-[20px] text-center">{page}</span>
              <button onClick={() => setPage(p => (p < totalPages ? p+1 : p))} disabled={page>=totalPages} className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"><ChevronRight size={18}/></button>
           </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      {loading ? (
        <div className="p-12 text-center text-neutral-500 animate-pulse">Carregando alunos...</div>
      ) : students.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-neutral-200 shadow-sm flex flex-col items-center">
           <User size={48} className="text-neutral-300 mb-3"/>
           <h3 className="text-lg font-bold text-neutral-700">Nenhum aluno encontrado</h3>
           <p className="text-neutral-500 text-sm">Tente buscar por outro termo.</p>
        </div>
      ) : (
        <>
          {/* MOBILE CARDS (Grid) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {students.map((student) => (
              <div 
                key={student.id} 
                onClick={() => handleRowClick(student.id)} // CLIQUE NO CARD MOBILE
                className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm flex flex-col gap-4 active:scale-[0.98] transition-transform"
              >
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        {getInitials(student.user.name)}
                        </div>
                        <div>
                        <h3 className="font-bold text-neutral-900 text-sm">{student.user.name}</h3>
                        <p className="text-xs text-neutral-500">{student.user.email}</p>
                        </div>
                    </div>
                    {getStatusBadge(student.pagamento?.status)}
                 </div>
                 
                 <div className="grid grid-cols-2 gap-2 text-sm border-t border-neutral-100 pt-3">
                    <div>
                       <span className="text-[10px] text-neutral-400 font-bold uppercase block mb-0.5">Coach</span>
                       <span className="text-neutral-800 flex items-center gap-1 font-medium">
                          <Shield size={12} className="text-red-700"/> {student.personal?.user?.name || "Sem Coach"}
                       </span>
                    </div>
                    <div>
                       <span className="text-[10px] text-neutral-400 font-bold uppercase block mb-0.5">Cadastro</span>
                       <span className="text-neutral-800 font-medium">{formatDate(student.created_at)}</span>
                    </div>
                 </div>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200 text-left">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Aluno</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Coach Responsável</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status Financeiro</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Data Cadastro</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {students.map((student) => (
                  <tr 
                    key={student.id} 
                    onClick={() => handleRowClick(student.id)} // CLIQUE NA LINHA DESKTOP
                    className="hover:bg-neutral-50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center font-bold text-xs border border-neutral-200 group-hover:bg-white group-hover:shadow-sm transition-all">
                           {getInitials(student.user.name)}
                        </div>
                        <div>
                           <p className="font-bold text-neutral-900 text-sm group-hover:text-red-700 transition-colors">{student.user.name}</p>
                           <p className="text-xs text-neutral-500">{student.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2 text-sm text-neutral-700 font-medium bg-neutral-50 px-2 py-1 rounded w-fit border border-neutral-100">
                          <Shield size={14} className="text-red-700"/>
                          {student.personal?.user?.name || <span className="text-neutral-400 italic">Sem Coach</span>}
                       </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(student.pagamento?.status)}</td>
                    <td className="px-6 py-4 text-sm text-neutral-500 font-mono">{formatDate(student.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                       <button 
                         className="text-neutral-400 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-all"
                         title="Editar"
                         onClick={(e) => {
                             e.stopPropagation(); 
                             handleRowClick(student.id);
                         }}
                       >
                          <MoreHorizontal size={20}/>
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* RODAPÉ COM CONTADOR */}
          <div className="text-xs text-center text-neutral-400 mt-4 pb-4">
             Mostrando {students.length} de {total} registros (Página {page} de {Math.ceil(total / limit) || 1})
          </div>
        </>
      )}
    </div>
  );
}