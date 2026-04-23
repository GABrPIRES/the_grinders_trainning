"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import {
  Search, ChevronLeft, ChevronRight,
  User, Clock, Calendar, ArrowRight,
} from "lucide-react";

interface Student {
  id: string;
  user: { name: string; email: string };
  pagamento: { vencimento: string | null; status: string | null };
  plano: { nome: string | null };
  treino_info: { proximo_treino: string | null; ultima_atualizacao: string | null };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TreinosSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 bg-surface-subtle rounded-xl w-72"></div>
      <div className="bg-surface-elevated border border-line rounded-xl overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-line last:border-0">
            <div className="w-2.5 h-2.5 rounded-full bg-surface-subtle flex-shrink-0"></div>
            <div className="w-9 h-9 rounded-full bg-surface-subtle flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-surface-subtle rounded w-36"></div>
              <div className="h-3 bg-surface-subtle rounded w-24"></div>
            </div>
            <div className="h-3 bg-surface-subtle rounded w-20 hidden md:block"></div>
            <div className="h-3 bg-surface-subtle rounded w-20 hidden md:block"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CoachWorkoutsSelectionPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(1);
  const [limit, setLimit]     = useState(10);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, page: page.toString(), limit: limit.toString() });
      const data = await fetchWithAuth(`alunos?${params}`);
      setStudents(data.alunos);
      setTotal(data.total);
    } catch (err) {
      console.error("Erro ao buscar alunos:", err);
    } finally {
      setLoading(false);
    }
  }, [search, page, limit]);

  useEffect(() => {
    const timer = setTimeout(fetchStudents, 400);
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  const totalPages = Math.ceil(total / limit);

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("pt-BR", { timeZone: "UTC", day: "2-digit", month: "short" }) : "—";

  const statusDot = (status: string | null) =>
    (status === "ativo" || status === "pago")
      ? <span className="w-2.5 h-2.5 rounded-full bg-semantic-success-text block flex-shrink-0" title="Ativo" />
      : <span className="w-2.5 h-2.5 rounded-full bg-semantic-error-text block flex-shrink-0" title="Pendente" />;

  const inputClass =
    "w-full px-4 py-2.5 border border-line-input rounded-lg focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none transition-all text-content-primary bg-surface-app placeholder:text-content-tertiary text-sm";

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-24 md:pb-6 text-content-primary">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-content-primary">Gerenciar Treinos</h1>
        <p className="text-sm text-content-tertiary mt-0.5">Selecione um aluno para editar ou criar planilhas.</p>
      </div>

      {/* Filter bar */}
      <div className="bg-surface-elevated border border-line rounded-xl shadow-sm p-4 flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" size={18} />
          <input
            type="text"
            placeholder="Buscar aluno..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-line-input rounded-lg focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none transition-all text-content-primary bg-surface-app placeholder:text-content-tertiary text-sm"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={limit}
            onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
            className={`${inputClass} w-full md:w-auto cursor-pointer`}
          >
            <option value="10">10 por pág</option>
            <option value="20">20 por pág</option>
            <option value="50">50 por pág</option>
          </select>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border border-line rounded-lg hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-bold text-content-secondary whitespace-nowrap">{page} / {totalPages || 1}</span>
            <button onClick={() => setPage(p => (p < totalPages ? p + 1 : p))} disabled={page >= totalPages} className="p-2 border border-line rounded-lg hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <TreinosSkeleton />
      ) : students.length === 0 ? (
        <div className="bg-surface-elevated border border-line rounded-xl shadow-sm p-12 text-center flex flex-col items-center">
          <User size={48} className="text-content-muted mb-4" />
          <h3 className="text-lg font-bold text-content-primary mb-1">Nenhum aluno encontrado</h3>
          <p className="text-sm text-content-tertiary">Tente buscar por outro termo.</p>
        </div>
      ) : (
        <>
          {/* Mobile — cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {students.map(student => (
              <div
                key={student.id}
                onClick={() => router.push(`/coach/treinos/${student.id}`)}
                className="bg-surface-elevated border border-line rounded-xl p-4 shadow-sm active:scale-[0.98] transition-transform cursor-pointer relative overflow-hidden"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${student.pagamento.status === "ativo" || student.pagamento.status === "pago" ? "bg-semantic-success-text" : "bg-semantic-error-text"}`} />
                <div className="flex items-start justify-between mb-3 pl-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-content-primary text-surface-app flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {getInitials(student.user.name)}
                    </div>
                    <div>
                      <p className="font-bold text-content-primary">{student.user.name}</p>
                      <p className="text-xs text-content-tertiary">{student.plano.nome || "Sem plano"}</p>
                    </div>
                  </div>
                  <ChevronRight className="text-content-muted" size={18} />
                </div>
                <div className="space-y-2 pt-3 border-t border-line text-sm pl-3">
                  <div className="flex justify-between items-center">
                    <span className="text-content-muted flex items-center gap-1.5"><Clock size={13} /> Última atualização</span>
                    <span className="font-bold text-content-secondary">{formatDate(student.treino_info.ultima_atualizacao)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-content-muted flex items-center gap-1.5"><Calendar size={13} /> Próx. Treino</span>
                    <span className="font-bold text-brand">{formatDate(student.treino_info.proximo_treino)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop — table */}
          <div className="hidden md:block bg-surface-elevated border border-line rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-page border-b border-line">
                    <th className="px-4 py-3 w-8"></th>
                    <th className="px-6 py-3 text-xs font-bold text-content-tertiary uppercase tracking-wide">Aluno</th>
                    <th className="px-6 py-3 text-xs font-bold text-content-tertiary uppercase tracking-wide">Última Atualização</th>
                    <th className="px-6 py-3 text-xs font-bold text-content-tertiary uppercase tracking-wide">Próximo Treino</th>
                    <th className="px-6 py-3 text-xs font-bold text-content-tertiary uppercase tracking-wide text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {students.map(student => (
                    <tr
                      key={student.id}
                      onClick={() => router.push(`/coach/treinos/${student.id}`)}
                      className="hover:bg-surface-page transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-4">{statusDot(student.pagamento.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-content-primary text-surface-app flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {getInitials(student.user.name)}
                          </div>
                          <div>
                            <p className="font-bold text-content-primary group-hover:text-brand transition-colors text-sm">{student.user.name}</p>
                            <p className="text-xs text-content-tertiary">{student.plano.nome || "Sem plano"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-content-secondary">{formatDate(student.treino_info.ultima_atualizacao)}</td>
                      <td className="px-6 py-4 text-sm font-bold text-content-secondary">{formatDate(student.treino_info.proximo_treino)}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-brand group-hover:underline">
                          Abrir Planilha <ArrowRight size={15} />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-center text-content-muted hidden md:block">
            Mostrando {students.length} de {total} alunos.
          </p>
        </>
      )}
    </div>
  );
}
