"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import {
  Search, Plus, MoreHorizontal, ChevronLeft, ChevronRight,
  User, Shield,
} from "lucide-react";

interface Student {
  id: string;
  created_at: string;
  user: { name: string; email: string };
  personal?: { user: { name: string } };
}

function StudentsSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-surface-elevated border border-line rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-surface-subtle" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-surface-subtle rounded w-40" />
            <div className="h-3 bg-surface-subtle rounded w-56" />
          </div>
          <div className="h-6 bg-surface-subtle rounded w-20" />
        </div>
      ))}
    </div>
  );
}


export default function AdminStudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => fetchStudents(), 500);
    return () => clearTimeout(timer);
  }, [search, page, limit]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, page: page.toString(), limit: limit.toString() });
      const data = await fetchWithAuth(`admin/alunos?${params}`);
      const lista = Array.isArray(data) ? data : (data.alunos || []);
      setStudents(lista);
      setTotal(data.total || lista.length);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);
  const getInitials = (name: string) => name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "AL";
  const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('pt-BR') : "-";

  const selectClass = "border border-line-input rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none bg-surface-app text-content-primary";

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-content-primary pb-24 md:pb-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-content-primary">Gerenciar Alunos</h1>
          <p className="text-sm text-content-tertiary">Visão global de todos os alunos da plataforma.</p>
        </div>
        <button
          onClick={() => router.push("/admin/students/create")}
          className="bg-brand text-content-on-brand px-4 py-2.5 rounded-lg font-bold hover:bg-brand-hover shadow-sm flex items-center gap-2 w-full sm:w-auto justify-center transition-all"
        >
          <Plus size={18} /> Novo Aluno
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-surface-elevated border border-line p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" size={18} />
          <input
            type="text" placeholder="Buscar aluno por nome ou email..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-line-input rounded-lg focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none bg-surface-app text-content-primary text-sm"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className={`w-full sm:w-auto ${selectClass}`}>
            <option value="10">10 por pág</option>
            <option value="20">20 por pág</option>
            <option value="50">50 por pág</option>
          </select>
          <div className="flex items-center gap-2">
            <span className="text-sm text-content-tertiary hidden sm:block mr-2">{students.length} de {total}</span>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border border-line rounded-lg hover:bg-surface-subtle disabled:opacity-50 transition-colors"><ChevronLeft size={16} /></button>
            <span className="text-sm font-bold text-center text-content-primary">{page}/{totalPages || 1}</span>
            <button onClick={() => setPage(p => (p < totalPages ? p + 1 : p))} disabled={page >= totalPages} className="p-2 border border-line rounded-lg hover:bg-surface-subtle disabled:opacity-50 transition-colors"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <StudentsSkeleton />
      ) : students.length === 0 ? (
        <div className="bg-surface-elevated border border-line p-12 text-center rounded-xl shadow-sm flex flex-col items-center">
          <User size={48} className="text-content-muted mb-3" />
          <h3 className="text-base font-bold text-content-primary">Nenhum aluno encontrado</h3>
          <p className="text-sm text-content-tertiary">Tente buscar por outro termo.</p>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {students.map((student) => (
              <div
                key={student.id}
                onClick={() => router.push(`/admin/students/${student.id}/edit`)}
                className="bg-surface-elevated border border-line p-5 rounded-xl shadow-sm flex flex-col gap-4 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-subtle text-content-secondary flex items-center justify-center font-bold text-xs border border-line">
                    {getInitials(student.user.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-content-primary text-sm">{student.user.name}</h3>
                    <p className="text-xs text-content-tertiary">{student.user.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm border-t border-line pt-3">
                  <div>
                    <span className="text-[10px] text-content-muted font-bold uppercase block mb-0.5">Coach</span>
                    <span className="text-content-secondary flex items-center gap-1 font-medium text-sm">
                      <Shield size={12} className="text-brand" /> {student.personal?.user?.name || "Sem Coach"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-content-muted font-bold uppercase block mb-0.5">Cadastro</span>
                    <span className="text-content-secondary font-medium text-sm">{formatDate(student.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-surface-elevated border border-line rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-line text-left">
              <thead className="bg-surface-page">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-content-muted uppercase tracking-wider">Aluno</th>
                  <th className="px-6 py-4 text-xs font-bold text-content-muted uppercase tracking-wider">Coach Responsável</th>
                  <th className="px-6 py-4 text-xs font-bold text-content-muted uppercase tracking-wider">Data Cadastro</th>
                  <th className="px-6 py-4 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-surface-elevated">
                {students.map((student) => (
                  <tr
                    key={student.id}
                    onClick={() => router.push(`/admin/students/${student.id}/edit`)}
                    className="hover:bg-surface-subtle transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-surface-subtle text-content-secondary flex items-center justify-center font-bold text-xs border border-line">
                          {getInitials(student.user.name)}
                        </div>
                        <div>
                          <p className="font-bold text-content-primary text-sm group-hover:text-brand transition-colors">{student.user.name}</p>
                          <p className="text-xs text-content-tertiary">{student.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-content-secondary font-medium bg-surface-subtle px-2 py-1 rounded w-fit border border-line">
                        <Shield size={13} className="text-brand" />
                        {student.personal?.user?.name || <span className="text-content-muted italic">Sem Coach</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-content-tertiary font-mono">{formatDate(student.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="text-content-muted hover:text-brand p-2 hover:bg-surface-subtle rounded-full transition-all"
                        onClick={(e) => { e.stopPropagation(); router.push(`/admin/students/${student.id}/edit`); }}
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-xs text-center text-content-muted pb-4">
            Mostrando {students.length} de {total} registros (Página {page} de {Math.ceil(total / limit) || 1})
          </div>
        </>
      )}
    </div>
  );
}
