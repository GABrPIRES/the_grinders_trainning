"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import {
  Search, Plus, MoreHorizontal, ChevronLeft, ChevronRight,
  Shield, Mail, Phone, Users, FileBadge,
} from "lucide-react";

interface Coach {
  id: string;
  user_id: string;
  phone_number: string;
  created_at: string;
  user: { name: string; email: string; status?: string };
  alunos_count: number;
}

function CoachesSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-surface-elevated border border-line rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-surface-subtle" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-surface-subtle rounded w-40" />
            <div className="h-3 bg-surface-subtle rounded w-56" />
          </div>
          <div className="h-6 bg-surface-subtle rounded w-16" />
        </div>
      ))}
    </div>
  );
}

export default function AdminCoachesPage() {
  const router = useRouter();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => fetchCoaches(), 500);
    return () => clearTimeout(timer);
  }, [search, page, limit]);

  const fetchCoaches = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, page: page.toString(), limit: limit.toString() });
      const data = await fetchWithAuth(`admin/coaches?${params}`);
      const lista = Array.isArray(data) ? data : (data.coaches || []);
      setCoaches(lista);
      setTotal(data.total || lista.length);
    } catch (error) {
      console.error("Erro ao buscar coaches:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);
  const getInitials = (name: string) => name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "CO";
  const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('pt-BR') : "-";

  const selectClass = "border border-line-input rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-brand-glow focus:border-brand-glow outline-none bg-surface-app text-content-primary";

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-content-primary pb-24 md:pb-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-content-primary">Coaches Parceiros</h1>
          <p className="text-sm text-content-tertiary">Gerencie os profissionais e acompanhe suas carteiras de alunos.</p>
        </div>
        <button
          onClick={() => router.push("/admin/coaches/create")}
          className="bg-brand text-content-on-brand px-4 py-2.5 rounded-lg font-bold hover:bg-brand-hover shadow-sm flex items-center gap-2 w-full sm:w-auto justify-center transition-all"
        >
          <Plus size={18} /> Novo Coach
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-surface-elevated border border-line p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" size={18} />
          <input
            type="text" placeholder="Buscar coach por nome, email..."
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
            <span className="text-sm text-content-tertiary hidden sm:block mr-2">{coaches.length} de {total}</span>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border border-line rounded-lg hover:bg-surface-subtle disabled:opacity-50 transition-colors"><ChevronLeft size={16} /></button>
            <span className="text-sm font-bold min-w-[20px] text-center text-content-primary">{page}</span>
            <button onClick={() => setPage(p => (p < totalPages ? p + 1 : p))} disabled={page >= totalPages} className="p-2 border border-line rounded-lg hover:bg-surface-subtle disabled:opacity-50 transition-colors"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <CoachesSkeleton />
      ) : coaches.length === 0 ? (
        <div className="bg-surface-elevated border border-line p-12 text-center rounded-xl shadow-sm flex flex-col items-center">
          <Shield size={48} className="text-content-muted mb-3" />
          <h3 className="text-base font-bold text-content-primary">Nenhum coach encontrado</h3>
          <p className="text-sm text-content-tertiary">Cadastre o primeiro profissional da plataforma.</p>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {coaches.map((coach) => (
              <div
                key={coach.id}
                onClick={() => router.push(`/admin/coaches/${coach.user_id}/edit`)}
                className="bg-surface-elevated border border-line p-5 rounded-xl shadow-sm flex flex-col gap-4 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-surface-subtle text-content-secondary flex items-center justify-center font-bold text-sm border border-line">
                      {getInitials(coach.user.name)}
                    </div>
                    <div>
                      <h3 className="font-bold text-content-primary text-sm">{coach.user.name}</h3>
                      <p className="text-xs text-content-tertiary">{coach.user.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-content-muted uppercase font-bold mb-0.5">Alunos</span>
                    <span className="bg-surface-subtle text-brand px-2 py-1 rounded text-xs font-bold border border-line flex items-center gap-1">
                      <Users size={12} /> {coach.alunos_count}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm border-t border-line pt-3">
                  <div className="flex items-center gap-2 text-content-secondary">
                    <FileBadge size={14} className="text-content-muted" />
                    <span className="font-mono text-xs">Sem CREF</span>
                  </div>
                  <div className="flex items-center gap-2 text-content-secondary justify-end">
                    <Phone size={14} className="text-content-muted" />
                    <span className="text-xs">{coach.phone_number || "-"}</span>
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
                  <th className="px-6 py-4 text-xs font-bold text-content-muted uppercase tracking-wider">Profissional</th>
                  <th className="px-6 py-4 text-xs font-bold text-content-muted uppercase tracking-wider">Contato</th>
                  <th className="px-6 py-4 text-xs font-bold text-content-muted uppercase tracking-wider">Registro (CREF)</th>
                  <th className="px-6 py-4 text-xs font-bold text-content-muted uppercase tracking-wider">Carteira</th>
                  <th className="px-6 py-4 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-surface-elevated">
                {coaches.map((coach) => (
                  <tr
                    key={coach.id}
                    onClick={() => router.push(`/admin/coaches/${coach.user_id}/edit`)}
                    className="hover:bg-surface-subtle transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-surface-subtle text-content-secondary flex items-center justify-center font-bold text-xs border border-line">
                          {getInitials(coach.user.name)}
                        </div>
                        <div>
                          <p className="font-bold text-content-primary text-sm">{coach.user.name}</p>
                          <p className="text-xs text-content-tertiary">Coach desde {formatDate(coach.created_at)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-sm text-content-secondary">
                        <span className="flex items-center gap-2"><Mail size={13} className="text-content-muted" /> {coach.user.email}</span>
                        <span className="flex items-center gap-2"><Phone size={13} className="text-content-muted" /> {coach.phone_number || "-"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm bg-surface-subtle px-2 py-1 rounded border border-line text-content-secondary">
                        Não informado
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users size={15} className="text-brand" />
                        <span className="font-bold text-content-primary">{coach.alunos_count}</span>
                        <span className="text-xs text-content-tertiary">alunos</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="text-content-muted hover:text-content-primary p-2 hover:bg-surface-subtle rounded-full transition-all"
                        onClick={(e) => { e.stopPropagation(); router.push(`/admin/coaches/${coach.user_id}/edit`); }}
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
            Mostrando {coaches.length} de {total} registros
          </div>
        </>
      )}
    </div>
  );
}
