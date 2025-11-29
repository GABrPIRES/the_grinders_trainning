"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { 
  Search, Plus, MoreHorizontal, ChevronLeft, ChevronRight, 
  User, Shield, Mail, Calendar, CreditCard 
} from "lucide-react";

// Tipagem flexível para garantir que não quebre se faltar algum dado
interface Student {
  id: string;
  user: { name: string; email: string };
  // O aluno tem um coach (personal)
  personal?: {
    user: { name: string };
  };
  pagamento?: { status: string };
  plano?: { nome: string };
  created_at: string;
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
      // Ajuste a rota se necessário (ex: 'alunos' se o admin ver tudo na mesma rota)
      const data = await fetchWithAuth(`admin/alunos?${params}`); 
      
      // Tratamento para diferentes formatos de resposta da API
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

  const totalPages = Math.ceil(total / limit);

  // Helpers Visuais
  const getInitials = (name: string) => name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "AL";
  const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR');

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'ativo': return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">Ativo</span>;
      case 'inativo': return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">Inativo</span>;
      default: return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">Sem Status</span>;
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
          onClick={() => router.push("/admin/alunos/new")}
          className="bg-red-700 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-red-800 shadow-md flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus size={20} /> Novo Aluno
        </button>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input
            type="text" placeholder="Buscar aluno..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
          />
        </div>
        
        {/* Paginação Compacta */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
           <span className="text-sm text-neutral-500 hidden sm:block">
              {students.length} de {total} registros
           </span>
           <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"><ChevronLeft size={18}/></button>
              <span className="text-sm font-bold">{page}</span>
              <button onClick={() => setPage(p => (p < totalPages ? p+1 : p))} disabled={page>=totalPages} className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"><ChevronRight size={18}/></button>
           </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      {loading ? (
        <div className="p-12 text-center text-neutral-500 animate-pulse">Carregando alunos...</div>
      ) : students.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-neutral-200">
           <User size={48} className="mx-auto text-neutral-300 mb-3"/>
           <p className="text-neutral-500">Nenhum aluno encontrado.</p>
        </div>
      ) : (
        <>
          {/* MOBILE CARDS */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {students.map((student) => (
              <div key={student.id} className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm flex flex-col gap-4">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-sm">
                       {getInitials(student.user.name)}
                    </div>
                    <div>
                       <h3 className="font-bold text-neutral-900">{student.user.name}</h3>
                       <p className="text-xs text-neutral-500">{student.user.email}</p>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-2 text-sm border-t border-neutral-100 pt-3">
                    <div>
                       <span className="text-xs text-neutral-400 font-bold uppercase block">Coach</span>
                       <span className="text-neutral-800 flex items-center gap-1">
                          <Shield size={12} className="text-red-700"/> {student.personal?.user.name || "Sem Coach"}
                       </span>
                    </div>
                    <div>
                       <span className="text-xs text-neutral-400 font-bold uppercase block">Cadastro</span>
                       <span className="text-neutral-800">{formatDate(student.created_at)}</span>
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
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Aluno</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Coach Responsável</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Data Cadastro</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-neutral-100 text-neutral-700 flex items-center justify-center font-bold text-xs">
                           {getInitials(student.user.name)}
                        </div>
                        <div>
                           <p className="font-bold text-neutral-900 text-sm">{student.user.name}</p>
                           <p className="text-xs text-neutral-500">{student.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2 text-sm text-neutral-700 font-medium">
                          <Shield size={14} className="text-red-700"/>
                          {student.personal?.user.name || <span className="text-neutral-400 italic">Sem Coach</span>}
                       </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(student.pagamento?.status || 'pendente')}</td>
                    <td className="px-6 py-4 text-sm text-neutral-500">{formatDate(student.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                       <button className="text-neutral-400 hover:text-red-700 transition-colors"><MoreHorizontal size={20}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}