"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { 
  Search, Plus, MoreHorizontal, ChevronLeft, ChevronRight, 
  User, Shield, Mail, Phone, Users, FileBadge
} from "lucide-react";

interface Coach {
  id: string;
  user_id: string;
  phone_number: string;
  created_at: string;
  user: { 
    name: string; 
    email: string;
    status?: string; 
  };
  alunos_count: number;
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
      const params = new URLSearchParams({ 
        search, 
        page: page.toString(), 
        limit: limit.toString() 
      });
      
      const data = await fetchWithAuth(`admin/coaches?${params}`); 
      
      const lista = Array.isArray(data) ? data : (data.coaches || []);
      const totalCount = data.total || lista.length;

      setCoaches(lista);
      setTotal(totalCount);
    } catch (error) {
      console.error("Erro ao buscar coaches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (userId: string) => {
    router.push(`/admin/coaches/${userId}/edit`);
  };

  const totalPages = Math.ceil(total / limit);
  const getInitials = (name: string) => name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "CO";
  const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('pt-BR') : "-";

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-neutral-800 pb-20 md:pb-0">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Coaches Parceiros</h1>
          <p className="text-neutral-500 text-sm">Gerencie os profissionais e acompanhe suas carteiras de alunos.</p>
        </div>
        <button
          onClick={() => router.push("/admin/coaches/create")}
          className="bg-red-700 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-red-800 shadow-md flex items-center gap-2 w-full sm:w-auto justify-center transition-all"
        >
          <Plus size={20} /> Novo Coach
        </button>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input
            type="text" placeholder="Buscar coach por nome, email..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-600 outline-none transition-all"
          />
        </div>
        
        {/* Paginação */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-between md:justify-end">
           <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="w-full sm:w-auto border border-neutral-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-neutral-500 outline-none bg-white"
            >
              <option value="10">10 por pág</option>
              <option value="20">20 por pág</option>
              <option value="50">50 por pág</option>
            </select>

           <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500 hidden sm:block mr-2">
                  {coaches.length} de {total}
              </span>
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"><ChevronLeft size={18}/></button>
              <span className="text-sm font-bold min-w-[20px] text-center">{page}</span>
              <button onClick={() => setPage(p => (p < totalPages ? p+1 : p))} disabled={page>=totalPages} className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"><ChevronRight size={18}/></button>
           </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      {loading ? (
        <div className="p-12 text-center text-neutral-500 animate-pulse">Carregando coaches...</div>
      ) : coaches.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-neutral-200 shadow-sm flex flex-col items-center">
           <Shield size={48} className="text-neutral-300 mb-3"/>
           <h3 className="text-lg font-bold text-neutral-700">Nenhum coach encontrado</h3>
           <p className="text-neutral-500 text-sm">Cadastre o primeiro profissional da plataforma.</p>
        </div>
      ) : (
        <>
          {/* MOBILE CARDS */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {coaches.map((coach) => (
              <div 
                key={coach.id} 
                onClick={() => handleRowClick(coach.user_id)}
                className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm flex flex-col gap-4 active:scale-[0.98] transition-transform"
              >
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center font-bold text-sm border border-neutral-200">
                           {getInitials(coach.user.name)}
                        </div>
                        <div>
                           <h3 className="font-bold text-neutral-900 text-sm">{coach.user.name}</h3>
                           <p className="text-xs text-neutral-500">{coach.user.email}</p>
                        </div>
                    </div>
                    {/* Badge de Alunos */}
                    <div className="flex flex-col items-end">
                       <span className="text-[10px] text-neutral-400 uppercase font-bold mb-0.5">Alunos</span>
                       <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100 flex items-center gap-1">
                          <Users size={12}/> {coach.alunos_count}
                       </span>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-2 text-sm border-t border-neutral-100 pt-3">
                    <div className="flex items-center gap-2 text-neutral-600">
                       <FileBadge size={14} className="text-neutral-400"/>
                       <span className="font-mono text-xs">"Sem CREF"</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600 justify-end">
                       <Phone size={14} className="text-neutral-400"/>
                       <span className="text-xs">{coach.phone_number || "-"}</span>
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
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Profissional</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Contato</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Registro (CREF)</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Carteira</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {coaches.map((coach) => (
                  <tr 
                    key={coach.id} 
                    onClick={() => handleRowClick(coach.user_id)}
                    className="hover:bg-neutral-50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center font-bold text-xs border border-neutral-200 group-hover:bg-white group-hover:shadow-sm transition-all">
                           {getInitials(coach.user.name)}
                        </div>
                        <div>
                           <p className="font-bold text-neutral-900 text-sm group-hover:text-neutral-700 transition-colors">{coach.user.name}</p>
                           <p className="text-xs text-neutral-500">Coach desde {formatDate(coach.created_at)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col gap-1 text-sm text-neutral-600">
                          <span className="flex items-center gap-2"><Mail size={14} className="text-neutral-400"/> {coach.user.email}</span>
                          <span className="flex items-center gap-2"><Phone size={14} className="text-neutral-400"/> {coach.phone_number || "-"}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="font-mono text-sm bg-neutral-50 px-2 py-1 rounded border border-neutral-100 text-neutral-700">
                            "Não informado"
                        </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <Users size={16} className="text-blue-600"/>
                          <span className="font-bold text-neutral-800">{coach.alunos_count}</span>
                          <span className="text-xs text-neutral-500">alunos</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                         className="text-neutral-400 hover:text-neutral-800 p-2 hover:bg-neutral-100 rounded-full transition-all"
                         onClick={(e) => {
                             e.stopPropagation();
                             handleRowClick(coach.user_id);
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
          
          {/* RODAPÉ */}
          <div className="text-xs text-center text-neutral-400 mt-4 pb-4">
             Mostrando {coaches.length} de {total} registros
          </div>
        </>
      )}
    </div>
  );
}