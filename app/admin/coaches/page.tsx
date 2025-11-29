"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { 
  Search, Plus, MoreHorizontal, Shield, Mail, Phone, Users 
} from "lucide-react";

interface Coach {
  id: string;
  user: { name: string; email: string };
  phone_number: string;
  cref: string;
  alunos_count?: number; // Se sua API retornar contagem
}

export default function AdminCoachesPage() {
  const router = useRouter();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchWithAuth("admin/coaches");
        setCoaches(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filtered = coaches.filter(c => 
    c.user?.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name: string) => name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "CO";

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-neutral-800 pb-20 md:pb-0">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Coaches Parceiros</h1>
          <p className="text-neutral-500 text-sm">Gerencie os profissionais de educação física.</p>
        </div>
        <button onClick={() => router.push("/admin/coaches/new")} className="bg-red-700 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-red-800 shadow-md flex items-center gap-2 w-full sm:w-auto justify-center">
          <Plus size={20} /> Novo Coach
        </button>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input 
            type="text" placeholder="Buscar coach..." 
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
          />
        </div>
      </div>

      {/* CONTEÚDO */}
      {loading ? (
         <div className="p-12 text-center text-neutral-500 animate-pulse">Carregando coaches...</div>
      ) : (
        <>
          {/* MOBILE CARDS */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
             {filtered.map(coach => (
               <div key={coach.id} className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {getInitials(coach.user.name)}
                    </div>
                    <div>
                        <h3 className="font-bold text-neutral-900">{coach.user.name}</h3>
                        <p className="text-xs text-neutral-500">{coach.user.email}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-neutral-100 pt-3">
                     <span className="bg-neutral-100 px-2 py-1 rounded text-neutral-600 font-mono text-xs">CREF: {coach.cref || "N/A"}</span>
                     {coach.alunos_count !== undefined && (
                        <span className="flex items-center gap-1 text-neutral-600 font-medium">
                           <Users size={14} /> {coach.alunos_count} Alunos
                        </span>
                     )}
                  </div>
               </div>
             ))}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200 text-left">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Profissional</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Contato</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">CREF</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map(coach => (
                  <tr key={coach.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-neutral-100 text-neutral-700 flex items-center justify-center font-bold text-xs border border-neutral-200">
                           {getInitials(coach.user.name)}
                        </div>
                        <div>
                           <p className="font-bold text-neutral-900 text-sm">{coach.user.name}</p>
                           <p className="text-xs text-neutral-500">Coach</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                       <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-2"><Mail size={14}/> {coach.user.email}</span>
                          <span className="flex items-center gap-2"><Phone size={14}/> {coach.phone_number || "-"}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-neutral-600">{coach.cref || "Não informado"}</td>
                    <td className="px-6 py-4 text-right">
                       <button className="p-2 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-neutral-800 transition-colors">
                          <MoreHorizontal size={20} />
                       </button>
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